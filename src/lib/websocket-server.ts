// Server-side WebSocket event emitter
// This is a simple wrapper to emit events (client-side simulation for now)

export function emitWebSocketEvent(event: string, data: any) {
  // In a real implementation, this would emit to a WebSocket server
  // For now, we'll use a simple broadcast mechanism
  if (typeof window !== 'undefined') {
    // Client-side: dispatch custom event
    window.dispatchEvent(new CustomEvent(`ws:${event}`, { detail: data }))
  }
}

export const WS_EVENTS = {
  USER_CREATED: 'user:created',
  USER_DELETED: 'user:deleted',
  ESTABLISHMENT_CREATED: 'establishment:created',
  ESTABLISHMENT_DELETED: 'establishment:deleted',
  POST_CREATED: 'post:created',
  POST_DELETED: 'post:deleted',
}
