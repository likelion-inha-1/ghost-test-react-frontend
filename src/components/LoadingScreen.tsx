import drip from '../assets/drip.svg'
import handprint from '../assets/handprint.png'
import { u } from '../lib/units'
import './loading.css'

/**
 * 연출 로딩 (Figma 184:87 / 184:96)
 * 붉은 손바닥 3개가 순차적으로 찍히는 애니메이션 + 문구.
 * 표시 시간 제어(최소 노출 + 데이터 대기)는 부모가 담당한다.
 */
export function LoadingScreen({ text }: { text: string }) {
  const HAND_Y = 329
  const lefts = [79, 162.6, 246.2]
  return (
    <div className="loading-screen">
      {lefts.map((left, i) => (
        <img
          key={i}
          className="loading-hand"
          src={handprint}
          alt=""
          style={{
            left: u(left),
            top: u(HAND_Y),
            width: u(72.3),
            height: u(72.3),
            animationDelay: `${i * 0.45}s`,
          }}
        />
      ))}
      <img
        className="loading-drip"
        src={drip}
        alt=""
        style={{ left: u(289.5), top: u(387), width: u(7.5), height: u(21.1) }}
      />
      <p className="loading-text" style={{ top: u(419), fontSize: u(20), letterSpacing: u(2) }}>
        {text}
      </p>
    </div>
  )
}
