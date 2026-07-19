// docs/API.md 기준 (Base URL: /api/v1)

export interface School {
  schoolId: number
  schoolName: string
  region?: string
}

export interface Choice {
  choiceId: number
  choiceOrder: number
  content: string
  reactionText: string
}

export interface Question {
  questionId: number
  content: string
  imageUrl: string
  choices: Choice[]
}

export interface MatchInfo {
  ghostName: string
  comment: string
}

export interface TestResult {
  id: number
  schoolName: string | null
  ghostType: string
  ghostName: string
  /** 수식어 — 카드 상단 한 줄 (R-3 확정) */
  description: string
  imageUrl: string
  aiStory: string
  bestMatch: MatchInfo
  worstMatch: MatchInfo
  createdAt: string
}

export interface RankingItem {
  rank: number
  ghostType: string
  ghostName: string
  description: string
  count: number
  percent: number
}

export interface Rankings {
  participantCount: number
  rankings: RankingItem[]
}

export interface SchoolRankings extends Rankings {
  schoolName: string
}

/** 학교 건너뛰기 시 제출하는 schoolId (null 불허 — 협의 확정) */
export const SCHOOL_ID_SKIPPED = 0
