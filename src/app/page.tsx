import { Suspense } from 'react'
import { ListingsPage } from '@/components/listing/ListingsPage'

export default function Home() {
  return (
    <Suspense>
      <ListingsPage />
    </Suspense>
  )
}
