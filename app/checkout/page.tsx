'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Check, LockKeyhole, ShieldCheck } from 'lucide-react'
import { useCart } from '@/components/cart-drawer'

export default function CheckoutPage() {
  const router = useRouter()
  const { lines, subtotal, remove } = useCart()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [street, setStreet] = useState('')
  const [street2, setStreet2] = useState('')
  const [city, setCity] = useState('')
  const [stateCode, setStateCode] = useState('')
  const [zip, setZip] = useState('')
  const [country, setCountry] = useState('United States')
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true)
  const [billingAddress, setBillingAddress] = useState({
    name: '', street1: '', street2: '', city: '', state: '', zip: '', country: 'United States',
  })
  const [marketingOptIn, setMarketingOptIn] = useState(false)

  const protectionFee = subtotal > 100 ? Math.max(1, Math.ceil(subtotal * 0.01)) : 0
  const [baseShipping, setBaseShipping] = useState<number>(18)
  const [carrierLabel, setCarrierLabel] = useState<string>('Enter State & ZIP for live rate')
  const [carrierInfo, setCarrierInfo] = useState({ carrier: 'Standard', service: 'Insured' })
  const [isCalculating, setIsCalculating] = useState<boolean>(false)
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [submitError, setSubmitError] = useState<string>('')

  const calculateShipping = useCallback(async () => {
    const cleanZip = zip.trim().slice(0, 5)
    const cleanState = stateCode.trim().toUpperCase()

    if (cleanZip.length !== 5 || cleanState.length < 2) {
      setBaseShipping(18)
      return
    }

    setIsCalculating(true)
    try {
      const response = await fetch('/api/shipping-rates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subtotal,
          items: lines.map(({ product, quantity }) => ({
            id: product.id,
            quantity,
          })),
          destination: {
            street: street.trim(),
            street2: street2.trim(),
            city: city.trim(),
            state: cleanState,
            zip: cleanZip,
            country,
          },
        }),
      })

      const data = await response.json()
      if (typeof data.baseRate === 'number') {
        setBaseShipping(data.baseRate)
        setCarrierLabel(
          data.fallback ? 'Standard flat rate' : `${data.carrier} ${data.service}`
        )
        setCarrierInfo({
          carrier: data.carrier || 'Standard',
          service: data.service || 'Insured',
        })
      } else if (typeof data.rate === 'number') {
        setBaseShipping(Math.max(0, data.rate - (data.protectionFee || 0)))
        setCarrierLabel(`${data.carrier} ${data.service}`)
        setCarrierInfo({
          carrier: data.carrier || 'Standard',
          service: data.service || 'Insured',
        })
      }
    } catch (error) {
      console.error('Failed to fetch shipping rate:', error)
      setBaseShipping(18)
      setCarrierLabel('Standard flat rate')
    } finally {
      setIsCalculating(false)
    }
  }, [zip, stateCode, street, city, lines, subtotal])

  useEffect(() => {
    const cleanZip = zip.trim().slice(0, 5)
    const cleanState = stateCode.trim()
    if (cleanZip.length === 5 && cleanState.length >= 2) {
      const timer = setTimeout(() => {
        calculateShipping()
      }, 400)
      return () => clearTimeout(timer)
    } else {
      setBaseShipping(18)
    }
  }, [zip, stateCode, calculateShipping])

  const total = subtotal + baseShipping + protectionFee

  async function handleOrderSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (lines.length === 0 || submitting) return

    setSubmitting(true)
    setSubmitError('')
    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim()
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: fullName,
          customer_email: email.trim(),
          shipping_address: {
            name: fullName,
            street1: street.trim(),
            street2: street2.trim(),
            city: city.trim(),
            state: stateCode.trim().toUpperCase(),
            zip: zip.trim(),
            country,
          },
          billing_same_as_shipping: billingSameAsShipping,
          billing_address: billingSameAsShipping ? {
            name: fullName,
            street1: street.trim(),
            street2: street2.trim(),
            city: city.trim(),
            state: stateCode.trim().toUpperCase(),
            zip: zip.trim(),
            country,
          } : {
            ...billingAddress,
            name: billingAddress.name.trim(),
            street1: billingAddress.street1.trim(),
            street2: billingAddress.street2.trim(),
            city: billingAddress.city.trim(),
            state: billingAddress.state.trim().toUpperCase(),
            zip: billingAddress.zip.trim(),
            country: billingAddress.country.trim(),
          },
          items: lines.map(({ product, quantity }) => ({
            id: product.id,
            name: product.name || product.title,
            sku: product.sku || product.id,
            price: product.price,
            quantity,
            category: product.categoryLabel || product.category,
          })),
          subtotal,
          shipping_cost: baseShipping,
          protection_fee: protectionFee,
          total,
          shipping_carrier: carrierInfo.carrier,
          shipping_service: carrierInfo.service,
          marketing_opt_in: marketingOptIn,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not place order.')

      lines.forEach(({ product }) => remove(product.id))
      router.push(`/success?order=${encodeURIComponent(data.order?.order_number || '')}&email=${data.notificationsSent ? 'sent' : 'unavailable'}`)
    } catch (err: any) {
      setSubmitError(err?.message || 'Failed to place order.')
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f7f4] text-neutral-950">
      <header className="border-b border-neutral-200 bg-white px-5 py-5 sm:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className="font-serif text-2xl font-black tracking-[-0.07em]">
            Carolina <span className="text-emerald-700">Cache</span>
          </Link>
          <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-neutral-500">
            <LockKeyhole className="size-3" /> Secure checkout
          </span>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-10 sm:px-8 lg:grid-cols-[1fr_0.72fr] lg:gap-20 lg:py-16">
        <section>
          <Link href="/" className="mb-8 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-500 hover:text-neutral-950">
            <ArrowLeft className="size-3" /> Back to archive
          </Link>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Collection checkout</p>
          <h1 className="mt-3 text-5xl font-black tracking-[-0.07em] sm:text-7xl">Complete your acquisition.</h1>

          <form className="mt-10 space-y-8" onSubmit={handleOrderSubmit}>
            <fieldset className="space-y-4">
              <legend className="text-lg font-black">01 / Shipping details</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                <input required value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name" aria-label="First name" className="border border-neutral-300 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-600" />
                <input required value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last name" aria-label="Last name" className="border border-neutral-300 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-600" />
              </div>
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" aria-label="Email address" className="w-full border border-neutral-300 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-600" />
              <input required value={street} onChange={(e) => setStreet(e.target.value)} placeholder="Street address" aria-label="Shipping street address" autoComplete="shipping address-line1" className="w-full border border-neutral-300 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-600" />
              <input value={street2} onChange={(e) => setStreet2(e.target.value)} placeholder="Apt / Suite (optional)" aria-label="Shipping apartment or suite" autoComplete="shipping address-line2" className="w-full border border-neutral-300 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-600" />
              <div className="grid gap-3 sm:grid-cols-3">
                <input required value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" aria-label="Shipping city" autoComplete="shipping address-level2" className="border border-neutral-300 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-600" />
                <input required value={stateCode} onChange={(e) => setStateCode(e.target.value)} placeholder="State (e.g. NC)" aria-label="Shipping state" autoComplete="shipping address-level1" maxLength={2} className="border border-neutral-300 bg-white px-4 py-3 text-sm uppercase outline-none focus:border-emerald-600" />
                <input required value={zip} onChange={(e) => setZip(e.target.value.replace(/\D/g, '').slice(0, 5))} placeholder="ZIP" aria-label="Shipping ZIP code" autoComplete="shipping postal-code" inputMode="numeric" pattern="[0-9]{5}" maxLength={5} className="border border-neutral-300 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-600" />
              </div>
              <input required value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Country" aria-label="Shipping country" autoComplete="shipping country-name" className="w-full border border-neutral-300 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-600" />
            </fieldset>

            <label className="flex cursor-pointer items-start gap-3 border border-neutral-200 bg-white p-4 text-sm text-neutral-700">
              <input type="checkbox" checked={billingSameAsShipping} onChange={(event) => setBillingSameAsShipping(event.target.checked)} className="mt-0.5 size-4 accent-emerald-700" />
              <span>Billing address is the same as shipping address</span>
            </label>

            {!billingSameAsShipping && <fieldset className="space-y-4 border border-neutral-200 bg-white p-5">
              <legend className="px-2 text-lg font-black">Billing address</legend>
              <input required value={billingAddress.name} onChange={(e) => setBillingAddress((current) => ({ ...current, name: e.target.value }))} placeholder="Full name" aria-label="Billing full name" autoComplete="billing name" className="w-full border border-neutral-300 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-600" />
              <input required value={billingAddress.street1} onChange={(e) => setBillingAddress((current) => ({ ...current, street1: e.target.value }))} placeholder="Street address" aria-label="Billing street address" autoComplete="billing address-line1" className="w-full border border-neutral-300 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-600" />
              <input value={billingAddress.street2} onChange={(e) => setBillingAddress((current) => ({ ...current, street2: e.target.value }))} placeholder="Apt / Suite (optional)" aria-label="Billing apartment or suite" autoComplete="billing address-line2" className="w-full border border-neutral-300 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-600" />
              <div className="grid gap-3 sm:grid-cols-3">
                <input required value={billingAddress.city} onChange={(e) => setBillingAddress((current) => ({ ...current, city: e.target.value }))} placeholder="City" aria-label="Billing city" autoComplete="billing address-level2" className="border border-neutral-300 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-600" />
                <input required value={billingAddress.state} onChange={(e) => setBillingAddress((current) => ({ ...current, state: e.target.value }))} placeholder="State" aria-label="Billing state" autoComplete="billing address-level1" maxLength={2} className="border border-neutral-300 bg-white px-4 py-3 text-sm uppercase outline-none focus:border-emerald-600" />
                <input required value={billingAddress.zip} onChange={(e) => setBillingAddress((current) => ({ ...current, zip: e.target.value.replace(/\D/g, '').slice(0, 5) }))} placeholder="ZIP" aria-label="Billing ZIP code" autoComplete="billing postal-code" inputMode="numeric" pattern="[0-9]{5}" maxLength={5} className="border border-neutral-300 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-600" />
              </div>
              <input required value={billingAddress.country} onChange={(e) => setBillingAddress((current) => ({ ...current, country: e.target.value }))} placeholder="Country" aria-label="Billing country" autoComplete="billing country-name" className="w-full border border-neutral-300 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-600" />
            </fieldset>}

            <label className="flex items-start gap-3 border border-neutral-200 bg-white p-4 text-sm text-neutral-700">
              <input type="checkbox" checked={marketingOptIn} onChange={(event) => setMarketingOptIn(event.target.checked)} className="mt-0.5 size-4 accent-emerald-700" />
              <span>Email me about new drops &amp; live auctions</span>
            </label>

            <fieldset className="space-y-4">
              <legend className="text-lg font-black">02 / Payment</legend>
              <input required placeholder="Card number" aria-label="Card number" inputMode="numeric" className="w-full border border-neutral-300 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-600" />
              <div className="grid gap-3 sm:grid-cols-2">
                <input required placeholder="MM / YY" aria-label="Expiration date" className="border border-neutral-300 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-600" />
                <input required placeholder="CVC" aria-label="CVC" className="border border-neutral-300 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-600" />
              </div>
            </fieldset>

            {submitError && (
              <p role="alert" className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {submitError}
              </p>
            )}

            <button type="submit" disabled={submitting || lines.length === 0} className="w-full bg-neutral-950 px-5 py-4 text-xs font-black uppercase tracking-[0.16em] text-white transition hover:bg-emerald-700 disabled:opacity-50">
              {submitting ? 'Processing order...' : 'Place secure order'} <Check className="ml-2 inline size-4" />
            </button>
          </form>
        </section>

        <aside className="h-fit border border-neutral-200 bg-white p-6 sm:p-8">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-700">
            <ShieldCheck className="size-4" /> Protected acquisition
          </div>
          <h2 className="mt-6 text-2xl font-black">Order summary</h2>
          <div className="mt-6 space-y-4 border-y border-neutral-200 py-5">
            {lines.length === 0 ? (
              <p className="text-sm text-neutral-500">Your cart is empty. Return to the archive to select a find.</p>
            ) : (
              lines.map(({ product, quantity }) => (
                <div key={product.id} className="flex justify-between gap-4 text-sm">
                  <span>{product.name} &times; {quantity}</span>
                  <span className="font-bold">${(product.price * quantity).toLocaleString()}</span>
                </div>
              ))
            )}
            <div className="flex items-start justify-between gap-4 text-sm">
              <div>
                <span>Shipping</span>
                <p className="text-xs text-neutral-500">{isCalculating ? 'Calculating lowest rate...' : carrierLabel}</p>
              </div>
              <span className="font-bold">{isCalculating ? '...' : `$${baseShipping}`}</span>
            </div>
            {protectionFee > 0 && (
              <div className="flex items-start justify-between gap-4 text-sm">
                <div>
                  <span>High-value transit protection</span>
                  <p className="text-xs text-neutral-500">Full value coverage (1% over $100)</p>
                </div>
                <span className="font-bold">${protectionFee}</span>
              </div>
            )}
          </div>
          <div className="mt-4 flex justify-between text-lg font-black">
            <span>Total</span>
            <span>${total.toLocaleString()}</span>
          </div>
          <p className="mt-5 text-xs leading-relaxed text-neutral-500">
            Unlock priority shipping promos &amp; VIP repeat buyer perks. Rewards are applied to eligible accounts after purchase.
          </p>
        </aside>
      </div>
    </main>
  )
}
