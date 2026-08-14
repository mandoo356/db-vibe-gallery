export default function Footer() {
  return (
    <footer className="bg-surface-container-low w-full mt-auto border-t border-surface-variant py-12 px-8">
      <div className="flex flex-col md:flex-row justify-between items-center w-full max-w-screen-xl mx-auto gap-6">
        <div className="flex flex-col items-center md:items-start gap-1">
          <span className="text-xl font-bold text-on-surface-variant">DB Vibe Gallery</span>
          <span className="text-sm text-secondary">© 2024 DB Vibe Gallery. All rights reserved.</span>
        </div>
        <nav className="flex flex-wrap justify-center gap-6">
          {['이용약관', '개인정보처리방침', '문의하기', '도움말'].map(label => (
            <a key={label} href="#" className="text-sm text-text-secondary hover:text-primary hover:underline transition-colors">
              {label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  )
}
