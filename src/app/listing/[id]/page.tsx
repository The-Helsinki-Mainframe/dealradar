import { Suspense } from 'react'
import { ListingDetailPage } from '@/components/listing/ListingDetailPage'

export default async function ListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <Suspense>
      <ListingDetailPage id={id} />
    </Suspense>
  )
}
