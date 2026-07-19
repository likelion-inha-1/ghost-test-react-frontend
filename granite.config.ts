import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  // TODO: 앱인토스 콘솔에 등록한 appName으로 변경 (딥링크 intoss://{appName} 경로로 사용됨)
  appName: 'ghost-test',
  brand: {
    // TODO: 콘솔에 등록한 앱 이름과 동일하게 설정
    displayName: '귀신 유형 테스트',
    primaryColor: '#1A1B2E',
    // TODO: 콘솔 앱 정보에 업로드한 아이콘 이미지 URL 입력
    icon: '',
  },
  web: {
    // 실기기(샌드박스 앱) 테스트용 — 같은 네트워크에서 접근 가능한 개발 머신 IP.
    // 네트워크가 바뀌면 이 값도 바뀜 (ifconfig | grep "inet " 으로 확인)
    host: '192.168.45.31',
    port: 5173,
    commands: {
      dev: 'vite --host', // 외부 기기 접속 허용
      build: 'vite build',
    },
  },
  permissions: [],
  outdir: 'dist',
  // 호러 무드 유지: 상단 네비게이션바를 다크 + 투명(플로팅)으로
  navigationBar: {
    theme: 'dark',
    transparentBackground: true,
  },
  // 오버스크롤 시 흰 배경 노출 방지
  webViewProps: {
    bounces: false,
    pullToRefreshEnabled: false,
    overScrollMode: 'never',
  },
});
