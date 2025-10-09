import React, { useState } from 'react';
import { 
  Search, 
  MoreVertical, 
  Send, 
  Smile,
  Paperclip,
  Phone,
  Video,
  Plus,
  Users,
  Hash
} from 'lucide-react';

interface MessagesProps {
  currentUser: any;
}

const mockChats = [
  {
    id: 1,
    name: 'Data Structures Study Group',
    type: 'group',
    members: 12,
    lastMessage: 'Alex: Meeting at 6 PM in Library Room 204',
    timestamp: '2 min ago',
    avatar: 'https://images.pexels.com/photos/3184317/pexels-photo-3184317.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    unread: 3,
    online: true,
    description: 'Preparing for midterm exam'
  },
  {
    id: 2,
    name: 'Emma Thompson',
    type: 'direct',
    lastMessage: 'Thanks for sharing your notes!',
    timestamp: '1 hour ago',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    unread: 0,
    online: true,
    description: null
  },
  {
    id: 3,
    name: 'Mike Rodriguez',
    type: 'direct',
    lastMessage: 'See you at the library!',
    timestamp: '3 hours ago',
    avatar: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    unread: 0,
    online: false,
    description: null
  },
  {
    id: 4,
    name: 'Database Project Team',
    type: 'group',
    members: 4,
    lastMessage: 'Alex: I\'ve updated the ER diagram',
    timestamp: '1 day ago',
    avatar: 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    unread: 1,
    online: false,
    description: 'Working on final project'
  }
];

const mockMessages = [
  {
    id: 1,
    sender: 'Emma Thompson',
    content: 'Hey! Did you understand the graph traversal part from today\'s lecture?',
    timestamp: '2:30 PM',
    isOwn: false,
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
  },
  {
    id: 2,
    sender: 'You',
    content: 'Yeah, mostly! The DFS and BFS algorithms are pretty straightforward once you get the recursive thinking down.',
    timestamp: '2:32 PM',
    isOwn: true,
    avatar: ''
  },
  {
    id: 3,
    sender: 'Emma Thompson',
    content: 'That makes sense. Could you share your notes on the time complexity analysis? I\'m struggling with that part.',
    timestamp: '2:35 PM',
    isOwn: false,
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
  },
  {
    id: 4,
    sender: 'You',
    content: 'Of course! I\'ll send them over. The key is remembering that DFS is O(V+E) where V is vertices and E is edges.',
    timestamp: '2:36 PM',
    isOwn: true,
    avatar: ''
  },
  {
    id: 5,
    sender: 'Emma Thompson',
    content: 'Thanks for sharing your notes!',
    timestamp: '2:45 PM',
    isOwn: false,
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
  }
];

export const Messages: React.FC<MessagesProps> = ({ currentUser }) => {
  const [selectedChat, setSelectedChat] = useState(mockChats[1]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    // In a real app, this would send the message to the backend
    console.log('Sending message:', newMessage);
    setNewMessage('');
  };

  const filteredChats = mockChats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-full flex-col lg:flex-row">
      {/* Chat List */}
      <div className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col transition-colors duration-200 h-1/3 lg:h-full">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-white">Messages</h2>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
              <Plus className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {filteredChats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => setSelectedChat(chat)}
              className={`p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                selectedChat.id === chat.id ? 'bg-primary-50 dark:bg-primary-900/20 border-l-4 border-l-primary-600' : ''
              }`}
            >
              <div className="flex items-start space-x-2 lg:space-x-3">
                <div className="relative">
                  <img
                    src={chat.avatar}
                    alt={chat.name}
                    className="w-10 h-10 lg:w-12 lg:h-12 rounded-full object-cover"
                  />
                  {chat.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm lg:text-base font-semibold text-gray-900 dark:text-white truncate">
                      {chat.name}
                    </h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400 hidden lg:inline">{chat.timestamp}</span>
                  </div>
                  <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-300 truncate mt-1">
                    {chat.lastMessage}
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center space-x-2">
                      {chat.type === 'group' && (
                        <div className="flex items-center">
                          <Users className="h-3 w-3 text-gray-400 mr-1" />
                          <span className="text-xs text-gray-500 dark:text-gray-400">{chat.members}</span>
                        </div>
                      )}
                      {chat.description && (
                        <span className="text-xs text-gray-400 dark:text-gray-500">• {chat.description}</span>
                      )}
                    </div>
                    {chat.unread > 0 && (
                      <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-primary-600 rounded-full">
                        {chat.unread}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col h-2/3 lg:h-full">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-colors duration-200">
              <div className="flex items-center justify-between space-x-2">
                <div className="flex items-center space-x-2 lg:space-x-3 flex-1 min-w-0">
                  <div className="relative">
                    <img
                      src={selectedChat.avatar}
                      alt={selectedChat.name}
                      className="w-8 h-8 lg:w-10 lg:h-10 rounded-full object-cover"
                    />
                    {selectedChat.online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm lg:text-lg font-semibold text-gray-900 dark:text-white truncate">{selectedChat.name}</h3>
                    <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400 truncate">
                      {selectedChat.type === 'group' ? (
                        <div className="flex items-center space-x-1 lg:space-x-2">
                          <span>{selectedChat.members} members</span>
                          {selectedChat.description && (
                            <>
                              <span className="hidden lg:inline">•</span>
                              <span>{selectedChat.description}</span>
                            </>
                          )}
                        </div>
                      ) : (
                        selectedChat.online ? 'Online' : 'Last seen 1 hour ago'
                      )
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-1 lg:space-x-2">
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                    <Phone className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                    <Video className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                    <MoreVertical className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-2 lg:p-4 space-y-2 lg:space-y-4 bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
              {mockMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${message.isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    {!message.isOwn && (
                      <img
                        src={message.avatar}
                        alt={message.sender}
                        className="w-6 h-6 lg:w-8 lg:h-8 rounded-full object-cover"
                      />
                    )}
                    <div
                      className={`px-3 lg:px-4 py-2 rounded-2xl ${
                        message.isOwn
                          ? 'bg-primary-600 text-white rounded-br-md'
                          : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-md border border-gray-200 dark:border-gray-600'
                      }`}
                    >
                      <p className="text-xs lg:text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${message.isOwn ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>
                        {message.timestamp}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-colors duration-200">
              <form onSubmit={handleSendMessage} className="flex items-end space-x-2">
                <div className="flex-1 relative">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="w-full px-3 lg:px-4 py-2 lg:py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none transition-colors duration-200 text-sm lg:text-base"
                    rows={1}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                  />
                  <div className="absolute right-2 bottom-2 flex items-center space-x-1">
                    <button type="button" className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors">
                      <Paperclip className="h-3 w-3 lg:h-4 lg:w-4 text-gray-500 dark:text-gray-400" />
                    </button>
                    <button type="button" className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors">
                      <Smile className="h-3 w-3 lg:h-4 lg:w-4 text-gray-500 dark:text-gray-400" />
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="p-2 lg:p-3 bg-primary-600 text-white rounded-full hover:bg-primary-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  <Send className="h-4 w-4 lg:h-5 lg:w-5" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-8 w-8 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Select a conversation</h3>
              <p className="text-gray-500 dark:text-gray-400">Choose a conversation from the sidebar to start messaging.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};