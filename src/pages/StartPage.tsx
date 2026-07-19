import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, prefetchQuestions } from '../api/client'
import handprint from '../assets/handprint.png'
import splatterSheet from '../assets/splatter-sheet.png'
import { HauntedBackground } from '../components/HauntedBackground'
import { u } from '../lib/units'
import { useTestStore } from '../store'
import './start.css'

interface SpriteSpec {
  l: number; t: number; w: number; h: number
  img: { l: number; t: number; w: number; h: number }
  rotate?: number
}

// Figma 시작화면(184:106)의 핏자국 배치 — 스프라이트 시트 크롭 값 그대로
const SPLATTERS: SpriteSpec[] = [
  { l: 70, t: 91, w: 95, h: 190, img: { l: -200, t: -0.9, w: 485.71, h: 194.66 } },
  { l: 281, t: 651, w: 107, h: 214, img: { l: -200, t: -0.9, w: 485.71, h: 194.66 }, rotate: 129.42 },
  { l: 358, t: 305, w: 21, h: 29, img: { l: -223.81, t: -93.97, w: 323.81, h: 187.95 } },
  { l: 322, t: 493, w: 85, h: 117, img: { l: -223.81, t: -93.97, w: 323.81, h: 187.95 }, rotate: 112.97 },
  { l: 281, t: -39, w: 121, h: 121, img: { l: -95.83, t: -113.55, w: 283.33, h: 227.1 } },
  { l: 93, t: 340, w: 25, h: 27, img: { l: -172, t: -0.93, w: 272, h: 201.87 } },
  { l: 118, t: 322, w: 12, h: 23, img: { l: -125, t: -1.1, w: 566.67, h: 236.98 } },
  { l: 114, t: 297, w: 16, h: 25, img: { l: 0, t: -1.01, w: 425, h: 218.02 } },
  { l: 287, t: 206, w: 96, h: 116, img: { l: 0, t: -87.08, w: 283.33, h: 187.95 } },
  { l: 12, t: 595, w: 101, h: 194, img: { l: -125, t: -1.1, w: 566.67, h: 236.98 } },
]

/* 진입 시 하나씩 "찍히는" 연출 — delay는 부모가 지정 */
function Sprite({ spec, delay }: { spec: SpriteSpec; delay: number }) {
  return (
    <div
      className="sprite stamp-in"
      style={{
        left: u(spec.l),
        top: u(spec.t),
        width: u(spec.w),
        height: u(spec.h),
        transform: spec.rotate ? `rotate(${spec.rotate}deg)` : undefined,
        animationDelay: `${delay}s`,
      }}
    >
      <img
        src={splatterSheet}
        alt=""
        style={{
          left: `${spec.img.l}%`,
          top: `${spec.img.t}%`,
          width: `${spec.img.w}%`,
          height: `${spec.img.h}%`,
        }}
      />
    </div>
  )
}

// 참여자 10명당 손바닥 1개 — 참여자 수를 시드로 결정적 랜덤 배치 (이스터에그)
function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function EasterEggHandprints({ count, baseDelay }: { count: number; baseDelay: number }) {
  const n = Math.min(Math.floor(count / 10), 20)
  const rand = mulberry32(count - (count % 10))
  return (
    <>
      {Array.from({ length: n }, (_, i) => {
        const size = 40 + rand() * 70
        const left = rand() * (402 - size)
        const top = rand() * (874 - size)
        const rotate = rand() * 360
        return (
          <img
            key={i}
            className="stamp-in"
            src={handprint}
            alt=""
            style={{
              position: 'absolute',
              left: u(left),
              top: u(top),
              width: u(size),
              height: u(size),
              transform: `rotate(${rotate}deg)`,
              pointerEvents: 'none',
              animationDelay: `${baseDelay + i * 0.13}s`,
              // stamp-in의 최종 opacity를 이스터에그 톤(0.55)으로
              ['--stamp-opacity' as string]: 0.55,
            }}
          />
        )
      })}
    </>
  )
}

// 글리치: 타이틀은 읽을 만한 문구, 나머지는 읽을 수 없는 기괴한 글자로 — 전부 동시에
const TITLE_TEXTS = ['같이 갈래?', '뒤를 봐', '이미 늦었어', '거울을 봐', '너인 줄 알았어']
const WEIRD_CHARS = 'ㅎㅓㅡㅣㄱㄷㅆㅉㅟㅐㄹ흐어윽엇왜너뒤제발살려도망▚▞░▒▓†‡Ø¿?∅'

function scramble(length: number): string {
  let out = ''
  for (let i = 0; i < length; i++) {
    out += Math.random() < 0.14 ? ' ' : WEIRD_CHARS[Math.floor(Math.random() * WEIRD_CHARS.length)]
  }
  return out
}

interface GlitchTexts {
  title: string
  subtitle: string
  counter: string
  button: string
}

export function StartPage() {
  const navigate = useNavigate()
  const { participantCount, setParticipantCount } = useTestStore()
  const result = useTestStore((s) => s.result)
  const [glitch, setGlitch] = useState<GlitchTexts | null>(null)
  const timers = useRef<number[]>([])

  // 이미 테스트를 마친 사용자는 결과 페이지로 (localStorage 복원)
  useEffect(() => {
    if (result) navigate('/result', { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    api.getParticipantCount().then(setParticipantCount).catch(() => {})
  }, [setParticipantCount])

  // 모든 문구가 동시에 지지직 — 첫 발동은 진입 후 ~1.5초, 이후 3~6.5초 랜덤 주기
  useEffect(() => {
    const pending = timers.current
    const fire = (nextDelay: number) => {
      pending.push(
        window.setTimeout(() => {
          setGlitch({
            title: TITLE_TEXTS[Math.floor(Math.random() * TITLE_TEXTS.length)],
            subtitle: scramble(22),
            counter: scramble(12),
            button: scramble(4),
          })
          pending.push(
            window.setTimeout(() => {
              setGlitch(null)
              fire(3000 + Math.random() * 3500)
            }, 700),
          )
        }, nextDelay),
      )
    }
    fire(1500)
    return () => pending.forEach(clearTimeout)
  }, [])

  const start = () => {
    prefetchQuestions().catch(() => {}) // ★ 프리페치 발사 — 실패해도 퀴즈 화면에서 재시도
    navigate('/school')
  }

  return (
    <div className="canvas">
      <HauntedBackground dim />
      {SPLATTERS.map((s, i) => (
        <Sprite key={i} spec={s} delay={0.3 + i * 0.14} />
      ))}
      <div
        className="sprite stamp-in"
        style={{
          left: u(11),
          top: u(186),
          width: u(87),
          height: u(87),
          transform: 'rotate(-164.3deg) scaleY(-1)',
          overflow: 'visible',
          animationDelay: '1.0s',
        }}
      >
        <img src={handprint} alt="" style={{ inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
      <EasterEggHandprints count={participantCount ?? 0} baseDelay={2.0} />

      <h1
        className={glitch ? 'glitching' : undefined}
        style={{
          position: 'absolute',
          left: u(35),
          top: u(235),
          width: u(339),
          margin: 0,
          fontFamily: 'var(--font-title)',
          fontWeight: 400,
          fontSize: u(50),
          lineHeight: 'normal',
          color: 'var(--text)',
          textAlign: 'center',
        }}
      >
        {glitch?.title ?? '귀신 유형 테스트'}
      </h1>
      <p
        className={glitch ? 'glitching' : undefined}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: u(305),
          margin: 0,
          fontFamily: 'var(--font-point)',
          fontSize: u(10),
          letterSpacing: u(3.5),
          color: 'var(--red-text)',
          textAlign: 'center',
          whiteSpace: 'nowrap',
        }}
      >
        {glitch?.subtitle ?? `한여름 밤의 심리 테스트: "내 성격의 '서늘한' 이면`}
      </p>

      <p
        className={glitch ? 'glitching' : undefined}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: u(592),
          margin: 0,
          fontFamily: 'var(--font-point)',
          fontSize: u(10),
          letterSpacing: u(2),
          color: 'var(--text-dim)',
          textAlign: 'center',
        }}
      >
        {glitch?.counter ?? `현재 ${participantCount === null ? '___' : participantCount.toLocaleString()}명이 참여중`}
      </p>
      <button
        onClick={start}
        style={{
          position: 'absolute',
          left: u(85),
          top: u(613),
          width: u(232),
          height: u(60),
          background: 'var(--red)',
          borderRadius: u(10),
          boxShadow: '0px 1px 4px 0px rgba(0,0,0,0.25)',
          fontFamily: 'var(--font-title)',
          fontSize: u(20),
          color: 'var(--text)',
        }}
      >
        <span className={glitch ? 'glitching' : undefined} style={{ display: 'inline-block' }}>
          {glitch?.button ?? '시작하기'}
        </span>
      </button>
    </div>
  )
}
