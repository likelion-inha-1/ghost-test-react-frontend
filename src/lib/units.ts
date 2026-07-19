/**
 * Figma 디자인 캔버스(402pt) 기준 수치를 뷰포트 비례값으로 변환.
 * .canvas 루트에 --u: calc(min(100vw, 430px) / 402) 가 정의되어 있어야 한다.
 */
export const u = (n: number) => `calc(var(--u) * ${n})`
