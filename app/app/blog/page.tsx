import { Metadata } from 'next'
import BlogPageClient from './BlogPageClient'

export const metadata: Metadata = {
  title: 'Articles',
  description: 'Browse all published articles and discover great content.',
  openGraph: {
    title: 'Articles | Ediora',
    description: 'Browse all published articles and discover great content.',
    type: 'website',
  },
}

export default function BlogPage() {
  return <BlogPageClient />
}
