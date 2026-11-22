'use client'

import { X } from 'lucide-react'
import { useCallback, useEffect, useRef } from 'react'

export function PackingSlipModal({ order, onClose }: {
  order: {
    id: string;
    customer_name: string;
    customer_email: string;
    shipping_address: any;
    items: Array<{ title: string; quantity: number; price: number }>;
    total: number;
  } | null;
  onClose: () => void;
}) {
  const modalRef = useRef<HTMLDivElement>(null)

  const handlePrint = useCallback(() => {
    window.print()
  }, [])

  if (!order) return null

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 z-[120] flex items-center justify-center bg-neutral-950/60 p-4 backdrop-blur-sm print:hidden"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="packing-slip-title"
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto border border-neutral-200 bg-[#f7f7f4] p-5 text-neutral-950 shadow-2xl sm:p-7 print:block print:max-h-full print:max-w-full print:p-0 print:shadow-none"
      >
        <div className="flex items-start justify-between border-b border-neutral-200 pb-5 print:hidden">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700">
              Carolina Cache · Packing Slip
            </p>
            <h2 id="packing-slip-title" className="mt-2 text-2xl font-black tracking-tight">
              Packing Slip for Order #{order.id}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close packing slip"
            className="grid size-9 place-items-center border border-neutral-200 bg-white"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="packing-slip-content p-5 print:p-0">
          <h3 className="text-xl font-bold mb-4 print:text-black">Order Details</h3>
          <p><strong>Order ID:</strong> {order.id}</p>
          <p><strong>Customer Name:</strong> {order.customer_name}</p>
          <p><strong>Customer Email:</strong> {order.customer_email}</p>
          <p>
            <strong>Shipping Address:</strong>{' '}
            {order.shipping_address ? (
              <>
                {order.shipping_address.line1}, {order.shipping_address.city},{' '}
                {order.shipping_address.state} {order.shipping_address.postal_code},{' '}
                {order.shipping_address.country}
              </>
            ) : (
              'N/A'
            )}
          </p>

          <h3 className="text-xl font-bold mt-6 mb-4 print:text-black">Items</h3>
          <table className="w-full text-left table-auto">
            <thead>
              <tr>
                <th className="pb-2 border-b border-neutral-300 print:border-black">Item</th>
                <th className="pb-2 border-b border-neutral-300 print:border-black">Quantity</th>
                <th className="pb-2 border-b border-neutral-300 print:border-black">Price</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map((item, index) => (
                <tr key={index}>
                  <td className="py-2">{item.title}</td>
                  <td className="py-2">{item.quantity}</td>
                  <td className="py-2">${(item.price / 100).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className="text-lg font-bold mt-6 text-right print:text-black">
            Total: ${(order.total / 100).toFixed(2)}
          </p>
        </div>

        <div className="flex justify-end gap-3 border-t border-neutral-200 pt-4 sm:col-span-2 print:hidden">
          <button
            type="button"
            onClick={onClose}
            className="border border-neutral-300 bg-white px-4 py-3 text-xs font-bold uppercase tracking-wider"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="bg-neutral-950 px-5 py-3 text-xs font-black uppercase tracking-wider text-white hover:bg-emerald-700"
          >
            Print Now
          </button>
        </div>
      </section>
    </div>
  )
}
