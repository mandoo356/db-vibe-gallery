'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/', label: '갤러리' },
  { href: '/register', label: '앱 등록' },
]

export default function Navbar() {
  const pathname = usePathname()
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(20px)' }}>
      <div className="flex justify-between items-center w-full px-8 max-w-screen-xl mx-auto h-16">
        <Link href="/" className="text-xl font-bold" style={{ background: 'linear-gradient(135deg, #a855f7, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          DB Vibe Gallery
        </Link>
        <nav className="flex items-center gap-6">
          {links.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-sm font-medium transition-colors ${
                pathname === l.href ? 'text-white' : 'text-white/50 hover:text-white/80'
              }`}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/register"
            className="text-sm font-semibold px-4 py-2 rounded-lg transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #a855f7, #6366f1)', color: '#fff' }}
          >
            + 앱 등록
          </Link>
        </nav>
      </div>
    </header>
  )
}
