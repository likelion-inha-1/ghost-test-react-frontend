import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { TDSMobileAITProvider } from '@toss/tds-mobile-ait'
import './fonts.css'
import './index.css'
import App from './App.tsx'

// dev 전용: 웹뷰에서 흰/검정 화면의 원인을 볼 수 있게 에러를 화면에 표시
if (import.meta.env.DEV) {
  const show = (msg: string) => {
    const el = document.createElement('pre')
    el.style.cssText =
      'position:fixed;left:8px;right:8px;bottom:8px;z-index:9999;background:#300;color:#fbb;padding:10px;font-size:11px;white-space:pre-wrap;border-radius:6px;max-height:40vh;overflow:auto'
    el.textContent = msg
    document.body.appendChild(el)
  }
  window.addEventListener('error', (e) => show(`[error] ${e.message}\n${e.filename}:${e.lineno}`))
  window.addEventListener('unhandledrejection', (e) => show(`[promise] ${String(e.reason)}`))
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TDSMobileAITProvider>
      <App />
    </TDSMobileAITProvider>
  </StrictMode>,
)
