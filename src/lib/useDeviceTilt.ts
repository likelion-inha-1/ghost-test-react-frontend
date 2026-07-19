import { useEffect, type RefObject } from 'react'

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

/**
 * 기기 기울임을 CSS 변수(--tilt-x, --tilt-y, -1~1)로 공급한다.
 * - Android/구형 iOS: deviceorientation 즉시 구독
 * - iOS 13+: 권한이 필요해 첫 터치 제스처에서 요청
 * - 데스크톱(개발): 마우스 위치로 대체
 * rAF로 스로틀되어 페인트당 1회만 스타일을 쓴다.
 */
export function useDeviceTilt(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current
    if (!el || matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const state = { x: 0, y: 0 }
    let baseBeta: number | null = null
    let raf = 0
    let dirty = false

    const onOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return
      baseBeta ??= e.beta // 처음 든 각도를 기준점으로
      state.x = clamp(e.gamma / 30, -1, 1)
      state.y = clamp((e.beta - baseBeta) / 30, -1, 1)
      dirty = true
    }

    const onMouse = (e: MouseEvent) => {
      state.x = clamp((e.clientX / innerWidth) * 2 - 1, -1, 1)
      state.y = clamp((e.clientY / innerHeight) * 2 - 1, -1, 1)
      dirty = true
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

    const DOE = DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> }
    const needsPermission = typeof DOE?.requestPermission === 'function'

    const requestOnGesture = () => {
      DOE.requestPermission!()
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
    window.addEventListener('mousemove', onMouse)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('deviceorientation', onOrientation)
      window.removeEventListener('touchend', requestOnGesture)
      window.removeEventListener('mousemove', onMouse)
    }
  }, [ref])
}
