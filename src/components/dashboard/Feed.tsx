import React, { useState } from 'react';
import {
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Plus,
  TrendingUp,
  TrendingDown,
  Bookmark,
  Flag,
  User,
  Calendar,
  Tag,
  Image,
  FileText,
  BarChart3,
  Award,
  Users,
} from 'lucide-react';

interface FeedProps {
  currentUser: any;
}

const mockPosts = [
  {
    id: 1,
    author: {
      name: 'Sarah Chen',
      avatar:
        'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      year: '3rd Year',
      branch: 'Computer Science',
      karma: 2450,
      badges: ['Top Contributor'],
    },
    timestamp: '2 hours ago',
    content:
      'Just finished my Machine Learning project on sentiment analysis! The model achieved 94% accuracy on the test dataset. Happy to share my code and approach with anyone interested. #MachineLearning #NLP #ProjectShare',
    type: 'text',
    tags: ['MachineLearning', 'NLP', 'ProjectShare'],
    upvotes: 45,
    downvotes: 2,
    comments: 12,
    shares: 8,
    userVote: null,
    isBookmarked: false,
    attachments: [],
  },
  {
    id: 2,
    author: {
      name: 'Mike Rodriguez',
      avatar:
        'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      year: '4th Year',
      branch: 'Computer Science',
      karma: 1800,
      badges: ['Code Warrior'],
    },
    timestamp: '4 hours ago',
    content:
      'Data Structures exam tomorrow! Created a comprehensive cheat sheet covering all major algorithms and their time complexities. Sharing it with everyone - good luck! 📚',
    type: 'text_with_attachment',
    tags: ['DataStructures', 'ExamPrep', 'StudyMaterial'],
    upvotes: 78,
    downvotes: 1,
    comments: 23,
    shares: 34,
    userVote: 'upvote',
    isBookmarked: true,
    attachments: [
      {
        type: 'pdf',
        name: 'DS_Algorithms_CheatSheet.pdf',
        size: '2.3 MB',
      },
    ],
  },
  {
    id: 3,
    author: {
      name: 'Emma Thompson',
      avatar:
        'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      year: '2nd Year',
      branch: 'Computer Science',
      karma: 950,
      badges: ['Rising Star'],
    },
    timestamp: '6 hours ago',
    content:
      "Quick poll: What's your preferred programming language for competitive programming?",
    type: 'poll',
    tags: ['CompetitiveProgramming', 'Poll'],
    upvotes: 32,
    downvotes: 0,
    comments: 18,
    shares: 5,
    userVote: null,
    isBookmarked: false,
    poll: {
      question:
        "What's your preferred programming language for competitive programming?",
      options: [
        { text: 'C++', votes: 45, percentage: 60 },
        { text: 'Python', votes: 18, percentage: 24 },
        { text: 'Java', votes: 12, percentage: 16 },
      ],
      totalVotes: 75,
      userVoted: false,
    },
  },
  {
    id: 4,
    author: {
      name: 'Alex Kumar',
      avatar:
        'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      year: '3rd Year',
      branch: 'Computer Science',
      karma: 1650,
      badges: ['Algorithm Master'],
    },
    timestamp: '8 hours ago',
    content:
      'Hackathon team formation! Looking for 2 more members for the upcoming TechFest hackathon. We need someone with frontend skills (React/Vue) and a designer. Our idea is around sustainable tech solutions. DM if interested! 🚀',
    type: 'text',
    tags: ['Hackathon', 'TeamFormation', 'React', 'Design'],
    upvotes: 28,
    downvotes: 0,
    comments: 15,
    shares: 12,
    userVote: null,
    isBookmarked: false,
    attachments: [],
  },
];

const mockComments = [
  {
    id: 1,
    postId: 1,
    author: {
      name: 'Lisa Wang',
      avatar:
        'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      year: '2nd Year',
    },
    content:
      "This is amazing! Could you share the dataset you used? I'm working on a similar project.",
    timestamp: '1 hour ago',
    upvotes: 8,
    userVote: null,
  },
  {
    id: 2,
    postId: 1,
    author: {
      name: 'John Smith',
      avatar:
        'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      year: '4th Year',
    },
    content:
      'Great work! What preprocessing techniques did you use for the text data?',
    timestamp: '45 minutes ago',
    upvotes: 5,
    userVote: 'upvote',
  },
];

export const Feed: React.FC<FeedProps> = ({ currentUser }) => {
  const [posts, setPosts] = useState(mockPosts);
  const [showComments, setShowComments] = useState<number | null>(null);
  const [comments, setComments] = useState(mockComments);
  const [newComment, setNewComment] = useState('');
  const [newPost, setNewPost] = useState('');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [postType, setPostType] = useState<'text' | 'poll' | 'image'>('text');

  const handleVote = (postId: number, voteType: 'upvote' | 'downvote') => {
    setPosts(
      posts.map((post) => {
        if (post.id === postId) {
          let newUpvotes = post.upvotes;
          let newDownvotes = post.downvotes;
          let newUserVote = voteType;

          if (post.userVote === voteType) {
            // Remove vote
            if (voteType === 'upvote') newUpvotes--;
            else newDownvotes--;
            newUserVote = null;
          } else if (post.userVote) {
            // Change vote
            if (post.userVote === 'upvote') newUpvotes--;
            else newDownvotes--;
            if (voteType === 'upvote') newUpvotes++;
            else newDownvotes++;
          } else {
            // Add new vote
            if (voteType === 'upvote') newUpvotes++;
            else newDownvotes++;
          }

          return {
            ...post,
            upvotes: newUpvotes,
            downvotes: newDownvotes,
            userVote: newUserVote,
          };
        }
        return post;
      })
    );
  };

  const handleBookmark = (postId: number) => {
    setPosts(
      posts.map((post) =>
        post.id === postId
          ? { ...post, isBookmarked: !post.isBookmarked }
          : post
      )
    );
  };

  const handleCommentSubmit = (postId: number) => {
    if (!newComment.trim()) return;

    const comment = {
      id: comments.length + 1,
      postId,
      author: {
        name: currentUser.name,
        avatar: currentUser.avatar,
        year: `${currentUser.year} Year`,
      },
      content: newComment,
      timestamp: 'Just now',
      upvotes: 0,
      userVote: null,
    };

    setComments([...comments, comment]);
    setPosts(
      posts.map((post) =>
        post.id === postId ? { ...post, comments: post.comments + 1 } : post
      )
    );
    setNewComment('');
  };

  const handleCreatePost = () => {
    if (!newPost.trim()) return;

    const post = {
      id: posts.length + 1,
      author: {
        name: currentUser.name,
        avatar: currentUser.avatar,
        year: `${currentUser.year}rd Year`,
        branch: currentUser.branch,
        karma: currentUser.karma,
        badges: currentUser.badges,
      },
      timestamp: 'Just now',
      content: newPost,
      type: postType,
      tags: [],
      upvotes: 0,
      downvotes: 0,
      comments: 0,
      shares: 0,
      userVote: null,
      isBookmarked: false,
      attachments: [],
    };

    setPosts([post, ...posts]);
    setNewPost('');
    setShowCreatePost(false);
  };

  const getVoteColor = (post: any, voteType: 'upvote' | 'downvote') => {
    if (post.userVote === voteType) {
      return voteType === 'upvote'
        ? 'text-green-600 dark:text-green-400'
        : 'text-red-600 dark:text-red-400';
    }
    return 'text-gray-500 dark:text-gray-400';
  };

  const renderPost = (post: any) => (
    <div
      key={post.id}
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 lg:p-6 hover:border-gray-300 dark:hover:border-gray-600 transition-colors duration-200"
    >
      {/* Post Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-2 lg:space-x-3 flex-1 min-w-0">
          <img
            src={post.author.avatar}
            alt={post.author.name}
            className="w-10 h-10 lg:w-12 lg:h-12 rounded-full object-cover flex-shrink-0"
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-2">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm lg:text-base truncate">
                {post.author.name}
              </h3>
              <div className="flex flex-wrap gap-1 mt-1 lg:mt-0">
                {post.author.badges.slice(0, 1).map((badge, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300"
                >
                  <Award className="h-3 w-3 mr-1" />
                  {badge}
                </span>
                ))}
              </div>
            </div>
            <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-2 text-xs lg:text-sm text-gray-600 dark:text-gray-400 mt-1">
              <span>
                {post.author.branch} • {post.author.year}
              </span>
              <span className="hidden lg:inline">•</span>
              <span>{post.timestamp}</span>
              <span className="hidden lg:inline">•</span>
              <div className="flex items-center mt-1 lg:mt-0">
                <TrendingUp className="h-3 w-3 mr-1" />
                <span>{post.author.karma} karma</span>
              </div>
            </div>
          </div>
        </div>
        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors flex-shrink-0">
          <MoreHorizontal className="h-5 w-5 text-gray-500 dark:text-gray-400" />
        </button>
      </div>

      {/* Post Content */}
      <div className="mb-4">
        <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
          {post.content}
        </p>

        {/* This is the line that was fixed */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {post.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                <Tag className="h-3 w-3 mr-1" />#{tag}
              </span>
            ))}
          </div>
        )}

        {/* Poll */}
        {post.type === 'poll' && post.poll && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">
              {post.poll.question}
            </h4>
            <div className="space-y-2">
              {post.poll.options.map((option, index) => (
                <div key={index} className="relative">
                  <button className="w-full text-left p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-blue-300 dark:hover:border-blue-600 transition-colors">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-800 dark:text-gray-200">
                        {option.text}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {option.percentage}%
                      </span>
                    </div>
                    <div className="mt-2 w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${option.percentage}%` }}
                      ></div>
                    </div>
                  </button>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
              {post.poll.totalVotes} votes
            </p>
          </div>
        )}

        {/* Attachments */}
        {post.attachments && post.attachments.length > 0 && (
          <div className="mt-4">
            {post.attachments.map((attachment, index) => (
              <div
                key={index}
                className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
              >
                <FileText className="h-8 w-8 text-red-500 mr-3" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {attachment.name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {attachment.size}
                  </p>
                </div>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Download
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Post Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center space-x-4 lg:space-x-6">
          <div className="flex items-center space-x-1">
            <button
              onClick={() => handleVote(post.id, 'upvote')}
              className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${getVoteColor(
                post,
                'upvote'
              )}`}
            >
              <TrendingUp className="h-5 w-5" />
            </button>
            <span className="text-xs lg:text-sm font-medium text-gray-700 dark:text-gray-300">
              {post.upvotes - post.downvotes}
            </span>
            <button
              onClick={() => handleVote(post.id, 'downvote')}
              className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${getVoteColor(
                post,
                'downvote'
              )}`}
            >
              <TrendingDown className="h-5 w-5" />
            </button>
          </div>

          <button
            onClick={() =>
              setShowComments(showComments === post.id ? null : post.id)
            }
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <MessageCircle className="h-5 w-5" />
            <span className="text-xs lg:text-sm">{post.comments}</span>
          </button>

          <button className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors">
            <Share2 className="h-5 w-5" />
            <span className="text-xs lg:text-sm hidden lg:inline">{post.shares}</span>
          </button>
        </div>

        <div className="flex items-center space-x-1 lg:space-x-2">
          <button
            onClick={() => handleBookmark(post.id)}
            className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
              post.isBookmarked
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            <Bookmark className="h-5 w-5" />
          </button>
          <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 dark:text-gray-400">
            <Flag className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Comments Section */}
      {showComments === post.id && (
        <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
          <div className="space-y-4">
            {comments
              .filter((comment) => comment.postId === post.id)
              .map((comment) => (
                <div key={comment.id} className="flex space-x-3">
                  <img
                    src={comment.author.avatar}
                    alt={comment.author.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-gray-900 dark:text-white text-sm">
                          {comment.author.name}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {comment.author.year}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          •
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {comment.timestamp}
                        </span>
                      </div>
                      <p className="text-gray-800 dark:text-gray-200 text-sm">
                        {comment.content}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4 mt-2">
                      <button className="flex items-center space-x-1 text-xs text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                        <TrendingUp className="h-3 w-3" />
                        <span>{comment.upvotes}</span>
                      </button>
                      <button className="text-xs text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                        Reply
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {/* Add Comment */}
          <div className="mt-4 flex space-x-3">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-8 h-8 rounded-full object-cover"
            />
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="w-full p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={2}
              />
              <div className="flex justify-end mt-2">
                <button
                  onClick={() => handleCommentSubmit(post.id)}
                  disabled={!newComment.trim()}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors text-sm"
                >
                  Comment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto p-4 lg:p-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 space-y-4 lg:space-y-0">
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
              Community Feed
            </h2>
            <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400">
              {currentUser.college} • {currentUser.branch}
            </p>
          </div>
          <button
            onClick={() => setShowCreatePost(true)}
            className="bg-blue-600 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center text-sm lg:text-base w-full lg:w-auto justify-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create Post
          </button>
        </div>

        {/* Create Post Modal */}
        {showCreatePost && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Create New Post
                </h3>

                <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1 mb-4">
                  <button
                    onClick={() => setPostType('text')}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      postType === 'text'
                        ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400'
                        : 'text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    Text
                  </button>
                  <button
                    onClick={() => setPostType('poll')}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      postType === 'poll'
                        ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400'
                        : 'text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    <BarChart3 className="h-4 w-4 inline mr-1" />
                    Poll
                  </button>
                  <button
                    onClick={() => setPostType('image')}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      postType === 'image'
                        ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400'
                        : 'text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    <Image className="h-4 w-4 inline mr-1" />
                    Image
                  </button>
                </div>

                <textarea
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  placeholder="What's on your mind?"
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={4}
                />

                <div className="flex flex-col lg:flex-row justify-end space-y-2 lg:space-y-0 lg:space-x-3 mt-4">
                  <button
                    onClick={() => setShowCreatePost(false)}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors border border-gray-300 dark:border-gray-600 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreatePost}
                    disabled={!newPost.trim()}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                  >
                    Post
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Posts */}
        <div className="space-y-6">{posts.map(renderPost)}</div>

        {/* Load More */}
        <div className="text-center mt-8">
          <button className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            Load More Posts
          </button>
        </div>
      </div>
    </div>
  );
};
