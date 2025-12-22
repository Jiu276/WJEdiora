import { Metadata } from 'next'
export const dynamic = 'force-dynamic'
export const revalidate = 0

import SearchPageClient from './SearchPageClient'

export const metadata: Metadata = {
  title: 'Search Articles',
  description: 'Search and find relevant articles.',
  robots: {
    index: false, // typically exclude search pages from indexing
    follow: false,
  },
}

export default function SearchPage() {
  return <SearchPageClient />
}
