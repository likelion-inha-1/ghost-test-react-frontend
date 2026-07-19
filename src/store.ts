import { create } from 'zustand'
import type { School, TestResult } from './api/types'

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
  school: null,
  choiceIds: [],
  result: null,
  participantCount: null,

  setSchool: (school) => set({ school }),
  answer: (index, choiceId) =>
    set((s) => {
      // 이전 문항으로 돌아가 답을 바꿔도 이후 답변은 유지 (> 버튼으로 다시 전진 가능)
      const next = [...s.choiceIds]
      next[index] = choiceId
      return { choiceIds: next }
    }),
  setResult: (result) => set({ result }),
  setParticipantCount: (count) => set({ participantCount: count }),
  reset: () => set({ school: null, choiceIds: [], result: null }),
}))
