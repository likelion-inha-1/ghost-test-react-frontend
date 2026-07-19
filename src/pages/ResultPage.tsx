import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { api, prefetchRankings, preloadImage } from '../api/client'
import type { TestResult } from '../api/types'
import handIcon from '../assets/hand-icon.svg'
import shareButton from '../assets/share-button.svg'
import { HauntedBackground } from '../components/HauntedBackground'
import { LoadingScreen } from '../components/LoadingScreen'
import { u, uTop } from '../lib/units'
import { useDeviceTilt } from '../lib/useDeviceTilt'
import { shareResult } from '../lib/share'
import { useTestStore } from '../store'
import './result.css'

/** 결과 플립 카드 (Figma 184:18 앞면 / 184:46 뒷면) */
export function ResultPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const ownResult = useTestStore((s) => s.result)
  const school = useTestStore((s) => s.school)
  const sharedId = params.get('id')
  // 공유 링크(id 파라미터)로 들어오면 내 결과가 있어도 친구 결과를 보여준다
  const [result, setLoadedResult] = useState<TestResult | null>(sharedId ? null : ownResult)
  const [flipped, setFlipped] = useState(false)
  const [failed, setFailed] = useState(false)
  const canvasRef = useRef<HTMLDivElement>(null)
  useDeviceTilt(canvasRef) // 기울임 → 카드 3D 틸트 + 테두리 반사광

  // 공유 링크 재진입: GET /histories/{id}
  useEffect(() => {
    if (!sharedId) return
    api
      .getResult(Number(sharedId))
      .then(async (r) => {
        await preloadImage(r.imageUrl)
        setLoadedResult(r)
      })
      .catch(() => setFailed(true))
  }, [sharedId])

  // 순위 화면 프리페치 (docs/API.md §4)
  useEffect(() => {
    if (result) prefetchRankings(school?.schoolId)
  }, [result, school])

  useEffect(() => {
    if (!ownResult && !sharedId) navigate('/', { replace: true })
  }, [ownResult, sharedId, navigate])

  if (failed) {
    return (
      <div className="canvas">
        <HauntedBackground />
        <div className="result-error">
          <p>결과를 찾을 수 없어요...</p>
          <button onClick={() => navigate('/')}>나도 테스트하기</button>
        </div>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="canvas">
        <LoadingScreen text="귀신을 불러들이는 중입니다..." />
      </div>
    )
  }

  return (
    <div className="canvas result-canvas" ref={canvasRef}>
      <div
        className={`result-card ${flipped ? 'is-flipped' : ''}`}
        style={{ top: uTop(48), width: u(317), height: u(559), borderRadius: u(10) }}
        onClick={() => setFlipped((f) => !f)}
      >
        <div className="result-card-inner">
          {/* 앞면: 일러스트 + 유형명 + 궁합 */}
          <div className="result-face result-front" style={{ borderRadius: u(10) }}>
            <div className="result-face-clip">
              <img className="result-illust" src={result.imageUrl} alt={result.ghostName} />
              <div className="result-top-gradient" style={{ height: u(160) }} />
              <div className="result-gradient" style={{ height: u(143) }} />
              <div className="result-title" style={{ left: u(22), right: u(22), top: u(28) }}>
                <p className="result-modifier" style={{ fontSize: u(13) }}>{result.description}</p>
                <p className="result-name" style={{ fontSize: u(result.ghostName.length > 9 ? 26 : 35), letterSpacing: u(3) }}>{result.ghostName}</p>
              </div>
              <div className="result-matches" style={{ left: u(22), bottom: u(18), fontSize: u(10), lineHeight: u(18), letterSpacing: u(0.5) }}>
                <p className="result-match-label">나와 가장 잘 맞는 귀신</p>
                <p className="result-match-value">
                  {result.bestMatch.comment.replace(result.bestMatch.ghostName, '').trim()}{' '}
                  <span>{result.bestMatch.ghostName}</span>
                </p>
                <p className="result-match-label">나와 가장 안 맞는 귀신</p>
                <p className="result-match-value">
                  {result.worstMatch.comment.replace(result.worstMatch.ghostName, '').trim()}{' '}
                  <span>{result.worstMatch.ghostName}</span>
                </p>
              </div>
            </div>
            <div className="result-border" aria-hidden><div className="result-border-glare" /></div>
          </div>

          {/* 뒷면: 유형명 + 상세 스토리 — 제목은 앞면과 동일 좌표(28/22),
              본문은 제목 줄 수와 무관하게 항상 같은 간격 */}
          <div className="result-face result-back" style={{ borderRadius: u(10) }}>
            <div className="result-face-clip result-back-content" style={{ padding: `${u(28)} ${u(22)} ${u(24)}` }}>
              <div className="result-title result-title-flow">
                <p className="result-modifier" style={{ fontSize: u(13) }}>{result.description}</p>
                <p className="result-name" style={{ fontSize: u(result.ghostName.length > 9 ? 26 : 35), letterSpacing: u(3) }}>{result.ghostName}</p>
              </div>
              <p className="result-story" style={{ marginTop: u(28), fontSize: u(15), lineHeight: u(25), letterSpacing: u(0.9) }}>
                {result.aiStory}
              </p>
            </div>
            <div className="result-border" aria-hidden><div className="result-border-glare" /></div>
          </div>
        </div>
      </div>

      <div className="result-hint" style={{ top: uTop(620) }}>
        <img src={handIcon} alt="" style={{ width: u(11), height: u(15) }} />
        <span style={{ fontSize: u(10), letterSpacing: u(0.5) }}>카드를 클릭해보세요</span>
      </div>

      <button
        className="result-cta"
        style={{ left: u(59), top: uTop(695), width: u(209), height: u(53), borderRadius: u(12), fontSize: u(18) }}
        onClick={() => navigate('/stats')}
      >
        결과 분포 확인하기
      </button>
      <button
        className="result-share"
        style={{ left: u(301), top: uTop(700), width: u(43), height: u(43) }}
        onClick={() => shareResult(result)}
        aria-label="공유하기"
      >
        <img src={shareButton} alt="" />
      </button>

      <div className="result-links" style={{ top: uTop(764), fontSize: u(12), letterSpacing: u(1.5) }}>
        <button
          onClick={() => {
            // 저장된 결과(localStorage)만 비우고 처음부터 — 별도 API 요청 없음
            useTestStore.getState().reset()
            navigate('/')
          }}
        >
          {sharedId ? '나도 테스트 해보기' : '테스트 다시 하기'}
        </button>
      </div>
    </div>
  )
}
