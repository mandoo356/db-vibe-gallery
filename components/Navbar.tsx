'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/', label: '홈' },
  { href: '/register', label: '앱 등록' },
  { href: '/admin', label: '관리자' },
]

export default function Navbar() {
  const pathname = usePathname()
  return (
    <header className="bg-surface-container-lowest border-b border-surface-variant shadow-sm w-full top-0 sticky z-50">
      <div className="flex justify-between items-center w-full px-8 max-w-screen-xl mx-auto h-20">
        <Link href="/" className="text-2xl font-bold text-primary">
          DB Vibe Gallery
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          {links.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-base transition-colors ${
                pathname === l.href
                  ? 'text-primary font-bold border-b-2 border-primary pb-1'
                  : 'text-secondary hover:text-primary'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
