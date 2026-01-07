# 배포 가이드

이 프로젝트는 Socket.io를 사용하는 실시간 멀티플레이어 게임입니다. Vercel은 Serverless 환경이므로 Socket.io custom server를 직접 실행할 수 없습니다.

## 배포 옵션

### 옵션 1: Railway (추천)

Railway는 Node.js 서버를 쉽게 배포할 수 있는 플랫폼입니다.

1. [Railway](https://railway.app/)에 가입
2. GitHub 저장소 연결
3. 자동으로 배포됨
4. 환경 변수 설정 불필요 (자동으로 포트 할당)

```bash
# Railway CLI 설치
npm i -g @railway/cli

# 로그인
railway login

# 배포
railway up
```

### 옵션 2: Render

[Render](https://render.com/)도 무료로 Node.js 서버를 배포할 수 있습니다.

1. Render에 가입
2. New > Web Service 선택
3. GitHub 저장소 연결
4. Build Command: `npm install`
5. Start Command: `npm start`
6. 배포 완료

### 옵션 3: Vercel + 별도 Socket.io 서버

프론트엔드는 Vercel에, Socket.io 서버는 Railway/Render에 배포하는 방법:

1. **Socket.io 서버만 별도 배포** (Railway 또는 Render)
   - server.js만 별도 프로젝트로 분리
   - Railway/Render에 배포

2. **프론트엔드 Vercel 배포**
   ```bash
   vercel --prod
   ```

3. **환경 변수 설정**
   - Vercel 프로젝트 설정에서 환경 변수 추가:
   - `NEXT_PUBLIC_SOCKET_URL`: Socket.io 서버 URL (예: https://your-app.railway.app)

### 옵션 4: 단일 VPS (Heroku, DigitalOcean 등)

전통적인 VPS에 배포:

```bash
# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start
```

## 추천 배포 방법

가장 간단한 방법은 **Railway**를 사용하는 것입니다:

1. GitHub에 코드 푸시
2. Railway에서 저장소 연결
3. 자동 배포 완료

Railway는 자동으로 Node.js 프로젝트를 감지하고, `npm install` 및 `npm start`를 실행합니다.

## 로컬 테스트

```bash
# 개발 모드
npm run dev

# 프로덕션 빌드 및 실행
npm run build
npm start
```

## 환경 변수

배포 시 필요한 환경 변수:

- `NODE_ENV`: production (자동 설정되는 경우가 많음)
- `PORT`: 서버 포트 (Railway/Render는 자동 할당)
- `NEXT_PUBLIC_SOCKET_URL`: Socket.io 서버 URL (프론트엔드용)

## 문제 해결

### Socket.io 연결 실패

1. CORS 설정 확인 (server.js:164)
2. 환경 변수 `NEXT_PUBLIC_SOCKET_URL` 확인
3. 방화벽 설정 확인

### Vercel 배포 시 에러

Vercel은 Serverless 환경이므로 Socket.io custom server를 실행할 수 없습니다. 위의 "옵션 3"을 참고하세요.
