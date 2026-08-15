import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

async function fetchScreenshot(url: string, params: Record<string, string>): Promise<string> {
  const qs = new URLSearchParams({ url, screenshot: 'true', meta: 'false', ...params })
  try {
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

  // 1. 메타데이터 + 3개 해상도 스크린샷 병렬 요청
  const [metaRes, desktopShot, tabletShot, mobileShot] = await Promise.all([
    fetch(`https://api.microlink.io/?url=${encodeURIComponent(url)}&meta=true`, { next: { revalidate: 0 } })
      .then(r => r.json()).catch(() => ({ status: 'error' })),
    fetchScreenshot(url, { 'viewport.width': '1280', 'viewport.height': '800' }),
    fetchScreenshot(url, { 'viewport.width': '768', 'viewport.height': '1024' }),
    fetchScreenshot(url, { 'viewport.width': '375', 'viewport.height': '812' }),
  ])

  const pageTitle = metaRes?.data?.title ?? ''
  const pageMeta = metaRes?.data?.description ?? ''
  const screenshots = [desktopShot, tabletShot, mobileShot].filter(Boolean)
  const screenshot = screenshots[0] ?? ''

  // 2. Claude로 한국어 앱 소개 생성 (더 자세하게)
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

아래 형식으로 한국어로 작성해줘. 각 섹션은 줄바꿈으로 구분:

[개요]
이 앱이 무엇인지 2~3문장으로 소개. 어떤 문제를 해결하는지 포함.

[주요 기능]
• 기능 1
• 기능 2
• 기능 3
(URL과 제목에서 유추 가능한 주요 기능 3~4가지)

[활용 대상]
누가 이 앱을 사용하면 좋은지 1~2문장.

조건:
- 자연스러운 한국어로 작성
- 추측이 필요한 부분은 자연스럽게 유추해서 작성
- 마크다운 헤더(#) 사용 금지, 위의 [섹션명] 형식만 사용
- 전체 500자 이내`
      }]
    })
    const description = msg.content[0].type === 'text' ? msg.content[0].text.trim() : pageMeta
    return NextResponse.json({ screenshot, screenshots, description, title: pageTitle })
  } catch {
    return NextResponse.json({ screenshot, screenshots, description: pageMeta, title: pageTitle })
  }
}
