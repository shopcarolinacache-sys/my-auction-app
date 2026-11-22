'use client'

import { useState } from 'react'
import { PackingSlipModal } from '@/components/packing-slip-modal'

export default function OrderDetailsPage() {
  const [isPackingSlipOpen, setIsPackingSlipOpen] = useState(false)

  // Dummy order data for demonstration
  const dummyOrder = {
    id: '12345',
    customer_name: 'John Doe',
    customer_email: 'john.doe@example.com',
    shipping_address: {
      line1: '123 Main St',
      city: 'Anytown',
      state: 'CA',
      postal_code: '90210',
      country: 'USA',
    },
    items: [
      { title: 'Item A', quantity: 2, price: 1000 },
      { title: 'Item B', quantity: 1, price: 2500 },
    ],
    total: 4500,
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Order Details #12345</h1>
      <button
        onClick={() => setIsPackingSlipOpen(true)}
        className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Print packing slip
      </button>

      {isPackingSlipOpen && (
        <PackingSlipModal
          order={dummyOrder}
          onClose={() => setIsPackingSlipOpen(false)}
        />
      )}
    </div>
  )
}
