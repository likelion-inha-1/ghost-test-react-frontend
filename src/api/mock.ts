// 백엔드 미가동 시 사용하는 목 데이터 (VITE_API_BASE_URL 미설정 시 자동 활성화)
// 콘텐츠 출처: mockup/story.txt, mockup/ghost.txt, mockup/images/*.jpg
import type { Question, Rankings, School, SchoolRankItem, SchoolRankings, TestResult } from './types'

// 이미지 번호 매핑은 일러스트 내용 기준 추정 — 백엔드 확정 데이터가 오면 무의미해짐
const GHOSTS: Array<{ mbti: string; ghostName: string; description: string; img: string }> = [
  { mbti: 'INTJ', ghostName: '뒤끝의 지박령', description: '어떤 거든 끝까지 물고 늘어지는', img: '/mock/13.jpg' },
  { mbti: 'INTP', ghostName: '관찰광 초상화귀신', description: '벽에 걸려 사람들을 밤새 구경하는', img: '/mock/4.jpg' },
  { mbti: 'ENTJ', ghostName: '실적중독 염라대왕', description: '저승 직원들 야근까지 시키는', img: '/mock/1.jpg' },
  { mbti: 'ENTP', ghostName: '말빨甲 구미호', description: '말 한마디로 홀려 간까지 빼먹는', img: '/mock/3.jpg' },
  { mbti: 'INFJ', ghostName: '속을 알 수 없는 달걀귀신', description: '표정 하나 안 바뀌어서 더 무서운', img: '/mock/5.jpg' },
  { mbti: 'INFP', ghostName: '수다쟁이 처녀귀신', description: '밤새 조잘거려서 귀찮게 하는', img: '/mock/14.jpg' },
  { mbti: 'ENFJ', ghostName: '오지랖 선녀', description: '지나가는 귀신들 고민까지 들어주는', img: '/mock/9.jpg' },
  { mbti: 'ENFP', ghostName: '흥부자 도깨비', description: '심심하면 금은보화 퍼주는', img: '/mock/6.jpg' },
  { mbti: 'ISTJ', ghostName: '원칙주의 저승사자', description: '명부에 오타 하나만 나도 다시 쓰게 하는', img: '/mock/12.jpg' },
  { mbti: 'ISFJ', ghostName: '잔소리 성주신', description: '제사상 반찬 하나 빠져도 꿈에 찾아오는', img: '/mock/10.jpg' },
  { mbti: 'ESTJ', ghostName: '군기반장 퇴마사', description: '악귀도 줄 세워 훈련시키는', img: '/mock/15.jpg' },
  { mbti: 'ESFJ', ghostName: '참견쟁이 할머니귀신', description: '동네 귀신들 소식 다 알고 있는', img: '/mock/11.jpg' },
  { mbti: 'ISTP', ghostName: '귀차니즘 강시', description: '부적 붙이면 그냥 포기하는', img: '/mock/2.jpg' },
  { mbti: 'ISFP', ghostName: '감성 물귀신', description: '조용히 곁에 있다가 어느새 친구가 되는', img: '/mock/7.jpg' },
  { mbti: 'ESTP', ghostName: '장난꾸러기 빨간마스크', description: '사람 놀래키고 도망가는 게 취미인', img: '/mock/8.jpg' },
  { mbti: 'ESFP', ghostName: '관종 홍콩할매귀신', description: '사진 찍히는 곳마다 나타나는', img: '/mock/16.jpg' },
]

// [질문, A선택지, A반응, B선택지, B반응, A성향, B성향] — mockup/story.txt
const STORY: Array<[string, string, string, string, string, string, string]> = [
  [
    '담을 넘다가 경비실 쪽에서 인기척이 들린다',
    '"저... 교과서만 가지러 왔어요" 하고 말한다',
    '...아무 대답이 없다. 잘못 들었나 싶어 발걸음을 옮겨 운동장을 가로지르기 시작한다.',
    '순간 몸이 굳어서 담벼락 그림자에 바짝 붙는다',
    '숨죽인 채 한참을 기다렸지만, 인기척은 다시 들리지 않는다. 조심스레 운동장을 가로지르기 시작한다.',
    'E', 'I',
  ],
  [
    '운동장을 가로지르다 보니 길이 두 갈래다. 하나는 밝은 가로등 밑 정문 쪽 길, 하나는 어두운 화단을 낀 지름길',
    "'빨리 교과서나 챙겨와야지..' 어두운 화단을 낀 지름길로 걷는다",
    '화단 사이를 빠르게 지나쳐 건물 뒷문에 다다른다. 문을 밀고 들어서자 계단이 눈에 들어온다.',
    "'어두운 길엔 뭐가 있을 지 몰라..' 밝고 안전한 길로 걷는다",
    '불빛을 따라 걷다 보니 정문이 보인다. 문을 밀고 들어서자 계단이 눈에 들어온다.',
    'S', 'N',
  ],
  [
    '계단을 오르는데 위쪽에서 저벅저벅 발소리가 들린다',
    "'다른 층에서 나는 소리겠지' 하고 그대로 계단을 오른다",
    '발소리는 이내 멎는다. 침착하게 2층에 다다른다. 복도 저편, 화장실 앞을 지나야 한다.',
    '순간 소름이 돋아 발소리를 피해 반대쪽 계단을 이용한다',
    '심장이 쿵쾅거린다. 애써 마음을 가라앉히며 2층에 다다른다. 복도 저편, 화장실 앞을 지나야 한다.',
    'J', 'P',
  ],
  [
    '화장실 앞을 지나는데, 안에서 물방울 떨어지는 소리가 들린다. 안을 들여다보니 아무도 없고, 세면대 위엔 짝꿍이 찾던 것과 똑같은 손거울이 놓여 있다.',
    '신경 쓰지 않고 곧장 교실로 향한다',
    '내 일도 아니다. 발걸음을 옮겨 긴 복도로 들어선다.',
    '짝꿍 생각에 손거울을 슬쩍 주머니에 챙긴다',
    '내일 갖다주면 좋아하겠지. 거울을 챙겨 긴 복도로 들어선다.',
    'T', 'F',
  ],
  [
    '복도를 걷는데 저편 끝에서 그림자 같은 게 휙 지나간다',
    '"누구야? 여기 있는 거 다 아니까 나와" 하고 반응한다',
    '돌아오는 대답은 없다. 정적만이 복도를 채운다. 발걸음을 옮기자 음악실 앞이 보인다.',
    '못 본 척, 아무 일 없다는 듯 걸음을 서두른다',
    '뒤돌아보고 싶은 걸 억지로 참으며 걸음을 서두른다. 어느새 음악실 앞이다.',
    'E', 'I',
  ],
  [
    '음악실 앞을 지나는데, 안에서 피아노 소리가 들리는 듯하다. 문득 예전에 이 학교에서 들었던 괴담이 떠오른다.',
    '"다 지어낸 얘기겠지" 하고 대수롭지 않게 넘긴다',
    '괜한 생각 말자 싶어 걸음을 옮긴다. 3층으로 향하는 마지막 계단 앞에 선다.',
    '소문의 내용이 하나하나 다시 떠오르며 등골이 서늘해진다',
    '머릿속에서 그 소문이 자꾸 재생된다. 애써 떨치며 3층으로 향하는 마지막 계단 앞에 선다.',
    'S', 'N',
  ],
  [
    '3층으로 향하는 마지막 계단, 모든 불이 꺼져 있다.',
    "'휴대폰 플래시를 켜면 되겠네.' 침착하게 불빛을 비추며 계단을 오른다.",
    '마침내 도착한 3층, 복도 끝에 우리 반이 눈에 들어온다.',
    "'이 분위기... 괜히 불안한데.' 심호흡을 하고 조심스럽게 계단을 오른다.",
    '조심스레 계단을 오른다. 3층 저 끝에 우리 반이 눈에 들어온다.',
    'T', 'F',
  ],
  [
    '내 교실 앞, 문 손잡이가 이미 살짝 열려 있다',
    '살짝 벌어진 틈으로 안쪽을 조심스레 들여다본다',
    '어둠 속을 살피던 그 순간, 틈 사이로 문이 스르륵 더 열린다.',
    '망설이지 않고 손잡이를 잡아 벌컥 연다',
    '손잡이를 잡는 손에 힘이 들어간다. 문이 활짝 열린다.',
    'J', 'P',
  ],
]

/** choiceId 인코딩: 문항 i의 A = i*2+1, B = i*2+2 */
function mbtiFromChoices(choiceIds: number[]): string {
  const tally: Record<string, number> = {}
  choiceIds.forEach((id) => {
    const q = Math.ceil(id / 2) - 1
    const isA = id % 2 === 1
    const letter = STORY[q]?.[isA ? 5 : 6]
    if (letter) tally[letter] = (tally[letter] ?? 0) + 1
  })
  const pick = (a: string, b: string) => ((tally[a] ?? 0) >= (tally[b] ?? 0) ? a : b)
  return pick('E', 'I') + pick('S', 'N') + pick('T', 'F') + pick('J', 'P')
}

export const mockApi = {
  async getParticipantCount(): Promise<number> {
    return 357
  },

  async searchSchools(query: string): Promise<School[]> {
    const pool: School[] = [
      { schoolId: 1, schoolName: '인하대학교', region: '인천' },
      { schoolId: 2, schoolName: '인하공업전문대학', region: '인천' },
      { schoolId: 3, schoolName: '인하대학교사범대학부속중학교', region: '인천' },
      { schoolId: 4, schoolName: '인하대학교사범대학부속고등학교', region: '인천' },
      { schoolId: 5, schoolName: '인천고등학교', region: '인천' },
      { schoolId: 6, schoolName: '인창고등학교', region: '서울' },
      { schoolId: 7, schoolName: '하나고등학교', region: '서울' },
    ]
    return pool.filter((s) => s.schoolName.includes(query)).slice(0, 10)
  },

  async getQuestions(): Promise<Question[]> {
    return STORY.map(([content, a, ra, b, rb], i) => ({
      questionId: i + 1,
      content,
      // 문항(스토리) 일러스트는 아직 없음 — 빈 값이면 프론트가 플레이스홀더 표시
      imageUrl: '',
      choices: [
        { choiceId: i * 2 + 1, choiceOrder: 1, content: a, reactionText: ra },
        { choiceId: i * 2 + 2, choiceOrder: 2, content: b, reactionText: rb },
      ],
    }))
  },

  async submitAnswers(schoolId: number, choiceIds: number[]): Promise<TestResult> {
    const mbti = mbtiFromChoices(choiceIds)
    const idx = GHOSTS.findIndex((g) => g.mbti === mbti)
    const ghost = GHOSTS[idx === -1 ? 0 : idx]
    const best = GHOSTS[(idx + 5) % 16]
    const worst = GHOSTS[(idx + 11) % 16]
    return {
      id: 1004,
      schoolName: schoolId === 0 ? null : '인하고등학교',
      ghostType: ghost.mbti,
      ghostName: ghost.ghostName,
      description: ghost.description,
      imageUrl: ghost.img,
      aiStory:
        '거울 속에서 너를 마주본 그 존재는, 사실 꽤 오래전부터 너를 따라다니고 있었다.\n네가 웃을 때 같이 웃고, 네가 무서워할 때 조금 미안해하면서.\n오늘 밤 학교에서의 선택들이 그 정체를 드러나게 했을 뿐이다.',
      bestMatch: { ghostName: best.ghostName, comment: `${best.description} ${best.ghostName}` },
      worstMatch: { ghostName: worst.ghostName, comment: `${worst.description} ${worst.ghostName}` },
      createdAt: new Date().toISOString(),
    }
  },

  async getResult(id: number): Promise<TestResult> {
    const ghost = GHOSTS[Number(id) % 16]
    const base = await this.submitAnswers(1, [])
    return { ...base, id: Number(id), ghostType: ghost.mbti, ghostName: ghost.ghostName, description: ghost.description, imageUrl: ghost.img }
  },

  async getRankings(): Promise<Rankings> {
    const total = 357
    return {
      participantCount: total,
      rankings: GHOSTS.map((g, i) => ({
        rank: i + 1,
        ghostType: g.mbti,
        ghostName: g.ghostName,
        description: g.description,
        count: Math.max(4, Math.round((total / 16) * (1.8 - i * 0.1))),
        percent: Math.round(Math.max(1.1, (1.8 - i * 0.1) * 6.25) * 10) / 10,
      })),
    }
  },

  async getSchoolRankings(schoolId: number): Promise<SchoolRankings> {
    const base = await this.getRankings()
    void schoolId
    return { schoolName: '인하고등학교', participantCount: 53, rankings: base.rankings }
  },

  async getTopSchools(): Promise<SchoolRankItem[]> {
    return [
      { rank: 1, schoolName: '인하대학교', percent: 14.8 },
      { rank: 2, schoolName: '인하고등학교', percent: 11.2 },
      { rank: 3, schoolName: '인하중학교', percent: 8.5 },
    ]
  },
}
