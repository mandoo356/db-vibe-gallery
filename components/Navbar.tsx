'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/', label: '홈' },
  { href: '/register', label: '앱 등록' },
  { href: '/admin', label: '관리자' },
  { href: '/', label: '갤러리' },
]

export default function Navbar() {
  const pathname = usePathname()
  return (
    <header className="bg-surface-container-lowest border-b border-surface-variant shadow-sm w-full top-0 sticky z-50">
      <div className="flex justify-between items-center w-full px-8 max-w-screen-xl mx-auto h-20">
        <Link href="/" className="text-2xl font-bold text-primary">
          DB Vibe Gallery
        </Link>
        <nav className="hidden md:flex items-center gap-8 h-full">
          {links.map((l, i) => (
            <Link
              key={i}
              href={l.href}
              className={`h-full flex items-center text-sm transition-colors ${
                pathname === l.href && l.href !== '/' || (l.href === '/' && (pathname === '/' || l.label === '홈' && pathname === '/'))
                  ? 'text-primary font-bold border-b-2 border-primary'
                  : 'text-secondary hover:text-primary'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <button className="p-2 text-secondary hover:bg-surface-container rounded-lg transition-colors">
            <span className="material-symbols-outlined">search</span>
          </button>
          <button className="p-2 text-secondary hover:bg-surface-container rounded-lg transition-colors">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="p-2 text-secondary hover:bg-surface-container rounded-lg transition-colors hidden sm:block">
            <span className="material-symbols-outlined">account_circle</span>
          </button>
          <button className="ml-2 bg-primary-container text-on-primary-container text-sm font-medium px-6 py-2 rounded-lg hover:opacity-90 transition-opacity active:scale-95">
            로그인
          </button>
        </div>
      </div>
    </header>
  )
}
