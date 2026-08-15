'use client'
import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import AnimatedBg from '@/components/AnimatedBg'
import { fetchApps, editApp, removeApp, type AppItem } from '@/lib/firestore'

const glass = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(12px)' }
const fieldStyle = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#f1f5f9' }

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
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}>
      <div className="w-full max-w-lg rounded-2xl p-8" style={glass}>
        <h3 className="text-xl font-bold text-white mb-6">앱 수정</h3>
        <div className="space-y-4">
          {(['name', 'url'] as const).map(k => (
            <div key={k}>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>{k === 'name' ? '앱 이름' : '배포 URL'}</label>
              <input value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
                className="w-full rounded-lg px-4 py-2.5 text-sm outline-none" style={fieldStyle} />
            </div>
          ))}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>설명</label>
            <textarea rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="w-full rounded-lg px-4 py-2.5 text-sm outline-none resize-none" style={fieldStyle} />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg text-sm font-medium"
            style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.08)' }}>
            취소
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, #a855f7, #6366f1)', color: '#fff' }}>
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

  const Layout = ({ children }: { children: React.ReactNode }) => (
    <div className="flex flex-col min-h-screen" style={{ background: '#000' }}>
      <AnimatedBg /><Navbar />
      <main className="relative z-10 flex-grow w-full max-w-screen-xl mx-auto px-8 pt-28 pb-16">{children}</main>
      <Footer />
    </div>
  )

  if (!authed) return (
    <Layout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-full max-w-md rounded-2xl p-8" style={glass}>
          <div className="text-center mb-8">
            <span className="material-symbols-outlined text-5xl icon-fill" style={{ color: '#a855f7' }}>admin_panel_settings</span>
            <h1 className="text-2xl font-bold text-white mt-4 mb-2">관리자 접속</h1>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>보안 구역입니다. 접근 권한을 확인해주세요.</p>
          </div>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input type="password" placeholder="비밀번호를 입력하세요"
              value={password} onChange={e => setPassword(e.target.value)}
              className="w-full rounded-lg px-4 py-3 text-sm outline-none placeholder:text-white/20"
              style={fieldStyle} />
            {error && <p className="text-sm" style={{ color: '#f87171' }}>{error}</p>}
            <button type="submit"
              className="w-full py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
              style={{ background: 'linear-gradient(135deg, #a855f7, #6366f1)', color: '#fff' }}>
              접속하기
            </button>
          </form>
        </div>
      </div>
    </Layout>
  )

  return (
    <Layout>
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white">앱 관리 대시보드</h2>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>총 {apps.length}개의 애플리케이션</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64" style={{ color: 'rgba(255,255,255,0.3)' }}>
          <span className="material-symbols-outlined animate-spin text-4xl">progress_activity</span>
        </div>
      ) : apps.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 rounded-xl" style={{ ...glass, color: 'rgba(255,255,255,0.3)' }}>
          <span className="material-symbols-outlined text-6xl mb-4">inbox</span>
          <p>등록된 앱이 없습니다.</p>
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden" style={glass}>
          <table className="w-full text-left">
            <thead style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}>
              <tr>
                {['앱 이름', 'URL', '별점', '리뷰', '관리'].map(h => (
                  <th key={h} className={`px-6 py-4 text-xs font-medium ${h === '관리' ? 'text-right' : ''}`}
                    style={{ color: 'rgba(255,255,255,0.4)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {apps.map(app => (
                <tr key={app.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                  className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm"
                        style={{ background: 'rgba(168,85,247,0.15)', color: '#c084fc' }}>
                        {app.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-white">{app.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <a href={app.url} target="_blank" rel="noopener noreferrer"
                      className="text-xs hover:underline truncate max-w-xs block" style={{ color: '#c084fc' }}>
                      {app.url}
                    </a>
                  </td>
                  <td className="px-6 py-4 text-sm text-white">{app.averageRating.toFixed(1)}</td>
                  <td className="px-6 py-4 text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>{app.reviewCount}개</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => setEditTarget(app)} className="p-1.5 transition-colors hover:text-white"
                      style={{ color: 'rgba(255,255,255,0.4)' }}>
                      <span className="material-symbols-outlined text-xl">edit</span>
                    </button>
                    <button onClick={() => handleDelete(app.id, app.name)} className="p-1.5 transition-colors"
                      style={{ color: 'rgba(255,255,255,0.4)' }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#f87171')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}>
                      <span className="material-symbols-outlined text-xl">delete</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {editTarget && <EditModal app={editTarget} onSave={handleEdit} onClose={() => setEditTarget(null)} />}
    </Layout>
  )
}
