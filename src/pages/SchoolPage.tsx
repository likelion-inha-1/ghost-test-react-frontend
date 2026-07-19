import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import type { School } from '../api/types'
import { HauntedBackground } from '../components/HauntedBackground'
import { u } from '../lib/units'
import { useTestStore } from '../store'
import './school.css'

/**
 * 학교 선택 — 디자인 시안 없음, 스타일 가이드 기반 자체 제작 (DESIGN.md §3.5)
 * 원칙: 검색 박스 하나 + 실시간 자동완성 + 건너뛰기. 피로도 최소화.
 */
export function SchoolPage() {
  const navigate = useNavigate()
  const setSchool = useTestStore((s) => s.setSchool)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<School[]>([])
  const cache = useRef(new Map<string, School[]>())
  const timer = useRef<number>(undefined)

  useEffect(() => {
    const q = query.trim()
    if (!q) {
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
  }, [query])

  const select = (school: School | null) => {
    setSchool(school)
    navigate('/quiz')
  }

  return (
    <div className="canvas">
      <HauntedBackground />
      <div className="school-content">
        <h2 className="school-title" style={{ fontSize: u(29), marginTop: `calc(var(--nav-inset) + ${u(110)})` }}>
          오늘 밤, 어느 학교로 숨어들까?
        </h2>
        <p className="school-sub" style={{ fontSize: u(11), letterSpacing: u(2) }}>
          네가 다니는 학교라면... 더 실감날 거야
        </p>
        <input
          className="school-input"
          // iOS는 16px 미만 입력 포커스 시 자동 확대 — 최소 16px 보장
          style={{ height: u(48), fontSize: `max(16px, ${u(15)})`, marginTop: u(28) }}
          type="search"
          placeholder="학교 이름을 검색해봐"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
        {/* 키보드가 올라와도 보이도록 입력창 바로 아래에 배치 */}
        <button className="school-skip" style={{ fontSize: u(12), letterSpacing: u(1), marginTop: u(14) }} onClick={() => select(null)}>
          아무 학교나 상관없어 &gt;
        </button>
        <ul className="school-list">
          {results.map((school) => (
            <li key={school.schoolId}>
              <button className="school-item" style={{ fontSize: u(15) }} onClick={() => select(school)}>
                {school.schoolName}
                {school.region && <span className="school-region"> {school.region}</span>}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
