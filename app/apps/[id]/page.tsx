'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import AnimatedBg from '@/components/AnimatedBg'
import SmartShot, { mshot } from '@/components/SmartShot'
import { fetchApp, fetchReviews, createReview, type AppItem, type Review } from '@/lib/firestore'

function Stars({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  const [hover, setHover] = useState(0)
  const interactive = !!onChange
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(i => {
        const filled = i <= (hover || value)
        return (
          <span key={i} onClick={() => onChange?.(i)}
            onMouseEnter={() => interactive && setHover(i)}
            onMouseLeave={() => interactive && setHover(0)}
            style={{ cursor: interactive ? 'pointer' : 'default', color: filled ? '#f59e0b' : 'rgba(255,255,255,0.15)', transition: 'color 0.15s' }}
            className={`material-symbols-outlined text-2xl ${filled ? 'icon-fill' : ''}`}>
            star
          </span>
        )
      })}
    </div>
  )
}

function parseDescription(desc: string) {
  const sections: { title: string; body: string }[] = []
  const parts = desc.split(/\[([^\]]+)\]/)
  for (let i = 1; i < parts.length; i += 2) {
    sections.push({ title: parts[i].trim(), body: parts[i + 1]?.trim() ?? '' })
  }
  return sections.length > 0 ? sections : [{ title: '', body: desc }]
}

const glass = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(12px)' }
const inputStyle = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#f1f5f9' }

export default function AppDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [app, setApp] = useState<AppItem | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [rating, setRating] = useState(0)
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  useEffect(() => {
    Promise.all([fetchApp(id), fetchReviews(id)])
      .then(([a, r]) => { setApp(a); setReviews(r); setLoading(false) })
      .catch(() => { setLoading(false); setError(true) })
  }, [id])

  async function handleReview(e: React.FormEvent) {
    e.preventDefault()
    if (!rating) return
    setSubmitting(true)
    setSubmitError('')
    try {
      await createReview(id, rating, text)
      const [updatedApp, updatedReviews] = await Promise.all([fetchApp(id), fetchReviews(id)])
      setApp(updatedApp)
      setReviews(updatedReviews)
      setRating(0)
      setText('')
    } catch (err) {
      setSubmitError('리뷰 등록에 실패했습니다. 다시 시도해주세요.')
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div className="flex flex-col min-h-screen" style={{ background: '#000' }}>
      <AnimatedBg />
      <Navbar />
      <main className="relative z-10 flex-grow flex items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-4xl" style={{ color: 'rgba(255,255,255,0.3)' }}>progress_activity</span>
      </main>
      <Footer />
    </div>
  )

  if (error || !app) return (
    <div className="flex flex-col min-h-screen" style={{ background: '#000' }}>
      <AnimatedBg />
      <Navbar />
      <main className="relative z-10 flex-grow flex flex-col items-center justify-center gap-4" style={{ color: 'rgba(255,255,255,0.4)' }}>
        <span className="material-symbols-outlined text-6xl">error</span>
        <p>앱을 찾을 수 없습니다.</p>
        <Link href="/" className="px-6 py-2.5 rounded-lg font-semibold hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #a855f7, #6366f1)', color: '#fff' }}>
          갤러리로 돌아가기
        </Link>
      </main>
      <Footer />
    </div>
  )

  const stored = (app.imageUrls?.length ? app.imageUrls : app.imageUrl ? [app.imageUrl] : []).filter(Boolean)
  // 캡처 서비스 URL(thum.io·microlink 흰 화면 이력)은 제외하고 진짜 og 이미지만 사용
  const ogStored = stored.find(s => !s.includes('image.thum.io') && !s.includes('microlink.io'))
  // 히어로 1장 + 가로 한 줄 3장(높이 통일)
  const hero = { src: mshot(app.url, 1280, 800), minWidth: 1280 }
  const row: { src: string; minWidth?: number; label: string }[] = [
    { src: mshot(app.url, 1280, 800), minWidth: 1280, label: '데스크탑' },
    ogStored ? { src: ogStored, label: '태블릿' } : { src: mshot(app.url, 768, 1024), minWidth: 768, label: '태블릿' },
    { src: mshot(app.url, 390, 844), minWidth: 390, label: '모바일' },
  ]
  const descSections = parseDescription(app.description)

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#000' }}>
      <AnimatedBg />
      <Navbar />
      <main className="relative z-10 flex-grow w-full max-w-screen-xl mx-auto px-8 pt-28 pb-16">

        {/* App Header */}
        <section className="mb-10 p-8 rounded-2xl" style={glass}>
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center"
              style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)' }}>
              <span className="font-black text-4xl" style={{ color: '#a855f7' }}>{app.name.charAt(0).toUpperCase()}</span>
            </div>
            <div className="flex-grow">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-white">{app.name}</h1>
                {app.tags?.map(tag => (
                  <span key={tag} className="px-3 py-1 rounded-full text-xs font-semibold"
                    style={{ background: 'rgba(168,85,247,0.15)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.2)' }}>
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-3 mb-5">
                <Stars value={Math.round(app.averageRating)} />
                <span className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  {app.averageRating.toFixed(1)} ({app.reviewCount}개 리뷰)
                </span>
              </div>
              <a href={app.url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold hover:opacity-90 transition-opacity"
                style={{ background: 'linear-gradient(135deg, #a855f7, #6366f1)', color: '#fff' }}>
                <span className="material-symbols-outlined text-sm">launch</span>
                앱 방문하기
              </a>
            </div>
          </div>
        </section>

        {/* Screenshot Gallery — 히어로 1장 + 가로 한 줄 3장 */}
        <section className="mb-10 space-y-4">
          {/* 히어로: 전체 너비 */}
          <div className="rounded-2xl overflow-hidden"
            style={{ border: '1px solid rgba(255,255,255,0.08)', background: '#0a0a12' }}>
            <SmartShot src={hero.src} minWidth={hero.minWidth}
              alt={`${app.name} - 히어로`}
              style={{ width: '100%', height: 'auto', display: 'block' }} />
          </div>

          {/* 가로 한 줄 3장: 높이 통일, 모바일은 위쪽만 잘라서 표시 */}
          <div className="grid grid-cols-3 gap-4">
            {row.map((img, idx) => (
              <div key={idx} className="rounded-2xl overflow-hidden"
                style={{ border: '1px solid rgba(255,255,255,0.08)', background: '#0a0a12' }}>
                <div className="px-3 py-1.5 text-xs font-medium" style={{ color: 'rgba(255,255,255,0.4)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {img.label}
                </div>
                <div style={{ height: 220, overflow: 'hidden' }}>
                  <SmartShot src={img.src} minWidth={img.minWidth}
                    alt={`${app.name} - ${img.label}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', display: 'block' }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Description */}
        <section className="mb-10 p-8 rounded-2xl" style={glass}>
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-base" style={{ color: '#a855f7' }}>description</span>
            앱 소개
          </h2>
          {descSections[0].title ? (
            <div className="space-y-6">
              {descSections.map((sec, i) => (
                <div key={i}>
                  <h3 className="text-sm font-semibold mb-2" style={{ color: '#c084fc' }}>{sec.title}</h3>
                  <div className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
                    {sec.body.split('\n').map((line, j) => (
                      <p key={j} className={line.startsWith('•') ? 'pl-2 mb-1' : 'mb-1'}>{line}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: 'rgba(255,255,255,0.65)' }}>
              {app.description}
            </p>
          )}
        </section>

        {/* Reviews */}
        <section>
          <h2 className="text-xl font-bold text-white mb-6">사용자 리뷰</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Write Review */}
            <div className="md:col-span-1">
              <div className="p-6 rounded-xl sticky top-24" style={glass}>
                <h3 className="text-sm font-semibold text-white mb-4">리뷰 작성하기</h3>
                <form onSubmit={handleReview}>
                  <div className="mb-4">
                    <label className="block text-xs font-medium mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>별점 선택</label>
                    <Stars value={rating} onChange={setRating} />
                    {!rating && <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.25)' }}>별을 클릭해서 선택하세요</p>}
                  </div>
                  <div className="mb-4">
                    <label className="block text-xs font-medium mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>리뷰 내용</label>
                    <textarea
                      rows={4}
                      placeholder="의견을 남겨주세요..."
                      value={text}
                      onChange={e => setText(e.target.value)}
                      className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-y placeholder:text-white/20"
                      style={inputStyle}
                    />
                  </div>
                  {submitError && (
                    <p className="text-xs mb-3" style={{ color: '#f87171' }}>{submitError}</p>
                  )}
                  <button type="submit" disabled={!rating || submitting}
                    className="w-full py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-30"
                    style={{ background: 'linear-gradient(135deg, #a855f7, #6366f1)', color: '#fff' }}>
                    {submitting ? '등록 중...' : '리뷰 등록'}
                  </button>
                </form>
              </div>
            </div>

            {/* Review List */}
            <div className="md:col-span-2 space-y-3">
              {reviews.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 rounded-xl"
                  style={{ ...glass, color: 'rgba(255,255,255,0.3)' }}>
                  <span className="material-symbols-outlined text-4xl mb-2">rate_review</span>
                  <p className="text-sm">첫 번째 리뷰를 남겨보세요!</p>
                </div>
              ) : reviews.map(r => (
                <div key={r.id} className="p-5 rounded-xl" style={glass}>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{ background: 'rgba(168,85,247,0.2)', color: '#c084fc' }}>익</div>
                      <div>
                        <span className="block text-sm font-medium text-white">익명 사용자</span>
                        <span className="block text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
                          {r.createdAt?.toDate?.().toLocaleDateString('ko-KR') ?? ''}
                        </span>
                      </div>
                    </div>
                    <Stars value={r.rating} />
                  </div>
                  {r.text && <p className="text-sm mt-2" style={{ color: 'rgba(255,255,255,0.55)' }}>{r.text}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
