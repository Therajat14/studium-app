// In-memory presence store: userId → Set<socketId>.
// One user may have multiple open tabs / devices — the user is "online"
// as long as at least one socket is connected.
//
// Redis migration path: replace this Map with Redis HSET/HDEL/HLEN commands
// using the same function signatures. No other file needs to change.

const store = new Map<string, Set<string>>()

/** Record a new socket connection. Returns true if this brings the user online. */
export const addConnection = (userId: string, socketId: string): boolean => {
  const wasOffline = !isOnline(userId)
  const sockets = store.get(userId) ?? new Set<string>()
  sockets.add(socketId)
  store.set(userId, sockets)
  return wasOffline
}

/** Remove a socket connection. Returns true if the user just went offline. */
export const removeConnection = (userId: string, socketId: string): boolean => {
  const sockets = store.get(userId)
  if (!sockets) return false
  sockets.delete(socketId)
  if (sockets.size === 0) {
    store.delete(userId)
    return true
  }
  return false
}

export const isOnline = (userId: string): boolean =>
  (store.get(userId)?.size ?? 0) > 0

/** Returns online status for a batch of user IDs — O(n) on the request size. */
export const batchIsOnline = (userIds: string[]): Record<string, boolean> => {
  const result: Record<string, boolean> = {}
  for (const id of userIds) result[id] = isOnline(id)
  return result
}

export const getOnlineUserIds = (): string[] => [...store.keys()]

export const getOnlineCount = (): number => store.size
