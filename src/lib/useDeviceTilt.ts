import { useCallback, useEffect, type RefObject } from 'react'

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

/**
 * 카드 홀로그램용 틸트 입력을 CSS 변수(--tilt-*)로 공급한다.
 * 인터랙션 스펙:
 * - 드래그(문지르기)해야만 기울어진다 — 이동량 비례
 * - 탭은 기울지 않는다 (플립은 항상 정면에서 시작)
 * - 손을 떼면 정면 복귀
 * 반환값 reset(): 플립 시점에 호출해 어떤 상태든 즉시 정면으로
 */
export function useDeviceTilt(ref: RefObject<HTMLElement | null>) {
  const reset = useCallback(() => {
    const el = ref.current
    if (!el) return
    el.style.setProperty('--tilt-x', '0')
    el.style.setProperty('--tilt-y', '0')
    el.style.setProperty('--tilt-ax', '0')
    el.style.setProperty('--tilt-ay', '1')
    el.style.setProperty('--tilt-mag', '0')
  }, [ref])

  useEffect(() => {
    try {
      return setupTilt(ref.current)
    } catch {
      // 지원하지 않는 환경 — 효과 없이 정적 렌더로 폴백
    }
  }, [ref])

  return reset
}

function setupTilt(el: HTMLElement | null) {
  if (!el) return
  if (typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const state = { x: 0, y: 0 }
  let raf = 0
  let dirty = false

  const set = (x: number, y: number) => {
    state.x = clamp(x, -1, 1)
    state.y = clamp(y, -1, 1)
    dirty = true
  }

  // 터치 드래그 — 시작점 대비 이동량 기준 (탭은 기울지 않음)
  const DRAG_DEADZONE = 10 // px — 탭 떨림 무시
  const DRAG_RANGE = 130 // px — 이 거리만큼 끌면 최대 기울기
  let startX = 0
  let startY = 0
  let dragging = false

  const onTouchStart = (e: TouchEvent) => {
    const t = e.touches[0]
    if (!t) return
    startX = t.clientX
    startY = t.clientY
    dragging = false
  }
  const onTouchMove = (e: TouchEvent) => {
    const t = e.touches[0]
    if (!t) return
    const dx = t.clientX - startX
    const dy = t.clientY - startY
    if (!dragging && Math.hypot(dx, dy) < DRAG_DEADZONE) return
    dragging = true
    set(dx / DRAG_RANGE, dy / DRAG_RANGE)
  }
  const onTouchEnd = () => {
    dragging = false
    set(0, 0) // 손을 떼면 정면 복귀
  }

  // 마우스 (데스크톱 개발 확인용) — 화면 위치 추종
  const onMouse = (e: MouseEvent) => {
    set((e.clientX / innerWidth) * 2 - 1, (e.clientY / innerHeight) * 2 - 1)
  }

  const loop = () => {
    if (dirty) {
      el.style.setProperty('--tilt-x', state.x.toFixed(3))
      el.style.setProperty('--tilt-y', state.y.toFixed(3))
      // 단일 축 회전용: 기울임 방향에 수직인 축 + 크기 (rotateX+rotateY 합성 비틀림 방지)
      el.style.setProperty('--tilt-ax', (-state.y).toFixed(3))
      el.style.setProperty('--tilt-ay', state.x.toFixed(3))
      el.style.setProperty('--tilt-mag', Math.min(1, Math.hypot(state.x, state.y)).toFixed(3))
      dirty = false
    }
    raf = requestAnimationFrame(loop)
  }
  raf = requestAnimationFrame(loop)

  el.addEventListener('touchstart', onTouchStart, { passive: true })
  el.addEventListener('touchmove', onTouchMove, { passive: true })
  el.addEventListener('touchend', onTouchEnd, { passive: true })
  el.addEventListener('touchcancel', onTouchEnd, { passive: true })

  // 마우스 추적은 진짜 포인터 장치에서만 (데스크톱 개발용).
  // 모바일 브라우저는 탭 시 합성 mousemove를 발사해 탭 위치로 기울어버린다
  const hasRealPointer =
    typeof matchMedia === 'function' && matchMedia('(hover: hover) and (pointer: fine)').matches
  if (hasRealPointer) window.addEventListener('mousemove', onMouse)

  return () => {
    cancelAnimationFrame(raf)
    el.removeEventListener('touchstart', onTouchStart)
    el.removeEventListener('touchmove', onTouchMove)
    el.removeEventListener('touchend', onTouchEnd)
    el.removeEventListener('touchcancel', onTouchEnd)
    if (hasRealPointer) window.removeEventListener('mousemove', onMouse)
  }
}
