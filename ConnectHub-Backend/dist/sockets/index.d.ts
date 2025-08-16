import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
export declare const initializeSocket: (server: HTTPServer) => SocketIOServer;
