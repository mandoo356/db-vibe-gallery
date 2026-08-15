'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import AnimatedBg from '@/components/AnimatedBg'
import { fetchApps, type AppItem } from '@/lib/firestore'

function Stars({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <span
          key={i}
          className={`material-symbols-outlined text-base ${i <= Math.round(value) ? 'icon-fill' : ''}`}
          style={{ color: i <= Math.round(value) ? '#f59e0b' : 'rgba(255,255,255,0.15)' }}
        >star</span>
      ))}
    </div>
  )
}

function AppCard({ app }: { app: AppItem }) {
  return (
    <article className="group relative rounded-xl flex flex-col h-full transition-all duration-300 hover:-translate-y-1 overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(12px)' }}>
      {/* thumbnail */}
      <div className="relative h-36 overflow-hidden flex-shrink-0 rounded-t-xl flex items-center justify-center" style={{ background: '#0a0a12' }}>
        {(app.imageUrls?.[0] ?? app.imageUrl) ? (
          <img src={app.imageUrls?.[0] ?? app.imageUrl} alt={app.name} className="w-full h-full object-contain opacity-80 group-hover:opacity-100 transition-opacity" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-5xl font-black" style={{ color: 'rgba(168,85,247,0.5)' }}>
              {app.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        {/* rating badge */}
        <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', color: '#f59e0b' }}>
          <span className="material-symbols-outlined icon-fill text-xs">star</span>
          {app.averageRating.toFixed(1)}
        </div>
      </div>

      <div className="flex flex-col flex-grow p-5">
        <h3 className="text-sm font-semibold text-white mb-1.5 truncate">{app.name}</h3>
        <p className="text-xs flex-grow mb-3 line-clamp-2" style={{ color: 'rgba(255,255,255,0.45)' }}>{app.description}</p>

        <div className="mb-3">
          <Stars value={app.averageRating} />
          <span className="text-xs mt-1 block" style={{ color: 'rgba(255,255,255,0.3)' }}>{app.reviewCount}개 리뷰</span>
        </div>

        {app.tags && app.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {app.tags.slice(0, 3).map(tag => (
              <span key={tag} className="px-2 py-0.5 rounded text-xs font-medium"
                style={{ background: 'rgba(168,85,247,0.15)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.2)' }}>
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex gap-2 mt-auto">
          <Link href={`/apps/${app.id}`}
            className="flex-1 text-center py-2 rounded-lg text-xs font-medium transition-all"
            style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.08)' }}>
            상세 보기
          </Link>
          <a href={app.url} target="_blank" rel="noopener noreferrer"
            className="flex-1 text-center py-2 rounded-lg text-xs font-semibold transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #a855f7, #6366f1)', color: '#fff' }}>
            앱 방문
          </a>
        </div>
      </div>
    </article>
  )
}

export default function GalleryPage() {
  const [apps, setApps] = useState<AppItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchApps().then(data => { setApps(data); setLoading(false) })
  }, [])

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#000' }}>
      <AnimatedBg />
      <Navbar />

      <main className="relative z-10 flex-grow w-full max-w-screen-xl mx-auto px-8 pt-28 pb-16">
        {/* Hero */}
        <section className="mb-14 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-6"
            style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.25)', color: '#c084fc' }}>
            <span className="material-symbols-outlined text-sm icon-fill" style={{ color: '#a855f7' }}>auto_awesome</span>
            AI 학습자 앱 갤러리
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white mb-4 leading-tight">
            DB Vibe<br />
            <span style={{ background: 'linear-gradient(135deg, #a855f7, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Gallery
            </span>
          </h1>
          <p className="text-lg max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.45)' }}>
            학습자들이 만든 AI 앱을 발견하고, 별점을 남겨보세요.
          </p>
        </section>

        {loading ? (
          <div className="flex justify-center items-center h-64" style={{ color: 'rgba(255,255,255,0.3)' }}>
            <span className="material-symbols-outlined animate-spin text-4xl">progress_activity</span>
          </div>
        ) : apps.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64" style={{ color: 'rgba(255,255,255,0.3)' }}>
            <span className="material-symbols-outlined text-6xl mb-4">apps</span>
            <p className="text-lg mb-4">아직 등록된 앱이 없어요.</p>
            <Link href="/register"
              className="px-6 py-2.5 rounded-lg font-semibold hover:opacity-90 transition-opacity"
              style={{ background: 'linear-gradient(135deg, #a855f7, #6366f1)', color: '#fff' }}>
              첫 번째 앱 등록하기
            </Link>
          </div>
        ) : (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {apps.map(app => <AppCard key={app.id} app={app} />)}
          </section>
        )}
      </main>
      <Footer />
    </div>
  )
}
