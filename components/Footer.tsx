export default function Footer() {
  return (
    <footer className="bg-surface-container-low w-full mt-auto border-t border-surface-variant">
      <div className="flex flex-col md:flex-row justify-between items-center w-full py-12 px-8 max-w-screen-xl mx-auto gap-6">
        <div className="text-xl font-bold text-on-surface-variant">DB Vibe Gallery</div>
        <div className="flex flex-wrap justify-center gap-6 text-sm text-text-secondary">
          <a href="#" className="hover:text-primary">이용약관</a>
          <a href="#" className="hover:text-primary">개인정보처리방침</a>
          <a href="#" className="hover:text-primary">문의하기</a>
        </div>
        <div className="text-sm text-secondary">© 2024 DB Vibe Gallery. All rights reserved.</div>
      </div>
    </footer>
  )
}
