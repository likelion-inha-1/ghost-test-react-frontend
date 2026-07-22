import { useEffect, useState } from 'react'
import { prefetchRankings } from '../api/client'
import type { Rankings, SchoolRankItem } from '../api/types'
import { u } from '../lib/units'
import { useTestStore } from '../store'
import './stats.css'

/**
 * 순위 — Figma v2.0 (257:35)
 * ① 집계된 학교 등수 1~3위 → 구분선 → ② 전체 유형 분포 1~3위 → ③ 4~16위 2단 컬럼
 */
export function StatsPage() {
  const school = useTestStore((s) => s.school)
  const [rankings, setRankings] = useState<Rankings | null>(null)
  const [topSchools, setTopSchools] = useState<SchoolRankItem[]>([])

  useEffect(() => {
    const p = prefetchRankings(school?.schoolId)
    p.rankings.then(setRankings).catch(() => {})
    p.topSchools?.then(setTopSchools).catch(() => {})
  }, [school])

  const top3 = rankings?.rankings.slice(0, 3) ?? []
  const restLeft = rankings?.rankings.slice(3, 10) ?? []
  const restRight = rankings?.rankings.slice(10) ?? []
  const badgeSizes = [57, 46, 46]

  return (
    <div className="canvas stats-canvas">
      {/* 뒤로가기는 토스 네비게이션바 기본 UI 사용 — 자체 버튼 없음 */}
      <div className="stats-content" style={{ padding: `calc(var(--nav-inset) + ${u(48)}) ${u(42)} ${u(60)}` }}>
        {/* ① 학교 등수 (v2 신설 — 백엔드 API 협의 중, 목 데이터) */}
        {topSchools.length > 0 && (
          <>
            <p className="stats-caption" style={{ fontSize: u(13), letterSpacing: u(2) }}>집계된 학교 등수</p>
            <h2 className="stats-title" style={{ fontSize: u(25), letterSpacing: u(2.5), margin: `${u(6)} 0 ${u(30)}` }}>
              귀신이 가장 많은 학교는?
            </h2>
            {topSchools.map((item, i) => (
              <div className="stats-top-row" key={item.rank} style={{ marginBottom: u(i === 0 ? 28 : 22), gap: u(14) }}>
                <div
                  className={`stats-badge ${i === 0 ? 'stats-badge-first' : ''}`}
                  style={{ width: u(badgeSizes[i]), height: u(badgeSizes[i]), fontSize: u(i === 0 ? 22 : 18) }}
                >
                  {item.rank}
                  <span style={{ fontSize: u(11) }}>위</span>
                </div>
                <p className={`stats-top-name ${i === 0 ? 'stats-top-name-first' : ''}`} style={{ flex: 1, margin: 0, fontSize: u(i === 0 ? 26 : 20), letterSpacing: u(2) }}>
                  {item.schoolName}
                </p>
                <span className="stats-percent" style={{ fontSize: u(12), letterSpacing: u(1) }}>{item.percent}%</span>
              </div>
            ))}
            <div className="stats-divider" style={{ margin: `${u(34)} 0 ${u(38)}` }} />
          </>
        )}

        {/* ② 전체 유형 분포 1~3위 */}
        <p className="stats-caption" style={{ fontSize: u(13), letterSpacing: u(2) }}>전체 테스트 결과 분포</p>
        <h2 className="stats-title" style={{ fontSize: u(25), letterSpacing: u(2.5), margin: `${u(6)} 0 ${u(30)}` }}>
          가장 많은 귀신은?
        </h2>
        {top3.map((item, i) => (
          <div className="stats-top-row" key={item.rank} style={{ marginBottom: u(i === 0 ? 32 : 24), gap: u(14) }}>
            <div
              className={`stats-badge ${i === 0 ? 'stats-badge-first' : ''}`}
              style={{ width: u(badgeSizes[i]), height: u(badgeSizes[i]), fontSize: u(i === 0 ? 22 : 18) }}
            >
              {item.rank}
              <span style={{ fontSize: u(11) }}>위</span>
            </div>
            <div className="stats-top-info">
              <p className="stats-top-modifier" style={{ fontSize: u(12), letterSpacing: u(1.5) }}>{item.description}</p>
              <p className={`stats-top-name ${i === 0 ? 'stats-top-name-first' : ''}`} style={{ fontSize: u(i === 0 ? 28 : 22), letterSpacing: u(2) }}>
                {item.ghostName}
              </p>
            </div>
            <span className="stats-percent" style={{ fontSize: u(12), letterSpacing: u(1) }}>{item.percent}%</span>
          </div>
        ))}

        {/* ③ 4~16위 — 2단 컬럼 (v2) */}
        <div className="stats-rest-grid" style={{ marginTop: u(20), columnGap: u(24) }}>
          <div className="stats-rest-col">
            {restLeft.map((item) => (
              <div className="stats-row" key={item.rank} style={{ height: u(33), gap: u(10) }}>
                <span className="stats-row-rank" style={{ fontSize: u(16), width: u(34) }}>{item.rank}위</span>
                <span className="stats-row-name" style={{ fontSize: u(12), letterSpacing: u(1) }}>{item.ghostName}</span>
                <span className="stats-percent" style={{ fontSize: u(11) }}>{item.percent}%</span>
              </div>
            ))}
          </div>
          <div className="stats-rest-col">
            {restRight.map((item) => (
              <div className="stats-row" key={item.rank} style={{ height: u(33), gap: u(10) }}>
                <span className="stats-row-rank" style={{ fontSize: u(16), width: u(34) }}>{item.rank}위</span>
                <span className="stats-row-name" style={{ fontSize: u(12), letterSpacing: u(1) }}>{item.ghostName}</span>
                <span className="stats-percent" style={{ fontSize: u(11) }}>{item.percent}%</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
