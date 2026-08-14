'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { fetchApp, fetchReviews, createReview, type AppItem, type Review } from '@/lib/firestore'

function Stars({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  const [hover, setHover] = useState(0)
  const interactive = !!onChange
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(i => {
        const filled = i <= (hover || value)
        return (
          <span
            key={i}
            onClick={() => onChange?.(i)}
            onMouseEnter={() => interactive && setHover(i)}
            onMouseLeave={() => interactive && setHover(0)}
            style={{ cursor: interactive ? 'pointer' : 'default' }}
            className={`material-symbols-outlined text-2xl transition-colors ${
              filled
                ? 'icon-fill text-primary-container'
                : interactive
                  ? 'text-surface-variant'
                  : 'text-surface-container-high'
            }`}
          >
            star
          </span>
        )
      })}
    </div>
  )
}

export default function AppDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [app, setApp] = useState<AppItem | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [rating, setRating] = useState(0)
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    Promise.all([fetchApp(id), fetchReviews(id)])
      .then(([a, r]) => {
        setApp(a)
        setReviews(r)
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
        setError(true)
      })
  }, [id])

  async function handleReview(e: React.FormEvent) {
    e.preventDefault()
    if (!rating) return
    setSubmitting(true)
    try {
      await createReview(id, rating, text)
      const [updatedApp, updatedReviews] = await Promise.all([fetchApp(id), fetchReviews(id)])
      setApp(updatedApp)
      setReviews(updatedReviews)
      setRating(0)
      setText('')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow flex items-center justify-center text-text-secondary">불러오는 중...</main>
      <Footer />
    </div>
  )

  if (error || !app) return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow flex flex-col items-center justify-center text-text-secondary gap-4">
        <span className="material-symbols-outlined text-6xl">error</span>
        <p>앱을 찾을 수 없습니다.</p>
        <Link href="/" className="bg-primary-container text-on-primary-container px-6 py-2 rounded-lg">갤러리로 돌아가기</Link>
      </main>
      <Footer />
    </div>
  )

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow w-full max-w-screen-xl mx-auto px-8 py-16">

        {/* App Header */}
        <section className="flex flex-col md:flex-row gap-8 items-start mb-12">
          <div className="w-24 h-24 rounded-xl bg-primary-fixed border border-surface-variant overflow-hidden flex items-center justify-center flex-shrink-0">
            {app.imageUrl ? (
              <img src={app.imageUrl} alt={app.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-primary font-bold text-4xl">{app.name.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div className="flex-grow">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold text-text-primary">{app.name}</h1>
              {app.tags && app.tags.map(tag => (
                <span key={tag} className="px-3 py-1 bg-primary-fixed text-primary rounded-full text-xs font-semibold">{tag}</span>
              ))}
            </div>
            <p className="text-base text-text-secondary mb-4 max-w-2xl">{app.description}</p>
            <div className="flex items-center gap-4 mb-6">
              <Stars value={Math.round(app.averageRating)} />
              <span className="text-sm text-text-secondary">{app.averageRating.toFixed(1)} ({app.reviewCount}개 리뷰)</span>
            </div>
            <a
              href={app.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-primary-container text-on-primary-container font-semibold px-8 py-3 rounded-lg hover:opacity-90 transition-opacity"
            >
              <span className="material-symbols-outlined">launch</span>
              앱 방문하기
            </a>
          </div>
        </section>

        {/* Large Preview Image */}
        {app.imageUrl && (
          <section className="mb-12">
            <img
              src={app.imageUrl}
              alt={`${app.name} 미리보기`}
              className="w-full rounded-xl border border-surface-variant object-cover"
              style={{ maxHeight: '480px' }}
            />
          </section>
        )}

        {/* Reviews */}
        <section>
          <h2 className="text-2xl font-bold text-text-primary mb-6">사용자 리뷰</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            {/* Write Review */}
            <div className="md:col-span-1">
              <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-6 sticky top-28">
                <h3 className="text-base font-semibold text-text-primary mb-4">리뷰 작성하기</h3>
                <form onSubmit={handleReview}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-text-secondary mb-2">별점 선택</label>
                    <Stars value={rating} onChange={setRating} />
                    {rating === 0 && (
                      <p className="text-xs text-text-tertiary mt-1">별을 클릭해서 점수를 선택하세요</p>
                    )}
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-text-secondary mb-2">리뷰 내용</label>
                    <textarea
                      rows={4}
                      placeholder="이 앱에 대한 의견을 남겨주세요..."
                      value={text}
                      onChange={e => setText(e.target.value)}
                      className="w-full bg-surface-container-low border border-surface-variant rounded-lg p-3 text-sm text-text-primary focus:border-primary-container outline-none resize-y placeholder:text-text-tertiary"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!rating || submitting}
                    className="w-full bg-primary-container text-on-primary-container text-sm font-medium py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40"
                  >
                    {submitting ? '등록 중...' : '리뷰 등록'}
                  </button>
                </form>
              </div>
            </div>

            {/* Review List */}
            <div className="md:col-span-2 space-y-4">
              {reviews.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-text-secondary border border-surface-variant rounded-xl">
                  <span className="material-symbols-outlined text-4xl mb-2">rate_review</span>
                  <p className="text-sm">아직 리뷰가 없습니다. 첫 번째 리뷰를 남겨주세요!</p>
                </div>
              ) : (
                reviews.map(r => (
                  <div key={r.id} className="bg-surface-container-lowest border border-surface-variant rounded-xl p-6">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary-fixed flex items-center justify-center text-primary text-xs font-bold">
                          익
                        </div>
                        <div>
                          <span className="block text-sm font-medium text-text-primary">익명 사용자</span>
                          <span className="block text-xs text-text-tertiary">
                            {r.createdAt?.toDate?.().toLocaleDateString('ko-KR') ?? ''}
                          </span>
                        </div>
                      </div>
                      <Stars value={r.rating} />
                    </div>
                    {r.text && <p className="text-sm text-text-secondary mt-2">{r.text}</p>}
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
