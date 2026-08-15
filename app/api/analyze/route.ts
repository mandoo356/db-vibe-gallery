import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const AUTH_REQUIRED_PATTERNS = [
  'script.google.com',
  'docs.google.com',
  'sheets.google.com',
  'forms.google.com',
  'accounts.google.com',
]

function requiresAuth(url: string): boolean {
  return AUTH_REQUIRED_PATTERNS.some(p => url.includes(p))
}

// thum.io: 실제 Chrome 헤드리스로 SPA 렌더링 후 캡처, 무료·API 키 불필요
function thumioUrl(url: string, width: number, crop: number): string {
  return `https://image.thum.io/get/width/${width}/crop/${crop}/${url}`
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
  const ogImage: string = metaRes?.data?.image?.url ?? ''

  // 2. thum.io로 스크린샷 URL 구성 (인증 필요 URL은 건너뜀)
  const authReq = requiresAuth(url)
  const screenshots = [
    ogImage,
    authReq ? '' : thumioUrl(url, 1280, 800),
    authReq ? '' : thumioUrl(url, 390, 844),
  ].filter(Boolean)
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
