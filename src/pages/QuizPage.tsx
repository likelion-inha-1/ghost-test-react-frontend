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

type Phase = 'summon' | 'prologue' | 'question' | 'reaction' | 'ending' | 'analyze' | 'error'

/** A3: 내레이션 줄 등장 타이밍 — 글자 수(읽는 시간)에 비례 */
function narrationTiming(text: string) {
  const lines = text.split('\n')
  const delays: number[] = []
  let acc = 0.3
  for (const line of lines) {
    delays.push(acc)
    acc += 0.7 + Math.min(line.length * 0.05, 1.8)
  }
  return { lines, delays, total: acc }
}

function StaggeredLines({ text, fontSize, letterSpacing }: { text: string; fontSize: string; letterSpacing: string }) {
  const { lines, delays } = narrationTiming(text)
  return (
    <div className="quiz-narration-text" style={{ fontSize, letterSpacing, padding: `0 ${u(40)}` }}>
      {lines.map((line, i) => (
        <p key={i} className="quiz-narration-line" style={{ animationDelay: `${delays[i]}s` }}>
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
        // 개발용: ?phase=question&q=4 로 프롤로그 건너뛰고 특정 문항 바로 확인
        const params = new URLSearchParams(location.search)
        const debugPhase = import.meta.env.DEV && params.get('phase')
        if (debugPhase === 'question') {
          const q = Number(params.get('q'))
          if (q >= 1 && q <= qs.length) setIndex(q - 1)
          setPhase('question')
        } else {
          setPhase('prologue')
        }
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

  /** 엔딩 탭 → (필요시 로딩②) → 결과. 갑툭튀 연출은 추후 재제작 예정 */
  const finish = useCallback(async () => {
    setPhase('analyze')
    try {
      if (!submitPromise.current) startSubmit()
      const result = await submitPromise.current!
      setResult(result)
      navigate('/result', { replace: true })
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

  // 프롤로그 / 엔딩 — 전체 화면 내레이션 (탭하여 진행)
  if (phase === 'prologue' || phase === 'ending') {
    const isPrologue = phase === 'prologue'
    const text = isPrologue ? PROLOGUE : ENDING
    return (
      <div className="canvas quiz-narration" onClick={() => (isPrologue ? setPhase('question') : finish())}>
        {/* 엔딩은 Q8까지 어두워진 배경 톤을 그대로 유지 (갑자기 밝아지지 않게) */}
        <HauntedBackground opacity={isPrologue ? 1 : 0.55} />
        <StaggeredLines text={text} fontSize={u(16)} letterSpacing={u(1.5)} />
        <p
          className="quiz-tap-hint quiz-tap-hint-delayed"
          style={{
            bottom: u(120),
            fontSize: u(11),
            letterSpacing: u(2),
            animationDelay: `${narrationTiming(text).total + 0.2}s`,
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
      style={{ padding: `${u(104)} ${u(45)} ${u(28)}` }}
      onClick={phase === 'reaction' ? advance : undefined}
    >
      <HauntedBackground opacity={bgOpacity} />
      <div
        className="quiz-vignette"
        style={{ background: `radial-gradient(ellipse at center, transparent 52%, rgba(0, 0, 0, ${vignette}) 100%)` }}
      />

      <p className="quiz-progress-label" style={{ left: u(52), top: u(48), fontSize: u(10), letterSpacing: u(3.5) }}>
        Q{index + 1}/{total}
      </p>
      <div className="quiz-track" style={{ left: u(56), top: u(72), width: u(296) }} />
      <div
        className="quiz-track-fill"
        style={{ left: u(56), top: u(70.5), width: u(296 * ((index + 1) / total)) }}
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
            {/* 긴 질문 가독성: 문장 단위 줄 분리 + 크기·행간 조정 */}
            <div
              className="quiz-question"
              style={{
                fontSize: u(question.content.length > 40 ? 16.5 : 19),
                letterSpacing: u(question.content.length > 40 ? 1 : 1.5),
                gap: u(8),
              }}
            >
              {question.content.split(/(?<=[.?!])\s+/).map((sentence, i) => (
                <p key={i}>{sentence}</p>
              ))}
            </div>
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
