'use client'
import { useEffect, useState } from 'react'

// WordPress mshots: 실제 브라우저 렌더링, 무료·키 불필요.
// 첫 요청은 로딩 플레이스홀더(400×300)를 주고 백그라운드에서 캡처를 생성한다.
export const mshot = (url: string, w: number, h: number) =>
  `https://s0.wp.com/mshots/v1/${encodeURIComponent(url)}?w=${w}&h=${h}`

// 완성된 캡처(요청 폭과 일치)가 나올 때까지 폴링해서 표시
export default function SmartShot({ src, minWidth, alt, className, style }: {
  src: string
  minWidth?: number   // mshots URL일 때 기대 폭 — 미달이면 플레이스홀더로 보고 재시도
  alt: string
  className?: string
  style?: React.CSSProperties
}) {
  const [url, setUrl] = useState(minWidth ? '' : src)

  useEffect(() => {
    if (!minWidth) { setUrl(src); return }
    let alive = true
    let tries = 0
    const load = async () => {
      try {
        const res = await fetch(src, { cache: tries ? 'reload' : 'default' })
        const blob = await res.blob()
        const bmp = await createImageBitmap(blob)
        if (bmp.width >= minWidth * 0.9) {
          if (alive) setUrl(URL.createObjectURL(blob))
          return
        }
      } catch { /* 네트워크 오류도 재시도 */ }
      if (alive && ++tries < 10) setTimeout(load, 5000)
    }
    load()
    return () => { alive = false }
  }, [src, minWidth])

  if (!url) return (
    <div className={className} style={{ ...style, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 120 }}>
      <span className="material-symbols-outlined animate-spin" style={{ color: 'rgba(255,255,255,0.25)' }}>progress_activity</span>
    </div>
  )
  return <img src={url} alt={alt} className={className} style={style} />
}
