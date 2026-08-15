import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

// 로그인/인증 화면이 나오는 URL 패턴 — 캡처해도 흰 화면만 나옴
const AUTH_REQUIRED_PATTERNS = [
  'script.google.com',
  'docs.google.com',
  'sheets.google.com',
  'forms.google.com',
  'accounts.google.com',
  'login.',
  '/login',
  '/signin',
]

function requiresAuth(url: string): boolean {
  return AUTH_REQUIRED_PATTERNS.some(p => url.includes(p))
}

async function fetchScreenshot(url: string, extraParams: Record<string, string> = {}): Promise<string> {
  try {
    const qs = new URLSearchParams({
      url,
      screenshot: 'true',
      meta: 'false',
      'screenshot.delay': '3000',
      ...extraParams,
    })
    const res = await fetch(`https://api.microlink.io/?${qs}`, { next: { revalidate: 0 } })
    const data = await res.json()
    return data.status === 'success' ? (data.data?.screenshot?.url ?? '') : ''
  } catch {
    return ''
  }
}

export async function POST(req: NextRequest) {
  const { url } = await req.json()
  if (!url) return NextResponse.json({ error: 'URL required' }, { status: 400 })

  // 1. 메타데이터 (og:image 포함)
  const metaRes = await fetch(
    `https://api.microlink.io/?url=${encodeURIComponent(url)}&meta=true`,
    { next: { revalidate: 0 } }
  ).then(r => r.json()).catch(() => ({}))

  const pageTitle = metaRes?.data?.title ?? ''
  const pageMeta = metaRes?.data?.description ?? ''
  // og:image — 개발자가 직접 만든 고품질 프리뷰 이미지
  const ogImage: string = metaRes?.data?.image?.url ?? ''

  // 2. 스크린샷: 인증 필요 URL은 건너뜀 (흰 화면만 나오므로)
  let desktopShot = ''
  let mobileShot = ''
  if (!requiresAuth(url)) {
    ;[desktopShot, mobileShot] = await Promise.all([
      fetchScreenshot(url, { 'viewport.width': '1280', 'viewport.height': '800' }),
      fetchScreenshot(url, { 'viewport.width': '390', 'viewport.height': '844' }),
    ])
  }

  // 3장 조합: og:image → 데스크탑 캡처 → 모바일 캡처
  const screenshots = [ogImage, desktopShot, mobileShot].filter(Boolean)
  const screenshot = screenshots[0] ?? ''

  // 3. Claude 한국어 설명 생성
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ screenshot, screenshots, description: pageMeta, title: pageTitle })
  }

  try {
    const client = new Anthropic()
    const msg = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 800,
      messages: [{
        role: 'user',
        content: `아래 정보를 바탕으로 DB Vibe 학습자 갤러리에 올릴 앱 소개를 작성해줘.

- 앱 URL: ${url}
- 앱 제목: ${pageTitle || '(없음)'}
- 페이지 설명: ${pageMeta || '(없음)'}

아래 형식으로 한국어로 작성해줘:

[개요]
이 앱이 무엇인지 2~3문장. 어떤 문제를 해결하는지 포함.

[주요 기능]
• 기능 1
• 기능 2
• 기능 3

[활용 대상]
누가 사용하면 좋은지 1~2문장.

조건: 자연스러운 한국어, 마크다운 헤더(#) 금지, [섹션명] 형식만 사용, 전체 500자 이내`
      }]
    })
    const description = msg.content[0].type === 'text' ? msg.content[0].text.trim() : pageMeta
    return NextResponse.json({ screenshot, screenshots, description, title: pageTitle })
  } catch {
    return NextResponse.json({ screenshot, screenshots, description: pageMeta, title: pageTitle })
  }
}
