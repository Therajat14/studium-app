// Centralised event name registry + payload shapes.
// Import these constants in both the server (gateway/handlers) and the client
// so event names are never magic strings.

// ─── Event name constants ──────────────────────────────────────────────────

export const SocketEvent = {
  // Server → Client: notifications
  NOTIFICATION_NEW:   'notification:new',
  NOTIFICATION_COUNT: 'notification:count',

  // Server → Client: feed
  FEED_NEW_POST: 'feed:new_post',

  // Server → Client: post room
  POST_NEW_COMMENT:    'post:new_comment',
  POST_REACTION_UPDATE: 'post:reaction_update',

  // Server → Client: presence
  PRESENCE_ONLINE:  'presence:online',
  PRESENCE_OFFLINE: 'presence:offline',

  // Bidirectional: typing (ephemeral, never persisted)
  TYPING_START: 'typing:start',
  TYPING_STOP:  'typing:stop',

  // Client → Server: room management
  ROOM_JOIN_POST:  'room:join_post',
  ROOM_LEAVE_POST: 'room:leave_post',
} as const

export type SocketEventName = (typeof SocketEvent)[keyof typeof SocketEvent]

// ─── Payload types ─────────────────────────────────────────────────────────
// Kept minimal — only fields the client actually needs to update its cache.

export interface NotificationPayload {
  id:          string
  type:        string
  entityId:    string
  entityType:  string
  readAt:      Date | null
  createdAt:   Date
  actor: {
    id:       string
    name:     string
    avatarUrl: string | null
  }
}

export interface FeedNewPostPayload {
  post: {
    id:        string
    title:     string | null
    content:   string
    type:      string
    createdAt: Date
    author: {
      id:       string
      name:     string
      avatarUrl: string | null
      role:     string
      college:  string | null
    }
    tags:   Array<{ tag: { id: string; name: string; slug: string } }>
    _count: { reactions: number; comments: number }
  }
}

export interface PostNewCommentPayload {
  postId: string
  comment: {
    id:        string
    content:   string
    parentId:  string | null
    createdAt: Date
    author: {
      id:       string
      name:     string
      avatarUrl: string | null
      role:     string
    }
    _count: { reactions: number; replies: number }
  }
}

export interface PostReactionUpdatePayload {
  postId: string
  counts: Record<string, number>
}

export interface PresencePayload    { userId: string }
export interface TypingPayload      { postId: string; userId: string }
export interface NotificationCountPayload { unread: number }
