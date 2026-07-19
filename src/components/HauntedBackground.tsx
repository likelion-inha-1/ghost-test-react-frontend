import bgTexture from '../assets/bg-texture.png'

/**
 * 전 화면 공통 배경 — Figma image 38 익스포트 렌더 (색 보정 + 30% 어둡기 반영본)
 * 시작화면은 Figma 기준 15% → 반영본의 절반 밝기(opacity 0.5)로 표현
 */
export function HauntedBackground({ dim = false }: { dim?: boolean }) {
  return (
    <div className="haunted-bg" aria-hidden>
      <img src={bgTexture} alt="" style={dim ? { opacity: 0.5 } : undefined} />
    </div>
  )
}
