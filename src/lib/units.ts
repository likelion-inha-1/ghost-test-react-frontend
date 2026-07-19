/**
 * Figma 디자인 캔버스(402pt) 기준 수치를 뷰포트 비례값으로 변환.
 * .canvas 루트에 --u: calc(min(100vw, 430px) / 402) 가 정의되어 있어야 한다.
 */
export const u = (n: number) => `calc(var(--u) * ${n})`

/**
 * 상단 기준 좌표 — 투명(플로팅) 네비게이션바를 피해 safe-area 만큼 내려간다.
 * 디자인 수치는 그대로 쓰고, 노치/상태바 높이만 기기별로 가산.
 */
export const uTop = (n: number) => `calc(var(--nav-inset) + var(--u) * ${n})`
