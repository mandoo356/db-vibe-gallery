'use client'
import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { fetchApps, editApp, removeApp, type AppItem } from '@/lib/firestore'

function EditModal({ app, onSave, onClose }: {
  app: AppItem
  onSave: (id: string, data: Partial<AppItem>) => Promise<void>
  onClose: () => void
}) {
  const [form, setForm] = useState({ name: app.name, url: app.url, description: app.description })
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    await onSave(app.id, form)
    setSaving(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface-container-lowest rounded-xl border border-surface-variant p-8 w-full max-w-lg shadow-xl">
        <h3 className="text-xl font-bold text-text-primary mb-6">앱 수정</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">앱 이름</label>
            <input
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full border border-surface-variant rounded-lg px-4 py-2 text-text-primary focus:border-primary outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">배포 URL</label>
            <input
              value={form.url}
              onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
              className="w-full border border-surface-variant rounded-lg px-4 py-2 text-text-primary focus:border-primary outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">설명</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="w-full border border-surface-variant rounded-lg px-4 py-2 text-text-primary focus:border-primary outline-none resize-none"
            />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 border border-surface-variant text-text-secondary py-2 rounded-lg hover:bg-surface-container transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-primary text-on-primary py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [apps, setApps] = useState<AppItem[]>([])
  const [loading, setLoading] = useState(false)
  const [editTarget, setEditTarget] = useState<AppItem | null>(null)

  function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      setAuthed(true)
      setLoading(true)
      fetchApps().then(data => { setApps(data); setLoading(false) })
    } else {
      setError('비밀번호가 올바르지 않습니다.')
    }
  }

  async function handleEdit(id: string, data: Partial<AppItem>) {
    await editApp(id, data)
    setApps(apps.map(a => a.id === id ? { ...a, ...data } : a))
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`"${name}" 앱을 삭제하시겠습니까?`)) return
    await removeApp(id)
    setApps(apps.filter(a => a.id !== id))
  }

  if (!authed) return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow flex items-center justify-center p-8">
        <div className="w-full max-w-md bg-surface-container-lowest border border-surface-variant rounded-xl shadow-sm p-8">
          <div className="text-center mb-8">
            <span className="material-symbols-outlined text-5xl text-primary icon-fill">admin_panel_settings</span>
            <h1 className="text-2xl font-bold text-text-primary mt-4 mb-2">관리자 접속</h1>
            <p className="text-base text-text-secondary">보안 구역입니다. 접근 권한을 확인해주세요.</p>
          </div>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">마스터 비밀번호</label>
              <input
                type="password"
                placeholder="비밀번호를 입력하세요"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full border border-surface-variant rounded-lg px-4 py-2 text-text-primary focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>
            {error && <p className="text-sm text-error">{error}</p>}
            <button type="submit" className="w-full bg-primary text-on-primary font-medium py-3 rounded-lg hover:opacity-90 transition-opacity">
              접속하기
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  )

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow w-full max-w-screen-xl mx-auto px-8 py-16">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-4xl font-bold text-text-primary">앱 관리 대시보드</h2>
            <p className="text-base text-text-secondary mt-2">총 {apps.length}개의 애플리케이션</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64 text-text-secondary">불러오는 중...</div>
        ) : apps.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-text-secondary border border-surface-variant rounded-xl">
            <span className="material-symbols-outlined text-6xl mb-4">inbox</span>
            <p>등록된 앱이 없습니다.</p>
          </div>
        ) : (
          <div className="bg-surface-container-lowest border border-surface-variant rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-surface-container-low border-b border-surface-variant">
                <tr>
                  <th className="px-6 py-4 text-sm font-medium text-text-secondary">앱 이름</th>
                  <th className="px-6 py-4 text-sm font-medium text-text-secondary">URL</th>
                  <th className="px-6 py-4 text-sm font-medium text-text-secondary">별점</th>
                  <th className="px-6 py-4 text-sm font-medium text-text-secondary">리뷰</th>
                  <th className="px-6 py-4 text-sm font-medium text-text-secondary text-right">관리</th>
                </tr>
              </thead>
              <tbody>
                {apps.map(app => (
                  <tr key={app.id} className="border-b border-surface-variant hover:bg-surface-container-low transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary-fixed flex items-center justify-center text-primary font-bold text-sm">
                          {app.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-text-primary">{app.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <a href={app.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline truncate max-w-xs block">
                        {app.url}
                      </a>
                    </td>
                    <td className="px-6 py-4 text-sm text-text-primary">{app.averageRating.toFixed(1)}</td>
                    <td className="px-6 py-4 text-sm text-text-primary">{app.reviewCount}개</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setEditTarget(app)}
                        className="p-2 text-text-secondary hover:text-primary transition-colors"
                      >
                        <span className="material-symbols-outlined text-xl">edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(app.id, app.name)}
                        className="p-2 text-text-secondary hover:text-error transition-colors"
                      >
                        <span className="material-symbols-outlined text-xl">delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
      <Footer />
      {editTarget && (
        <EditModal
          app={editTarget}
          onSave={handleEdit}
          onClose={() => setEditTarget(null)}
        />
      )}
    </div>
  )
}
