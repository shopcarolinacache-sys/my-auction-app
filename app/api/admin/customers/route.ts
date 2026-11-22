import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Fetch all customers from the customers table
    const { data: customersData, error: customersError } = await supabase.from('customers').select('id,email,full_name,phone,default_shipping_address,acquisition_source,marketing_opt_in,favorite_categories,tags,notes,total_orders,total_spent,auctions_won,last_activity_at')
    if (customersError) throw customersError

    // Fetch all orders
    const { data: ordersData, error: ordersError } = await supabase.from('orders').select('id,customer_email,customer_name,shipping_address,total,created_at')
    if (ordersError) throw ordersError

    // Fetch all bids
    const { data: bidsData, error: bidsError } = await supabase.from('bids').select('id,auction_id,created_at,amount,bidder_name,bidder_email')
    if (bidsError) throw bidsError

    // Fetch newsletter leads (assuming a 'newsletter_leads' table with 'email' and 'opt_in' fields)
    const { data: leadsData, error: leadsError } = await supabase.from('newsletter_leads').select('email,opt_in,created_at')
    if (leadsError) console.warn('Could not load newsletter leads (table might not exist or RLS issue):', leadsError.message)

    const customerMap = new Map<string, any>()

    // Process existing customers
    customersData?.forEach(customer => {
      const email = customer.email.toLowerCase()
      customerMap.set(email, {
        id: customer.id,
        email: customer.email,
        full_name: customer.full_name,
        phone: customer.phone,
        default_shipping_address: customer.default_shipping_address,
        acquisition_source: customer.acquisition_source,
        marketing_opt_in: customer.marketing_opt_in,
        favorite_categories: customer.favorite_categories,
        tags: customer.tags,
        notes: customer.notes,
        total_orders: customer.total_orders || 0,
        total_spent: customer.total_spent || 0,
        auctions_won: customer.auctions_won || 0,
        last_activity_at: customer.last_activity_at,
        is_lead: false, // Will be updated if they are only a lead
      })
    })

    // Process orders
    ordersData?.forEach(order => {
      const email = String(order.customer_email ?? '').trim().toLowerCase()
      if (!email) return

      let customer = customerMap.get(email)
      if (!customer) {
        customer = {
          id: null, // No customer record yet
          email: order.customer_email,
          full_name: order.customer_name,
          phone: null,
          default_shipping_address: order.shipping_address,
          acquisition_source: 'order',
          marketing_opt_in: false,
          favorite_categories: null,
          tags: [],
          notes: null,
          total_orders: 0,
          total_spent: 0,
          auctions_won: 0,
          last_activity_at: order.created_at,
          is_lead: false,
        }
        customerMap.set(email, customer)
      }

      customer.total_orders = (customer.total_orders || 0) + 1
      customer.total_spent = (customer.total_spent || 0) + Number(order.total || 0)
      if (!customer.full_name && order.customer_name) customer.full_name = order.customer_name
      if (!customer.default_shipping_address && order.shipping_address) customer.default_shipping_address = order.shipping_address
      if (order.created_at && (!customer.last_activity_at || new Date(order.created_at) > new Date(customer.last_activity_at))) {
        customer.last_activity_at = order.created_at
      }
    })

    // Process bids
    bidsData?.forEach(bid => {
      const email = String(bid.bidder_email ?? '').trim().toLowerCase()
      if (!email) return

      let customer = customerMap.get(email)
      if (!customer) {
        customer = {
          id: null,
          email: bid.bidder_email,
          full_name: bid.bidder_name,
          phone: null,
          default_shipping_address: null,
          acquisition_source: 'bid',
          marketing_opt_in: false,
          favorite_categories: null,
          tags: [],
          notes: null,
          total_orders: 0,
          total_spent: 0,
          auctions_won: 0,
          last_activity_at: bid.created_at,
          is_lead: false,
        }
        customerMap.set(email, customer)
      }

      customer.auctions_won = (customer.auctions_won || 0) + 1 // Assuming a bid means an auction won for simplicity, adjust if needed
      if (!customer.full_name && bid.bidder_name) customer.full_name = bid.bidder_name
      if (bid.created_at && (!customer.last_activity_at || new Date(bid.created_at) > new Date(customer.last_activity_at))) {
        customer.last_activity_at = bid.created_at
      }
    })

    // Process newsletter leads
    leadsData?.forEach(lead => {
      const email = String(lead.email ?? '').trim().toLowerCase()
      if (!email) return

      let customer = customerMap.get(email)
      if (!customer) {
        customer = {
          id: null,
          email: lead.email,
          full_name: null,
          phone: null,
          default_shipping_address: null,
          acquisition_source: 'newsletter',
          marketing_opt_in: lead.opt_in || false,
          favorite_categories: null,
          tags: [],
          notes: null,
          total_orders: 0,
          total_spent: 0,
          auctions_won: 0,
          last_activity_at: lead.created_at,
          is_lead: true,
        }
        customerMap.set(email, customer)
      } else {
        // If customer already exists, update marketing opt-in if lead has it true
        if (lead.opt_in) customer.marketing_opt_in = true
        if (lead.created_at && (!customer.last_activity_at || new Date(lead.created_at) > new Date(customer.last_activity_at))) {
          customer.last_activity_at = lead.created_at
        }
        // If the customer was previously only a lead, and now has other activity, mark is_lead as false
        if (customer.is_lead && (customer.total_orders > 0 || customer.auctions_won > 0)) {
          customer.is_lead = false
        }
      }
    })

    // Convert map to array and sort
    const aggregatedCustomers = Array.from(customerMap.values()).sort((a, b) => {
      const dateA = a.last_activity_at ? new Date(a.last_activity_at).getTime() : 0
      const dateB = b.last_activity_at ? new Date(b.last_activity_at).getTime() : 0
      return dateB - dateA
    })

    return NextResponse.json(aggregatedCustomers, { status: 200 })
  } catch (error: any) {
    console.error('Failed to aggregate customer data:', error)
    return NextResponse.json({ error: error.message, code: error.code || null }, { status: 500 })
  }
}
