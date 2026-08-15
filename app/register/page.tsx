'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { createApp } from '@/lib/firestore'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', url: '', imageUrl: '', tags: '', description: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const urlInputRef = useRef<HTMLInputElement>(null)

  async function analyzeUrl() {
    const url = form.url.trim()
    if (!url || (!url.startsWith('http://') && !url.startsWith('https://'))) {
      setError('https://로 시작하는 유효한 URL을 먼저 입력해주세요.')
      return
    }
    setError('')
    setAnalyzing(true)
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      const data = await res.json()
      setForm(f => ({
        ...f,
        imageUrl: data.screenshot || f.imageUrl,
        description: data.description || f.description,
        name: f.name || data.title || f.name,
      }))
    } catch {
      setError('앱 분석 중 오류가 발생했습니다. 직접 입력해주세요.')
    } finally {
      setAnalyzing(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (form.password !== process.env.NEXT_PUBLIC_REGISTER_PASSWORD) {
      setError('비밀번호가 올바르지 않습니다.')
      return
    }
    if (!form.name || !form.url || !form.description) {
      setError('앱 이름, 배포 URL, 설명은 필수입니다.')
      return
    }
    setLoading(true)
    try {
      await createApp({
        name: form.name,
        url: form.url,
        description: form.description,
        imageUrl: form.imageUrl || undefined,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      })
      router.push('/')
    } catch {
      setError('등록 중 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full bg-surface-container-low border border-surface-variant rounded-lg px-4 py-2.5 text-text-primary focus:border-primary-container outline-none transition-all placeholder:text-text-tertiary"

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow flex items-center justify-center p-8 py-16">
        <div className="w-full max-w-2xl bg-surface-container-lowest rounded-xl border border-surface-variant p-12 shadow-sm">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-text-primary mb-2">새로운 앱 등록</h1>
            <p className="text-base text-text-secondary">배포 URL을 입력하면 앱 정보를 자동으로 분석해드려요.</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>

            {/* URL + 자동 분석 버튼 */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1" htmlFor="url">배포 URL</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary text-xl">link</span>
                  <input
                    ref={urlInputRef}
                    id="url"
                    type="url"
                    placeholder="https://"
                    value={form.url}
                    onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
                    className={`${inputClass} pl-10`}
                  />
                </div>
                <button
                  type="button"
                  onClick={analyzeUrl}
                  disabled={analyzing || !form.url}
                  className="flex items-center gap-1.5 px-4 py-2 bg-primary-container text-on-primary-container text-sm font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40 whitespace-nowrap"
                >
                  {analyzing ? (
                    <>
                      <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                      분석 중...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-base">auto_awesome</span>
                      자동 분석
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-text-tertiary mt-1">URL 입력 후 자동 분석을 누르면 스크린샷과 설명을 자동으로 가져와요.</p>
            </div>

            {/* 미리보기 이미지 */}
            {form.imageUrl && (
              <div className="rounded-xl overflow-hidden border border-surface-variant">
                <img src={form.imageUrl} alt="앱 미리보기" className="w-full object-cover max-h-52" />
                <div className="flex items-center justify-between px-4 py-2 bg-surface-container-low">
                  <span className="text-xs text-text-tertiary">자동 캡처된 스크린샷</span>
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, imageUrl: '' }))}
                    className="text-xs text-error hover:underline"
                  >
                    제거
                  </button>
                </div>
              </div>
            )}

            {/* 앱 이름 */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1" htmlFor="name">앱 이름</label>
              <input
                id="name"
                type="text"
                placeholder="예: My Awesome App"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className={inputClass}
              />
            </div>

            {/* 이미지 URL (수동) */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1" htmlFor="imageUrl">
                스크린샷 URL <span className="text-text-tertiary font-normal">(자동 분석 시 자동 입력)</span>
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary text-xl">image</span>
                <input
                  id="imageUrl"
                  type="url"
                  placeholder="https://... (직접 입력도 가능)"
                  value={form.imageUrl}
                  onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))}
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>

            {/* 기술 태그 */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1" htmlFor="tags">
                기술 태그 <span className="text-text-tertiary font-normal">(선택, 쉼표로 구분)</span>
              </label>
              <input
                id="tags"
                type="text"
                placeholder="예: React, Python, TypeScript"
                value={form.tags}
                onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                className={inputClass}
              />
            </div>

            {/* 설명 */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-text-secondary" htmlFor="desc">앱 설명</label>
                {analyzing && <span className="text-xs text-primary-container animate-pulse">AI가 작성 중...</span>}
              </div>
              <textarea
                id="desc"
                rows={5}
                placeholder={analyzing ? 'AI가 앱을 분석하고 설명을 작성하고 있어요...' : '앱의 주요 기능과 목적을 설명해주세요.'}
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="w-full bg-surface-container-low border border-surface-variant rounded-lg px-4 py-3 text-text-primary focus:border-primary-container outline-none resize-y placeholder:text-text-tertiary min-h-[120px]"
              />
              <p className="text-xs text-text-tertiary mt-1">자동 생성된 내용을 직접 수정할 수 있어요.</p>
            </div>

            {/* 비밀번호 */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1" htmlFor="password">등록 비밀번호</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary text-xl">key</span>
                <input
                  id="password"
                  type="password"
                  placeholder="강사에게 받은 비밀번호를 입력하세요"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-error flex items-center gap-1">
                <span className="material-symbols-outlined text-base">error</span>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-container text-on-primary-container font-semibold py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? '등록 중...' : '앱 제출하기'}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  )
}
