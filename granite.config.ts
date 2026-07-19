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
    host: 'localhost',
    port: 5173,
    commands: {
      dev: 'vite dev',
      build: 'vite build',
    },
  },
  permissions: [],
  outdir: 'dist',
});
