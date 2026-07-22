import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import type { School } from '../api/types'
import { HauntedBackground } from '../components/HauntedBackground'
import { u } from '../lib/units'
import { useTestStore } from '../store'
import './school.css'

/**
 * 학교 검색 — Figma v2.0 (257:185) 기반.
 * 자동완성으로 학교를 고른 뒤 [확인]으로 진행 (협의 확정: 자동완성 + 확인 버튼)
 * 상단 일러스트는 임시 시안이라 제외 — 확정본 오면 타이틀 위에 추가
 */
export function SchoolPage() {
  const navigate = useNavigate()
  const setSchool = useTestStore((s) => s.setSchool)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<School[]>([])
  const [selected, setSelected] = useState<School | null>(null)
  const cache = useRef(new Map<string, School[]>())
  const timer = useRef<number>(undefined)

  useEffect(() => {
    const q = query.trim()
    // 선택 직후(입력값 = 선택 학교명)에는 목록을 다시 띄우지 않는다
    if (!q || (selected && q === selected.schoolName)) {
      setResults([])
      return
    }
    const cached = cache.current.get(q)
    if (cached) {
      setResults(cached)
      return
    }
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => {
      api
        .searchSchools(q)
        .then((schools) => {
          cache.current.set(q, schools)
          setResults(schools)
        })
        .catch(() => {})
    }, 200)
    return () => window.clearTimeout(timer.current)
  }, [query, selected])

  const pick = (school: School) => {
    setSelected(school)
    setQuery(school.schoolName)
    setResults([])
  }

  const proceed = (school: School | null) => {
    setSchool(school)
    navigate('/quiz')
  }

  return (
    <div className="canvas">
      <HauntedBackground />
      <div className="school-content" style={{ paddingTop: `calc(var(--nav-inset) + ${u(150)})` }}>
        {/* TODO: 확정 일러스트 오면 여기에 추가 (시안의 학교+유령 그래픽 자리) */}
        <h2 className="school-title" style={{ fontSize: u(25) }}>
          현재 있는 학교를 입력해주세요
        </h2>
        <p className="school-sub" style={{ fontSize: u(10), marginTop: u(8) }}>
          입력하신 학교는 추후 집계에 포함됩니다
        </p>

        <input
          className="school-input"
          // iOS는 16px 미만 입력 포커스 시 자동 확대 — 최소 16px 보장 (시안 10px과 절충)
          style={{ height: u(38), fontSize: `max(16px, ${u(13)})`, marginTop: u(26), borderRadius: u(5) }}
          type="search"
          placeholder="학교 이름을 입력해 주세요"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setSelected(null)
          }}
          autoFocus
        />

        {results.length > 0 && (
          <ul className="school-list">
            {results.map((school) => (
              <li key={school.schoolId}>
                <button className="school-item" style={{ fontSize: u(14) }} onClick={() => pick(school)}>
                  {school.schoolName}
                  {school.region && <span className="school-region"> {school.region}</span>}
                </button>
              </li>
            ))}
          </ul>
        )}

        <button
          className="school-skip"
          style={{ fontSize: u(10), marginTop: u(12) }}
          onClick={() => proceed(null)}
        >
          상관없음 &gt;
        </button>

        <button
          className="school-confirm"
          style={{ width: u(138), height: u(33), borderRadius: u(5), fontSize: u(15), marginTop: u(20) }}
          disabled={!selected}
          onClick={() => selected && proceed(selected)}
        >
          확인
        </button>
      </div>
    </div>
  )
}
