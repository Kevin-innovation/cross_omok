---
name: Connect Four Development Rules
description: Critical development principles and debugging guidelines for Connect Four BY KEVIN project
---

# Connect Four BY KEVIN - Development Rules

## 🚨 CRITICAL: UI 기능 작동 안 할 때 필수 체크리스트

**증상만 보고 CSS만 수정하지 말 것!** 반드시 이 순서로 확인:

### 1단계: 데이터 검증 (가장 중요)
```typescript
// 항상 console.log로 데이터 확인부터!
useEffect(() => {
  console.log('lastMove:', lastMove);
  console.log('gameState:', gameState);
}, [lastMove, gameState]);
```

- 데이터가 실제로 전달되는가?
- 데이터 구조가 예상과 일치하는가?
- undefined/null 값은 없는가?

### 2단계: 서버-클라이언트 데이터 일치 확인 ⚠️⚠️⚠️

**실제 발생한 버그 사례:**
- 서버: `this.lastMove = { row, column }`
- 클라이언트: `lastMove.col` 로 확인
- 결과: 조건문이 항상 false → UI가 절대 표시되지 않음

**체크포인트:**
- [ ] 서버가 보내는 프로퍼티 이름 확인
- [ ] 클라이언트가 읽는 프로퍼티 이름 확인
- [ ] TypeScript 타입 정의와 실제 코드 일치 확인
- [ ] server.js와 types.ts 동시에 확인

### 3단계: TypeScript 타입 검증
- 타입 정의만 수정하고 실제 구현은 그대로인가?
- 제거된 state/props를 다른 곳에서 여전히 사용하는가?

### 4단계: CSS/스타일 (마지막!)
- 데이터 확인 완료 + 조건문 true 확인 후에만 CSS 수정
- 같은 CSS 방법으로 2-3번 실패하면 → 완전히 다른 접근법 사용
- 예: `ring` → `border` → 별도 오버레이 레이어

---

## ❌ 절대 하지 말 것

1. **증상만 보고 CSS만 계속 수정**
   - 10번 넘게 같은 요청 받은 이유: 데이터 확인 안 함

2. **같은 방법 반복**
   - 같은 방법으로 3번 실패했다면 근본 원인이 다른 곳에 있음

3. **데이터 확인 없이 UI 수정**
   - 보이지 않는 이유는 99% 데이터 문제

---

## ✅ 반드시 해야 할 것

### 1. 서버-클라이언트 데이터 일관성 유지

**좋은 예:**
```javascript
// server.js
this.lastMove = { row, col: column };

// types.ts
interface Position {
  row: number;
  col: number;
}

// GameBoard.tsx
const isLastMove = (row: number, col: number): boolean => {
  return lastMove.row === row && lastMove.col === col;
};
```

**나쁜 예:**
```javascript
// server.js
this.lastMove = { row, column };  // ❌ column

// GameBoard.tsx
lastMove.col  // ❌ col - 불일치!
```

### 2. State 초기화 완전성 확인

재대결/방 나가기 시 모든 관련 state 초기화:
```typescript
const leaveRoom = () => {
  setRoomId('');
  setGameState(null);
  setError('');
  setIsSpinning(false);      // ✅ 추가
  setFirstPlayer(undefined);  // ✅ 추가
  setIsMoving(false);        // ✅ 추가
};
```

### 3. State 누적 처리

돌림판처럼 반복되는 애니메이션은 누적 방식:
```typescript
// ❌ 나쁜 예 - 같은 값이면 작동 안 함
setRotation(360 * 5 + offset);

// ✅ 좋은 예 - 항상 새로운 회전 추가
setRotation(prev => prev + 360 * 5 + offset);
```

---

## 🔧 프로젝트별 핵심 규칙

### Socket.io 이벤트 처리
- 서버 이벤트와 클라이언트 리스너 동기화
- 이벤트 이름 오타 주의
- cleanup에서 모든 리스너 제거

### Position/좌표 관련
- 항상 `{ row, col }` 형식 사용
- `column` vs `col` 혼동 주의
- types.ts에 명확히 정의

### 게임 상태 관리
- 서버가 단일 진실의 원천
- 클라이언트는 서버 상태를 반영만
- 낙관적 업데이트 사용 시 롤백 처리

---

## 🛠️ 디버깅 작업 흐름

```
UI 문제 발생
    ↓
1. console.log로 데이터 확인
    ↓
2. 서버-클라이언트 프로퍼티 이름 일치 확인
    ↓
3. TypeScript 타입 vs 실제 코드 확인
    ↓
4. 조건문 로직 확인
    ↓
5. (마지막) CSS/스타일 확인
```

**2-3번 시도 후 해결 안 되면:**
- 위 단계를 다시 처음부터
- 완전히 다른 접근 방법 고려
- 근본 원인에 집중

---

## 📝 커밋 전 체크리스트

- [ ] TypeScript 빌드 에러 없음: `npm run build`
- [ ] 서버-클라이언트 프로퍼티 이름 일치
- [ ] State 초기화 완전성 확인
- [ ] console.log 디버그 코드 제거/주석 처리
- [ ] 관련된 모든 파일 수정 완료

---

## 🎯 프로젝트 특이사항

### 마지막 착수 표시
- 별도 오버레이 레이어 사용
- `absolute` + `inset-0` + `border-cyan-400` + `animate-pulse`
- 돌 자체가 아닌 셀 전체에 적용

### 돌림판 애니메이션
- rotation state는 누적 방식
- `prev => prev + additionalRotation`

### 게임 상태 동기화
- `gameState` 업데이트 시 `remainingTime`, `selectedTurnTime`도 동기화
- 방 나가기/재대결 시 모든 관련 state 초기화

---

## 💡 개발 철학

1. **데이터 우선**: UI는 데이터의 시각적 표현일 뿐
2. **일관성**: 서버-클라이언트 간 명명 규칙 통일
3. **완전성**: State 초기화는 반쪽 처리하지 말 것
4. **단순성**: 복잡한 해결책보다 근본 원인 해결

---

**마지막 업데이트**: 2026-01-10
**버전**: VER 2.0.1
