# Connect Four Online (커넥트 포 온라인)

2명의 플레이어가 실시간으로 함께 플레이할 수 있는 온라인 Connect Four (사목 게임) 게임입니다.

## 기능

- ✅ 7x6 게임 보드
- ✅ 실시간 멀티플레이어 (Socket.io)
- ✅ 방 생성 및 입장 시스템
- ✅ 닉네임 변경 가능
- ✅ 4개 연결 시 승리 체크
- ✅ 돌 떨어뜨리기 애니메이션
- ✅ 턴 기반 게임 플레이
- ✅ 게임 종료 후 재시작 기능
- ✅ DB 불필요 (메모리 기반)

## 기술 스택

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Node.js, Socket.io
- **배포**: Vercel (예정)

## 설치 및 실행

### 1. 패키지 설치

```bash
npm install
```

### 2. 개발 서버 실행

```bash
npm run dev
```

서버가 http://localhost:3000 에서 실행됩니다.

### 3. 게임 플레이

1. 브라우저에서 http://localhost:3000 접속
2. "새 게임 만들기" 버튼 클릭하여 방 생성
3. 생성된 방 ID를 친구에게 공유
4. 친구가 방 ID를 입력하여 입장
5. 게임 시작!

## 게임 규칙

- 두 플레이어가 번갈아가며 돌을 떨어뜨립니다
- 가로, 세로, 대각선으로 4개를 먼저 연결하면 승리
- 보드가 가득 차면 무승부

## 프로젝트 구조

```
c_omok/
├── app/
│   ├── layout.tsx        # 레이아웃
│   ├── page.tsx          # 메인 게임 페이지
│   └── globals.css       # 글로벌 스타일
├── components/
│   └── GameBoard.tsx     # 게임 보드 컴포넌트
├── lib/
│   ├── socket.ts         # Socket.io 클라이언트
│   └── types.ts          # TypeScript 타입 정의
├── server.js             # Socket.io 서버
├── package.json
└── tsconfig.json
```

## Vercel 배포

추후 Vercel에 배포 예정입니다.

## 라이선스

MIT
