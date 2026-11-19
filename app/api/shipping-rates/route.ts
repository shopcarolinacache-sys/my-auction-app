import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import EasyPostClient from "@easypost/api";

export async function POST(req: Request) {
  try {
    const { items = [], destination = {}, subtotal = 0 } = await req.json();
    const zip = String(destination.zip || "").trim().slice(0, 5);
    const state = String(destination.state || "").trim().toUpperCase();
    const orderSubtotal = Number(subtotal) || 0;
    const needsExtraProtection = orderSubtotal > 100;
    const protectionFee = needsExtraProtection
      ? Math.max(1, Math.ceil(orderSubtotal * 0.01))
      : 0;

    if (zip.length !== 5 || state.length < 2) {
      return NextResponse.json({
        rate: 18 + protectionFee,
        baseRate: 18,
        carrier: "Standard",
        service: "Insured",
        insured: needsExtraProtection,
        protectionFee,
        fallback: true,
      });
    }

    let totalWeightOz = 0;
    let maxLength = 10;
    let maxWidth = 8;
    let totalHeight = 4;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/['"]/g, "").trim();
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.replace(/['"]/g, "").trim();

    if (supabaseUrl && supabaseKey && items.length > 0) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const ids = items.map((i: any) => i.id || i.product_id).filter(Boolean);
      if (ids.length > 0) {
        const { data: products } = await supabase
          .from("products")
          .select("id, weight_oz, length_in, width_in, height_in")
          .in("id", ids);

        if (products && products.length > 0) {
          totalHeight = 0;
          for (const item of items) {
            const qty = Number(item.quantity || 1);
            const p = products.find((prod: any) => prod.id === (item.id || item.product_id));
            totalWeightOz += Number(p?.weight_oz || 16) * qty;
            maxLength = Math.max(maxLength, Number(p?.length_in || 10));
            maxWidth = Math.max(maxWidth, Number(p?.width_in || 8));
            totalHeight += Number(p?.height_in || 4) * qty;
          }
        }
      }
    }

    if (totalWeightOz <= 0) totalWeightOz = Math.max(1, items.length) * 16;

    const apiKey = process.env.EASYPOST_API_KEY?.replace(/['"]/g, "").trim();
    if (!apiKey) {
      return NextResponse.json({
        rate: 18 + protectionFee,
        baseRate: 18,
        carrier: "Standard",
        service: "Insured",
        insured: needsExtraProtection,
        protectionFee,
        fallback: true,
      });
    }

    const client = new EasyPostClient(apiKey);
    const shipment = await client.Shipment.create({
      to_address: {
        street1: destination.street || "100 N Tryon St",
        city: destination.city || "Charlotte",
        state,
        zip,
        country: "US",
      },
      from_address: {
        street1: (process.env.SHIP_FROM_STREET || "100 Trade St").replace(/['"]/g, ""),
        city: (process.env.SHIP_FROM_CITY || "Charlotte").replace(/['"]/g, ""),
        state: (process.env.SHIP_FROM_STATE || "NC").replace(/['"]/g, ""),
        zip: (process.env.SHIP_FROM_ZIP || "28216").replace(/['"]/g, ""),
        country: "US",
      },
      parcel: {
        length: maxLength,
        width: maxWidth,
        height: Math.max(2, totalHeight),
        weight: totalWeightOz,
      },
    });

    if (!shipment.rates || shipment.rates.length === 0) {
      return NextResponse.json({
        rate: 18 + protectionFee,
        baseRate: 18,
        carrier: "Standard",
        service: "Insured",
        insured: needsExtraProtection,
        protectionFee,
        fallback: true,
      });
    }

    const lowest = shipment.rates.reduce((min: any, r: any) =>
      parseFloat(r.rate) < parseFloat(min.rate) ? r : min
    );

    const baseRate = Math.ceil(parseFloat(lowest.rate));

    return NextResponse.json({
      rate: baseRate + protectionFee,
      baseRate,
      protectionFee,
      insured: needsExtraProtection,
      shipmentId: shipment.id,
      rateId: lowest.id,
      carrier: lowest.carrier,
      service: lowest.service,
      fallback: false,
    });
  } catch (err: any) {
    console.error("EasyPost SDK error:", err?.message || err);
    return NextResponse.json({
      rate: 18,
      baseRate: 18,
      carrier: "Standard",
      service: "Insured",
      insured: false,
      protectionFee: 0,
      fallback: true,
    });
  }
}
