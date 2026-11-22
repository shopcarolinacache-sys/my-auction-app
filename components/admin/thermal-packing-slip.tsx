import { useMemo, useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Printer, X } from 'lucide-react'

type OrderItem = { id?: string; product_id?: string; sku?: string; title?: string; name?: string; quantity?: number; price?: number; image?: string; images?: string[]; category?: string; section_placement?: string; source?: string; auction_id?: string }
type Order = { id: string; order_number: string; customer_name: string; customer_email: string; shipping_address: unknown; billing_address?: unknown; billing_same_as_shipping?: boolean; subtotal: number; shipping_cost?: number; protection_fee?: number; total: number; payment_status: string; fulfillment_status: string; carrier: string | null; tracking_number: string | null; notes: string | null; created_at: string; items?: unknown; source?: string; shipped_at?: string }
type Product = { id: string; sku: string | null; title: string; category: string | null; section_placement: string | null; images: string[] | null }

function asAddress(value: unknown): Record<string, string> {
  if (typeof value === 'string') return { street1: value }
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  return Object.fromEntries(Object.entries(value as Record<string, unknown>).filter((entry): entry is [string, string] => typeof entry[1] === 'string'))
}
function addressLines(value: unknown) {
  const address = asAddress(value)
  return [address.name, address.street1, address.street2, [address.city, address.state, address.zip].filter(Boolean).join(', '), address.country].filter(Boolean)
}
function normalizedItems(value: unknown): OrderItem[] {
  if (!Array.isArray(value)) return []
  return value.map((entry) => entry && typeof entry === 'object' ? entry as OrderItem : null).filter((entry): entry is OrderItem => !!entry)
}
function escapeHtml(value: unknown) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character] ?? character)
}

export function ThermalPackingSlip({ orders, onClose }: { orders: Order[]; onClose: () => void }) {
  const [printMode, setPrintMode] = useState<'thermal' | 'letter'>('thermal')
  const printRef = useRef<HTMLDivElement>(null)

  const money = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value) || 0)

  useEffect(() => {
    const style = document.createElement('style')
    style.id = 'print-style'
    if (printMode === 'thermal') {
      style.innerHTML = `
        @page { size: 4in 6in; margin: 0.15in; }
        body { margin: 0; }
        .packing-slip-container { width: 4in; height: 6in; overflow: hidden; }
        .packing-slip {
          font-family: 'monospace', monospace;
          font-size: 10px;
          line-height: 1.2;
          color: #000000;
          background-color: #FFFFFF;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          padding: 0.15in;
          box-sizing: border-box;
        }
        .packing-slip h1, .packing-slip h2, .packing-slip h3, .packing-slip p, .packing-slip span, .packing-slip div, .packing-slip table, .packing-slip th, .packing-slip td {
          color: #000000 !important;
          background-color: #FFFFFF !important;
        }
        .packing-slip header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 1px solid #000000;
          padding-bottom: 5px;
          margin-bottom: 5px;
        }
        .packing-slip .brand {
          font-weight: bold;
          font-size: 12px;
        }
        .packing-slip .contact {
          font-size: 8px;
        }
        .packing-slip .order-meta {
          text-align: right;
          font-size: 9px;
        }
        .packing-slip .address-box {
          border: 1px solid #000000;
          padding: 3px;
          margin-bottom: 5px;
        }
        .packing-slip table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 5px;
        }
        .packing-slip th, .packing-slip td {
          border: 1px solid #000000;
          padding: 2px 3px;
          text-align: left;
        }
        .packing-slip th {
          font-weight: bold;
        }
        .packing-slip .gift-note {
          margin-top: 5px;
          font-style: italic;
        }
        .packing-slip .page-break {
          page-break-after: always;
        }
        @media print {
          body > *:not(.packing-slip-container) { display: none !important; }
        }
      `
    } else {
      style.innerHTML = `
        @page { size: 8.5in 11in; margin: 0.5in; }
        body { margin: 0; }
        .packing-slip-container { width: 8.5in; height: 11in; overflow: hidden; }
        .packing-slip {
          font-family: 'Arial', sans-serif;
          font-size: 12px;
          line-height: 1.5;
          color: #000000;
          background-color: #FFFFFF;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          padding: 0.5in;
          box-sizing: border-box;
        }
        .packing-slip h1, .packing-slip h2, .packing-slip h3, .packing-slip p, .packing-slip span, .packing-slip div, .packing-slip table, .packing-slip th, .packing-slip td {
          color: #000000 !important;
          background-color: #FFFFFF !important;
        }
        .packing-slip header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 2px solid #000000;
          padding-bottom: 10px;
          margin-bottom: 10px;
        }
        .packing-slip .brand {
          font-weight: bold;
          font-size: 18px;
        }
        .packing-slip .contact {
          font-size: 10px;
        }
        .packing-slip .order-meta {
          text-align: right;
          font-size: 11px;
        }
        .packing-slip .address-box {
          border: 1px solid #000000;
          padding: 5px;
          margin-bottom: 10px;
        }
        .packing-slip table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }
        .packing-slip th, .packing-slip td {
          border: 1px solid #000000;
          padding: 5px 8px;
          text-align: left;
        }
        .packing-slip th {
          font-weight: bold;
        }
        .packing-slip .gift-note {
          margin-top: 10px;
          font-style: italic;
        }
        .packing-slip .page-break {
          page-break-after: always;
        }
        @media print {
          body > *:not(.packing-slip-container) { display: none !important; }
        }
      `
    }
    document.head.appendChild(style)

    return () => {
      document.head.removeChild(style)
    }
  }, [printMode])

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/45" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section role="dialog" aria-modal="true" aria-labelledby="print-title" className="flex h-full w-full max-w-3xl flex-col bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
          <h2 id="print-title" className="text-xl font-black">Print Packing Slip{orders.length > 1 ? `s (${orders.length})` : ''}</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="bg-neutral-900 text-white hover:bg-neutral-800 border border-neutral-900" onClick={() => setPrintMode('thermal')} disabled={printMode === 'thermal'}>4x6 Thermal</Button>
            <Button variant="outline" className="bg-neutral-900 text-white hover:bg-neutral-800 border border-neutral-900" onClick={() => setPrintMode('letter')} disabled={printMode === 'letter'}>8.5x11 Letter</Button>
            <Button className="bg-neutral-900 text-white hover:bg-neutral-800 border border-neutral-900" onClick={handlePrint}><Printer data-icon="inline-start" />Print Now</Button>
            <Button type="button" aria-label="Close print preview" onClick={onClose} className="grid size-9 place-items-center border border-neutral-200 hover:bg-neutral-50"><X className="size-4" /></Button>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-5">
          {orders.map((order, orderIndex) => {
            const items = normalizedItems(order.items)
            const billingDiffers = order.billing_same_as_shipping === false
            const showPrices = !billingDiffers
            const shipAddress = addressLines(order.shipping_address)

            return (
              <div key={order.id} className="packing-slip-container">
                <div className="packing-slip">
                  <header>
                    <div>
                      <div className="brand">CAROLINA CACHE</div>
                      <div className="contact">hello@shopcarolinacache.com</div>
                      <div className="contact">www.shopcarolinacache.com</div>
                    </div>
                    <div className="order-meta">
                      <strong>ORDER #: {escapeHtml(order.order_number)}</strong><br />
                      <span>DATE: {escapeHtml(new Date(order.created_at).toLocaleDateString())}</span><br />
                      {billingDiffers && <span className="font-bold">GIFT ORDER</span>}
                    </div>
                  </header>

                  <h3 className="font-bold">SHIP TO:</h3>
                  <address className="address-box not-italic">
                    {shipAddress.map((line, index) => <div key={`${line}-${index}`}>{escapeHtml(line)}</div>)}
                  </address>

                  <table>
                    <thead>
                      <tr>
                        <th>QTY</th>
                        <th>SKU</th>
                        <th>ITEM</th>
                        {showPrices && <th>PRICE</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, index) => (
                        <tr key={index}>
                          <td>{Number(item.quantity) || 1}</td>
                          <td>{escapeHtml(item.sku ?? '—')}</td>
                          <td>{escapeHtml(item.title ?? item.name ?? 'Item')}</td>
                          {showPrices && <td>{escapeHtml(money(Number(item.price) || 0))}</td>}
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {!showPrices && <p className="gift-note">Thank you for your gift order!</p>}
                  {order.notes && <p className="gift-note">Notes: {escapeHtml(order.notes)}</p>}
                </div>
                {orderIndex < orders.length - 1 && <div className="page-break"></div>}
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
