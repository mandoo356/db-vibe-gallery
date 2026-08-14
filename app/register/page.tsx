'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { createApp } from '@/lib/firestore'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', url: '', imageUrl: '', description: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (form.password !== process.env.NEXT_PUBLIC_REGISTER_PASSWORD) {
      setError('비밀번호가 올바르지 않습니다.')
      return
    }
    if (!form.name || !form.url || !form.description) {
      setError('모든 항목을 입력해주세요.')
      return
    }

    setLoading(true)
    try {
      await createApp({ name: form.name, url: form.url, description: form.description, imageUrl: form.imageUrl || undefined })
      router.push('/')
    } catch {
      setError('등록 중 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow flex items-center justify-center p-8 py-16">
        <div className="w-full max-w-2xl bg-surface-container-lowest rounded-xl border border-surface-variant p-12 shadow-sm">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-text-primary mb-2">새로운 앱 등록</h1>
            <p className="text-base text-text-secondary">갤러리에 배포할 앱 정보를 입력해주세요.</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1" htmlFor="name">앱 이름</label>
              <input
                id="name"
                type="text"
                placeholder="예: My Awesome App"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full bg-surface border border-surface-variant rounded-lg px-4 py-2 text-text-primary focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-text-tertiary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1" htmlFor="url">배포 URL</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary text-xl">link</span>
                <input
                  id="url"
                  type="url"
                  placeholder="https://"
                  value={form.url}
                  onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
                  className="w-full bg-surface border border-surface-variant rounded-lg pl-10 pr-4 py-2 text-text-primary focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-text-tertiary"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1" htmlFor="imageUrl">앱 스크린샷 URL <span className="text-text-tertiary font-normal">(선택)</span></label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary text-xl">image</span>
                <input
                  id="imageUrl"
                  type="url"
                  placeholder="https://... (앱 미리보기 이미지 URL)"
                  value={form.imageUrl}
                  onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))}
                  className="w-full bg-surface border border-surface-variant rounded-lg pl-10 pr-4 py-2 text-text-primary focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-text-tertiary"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1" htmlFor="desc">설명</label>
              <textarea
                id="desc"
                rows={4}
                placeholder="앱의 주요 기능과 목적을 간단히 설명해주세요."
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="w-full bg-surface border border-surface-variant rounded-lg px-4 py-2 text-text-primary focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none placeholder:text-text-tertiary"
              />
            </div>

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
                  className="w-full bg-surface border border-surface-variant rounded-lg pl-10 pr-4 py-2 text-text-primary focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-text-tertiary"
                />
              </div>
            </div>

            {error && <p className="text-sm text-error">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-on-primary font-semibold py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
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
