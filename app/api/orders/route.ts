import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendOrderNotifications } from "@/lib/email";
import { upsertCustomer } from "@/lib/customers";
import { isRateLimited, isValidEmail } from "@/lib/request-security";

function isValidAddress(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const address = value as Record<string, unknown>;
  return typeof address.name === "string" && address.name.trim().length >= 2 && address.name.length <= 160 &&
    typeof address.street1 === "string" && address.street1.trim().length > 0 && address.street1.length <= 200 &&
    (address.street2 === undefined || typeof address.street2 === "string" && address.street2.length <= 100) &&
    typeof address.city === "string" && address.city.trim().length > 0 && address.city.length <= 100 &&
    typeof address.state === "string" && address.state.trim().length >= 2 && address.state.length <= 100 &&
    typeof address.zip === "string" && /^\d{5}$/.test(address.zip) &&
    typeof address.country === "string" && address.country.trim().length > 0 && address.country.length <= 100;
}

export async function POST(req: Request) {
  if (isRateLimited(req, "order-submit", 5)) {
    return NextResponse.json({ error: "Too many order attempts. Please try again shortly." }, { status: 429 });
  }

  try {
    const body = await req.json();
    const {
      customer_name,
      customer_email,
      shipping_address,
      billing_address,
      billing_same_as_shipping = true,
      items = [],
      subtotal = 0,
      shipping_cost = 0,
      protection_fee = 0,
      total = 0,
      shipping_carrier = "Standard",
      shipping_service = "Insured",
      marketing_opt_in = false,
    } = body;

    if (
      typeof customer_name !== "string" || customer_name.trim().length < 2 || customer_name.length > 160 ||
      !isValidEmail(customer_email) || !isValidAddress(shipping_address) ||
      typeof billing_same_as_shipping !== "boolean" ||
      (!billing_same_as_shipping && !isValidAddress(billing_address)) ||
      !Array.isArray(items) || items.length < 1 || items.length > 50 ||
      ![subtotal, shipping_cost, protection_fee, total].every((value) => Number.isFinite(Number(value)) && Number(value) >= 0) ||
      items.some((item: any) => typeof item?.name !== "string" || item.name.length > 200 ||
        !Number.isInteger(Number(item.quantity)) || Number(item.quantity) < 1 || Number(item.quantity) > 20 ||
        !Number.isFinite(Number(item.price)) || Number(item.price) < 0)
    ) {
      return NextResponse.json({ error: "Check your customer, shipping, and order details." }, { status: 400 });
    }

    const normalizedShippingAddress = {
      ...shipping_address,
      name: shipping_address.name.trim(),
      street1: shipping_address.street1.trim(),
      street2: typeof shipping_address.street2 === "string" ? shipping_address.street2.trim() : "",
      city: shipping_address.city.trim(),
      state: shipping_address.state.trim().toUpperCase(),
      zip: shipping_address.zip.trim(),
      country: shipping_address.country.trim(),
    };
    const normalizedBillingAddress = billing_same_as_shipping ? normalizedShippingAddress : {
      ...billing_address,
      name: billing_address.name.trim(),
      street1: billing_address.street1.trim(),
      street2: typeof billing_address.street2 === "string" ? billing_address.street2.trim() : "",
      city: billing_address.city.trim(),
      state: billing_address.state.trim().toUpperCase(),
      zip: billing_address.zip.trim(),
      country: billing_address.country.trim(),
    };

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/['"]/g, "").trim();
    const supabaseKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)?.replace(/['"]/g, "").trim();

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Supabase credentials not configured." }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    let customerId: string | null = null;
    let customerRecord: Awaited<ReturnType<typeof upsertCustomer>> | null = null;
    try {
      customerRecord = await upsertCustomer({
        email: customer_email,
        full_name: customer_name,
        ...(billing_same_as_shipping ? { default_shipping_address: normalizedShippingAddress } : {}),
        acquisition_source: "checkout",
        marketing_opt_in: marketing_opt_in === true,
        favorite_categories: items.map((item: any) => item.category).filter((category: unknown): category is string => typeof category === "string"),
      });
      customerId = customerRecord.id;
    } catch (customerError) {
      console.error("Customer upsert failed during checkout:", customerError);
    }

    let totalWeightOz = 0;
    let maxLength = 10;
    let maxWidth = 8;
    let totalHeight = 0;

    const ids = items.map((i: any) => i.id).filter((id: string) => id && !id.startsWith("local-"));
    if (ids.length > 0) {
      const { data: products } = await supabase
        .from("products")
        .select("id, stock, weight_oz, length_in, width_in, height_in")
        .in("id", ids);

      if (products && products.length > 0) {
        for (const item of items) {
          const qty = Number(item.quantity || 1);
          const p = products.find((prod: any) => prod.id === item.id);
          totalWeightOz += Number(p?.weight_oz || 16) * qty;
          maxLength = Math.max(maxLength, Number(p?.length_in || 10));
          maxWidth = Math.max(maxWidth, Number(p?.width_in || 8));
          totalHeight += Number(p?.height_in || 4) * qty;

          if (p) {
            const newStock = Math.max(0, Number(p.stock || 0) - qty);
            await supabase
              .from("products")
              .update({
                stock: newStock,
                status: newStock === 0 ? "sold" : "active",
              })
              .eq("id", p.id);
          }
        }
      }
    }

    if (totalWeightOz <= 0) totalWeightOz = Math.max(1, items.length) * 16;
    if (totalHeight <= 0) totalHeight = Math.max(1, items.length) * 4;

    const orderNumber = `CC-${Math.floor(100000 + Math.random() * 900000)}`;
    const notes = Number(subtotal) > 100
      ? `HIGH-VALUE PROTECTION ($${protection_fee}): Insure parcel for $${subtotal} on Pirate Ship.`
      : "Standard shipment (under $100).";

    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        customer_name,
        customer_email: customer_email.trim().toLowerCase(),
        customer_id: customerId,
        shipping_address: normalizedShippingAddress,
        billing_address: normalizedBillingAddress,
        billing_same_as_shipping,
        items,
        subtotal: Number(subtotal),
        shipping_cost: Number(shipping_cost),
        protection_fee: Number(protection_fee),
        total: Number(total),
        payment_status: "paid",
        fulfillment_status: "unfulfilled",
        carrier: shipping_carrier,
        shipping_carrier,
        shipping_service,
        weight_oz: totalWeightOz,
        length_in: maxLength,
        width_in: maxWidth,
        height_in: totalHeight,
        notes,
      })
      .select("id, order_number")
      .single();

    if (error) {
      console.error("Supabase order insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (customerId && customerRecord) {
      const { error: customerStatsError } = await supabase.from("customers").update({
        total_orders: Number(customerRecord.total_orders ?? 0) + 1,
        total_spent: Number(customerRecord.total_spent ?? 0) + Number(total),
        last_activity_at: new Date().toISOString(),
      }).eq("id", customerId);
      if (customerStatsError) console.error("Customer order stats update failed:", customerStatsError);
    }

    let notificationsSent = true;
    try {
      notificationsSent = await sendOrderNotifications({
        orderNumber: order.order_number,
        customerName: customer_name.trim(),
        customerEmail: customer_email.trim(),
        items: items.map((item: any) => ({ name: item.name, sku: typeof item.sku === 'string' ? item.sku : typeof item.id === 'string' ? item.id : undefined, quantity: Number(item.quantity), price: Number(item.price) })),
        subtotal: Number(subtotal),
        shipping: Number(shipping_cost),
        total: Number(total),
        shippingAddress: normalizedShippingAddress,
        billingAddress: normalizedBillingAddress,
        billingSameAsShipping: billing_same_as_shipping,
      });
    } catch {
      notificationsSent = false;
    }

    return NextResponse.json({ success: true, order, notificationsSent });
  } catch (err: any) {
    console.error("Order API error:", err);
    return NextResponse.json({ error: err?.message || "Failed to place order." }, { status: 500 });
  }
}
