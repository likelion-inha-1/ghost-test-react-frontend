import type { TestResult } from '../api/types'

/**
 * 결과 공유 (docs/API.md — 공유 미리보기는 imageUrl 재사용 확정)
 * 토스 환경: 토스 공유 링크 생성 후 네이티브 공유 시트.
 * 브라우저(개발): Web Share API → 클립보드 순 폴백.
 */
export async function shareResult(result: TestResult) {
  const deepLink = `intoss://ghost-test/result?id=${result.id}`
  try {
    const { getTossShareLink, share } = await import('@apps-in-toss/web-framework')
    // OG 이미지는 https 절대 경로만 허용 (공식 규칙) — 목 모드의 상대경로는 제외
    const ogImageUrl = result.imageUrl.startsWith('https://') ? result.imageUrl : undefined
    const link = await getTossShareLink(deepLink, ogImageUrl)
    await share({ message: `나의 귀신 유형은 "${result.ghostName}"! 너의 귀신도 알아봐 👻\n${link}` })
    return
  } catch {
    // 토스 브릿지 없는 환경 (로컬 브라우저 등)
  }
  // 웹 URL 공유는 개발 브라우저 전용 — 미니앱 정책상 자사 웹 랜딩 링크 공유는 제한 대상
  if (!import.meta.env.DEV) return
  const webUrl = `${location.origin}/result?id=${result.id}`
  try {
    await navigator.share({ title: '귀신 유형 테스트', text: `나의 귀신 유형은 "${result.ghostName}"!`, url: webUrl })
  } catch {
    // 클립보드도 실패할 수 있음 (문서 미포커스 등) — 조용히 무시
    try {
      await navigator.clipboard?.writeText(webUrl)
      alert('링크를 복사했어요!')
    } catch {
      console.warn('share fallback failed:', webUrl)
    }
  }
}
