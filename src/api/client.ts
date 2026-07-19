import { mockApi } from './mock'
import type { Question, Rankings, School, SchoolRankings, TestResult } from './types'

const BASE_URL = import.meta.env.VITE_API_BASE_URL as string | undefined
const useMock = !BASE_URL

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}/api/v1${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
  if (!res.ok) throw new Error(`API ${path} failed: ${res.status}`)
  return res.json() as Promise<T>
}

export const api = {
  getParticipantCount(): Promise<number> {
    if (useMock) return mockApi.getParticipantCount()
    return http<{ participantCount: number }>('/participant-count').then((r) => r.participantCount)
  },

  searchSchools(query: string): Promise<School[]> {
    if (useMock) return mockApi.searchSchools(query)
    return http<{ schools: School[] }>(`/schools?query=${encodeURIComponent(query)}`).then((r) => r.schools)
  },

  getQuestions(): Promise<Question[]> {
    if (useMock) return mockApi.getQuestions()
    return http<{ questions: Question[] }>('/questions').then((r) => r.questions)
  },

  submitAnswers(schoolId: number, choiceIds: number[]): Promise<TestResult> {
    if (useMock) return mockApi.submitAnswers(schoolId, choiceIds)
    return http<TestResult>('/histories', {
      method: 'POST',
      body: JSON.stringify({ schoolId, choiceIds }),
    })
  },

  getResult(id: number): Promise<TestResult> {
    if (useMock) return mockApi.getResult(id)
    return http<TestResult>(`/histories/${id}`)
  },

  getRankings(): Promise<Rankings> {
    if (useMock) return mockApi.getRankings()
    return http<Rankings>('/rankings')
  },

  getSchoolRankings(schoolId: number): Promise<SchoolRankings> {
    if (useMock) return mockApi.getSchoolRankings(schoolId)
    return http<SchoolRankings>(`/schools/${schoolId}/rankings`)
  },
}

// --- 프리페치 캐시 (docs/API.md 4장 로딩 최소화 전략) ---

let questionsPromise: Promise<Question[]> | null = null
/** 시작하기 클릭 순간 발사 — 학교 선택 + 로딩① 시간이 프리페치 버퍼가 된다 */
export function prefetchQuestions(): Promise<Question[]> {
  questionsPromise ??= api.getQuestions().catch((e) => {
    questionsPromise = null
    throw e
  })
  return questionsPromise
}

let rankingsPromise: Promise<Rankings> | null = null
let schoolRankingsPromise: Promise<SchoolRankings> | null = null
/** 결과 화면 진입 시 발사 — 순위 화면은 도착해 있는 데이터로 즉시 렌더 */
export function prefetchRankings(schoolId?: number) {
  rankingsPromise ??= api.getRankings().catch((e) => {
    rankingsPromise = null
    throw e
  })
  if (schoolId && schoolId !== 0) {
    schoolRankingsPromise ??= api.getSchoolRankings(schoolId).catch((e) => {
      schoolRankingsPromise = null
      throw e
    })
  }
  return { rankings: rankingsPromise, schoolRankings: schoolRankingsPromise }
}

export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = () => resolve() // 이미지 실패가 플로우를 막지 않게
    img.src = src
  })
}
