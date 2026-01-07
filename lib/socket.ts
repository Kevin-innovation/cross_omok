import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const initSocket = (): Socket => {
  if (!socket) {
    // 프로덕션 환경에서는 현재 호스트 사용, 개발 환경에서는 localhost:4077 사용
    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL ||
      (typeof window !== 'undefined' && window.location.origin) ||
      'http://localhost:4077';

    socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      path: '/socket.io',
    });
  }
  return socket;
};

export const getSocket = (): Socket | null => {
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
