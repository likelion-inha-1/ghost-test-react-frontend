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
    const link = await getTossShareLink(deepLink, result.imageUrl)
    await share({ message: `나의 귀신 유형은 "${result.ghostName}"! 너의 귀신도 알아봐 👻\n${link}` })
    return
  } catch {
    // 토스 브릿지 없는 환경 (로컬 브라우저 등)
  }
  const webUrl = `${location.origin}/result?id=${result.id}`
  try {
    await navigator.share({ title: '귀신 유형 테스트', text: `나의 귀신 유형은 "${result.ghostName}"!`, url: webUrl })
  } catch {
    await navigator.clipboard?.writeText(webUrl)
    alert('링크를 복사했어요!')
  }
}
