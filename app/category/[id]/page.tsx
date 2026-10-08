import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { CategoryPageClient } from '@/components/category-page-client'
import { categoryIds, getCategory } from '@/data/storefront'

export const dynamic = 'force-static'

export function generateStaticParams() {
  return categoryIds.map((id) => ({ id }))
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const category = getCategory(id)
  if (!category) return { title: 'Category not found' }
  const description = `${category.description} Shop curated ${category.title.toLowerCase()} at Carolina Cache.`
  return { title: category.title, description, alternates: { canonical: `/category/${id}` }, openGraph: { title: category.title, description, type: 'website', images: [{ url: category.image, alt: category.title }] } }
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!getCategory(id)) notFound()
  return <CategoryPageClient id={id} />
}
