// WebSocket disabled to prevent connection errors in development
class WebSocketManager {
  connect() {
    // Disabled to prevent console errors
    return
  }
  
  disconnect() {
    // Disabled
    return
  }
  
  emit(_event: string, _data: any) {
    // Disabled
    return
  }
  
  on(_event: string, _callback: any) {
    // Disabled
    return
  }
  
  subscribe(_event: string, _callback: any) {
    // Disabled
    return
  }
  
  unsubscribe(_event: string, _callback: any) {
    // Disabled
    return
  }
  
  isConnected(): boolean {
    return false
  }
}

export const wsManager = new WebSocketManager()

// Hook para usar WebSocket en componentes
export const useWebSocket = () => {
  return {
    connect: () => wsManager.connect(),
    disconnect: () => wsManager.disconnect(),
    emit: wsManager.emit.bind(wsManager),
    subscribe: wsManager.subscribe.bind(wsManager),
    unsubscribe: wsManager.unsubscribe.bind(wsManager),
    isConnected: wsManager.isConnected.bind(wsManager),
  }
}
