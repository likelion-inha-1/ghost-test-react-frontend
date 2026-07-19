import { useEffect, type RefObject } from 'react'

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

/**
 * 카드 홀로그램용 틸트 입력을 CSS 변수(--tilt-x, --tilt-y, -1~1)로 공급한다.
 * 입력 소스 (가능한 것 전부 병행):
 * - 기기 기울임(deviceorientation) — Android 웹뷰 등 이벤트가 오는 환경
 *   (iOS 웹뷰는 호스트 앱이 모션 권한을 위임해야 해서 대부분 불가)
 * - 터치 드래그 — 카드 위를 문지르면 위치를 따라 기울어짐 (모든 기기 동작 보장)
 * - 마우스 이동 — 데스크톱 개발 확인용
 * rAF로 스로틀되어 페인트당 1회만 스타일을 쓴다.
 */
export function useDeviceTilt(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    try {
      return setupTilt(ref.current)
    } catch {
      // 센서 미지원 웹뷰 등 — 효과 없이 정적 렌더로 폴백
    }
  }, [ref])
}

function setupTilt(el: HTMLElement | null) {
  if (!el) return
  if (typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const state = { x: 0, y: 0 }
  let baseBeta: number | null = null
  let raf = 0
  let dirty = false
  let touching = false

  const set = (x: number, y: number) => {
    state.x = clamp(x, -1, 1)
    state.y = clamp(y, -1, 1)
    dirty = true
  }

  // --- 자이로 ---
  const onOrientation = (e: DeviceOrientationEvent) => {
    if (touching || e.gamma == null || e.beta == null) return
    baseBeta ??= e.beta // 처음 든 각도를 기준점으로
    set(e.gamma / 30, (e.beta - baseBeta) / 30)
  }

  // --- 터치 드래그 (스크린 좌표 → 화면 중심 기준 -1~1) ---
  const onTouchMove = (e: TouchEvent) => {
    const t = e.touches[0]
    if (!t) return
    touching = true
    set((t.clientX / innerWidth) * 2 - 1, (t.clientY / innerHeight) * 2 - 1)
  }
  const onTouchEnd = () => {
    touching = false
    set(0, 0) // 손을 떼면 원위치
  }

  // --- 마우스 (개발용) ---
  const onMouse = (e: MouseEvent) => {
    set((e.clientX / innerWidth) * 2 - 1, (e.clientY / innerHeight) * 2 - 1)
  }

  const loop = () => {
    if (dirty) {
      el.style.setProperty('--tilt-x', state.x.toFixed(3))
      el.style.setProperty('--tilt-y', state.y.toFixed(3))
      dirty = false
    }
    raf = requestAnimationFrame(loop)
  }
  raf = requestAnimationFrame(loop)

  // 전역이 없을 수 있으므로 window에서 안전하게 조회
  const DOE = (window as unknown as Record<string, unknown>).DeviceOrientationEvent as
    | { requestPermission?: () => Promise<string> }
    | undefined
  const needsPermission = typeof DOE?.requestPermission === 'function'

  const requestOnGesture = () => {
    DOE?.requestPermission?.()
      .then((res) => {
        if (res === 'granted') window.addEventListener('deviceorientation', onOrientation)
      })
      .catch(() => {})
    window.removeEventListener('touchend', requestOnGesture)
  }

  if (needsPermission) {
    window.addEventListener('touchend', requestOnGesture)
  } else if ('DeviceOrientationEvent' in window) {
    window.addEventListener('deviceorientation', onOrientation)
  }
  el.addEventListener('touchmove', onTouchMove, { passive: true })
  el.addEventListener('touchend', onTouchEnd, { passive: true })
  window.addEventListener('mousemove', onMouse)

  return () => {
    cancelAnimationFrame(raf)
    window.removeEventListener('deviceorientation', onOrientation)
    window.removeEventListener('touchend', requestOnGesture)
    el.removeEventListener('touchmove', onTouchMove)
    el.removeEventListener('touchend', onTouchEnd)
    window.removeEventListener('mousemove', onMouse)
  }
}
