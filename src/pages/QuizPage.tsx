import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, preloadImage, prefetchQuestions } from '../api/client'
import type { Question, TestResult } from '../api/types'
import { HauntedBackground } from '../components/HauntedBackground'
import { LoadingScreen } from '../components/LoadingScreen'
import { PROLOGUE, ENDING } from '../content/story'
import { u } from '../lib/units'
import { useTestStore } from '../store'
import './quiz.css'

const SUMMON_MIN_MS = 2000
const SCARE_MS = 900

type Phase = 'summon' | 'prologue' | 'question' | 'reaction' | 'ending' | 'analyze' | 'scare' | 'error'

/** A3: 내레이션 줄 단위 스태거 페이드인 */
function StaggeredLines({ text, fontSize, letterSpacing }: { text: string; fontSize: string; letterSpacing: string }) {
  const lines = text.split('\n')
  return (
    <div className="quiz-narration-text" style={{ fontSize, letterSpacing, padding: `0 ${u(45)}` }}>
      {lines.map((line, i) => (
        <p key={i} className="quiz-narration-line" style={{ animationDelay: `${i * 0.6}s` }}>
          {line}
        </p>
      ))}
    </div>
  )
}

export function QuizPage() {
  const navigate = useNavigate()
  const { school, choiceIds, answer, setResult } = useTestStore()
  const [questions, setQuestions] = useState<Question[] | null>(null)
  const [phase, setPhase] = useState<Phase>('summon')
  const [index, setIndex] = useState(0)
  const [scareImage, setScareImage] = useState<string | null>(null)
  const submitPromise = useRef<Promise<TestResult> | null>(null)

  // 로딩 ①: 질문 프리페치 완료 + 최소 노출 시간 (docs/API.md §4)
  useEffect(() => {
    let alive = true
    const minDelay = new Promise((r) => setTimeout(r, SUMMON_MIN_MS))
    prefetchQuestions()
      .then(async (qs) => {
        qs.forEach((q) => q.imageUrl && preloadImage(q.imageUrl))
        await minDelay
        if (!alive) return
        setQuestions(qs)
        // 개발용: ?phase=question 으로 프롤로그 건너뛰고 바로 확인
        const debugPhase = import.meta.env.DEV && new URLSearchParams(location.search).get('phase')
        setPhase(debugPhase === 'question' ? 'question' : 'prologue')
      })
      .catch(() => alive && setPhase('error'))
    return () => {
      alive = false
    }
  }, [])

  /** A4: 엔딩 화면 진입과 동시에 제출 발사 — 사용자가 엔딩을 읽는 동안 결과·이미지 도착 */
  const startSubmit = useCallback(() => {
    if (submitPromise.current) return
    const ids = useTestStore.getState().choiceIds
    submitPromise.current = (async () => {
      let result: TestResult
      try {
        result = await api.submitAnswers(school?.schoolId ?? 0, ids)
      } catch {
        result = await api.submitAnswers(school?.schoolId ?? 0, ids) // 1회 조용히 재시도
      }
      await preloadImage(result.imageUrl)
      return result
    })()
    submitPromise.current.catch(() => {
      submitPromise.current = null
    })
  }, [school])

  /** A4: 엔딩 탭 → (필요시 로딩②) → 갑툭튀 → 결과 */
  const finish = useCallback(async () => {
    setPhase('analyze')
    try {
      if (!submitPromise.current) startSubmit()
      const result = await submitPromise.current!
      setResult(result)
      setScareImage(result.imageUrl)
      setPhase('scare')
      setTimeout(() => navigate('/result', { replace: true }), SCARE_MS)
    } catch {
      setPhase('error')
    }
  }, [startSubmit, setResult, navigate])

  if (phase === 'summon' || phase === 'error' || !questions) {
    return (
      <div className="canvas">
        {phase === 'error' ? (
          <RetryView
            onRetry={() => {
              if (questions) {
                submitPromise.current = null
                finish()
              } else {
                window.location.reload()
              }
            }}
          />
        ) : (
          <LoadingScreen text="한여름 밤, 학교 담장 앞에 도착했다..." />
        )}
      </div>
    )
  }

  if (phase === 'analyze') {
    return (
      <div className="canvas">
        <LoadingScreen text="결과를 분석 중입니다..." />
      </div>
    )
  }

  // A4: 갑툭튀 — 거울 속 그 존재 (실제 내 결과 귀신의 실루엣)
  if (phase === 'scare') {
    return (
      <div className="canvas quiz-scare">
        {scareImage && <img src={scareImage} alt="" className="quiz-scare-img" />}
      </div>
    )
  }

  // 프롤로그 / 엔딩 — 전체 화면 내레이션 (탭하여 진행)
  if (phase === 'prologue' || phase === 'ending') {
    const isPrologue = phase === 'prologue'
    return (
      <div className="canvas quiz-narration" onClick={() => (isPrologue ? setPhase('question') : finish())}>
        <HauntedBackground />
        <StaggeredLines text={isPrologue ? PROLOGUE : ENDING} fontSize={u(16)} letterSpacing={u(1.5)} />
        <p
          className="quiz-tap-hint quiz-tap-hint-delayed"
          style={{
            bottom: u(120),
            fontSize: u(11),
            letterSpacing: u(2),
            animationDelay: `${(isPrologue ? PROLOGUE : ENDING).split('\n').length * 0.6 + 0.4}s`,
          }}
        >
          화면을 탭하면 계속됩니다
        </p>
      </div>
    )
  }

  const question = questions[index]
  const selectedId = choiceIds[index]
  const selectedChoice = question.choices.find((c) => c.choiceId === selectedId)
  const total = questions.length
  // A2: 진행할수록 배경이 어두워지고 비네트가 짙어진다
  const progress = index / (total - 1)
  const bgOpacity = 1 - progress * 0.45
  const vignette = 0.25 + progress * 0.45

  const choose = (choiceId: number) => {
    answer(index, choiceId)
    setPhase('reaction')
  }

  const advance = () => {
    if (index + 1 < total) {
      setPhase('question')
      setIndex(index + 1)
    } else {
      setPhase('ending')
      startSubmit()
    }
  }

  return (
    <div
      className="canvas quiz-canvas"
      style={{ padding: `${u(140)} ${u(45)} ${u(28)}` }}
      onClick={phase === 'reaction' ? advance : undefined}
    >
      <HauntedBackground opacity={bgOpacity} />
      <div
        className="quiz-vignette"
        style={{ background: `radial-gradient(ellipse at center, transparent 52%, rgba(0, 0, 0, ${vignette}) 100%)` }}
      />

      <p className="quiz-progress-label" style={{ left: u(52), top: u(86), fontSize: u(10), letterSpacing: u(3.5) }}>
        Q{index + 1}/{total}
      </p>
      <div className="quiz-track" style={{ left: u(56), top: u(110), width: u(296) }} />
      <div
        className="quiz-track-fill"
        style={{ left: u(56), top: u(108.5), width: u(296 * ((index + 1) / total)) }}
      />

      {/* A6: index가 바뀌면 key 교체로 크로스페이드 등장 */}
      <div key={index} className="quiz-body">
        {question.imageUrl ? (
          <img
            className="quiz-illust"
            src={question.imageUrl}
            alt=""
            style={{ width: u(298), height: u(298), borderRadius: u(10) }}
          />
        ) : (
          <div
            className="quiz-illust quiz-illust-placeholder"
            style={{ width: u(298), height: u(298), borderRadius: u(10), fontSize: u(12), letterSpacing: u(2) }}
          >
            일러스트 준비 중
          </div>
        )}

        {phase === 'question' ? (
          <div className="quiz-flow" style={{ marginTop: u(30), gap: u(24) }}>
            <p className="quiz-question" style={{ fontSize: u(19), letterSpacing: u(1.5) }}>{question.content}</p>
            <div className="quiz-choices" style={{ gap: u(14) }}>
              {question.choices.map((choice) => (
                <button
                  key={choice.choiceId}
                  className={`quiz-choice ${choice.choiceId === selectedId ? 'is-selected' : ''}`}
                  style={{ minHeight: u(43), borderRadius: u(3), fontSize: u(14), letterSpacing: u(1), padding: `${u(12)} ${u(16)}` }}
                  onClick={() => choose(choice.choiceId)}
                >
                  {choice.content}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="quiz-flow" style={{ marginTop: u(50), gap: u(28) }}>
            <p className="quiz-reaction" style={{ fontSize: u(16), letterSpacing: u(1) }}>{selectedChoice?.reactionText}</p>
            <p className="quiz-tap-hint" style={{ fontSize: u(11), letterSpacing: u(2) }}>화면을 탭하면 계속됩니다</p>
          </div>
        )}
      </div>

      {phase === 'question' && (
        <div className="quiz-navrow" style={{ minHeight: u(44), paddingTop: u(24) }}>
          {index > 0 ? (
            <button className="quiz-nav" style={{ fontSize: u(20) }} onClick={() => setIndex(index - 1)}>
              &lt;
            </button>
          ) : (
            <span />
          )}
          {selectedId !== undefined ? (
            <button className="quiz-nav" style={{ fontSize: u(20) }} onClick={advance}>
              &gt;
            </button>
          ) : (
            <span />
          )}
        </div>
      )}
    </div>
  )
}

function RetryView({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="quiz-retry">
      <p style={{ fontSize: u(16) }}>귀신이 응답하지 않습니다...</p>
      <button className="quiz-retry-btn" style={{ fontSize: u(15), padding: `${u(12)} ${u(32)}`, borderRadius: u(8) }} onClick={onRetry}>
        다시 시도하기
      </button>
    </div>
  )
}
