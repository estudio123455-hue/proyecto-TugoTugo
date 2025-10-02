import { io, Socket } from 'socket.io-client'

class WebSocketManager {
  private socket: Socket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000

  connect() {
    if (this.socket?.connected) return

    this.socket = io(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001', {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true,
    })

    this.socket.on('connect', () => {
      console.log('🔌 WebSocket connected')
      this.reconnectAttempts = 0
    })

    this.socket.on('disconnect', () => {
      console.log('🔌 WebSocket disconnected')
    })

    this.socket.on('connect_error', () => {
      console.error('🔌 WebSocket connection error')
      this.handleReconnect()
    })

    this.socket.on('reconnect', () => {
      console.log('🔌 WebSocket reconnected')
    })
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)
      
      setTimeout(() => {
        console.log(`🔌 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
        this.connect()
      }, delay)
    }
  }

  subscribe(event: string, callback: (_data: any) => void) {
    if (this.socket) {
      this.socket.on(event, callback)
    }
  }

  unsubscribe(event: string, callback?: (_data: any) => void) {
    if (this.socket) {
      this.socket.off(event, callback)
    }
  }

  emit(event: string, data: any) {
    if (this.socket?.connected) {
      this.socket.emit(event, data)
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false
  }
}

export const wsManager = new WebSocketManager()

// Hook para usar WebSocket en componentes
export const useWebSocket = () => {
  return {
    connect: () => wsManager.connect(),
    disconnect: () => wsManager.disconnect(),
    subscribe: wsManager.subscribe.bind(wsManager),
    unsubscribe: wsManager.unsubscribe.bind(wsManager),
    emit: wsManager.emit.bind(wsManager),
    isConnected: wsManager.isConnected.bind(wsManager),
  }
}
