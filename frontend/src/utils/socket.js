import { io } from 'socket.io-client';
import { SOCKET_URL } from './config';

let socket;

const noopSocket = {
  on: () => noopSocket,
  off: () => noopSocket,
  emit: () => noopSocket,
  disconnect: () => {}
};

export const initSocket = () => {
  if (!SOCKET_URL) {
    return noopSocket;
  }

  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling']
    });
  }
  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
