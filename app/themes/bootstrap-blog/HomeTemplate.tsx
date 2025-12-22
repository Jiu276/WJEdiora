'use client'

import { useState } from 'react'
import { Input, Button } from 'antd'
import { SearchOutlined, CalendarOutlined, UserOutlined, MessageOutlined, ArrowDownOutlined } from '@ant-design/icons'
import Link from 'next/link'
import LazyImage from '@/components/LazyImage'
import BackToTop from '@/components/BackToTop'
import type { ThemeConfig } from '@/lib/themeLoader'

const { Search } = Input

interface Article {
  id: string
  title: string
  excerpt: string | null
  slug: string
  featuredImage: string | null
  publishDate: string | null
  category?: {
    name: string
  } | null
  author: string
  viewCount?: number
}

interface HomeTemplateProps {
  articles: Article[]
  config: ThemeConfig
  searchKeyword?: string
  onSearch?: (keyword: string) => void
}

export default function HomeTemplate({ articles, config, searchKeyword = '', onSearch }: HomeTemplateProps) {
  const [email, setEmail] = useState('')

  const handleSearch = (value: string) => {
    if (onSearch) {
      onSearch(value)
    } else {
      window.location.href = `/search?q=${encodeURIComponent(value)}`
    }
  }

  const handleSubscribe = () => {
    // TODO: 实现订阅功能
    alert('订阅功能待实现')
  }

  const filteredArticles = searchKeyword
    ? articles.filter(
        (article) =>
          article.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
          (article.excerpt && article.excerpt.toLowerCase().includes(searchKeyword.toLowerCase()))
      )
    : articles

  // 特色文章（前3篇）
  const featuredArticles = filteredArticles.slice(0, 3)
  // 最新文章（接下来的3篇）
  const latestArticles = filteredArticles.slice(3, 6)

  return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      {/* Header */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          background: '#fff',
          borderBottom: '1px solid #e5e7eb',
          padding: '16px 0',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" style={{ fontSize: '24px', fontWeight: 'bold', color: '#000', textDecoration: 'none' }}>
            Bootstrap Blog
          </Link>
          <nav style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
            <Link href="/" style={{ color: '#000', textDecoration: 'none', fontSize: '14px' }}>Home</Link>
            <Link href="/blog" style={{ color: '#000', textDecoration: 'none', fontSize: '14px' }}>Blog</Link>
            <Link href="/archive" style={{ color: '#000', textDecoration: 'none', fontSize: '14px' }}>Archive</Link>
            <Link href="/admin" style={{ color: '#000', textDecoration: 'none', fontSize: '14px' }}>Admin</Link>
            <Search
              placeholder="Search"
              onSearch={handleSearch}
              style={{ width: 200 }}
              allowClear
            />
            <span style={{ fontSize: '14px', color: '#666' }}>EN</span>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      {!searchKeyword && filteredArticles.length > 0 && (
        <section
          style={{
            position: 'relative',
            height: '600px',
            background: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${filteredArticles[0]?.featuredImage || '/api/placeholder/1200/600'})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            padding: '0 24px',
          }}
        >
          <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%' }}>
            <div style={{ maxWidth: 600, color: '#fff' }}>
              <h1 style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: 24, lineHeight: 1.2 }}>
                Bootstrap 5 Blog - A free template
              </h1>
              <Button
                type="default"
                size="large"
                style={{
                  border: '2px solid #fff',
                  background: 'transparent',
                  color: '#fff',
                  padding: '12px 32px',
                  height: 'auto',
                }}
                onClick={() => window.location.href = '/blog'}
              >
                DISCOVER MORE
              </Button>
            </div>
            <div style={{ position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)', color: '#fff', textAlign: 'center' }}>
              <div style={{ fontSize: '12px', marginBottom: 8 }}>SCROLL DOWN</div>
              <ArrowDownOutlined style={{ fontSize: '20px' }} />
            </div>
          </div>
        </section>
      )}

      {/* Introduction Section */}
      {!searchKeyword && (
        <section style={{ padding: '80px 24px', background: '#fff', textAlign: 'center' }}>
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <h2 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: 24, color: '#000' }}>
              Some great intro here
            </h2>
            <p style={{ fontSize: '16px', lineHeight: 1.8, color: '#666' }}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
              Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>
          </div>
        </section>
      )}

      {/* Featured Articles Section */}
      {featuredArticles.length > 0 && (
        <section style={{ padding: '80px 24px', background: '#f9fafb' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 32 }}>
              {featuredArticles.map((article) => (
                <article key={article.id} style={{ background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                  <Link href={`/blog/${article.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    {article.featuredImage && (
                      <div style={{ height: 250, overflow: 'hidden' }}>
                        <LazyImage
                          src={article.featuredImage}
                          alt={article.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                    )}
                    <div style={{ padding: 24 }}>
                      <div style={{ fontSize: '12px', fontWeight: 'bold', color: config.colors.primary, marginBottom: 12, letterSpacing: '1px' }}>
                        {article.category?.name?.toUpperCase() || 'UNCATEGORIZED'}
                      </div>
                      <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: 12, color: '#000', lineHeight: 1.3 }}>
                        {article.title}
                      </h3>
                      <p style={{ fontSize: '14px', lineHeight: 1.6, color: '#666', marginBottom: 16, minHeight: 60 }}>
                        {article.excerpt
                          ? article.excerpt.replace(/<[^>]*>/g, '').substring(0, 120) + '...'
                          : '点击阅读更多...'}
                      </p>
                      <div style={{ display: 'flex', gap: 16, fontSize: '12px', color: '#999' }}>
                        <span><UserOutlined style={{ marginRight: 4 }} />{article.author}</span>
                        {article.publishDate && (
                          <span><CalendarOutlined style={{ marginRight: 4 }} />{new Date(article.publishDate).toLocaleDateString('zh-CN')}</span>
                        )}
                        {article.viewCount !== undefined && (
                          <span><MessageOutlined style={{ marginRight: 4 }} />{article.viewCount}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Call-to-Action Banner */}
      {!searchKeyword && (
        <section
          style={{
            padding: '100px 24px',
            background: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('/api/placeholder/1200/400')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            textAlign: 'center',
            color: '#fff',
          }}
        >
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <p style={{ fontSize: '18px', lineHeight: 1.8, marginBottom: 32 }}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
            <Button
              type="default"
              size="large"
              style={{
                border: '2px solid #fff',
                background: 'transparent',
                color: '#fff',
                padding: '12px 32px',
                height: 'auto',
              }}
              onClick={() => window.location.href = '/blog'}
            >
              VIEW MORE
            </Button>
          </div>
        </section>
      )}

      {/* Latest from the Blog Section */}
      {latestArticles.length > 0 && (
        <section style={{ padding: '80px 24px', background: '#fff' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <h2 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: 16, color: '#000' }}>
                Latest from the blog
              </h2>
              <p style={{ fontSize: '16px', color: '#666' }}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 32 }}>
              {latestArticles.map((article) => (
                <article key={article.id} style={{ background: '#fff' }}>
                  <Link href={`/blog/${article.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    {article.featuredImage && (
                      <div style={{ height: 200, overflow: 'hidden', marginBottom: 16, borderRadius: 8 }}>
                        <LazyImage
                          src={article.featuredImage}
                          alt={article.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                    )}
                    <div style={{ fontSize: '12px', color: '#999', marginBottom: 8 }}>
                      {article.publishDate && (
                        <span>{new Date(article.publishDate).toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                      )}
                      {article.category && (
                        <span style={{ marginLeft: 8, fontWeight: 'bold', color: config.colors.primary }}>
                          | {article.category.name.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: 12, color: '#000', lineHeight: 1.3 }}>
                      {article.title}
                    </h3>
                    <p style={{ fontSize: '14px', lineHeight: 1.6, color: '#666' }}>
                      {article.excerpt
                        ? article.excerpt.replace(/<[^>]*>/g, '').substring(0, 100) + '...'
                        : '点击阅读更多...'}
                    </p>
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Newsletter Subscription */}
      {!searchKeyword && (
        <section style={{ padding: '80px 24px', background: '#f9fafb', textAlign: 'center' }}>
          <div style={{ maxWidth: 600, margin: '0 auto' }}>
            <h2 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: 16, color: '#000' }}>
              Subscribe to Newsletter
            </h2>
            <p style={{ fontSize: '16px', color: '#666', marginBottom: 32 }}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </p>
            <div style={{ display: 'flex', gap: 8, maxWidth: 400, margin: '0 auto' }}>
              <Input
                placeholder="Type your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                size="large"
                style={{ flex: 1 }}
              />
              <Button type="primary" size="large" onClick={handleSubscribe} style={{ background: '#000', borderColor: '#000' }}>
                Subscribe
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer style={{ background: '#1a1a1a', color: '#fff', padding: '60px 24px 20px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {/* Footer Images */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 60 }}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} style={{ height: 150, background: '#333', borderRadius: 4 }} />
            ))}
          </div>

          {/* Footer Content */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 40, marginBottom: 40 }}>
            {/* Left Column */}
            <div>
              <h4 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: 20 }}>Bootstrap Blog</h4>
              <p style={{ fontSize: '14px', color: '#999', marginBottom: 8 }}>53 Broadway, Broklyn, NY 11249</p>
              <p style={{ fontSize: '14px', color: '#999', marginBottom: 8 }}>(020) 123 456 789</p>
              <p style={{ fontSize: '14px', color: '#999', marginBottom: 16 }}>Info@Company.com</p>
              <div style={{ display: 'flex', gap: 12 }}>
                {['Facebook', 'Twitter', 'Google+', 'Behance', 'Pinterest'].map((social) => (
                  <span key={social} style={{ width: 32, height: 32, background: '#333', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    {social[0]}
                  </span>
                ))}
              </div>
            </div>

            {/* Middle Column */}
            <div>
              <h4 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: 20 }}>Navigation</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {['My Account', 'Add Listing', 'Pricing', 'Privacy & Policy', 'Our Partners', 'FAQ', 'How It Works', 'Contact'].map((link) => (
                  <Link key={link} href="#" style={{ color: '#999', textDecoration: 'none', fontSize: '14px' }}>
                    {link}
                  </Link>
                ))}
              </div>
            </div>

            {/* Right Column */}
            <div>
              <h4 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: 20 }}>Recent Posts</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {filteredArticles.slice(0, 3).map((article) => (
                  <Link
                    key={article.id}
                    href={`/blog/${article.id}`}
                    style={{ display: 'flex', gap: 12, textDecoration: 'none', color: '#999' }}
                  >
                    {article.featuredImage && (
                      <div style={{ width: 60, height: 60, borderRadius: 4, overflow: 'hidden', flexShrink: 0 }}>
                        <LazyImage
                          src={article.featuredImage}
                          alt={article.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                    )}
                    <div>
                      <div style={{ fontSize: '14px', color: '#fff', marginBottom: 4, lineHeight: 1.3 }}>
                        {article.title.length > 40 ? article.title.substring(0, 40) + '...' : article.title}
                      </div>
                      {article.publishDate && (
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          {new Date(article.publishDate).toLocaleDateString('zh-CN')}
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div style={{ textAlign: 'center', paddingTop: 20, borderTop: '1px solid #333', color: '#999', fontSize: '14px' }}>
            © {new Date().getFullYear()}. All rights reserved. Your great site.
          </div>
        </div>
      </footer>

      <BackToTop color="#000" />
    </div>
  )
}

