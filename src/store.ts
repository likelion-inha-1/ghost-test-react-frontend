import { create } from 'zustand'
import type { School, TestResult } from './api/types'

// 결과·학교는 localStorage에 보존 — 재접속 시 결과 페이지가 바로 보인다 (백엔드 초기화 API 없음)
const RESULT_KEY = 'ghost-test:result'
const SCHOOL_KEY = 'ghost-test:school'

function load<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

function save(key: string, value: unknown | null) {
  try {
    if (value === null) localStorage.removeItem(key)
    else localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // 저장 실패(시크릿 모드 등)는 무시 — 세션 내 동작엔 지장 없음
  }
}

interface TestState {
  /** 선택한 학교 (건너뛰기 시 null → 제출 시 schoolId 0) */
  school: School | null
  /** 문항 순서대로 선택한 choiceId */
  choiceIds: number[]
  /** 본인 테스트 결과 (POST /histories 응답) */
  result: TestResult | null
  participantCount: number | null

  setSchool: (school: School | null) => void
  answer: (index: number, choiceId: number) => void
  setResult: (result: TestResult) => void
  setParticipantCount: (count: number) => void
  reset: () => void
}

export const useTestStore = create<TestState>((set) => ({
  school: load<School>(SCHOOL_KEY),
  choiceIds: [],
  result: load<TestResult>(RESULT_KEY),
  participantCount: null,

  setSchool: (school) => {
    save(SCHOOL_KEY, school)
    set({ school })
  },
  answer: (index, choiceId) =>
    set((s) => {
      // 이전 문항으로 돌아가 답을 바꿔도 이후 답변은 유지 (> 버튼으로 다시 전진 가능)
      const next = [...s.choiceIds]
      next[index] = choiceId
      return { choiceIds: next }
    }),
  setResult: (result) => {
    save(RESULT_KEY, result)
    set({ result })
  },
  setParticipantCount: (count) => set({ participantCount: count }),
  reset: () => {
    save(RESULT_KEY, null)
    save(SCHOOL_KEY, null)
    set({ school: null, choiceIds: [], result: null })
  },
}))
