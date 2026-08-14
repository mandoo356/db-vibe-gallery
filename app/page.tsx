'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { fetchApps, type AppItem } from '@/lib/firestore'

function AppCard({ app }: { app: AppItem }) {
  return (
    <article
      className="bg-surface-container-lowest rounded-xl border border-surface-variant p-6 flex flex-col h-full hover:-translate-y-1 transition-transform duration-300 overflow-hidden"
      style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-lg bg-surface-container-low border border-surface-variant overflow-hidden flex items-center justify-center flex-shrink-0">
          {app.imageUrl ? (
            <img src={app.imageUrl} alt={app.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-primary font-bold text-lg">{app.name.charAt(0).toUpperCase()}</span>
          )}
        </div>
        <div className="flex items-center gap-1 text-primary-container">
          <span className="material-symbols-outlined icon-fill text-sm">star</span>
          <span className="text-xs font-bold text-text-primary">{app.averageRating.toFixed(1)}</span>
        </div>
      </div>

      <h3 className="text-base font-semibold text-text-primary mb-2">{app.name}</h3>
      <p className="text-sm text-text-secondary flex-grow mb-4 line-clamp-3">{app.description}</p>

      {app.tags && app.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {app.tags.map(tag => (
            <span key={tag} className="px-3 py-1 bg-primary-fixed text-primary rounded-full text-xs font-semibold">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <Link
          href={`/apps/${app.id}`}
          className="flex-1 text-center bg-surface-container-low border border-surface-variant text-text-secondary text-sm font-medium py-2 rounded-lg hover:border-primary-container hover:text-primary-container transition-colors"
        >
          상세 보기
        </Link>
        <a
          href={app.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 text-center bg-surface-container-lowest border border-primary-container text-primary-container text-sm font-medium py-2 rounded-lg hover:bg-primary-container hover:text-on-primary-container transition-colors"
        >
          앱 방문하기
        </a>
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
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow w-full max-w-screen-xl mx-auto px-8 py-16">
        <section className="mb-12">
          <h1 className="text-5xl font-bold text-text-primary mb-4">애플리케이션 탐색</h1>
          <p className="text-lg text-text-secondary max-w-2xl">
            DB Vibe 생태계의 다양한 사내 애플리케이션을 발견하고 활용하세요. 업무 효율성을 높이는 도구들이 준비되어 있습니다.
          </p>
        </section>

        {loading ? (
          <div className="flex justify-center items-center h-64 text-text-secondary">불러오는 중...</div>
        ) : apps.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-text-secondary">
            <span className="material-symbols-outlined text-6xl mb-4">apps</span>
            <p className="text-lg">아직 등록된 앱이 없어요.</p>
            <Link href="/register" className="mt-4 bg-primary-container text-on-primary-container px-6 py-2 rounded-lg hover:opacity-90">
              첫 번째 앱 등록하기
            </Link>
          </div>
        ) : (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {apps.map(app => <AppCard key={app.id} app={app} />)}
          </section>
        )}
      </main>
      <Footer />
    </div>
  )
}
