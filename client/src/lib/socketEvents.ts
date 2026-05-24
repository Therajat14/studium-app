// Mirror of server/src/lib/socket/socket.events.ts — keep in sync.
// Only the names the client actually uses are listed here.

export const SocketEvent = {
  NOTIFICATION_NEW:    'notification:new',
  NOTIFICATION_COUNT:  'notification:count',
  FEED_NEW_POST:       'feed:new_post',
  POST_NEW_COMMENT:    'post:new_comment',
  POST_REACTION_UPDATE:'post:reaction_update',
  PRESENCE_ONLINE:     'presence:online',
  PRESENCE_OFFLINE:    'presence:offline',
  TYPING_START:        'typing:start',
  TYPING_STOP:         'typing:stop',
  ROOM_JOIN_POST:      'room:join_post',
  ROOM_LEAVE_POST:     'room:leave_post',

  // Chat
  CHAT_MESSAGE_NEW:        'chat:message_new',
  CHAT_MESSAGE_DELETED:    'chat:message_deleted',
  CHAT_READ_RECEIPT:       'chat:read_receipt',
  CHAT_TYPING_START:       'chat:typing_start',
  CHAT_TYPING_STOP:        'chat:typing_stop',
  ROOM_JOIN_CONVERSATION:  'room:join_conversation',
  ROOM_LEAVE_CONVERSATION: 'room:leave_conversation',
} as const
