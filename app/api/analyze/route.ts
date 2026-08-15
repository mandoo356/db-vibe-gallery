import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { url } = await req.json()
  if (!url) return NextResponse.json({ error: 'URL required' }, { status: 400 })

  // 1. Microlink로 스크린샷 + 메타데이터 가져오기
  let screenshot = ''
  let pageTitle = ''
  let pageMeta = ''
  try {
    const res = await fetch(
      `https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=true&meta=true`,
      { next: { revalidate: 0 } }
    )
    const data = await res.json()
    if (data.status === 'success') {
      screenshot = data.data?.screenshot?.url ?? ''
      pageTitle = data.data?.title ?? ''
      pageMeta = data.data?.description ?? ''
    }
  } catch {
    // Microlink 실패해도 계속 진행
  }

  // 2. Claude로 한국어 앱 소개 생성
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ screenshot, description: pageMeta, title: pageTitle })
  }

  try {
    const client = new Anthropic()
    const msg = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      messages: [{
        role: 'user',
        content: `아래 정보를 바탕으로 DB Vibe 학습자 갤러리에 올릴 앱 소개 문구를 한국어 2~3문장으로 작성해줘.
- 앱 URL: ${url}
- 앱 제목: ${pageTitle || '(없음)'}
- 페이지 설명: ${pageMeta || '(없음)'}

조건:
- 앱의 주요 기능/목적을 자연스러운 한국어로
- 2~3문장, 200자 이내
- 설명문만 출력 (따옴표, 서두 없이)`
      }]
    })
    const description = msg.content[0].type === 'text' ? msg.content[0].text.trim() : pageMeta
    return NextResponse.json({ screenshot, description, title: pageTitle })
  } catch {
    return NextResponse.json({ screenshot, description: pageMeta, title: pageTitle })
  }
}
