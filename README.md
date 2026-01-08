# Connect Four Online (커넥트 포 온라인)

2명의 플레이어가 실시간으로 함께 플레이할 수 있는 온라인 Connect Four (사목 게임) 게임입니다.

🎮 **[지금 플레이하기](https://crossomok-production.up.railway.app/)**

## 주요 기능

### 기본 게임 기능
- ✅ **7x6 게임 보드**: 클래식 Connect Four 크기
- ✅ **실시간 멀티플레이어**: Socket.io를 활용한 실시간 대전
- ✅ **방 생성 및 입장**: 고유한 방 ID로 친구 초대
- ✅ **게스트 로그인**: 별도 회원가입 없이 닉네임만으로 플레이
- ✅ **닉네임 변경**: 언제든지 닉네임 수정 가능
- ✅ **4개 연결 승리**: 가로/세로/대각선 4개 연결 시 승리
- ✅ **중력 시스템**: 돌이 자연스럽게 아래로 떨어짐
- ✅ **게임 재시작**: 같은 방에서 바로 재시작 가능

### 고급 기능
- 🎯 **선공 결정 룰렛**: 게임 시작 시 랜덤하게 선공 결정 (3초 애니메이션)
- ⏱️ **턴 타이머**: 10초/20초/30초 중 선택 가능한 턴 제한 시간
  - 시간 초과 시 자동 패배
  - 실시간 카운트다운 표시
- 📋 **방 목록**: 현재 생성된 모든 방 확인 및 원클릭 입장
  - 실시간 방 정보 업데이트
  - 방장 닉네임, 인원 수, 턴 제한 시간 표시
  - 대기 중인 방만 입장 가능

### UI/UX
- ✨ **향상된 클릭 가이드**: 명확한 호버 효과와 화살표 표시
- 🎨 **애니메이션**: 부드러운 돌 떨어짐 효과
- 📱 **반응형 디자인**: 다양한 화면 크기 지원
- ⚡ **실시간 상태 표시**: 연결 상태, 턴 표시, 타이머

## 기술 스택

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Node.js, Socket.io (Custom Server)
- **배포**: Railway (WebSocket 지원)
- **저장소**: 메모리 기반 (DB 불필요)

## 설치 및 실행

### 1. 패키지 설치

```bash
npm install
```

### 2. 개발 서버 실행

```bash
npm run dev
```

개발 서버가 http://localhost:4077 에서 실행됩니다.

### 3. 프로덕션 서버

게임을 바로 플레이하려면 https://crossomok-production.up.railway.app/ 에 접속하세요.

### 4. 게임 플레이

#### 방법 1: 새 게임 만들기
1. 브라우저에서 https://crossomok-production.up.railway.app/ 접속
2. 닉네임 입력
3. "새 게임 만들기" 버튼 클릭
4. 턴 제한 시간 선택 (10초/20초/30초)
5. 생성된 방 ID를 친구에게 공유
6. 친구가 입장하면 자동으로 선공 결정 룰렛 시작
7. 게임 시작!

#### 방법 2: 방 목록에서 입장
1. "방 목록 보기" 버튼 클릭
2. 원하는 방 선택하여 입장
3. 자동으로 선공 결정 룰렛 시작
4. 게임 시작!

#### 방법 3: 방 ID로 직접 입장
1. 친구로부터 받은 방 ID 입력
2. "게임 참가" 버튼 클릭
3. 자동으로 선공 결정 룰렛 시작
4. 게임 시작!

## 게임 규칙

- 두 플레이어가 번갈아가며 열(column)을 선택하여 돌을 떨어뜨립니다
- 돌은 중력에 따라 가장 아래 빈 칸으로 떨어집니다
- 가로, 세로, 대각선으로 **4개를 먼저 연결**하면 승리
- 제한 시간 내에 수를 두지 않으면 **자동 패배**
- 보드가 가득 차면 무승부
- 게임 종료 후 같은 방에서 재시작 가능 (선공 다시 결정)

## 프로젝트 구조

```
c_omok/
├── app/
│   ├── layout.tsx          # 레이아웃
│   ├── page.tsx            # 메인 게임 페이지 (모든 게임 로직)
│   └── globals.css         # 글로벌 스타일
├── components/
│   ├── GameBoard.tsx       # 게임 보드 컴포넌트
│   └── SpinWheel.tsx       # 선공 결정 룰렛 컴포넌트
├── lib/
│   ├── socket.ts           # Socket.io 클라이언트 (재연결 로직 포함)
│   └── types.ts            # TypeScript 타입 정의
├── server.js               # Socket.io 서버 (게임 로직, 타이머 관리)
├── package.json
└── tsconfig.json
```

## Railway 배포

이 프로젝트는 Socket.io의 지속적인 WebSocket 연결을 위해 Railway에 배포됩니다.

### 배포 설정
- **Port**: 환경변수 `PORT` 사용 (Railway 자동 할당)
- **Start 명령어**: `node server.js`
- **Health Check**: `/health` 엔드포인트

### 환경변수
```
NEXT_PUBLIC_SOCKET_URL=https://crossomok-production.up.railway.app
```

## Socket.io 이벤트

### 클라이언트 → 서버
- `createRoom`: 새 방 생성
- `joinRoom`: 방 입장
- `makeMove`: 수 두기
- `restartGame`: 게임 재시작
- `getRoomList`: 방 목록 요청

### 서버 → 클라이언트
- `roomCreated`: 방 생성 완료
- `gameState`: 게임 상태 업데이트
- `moveMade`: 수 두기 완료
- `gameOver`: 게임 종료
- `wheelSpinning`: 룰렛 시작
- `spinComplete`: 룰렛 완료
- `timeUpdate`: 타이머 업데이트
- `timeOver`: 시간 초과
- `roomListUpdated`: 방 목록 업데이트
- `error`: 에러 메시지

## 에러 핸들링

- Socket.io 재연결 로직 (최대 5회 시도)
- 중복 클릭 방지
- 입력 검증 (서버 사이드)
- 자동 에러 메시지 제거 (3초)
- 연결 상태 표시

## 라이선스

MIT

## 개발자

Created with Next.js, Socket.io, and TypeScript
