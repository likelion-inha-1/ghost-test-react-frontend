import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import { QuizPage } from './pages/QuizPage'
import { ResultPage } from './pages/ResultPage'
import { SchoolPage } from './pages/SchoolPage'
import { StartPage } from './pages/StartPage'
import { StatsPage } from './pages/StatsPage'

/* A1: 라우트 진입마다 암전에서 걷히는 페이드 (공포영화 컷 전환) */
function RouteFade() {
  const location = useLocation()
  return <div className="route-fade" key={location.pathname} aria-hidden />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StartPage />} />
        <Route path="/school" element={<SchoolPage />} />
        <Route path="/quiz" element={<QuizPage />} />
        <Route path="/result" element={<ResultPage />} />
        <Route path="/stats" element={<StatsPage />} />
      </Routes>
      <RouteFade />
    </BrowserRouter>
  )
}

export default App
