'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import AnimatedBg from '@/components/AnimatedBg'
import { createApp } from '@/lib/firestore'

const glass = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(12px)' }
const inputStyle = 'w-full rounded-lg px-4 py-2.5 text-sm outline-none transition-all placeholder:text-white/20'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', url: '', imageUrl: '', imageUrls: [] as string[], tags: '', description: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const urlInputRef = useRef<HTMLInputElement>(null)

  async function analyzeUrl() {
    const url = form.url.trim()
    if (!url || (!url.startsWith('http://') && !url.startsWith('https://'))) {
      setError('https://로 시작하는 URL을 먼저 입력해주세요.')
      return
    }
    setError('')
    setAnalyzing(true)
    try {
      const res = await fetch('/api/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url }) })
      const data = await res.json()
      setForm(f => ({ ...f, imageUrl: data.screenshot || f.imageUrl, imageUrls: data.screenshots?.length ? data.screenshots : f.imageUrls, description: data.description || f.description, name: f.name || data.title || f.name }))
    } catch {
      setError('앱 분석 중 오류가 발생했습니다. 직접 입력해주세요.')
    } finally { setAnalyzing(false) }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (form.password !== process.env.NEXT_PUBLIC_REGISTER_PASSWORD) { setError('비밀번호가 올바르지 않습니다.'); return }
    if (!form.name || !form.url || !form.description) { setError('앱 이름, URL, 설명은 필수입니다.'); return }
    setLoading(true)
    try {
      await createApp({ name: form.name, url: form.url, description: form.description, imageUrl: form.imageUrl || undefined, imageUrls: form.imageUrls.length ? form.imageUrls : undefined, tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [] })
      router.push('/')
    } catch {
      setError('등록 중 오류가 발생했습니다.')
    } finally { setLoading(false) }
  }

  const fieldStyle = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#f1f5f9' }

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#000' }}>
      <AnimatedBg />
      <Navbar />
      <main className="relative z-10 flex-grow flex items-center justify-center px-8 pt-28 pb-16">
        <div className="w-full max-w-2xl rounded-2xl p-10" style={glass}>
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-5"
              style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.25)', color: '#c084fc' }}>
              <span className="material-symbols-outlined text-sm">auto_awesome</span>
              AI 자동 분석
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">새로운 앱 등록</h1>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
              배포 URL을 입력하면 스크린샷과 설명을 자동으로 가져와요.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* URL + 자동 분석 */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>배포 URL</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-lg" style={{ color: 'rgba(255,255,255,0.25)' }}>link</span>
                  <input ref={urlInputRef} id="url" type="url" placeholder="https://"
                    value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
                    className={`${inputStyle} pl-10`} style={fieldStyle} />
                </div>
                <button type="button" onClick={analyzeUrl} disabled={analyzing || !form.url}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-30 whitespace-nowrap"
                  style={{ background: 'linear-gradient(135deg, #a855f7, #6366f1)', color: '#fff' }}>
                  {analyzing
                    ? <><span className="material-symbols-outlined text-base animate-spin">progress_activity</span>분석 중</>
                    : <><span className="material-symbols-outlined text-base">auto_awesome</span>자동 분석</>
                  }
                </button>
              </div>
            </div>

            {/* 미리보기 */}
            {form.imageUrl && (
              <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
                <img src={form.imageUrl} alt="미리보기" className="w-full object-cover max-h-48" />
                <div className="flex items-center justify-between px-4 py-2" style={{ background: 'rgba(0,0,0,0.6)' }}>
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>자동 캡처된 스크린샷</span>
                  <button type="button" onClick={() => setForm(f => ({ ...f, imageUrl: '' }))} className="text-xs" style={{ color: '#f87171' }}>제거</button>
                </div>
              </div>
            )}

            {/* 앱 이름 */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>앱 이름</label>
              <input type="text" placeholder="예: My Awesome App"
                value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className={inputStyle} style={fieldStyle} />
            </div>

            {/* 스크린샷 URL */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
                스크린샷 URL <span style={{ color: 'rgba(255,255,255,0.25)', fontWeight: 400 }}>(자동 분석 시 자동 입력)</span>
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-lg" style={{ color: 'rgba(255,255,255,0.25)' }}>image</span>
                <input type="url" placeholder="https://..."
                  value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))}
                  className={`${inputStyle} pl-10`} style={fieldStyle} />
              </div>
            </div>

            {/* 기술 태그 */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
                기술 태그 <span style={{ color: 'rgba(255,255,255,0.25)', fontWeight: 400 }}>(선택, 쉼표로 구분)</span>
              </label>
              <input type="text" placeholder="예: React, Python, TypeScript"
                value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                className={inputStyle} style={fieldStyle} />
            </div>

            {/* 설명 */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>앱 설명</label>
                {analyzing && <span className="text-xs animate-pulse" style={{ color: '#a855f7' }}>AI가 작성 중...</span>}
              </div>
              <textarea rows={5} placeholder="앱의 주요 기능과 목적을 설명해주세요."
                value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="w-full rounded-lg px-4 py-3 text-sm outline-none resize-y placeholder:text-white/20"
                style={{ ...fieldStyle, minHeight: '120px' }} />
            </div>

            {/* 비밀번호 */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>등록 비밀번호</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-lg" style={{ color: 'rgba(255,255,255,0.25)' }}>key</span>
                <input type="password" placeholder="강사에게 받은 비밀번호"
                  value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className={`${inputStyle} pl-10`} style={fieldStyle} />
              </div>
            </div>

            {error && (
              <p className="text-sm flex items-center gap-1.5" style={{ color: '#f87171' }}>
                <span className="material-symbols-outlined text-base">error</span>{error}
              </p>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg, #a855f7, #6366f1)', color: '#fff' }}>
              {loading ? '등록 중...' : '앱 제출하기'}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  )
}
