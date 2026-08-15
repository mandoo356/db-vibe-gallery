import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

async function fetchScreenshot(url: string, extraParams: Record<string, string> = {}): Promise<string> {
  try {
    const qs = new URLSearchParams({
      url,
      screenshot: 'true',
      meta: 'false',
      // 3초 대기 → SPA가 JS 렌더링 완료 후 캡처
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

  // 1. 메타데이터(og:image 포함) + 2가지 해상도 스크린샷 병렬 요청
  const [metaRes, desktopShot, mobileShot] = await Promise.all([
    fetch(`https://api.microlink.io/?url=${encodeURIComponent(url)}&meta=true`, { next: { revalidate: 0 } })
      .then(r => r.json()).catch(() => ({})),
    // 데스크탑: 히어로 섹션이 잘 나오도록 1280x800 + 3초 딜레이
    fetchScreenshot(url, { 'viewport.width': '1280', 'viewport.height': '800' }),
    // 모바일
    fetchScreenshot(url, { 'viewport.width': '390', 'viewport.height': '844' }),
  ])

  const pageTitle = metaRes?.data?.title ?? ''
  const pageMeta = metaRes?.data?.description ?? ''

  // og:image를 1번 사진으로 (개발자가 직접 만든 고품질 프리뷰)
  const ogImage: string = metaRes?.data?.image?.url ?? ''

  // 3장: [og:image, 데스크탑 캡처, 모바일 캡처]
  const screenshots = [ogImage, desktopShot, mobileShot].filter(Boolean)
  const screenshot = screenshots[0] ?? ''

  // 2. Claude로 구조화된 한국어 설명 생성
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
