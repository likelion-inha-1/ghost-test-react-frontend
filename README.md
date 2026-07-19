# 👻 귀신 유형 테스트 — Frontend

토스 여름 챌린지 출품작. 8개의 질문으로 알아보는 나의 귀신 유형 테스트의 프론트엔드 레포입니다.
앱인토스(Apps in Toss) WebView 미니앱으로 배포됩니다.

기획·화면 정의·API 스펙은 [PLAN.md](./PLAN.md) 참고.

## 기술 스택

- Vite + React 18 + TypeScript
- `@apps-in-toss/web-framework` — 앱인토스 미니앱 SDK
- `@toss/tds-mobile`, `@toss/tds-mobile-ait` — 토스 디자인 시스템 (TDS Mobile)

## 시작하기

```sh
npm install
npm run dev        # localhost:5173
npm run build      # 배포 번들 생성 (dist/)
```

## 디렉토리 구조

```
src/
├── pages/        # 화면 (홈, 학교 선택, 질문, 결과)
├── components/   # 공용 컴포넌트
├── api/          # 백엔드 연동
├── App.tsx
└── main.tsx      # TDSMobileAITProvider 적용된 엔트리
granite.config.ts # 앱인토스 앱 설정 (appName, 아이콘 등)
```

## 미니앱 테스트

- 샌드박스 앱에서 `intoss://ghost-test` 딥링크로 접근 (appName은 `granite.config.ts` 참고)
- 실기기 테스트: `granite.config.ts`의 `web.host`를 로컬 IP로 변경하고 dev 커맨드에 `--host` 추가
- ⚠️ 콘솔에 앱 등록 후 `granite.config.ts`의 `appName`/`displayName`/`icon`을 실제 값으로 교체 필요
