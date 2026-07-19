import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { prefetchRankings } from '../api/client'
import type { Rankings, SchoolRankings } from '../api/types'
import { HauntedBackground } from '../components/HauntedBackground'
import { u } from '../lib/units'
import { useTestStore } from '../store'
import './stats.css'

/** 순위 — 전체 결과 분포 (Figma 184:129). 학교 분포는 디자인 대기, 동일 스타일로 연장 */
export function StatsPage() {
  const navigate = useNavigate()
  const school = useTestStore((s) => s.school)
  const [rankings, setRankings] = useState<Rankings | null>(null)
  const [schoolRankings, setSchoolRankings] = useState<SchoolRankings | null>(null)

  useEffect(() => {
    const p = prefetchRankings(school?.schoolId)
    p.rankings.then(setRankings).catch(() => {})
    p.schoolRankings?.then(setSchoolRankings).catch(() => {})
  }, [school])

  const top3 = rankings?.rankings.slice(0, 3) ?? []
  const rest = rankings?.rankings.slice(3) ?? []
  const badgeSizes = [57, 46, 46]

  return (
    <div className="canvas stats-canvas">
      <HauntedBackground />
      <button className="stats-back" style={{ left: u(20), top: u(20), fontSize: u(20) }} onClick={() => navigate(-1)}>
        &lt;
      </button>

      <div className="stats-content" style={{ padding: `${u(79)} ${u(42)} ${u(60)}` }}>
        <p className="stats-caption" style={{ fontSize: u(13), letterSpacing: u(2) }}>전체 테스트 결과 분포</p>
        <h2 className="stats-title" style={{ fontSize: u(30), letterSpacing: u(3), margin: `${u(6)} 0 ${u(36)}` }}>
          가장 많은 귀신은?
        </h2>

        {top3.map((item, i) => (
          <div className="stats-top-row" key={item.rank} style={{ marginBottom: u(i === 0 ? 40 : 24), gap: u(14) }}>
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

        {rest.map((item) => (
          <div className="stats-row" key={item.rank} style={{ height: u(39), gap: u(18) }}>
            <span className="stats-row-rank" style={{ fontSize: u(18), width: u(38) }}>{item.rank}위</span>
            <span className="stats-row-name" style={{ fontSize: u(14), letterSpacing: u(1.5) }}>{item.ghostName}</span>
            <span className="stats-percent" style={{ fontSize: u(12), letterSpacing: u(1) }}>{item.percent}%</span>
          </div>
        ))}

        {schoolRankings && (
          <>
            <p className="stats-caption" style={{ fontSize: u(13), letterSpacing: u(2), marginTop: u(64) }}>
              {schoolRankings.schoolName} · {schoolRankings.participantCount}명 참여
            </p>
            <h2 className="stats-title" style={{ fontSize: u(30), letterSpacing: u(3), margin: `${u(6)} 0 ${u(28)}` }}>
              우리 학교의 귀신은?
            </h2>
            {schoolRankings.rankings.map((item) => (
              <div className="stats-row" key={item.rank} style={{ height: u(39), gap: u(18) }}>
                <span className="stats-row-rank" style={{ fontSize: u(18), width: u(38) }}>{item.rank}위</span>
                <span className="stats-row-name" style={{ fontSize: u(14), letterSpacing: u(1.5) }}>{item.ghostName}</span>
                <span className="stats-percent" style={{ fontSize: u(12), letterSpacing: u(1) }}>{item.percent}%</span>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
