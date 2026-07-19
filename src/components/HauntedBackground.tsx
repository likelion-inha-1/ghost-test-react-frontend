import bgTexture from '../assets/bg-texture.png'

/**
 * 전 화면 공통 배경 — Figma image 38 익스포트 렌더 (색 보정 + 30% 어둡기 반영본)
 * dim: 시작화면용 절반 밝기 (Figma 15%)
 * opacity: 직접 지정 (질문 화면의 진행별 점감 등) — dim보다 우선
 */
export function HauntedBackground({ dim = false, opacity }: { dim?: boolean; opacity?: number }) {
  return (
    <div className="haunted-bg" aria-hidden>
      <img
        src={bgTexture}
        alt=""
        style={{ opacity: opacity ?? (dim ? 0.5 : undefined), transition: 'opacity 1s ease' }}
      />
    </div>
  )
}
