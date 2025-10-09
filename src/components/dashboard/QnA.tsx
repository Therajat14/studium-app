import React, { useState } from 'react';
import { 
  HelpCircle, 
  MessageCircle, 
  TrendingUp, 
  TrendingDown, 
  Award, 
  User, 
  Calendar, 
  Tag,
  Search,
  Filter,
  Plus,
  CheckCircle,
  Star,
  Users,
  Clock,
  Bookmark,
  Flag,
  Share2
} from 'lucide-react';

interface QnAProps {
  currentUser: any;
}

const mockQuestions = [
  {
    id: 1,
    title: 'How to optimize time complexity in dynamic programming problems?',
    content: 'I\'m struggling with understanding how to approach DP problems efficiently. Can someone explain the general strategy for optimizing time complexity? Specifically looking at problems like longest common subsequence and knapsack.',
    author: {
      name: 'Sarah Chen',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      year: '2nd Year',
      karma: 450,
      badges: ['Rising Star']
    },
    timestamp: '2 hours ago',
    tags: ['algorithms', 'dynamic-programming', 'optimization'],
    upvotes: 23,
    downvotes: 1,
    answers: 5,
    views: 156,
    bounty: 50,
    userVote: null,
    isBookmarked: false,
    hasAcceptedAnswer: false,
    difficulty: 'Intermediate'
  },
  {
    id: 2,
    title: 'Best practices for React state management in large applications?',
    content: 'Working on a large React project and finding it difficult to manage state across multiple components. Should I use Context API, Redux, or Zustand? What are the trade-offs?',
    author: {
      name: 'Mike Rodriguez',
      avatar: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      year: '3rd Year',
      karma: 1200,
      badges: ['Code Warrior']
    },
    timestamp: '4 hours ago',
    tags: ['react', 'state-management', 'frontend'],
    upvotes: 45,
    downvotes: 2,
    answers: 8,
    views: 234,
    bounty: 0,
    userVote: 'upvote',
    isBookmarked: true,
    hasAcceptedAnswer: true,
    difficulty: 'Advanced'
  },
  {
    id: 3,
    title: 'Database normalization vs denormalization - when to use which?',
    content: 'I understand the theory behind database normalization, but I\'m confused about when to denormalize for performance. Can someone provide practical examples?',
    author: {
      name: 'Emma Thompson',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      year: '4th Year',
      karma: 2100,
      badges: ['Database Guru', 'Top Contributor']
    },
    timestamp: '1 day ago',
    tags: ['database', 'normalization', 'performance'],
    upvotes: 67,
    downvotes: 3,
    answers: 12,
    views: 445,
    bounty: 100,
    userVote: null,
    isBookmarked: false,
    hasAcceptedAnswer: true,
    difficulty: 'Intermediate'
  },
  {
    id: 4,
    title: 'Machine Learning model deployment best practices?',
    content: 'I\'ve trained a good ML model but struggling with deployment. What are the best practices for deploying ML models to production? Docker, Kubernetes, or cloud services?',
    author: {
      name: 'Alex Kumar',
      avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      year: '3rd Year',
      karma: 1650,
      badges: ['ML Expert']
    },
    timestamp: '2 days ago',
    tags: ['machine-learning', 'deployment', 'devops'],
    upvotes: 34,
    downvotes: 0,
    answers: 6,
    views: 189,
    bounty: 75,
    userVote: null,
    isBookmarked: false,
    hasAcceptedAnswer: false,
    difficulty: 'Advanced'
  }
];

const mockAnswers = [
  {
    id: 1,
    questionId: 1,
    content: 'Great question! For DP optimization, here are the key strategies:\n\n1. **Memoization vs Tabulation**: Start with memoization for easier understanding, then convert to tabulation for better space complexity.\n\n2. **State Space Reduction**: Look for patterns where you only need the previous row/column instead of the entire DP table.\n\n3. **Time-Space Trade-offs**: Sometimes you can reduce space complexity from O(n²) to O(n) by only keeping track of necessary previous states.\n\nFor LCS specifically, you can optimize space from O(m*n) to O(min(m,n)) by only keeping track of the current and previous rows.',
    author: {
      name: 'Dr. Smith',
      avatar: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      year: 'Faculty',
      karma: 5600,
      badges: ['Algorithm Master', 'Top Mentor']
    },
    timestamp: '1 hour ago',
    upvotes: 18,
    downvotes: 0,
    userVote: null,
    isAccepted: false,
    isEndorsed: true
  },
  {
    id: 2,
    questionId: 1,
    content: 'Adding to the previous answer, here\'s a practical example with the knapsack problem:\n\n```python\n# Space optimized knapsack\ndef knapsack_optimized(weights, values, capacity):\n    dp = [0] * (capacity + 1)\n    \n    for i in range(len(weights)):\n        for w in range(capacity, weights[i] - 1, -1):\n            dp[w] = max(dp[w], dp[w - weights[i]] + values[i])\n    \n    return dp[capacity]\n```\n\nThis reduces space complexity from O(n*W) to O(W).',
    author: {
      name: 'Lisa Wang',
      avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      year: '4th Year',
      karma: 2300,
      badges: ['Code Expert']
    },
    timestamp: '45 minutes ago',
    upvotes: 12,
    downvotes: 0,
    userVote: 'upvote',
    isAccepted: false,
    isEndorsed: false
  }
];

const mockMentorshipRequests = [
  {
    id: 1,
    title: 'Looking for Machine Learning mentor',
    description: 'Junior seeking guidance on ML career path and project ideas. Interested in computer vision and NLP.',
    requester: {
      name: 'John Doe',
      avatar: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      year: '2nd Year'
    },
    skills: ['Python', 'TensorFlow', 'Data Analysis'],
    timestamp: '1 day ago',
    responses: 3
  },
  {
    id: 2,
    title: 'Need help with System Design interviews',
    description: 'Preparing for software engineering interviews. Looking for someone who can help with system design concepts.',
    requester: {
      name: 'Jane Smith',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      year: '4th Year'
    },
    skills: ['System Design', 'Distributed Systems', 'Scalability'],
    timestamp: '2 days ago',
    responses: 5
  }
];

export const QnA: React.FC<QnAProps> = ({ currentUser }) => {
  const [questions, setQuestions] = useState(mockQuestions);
  const [answers, setAnswers] = useState(mockAnswers);
  const [activeTab, setActiveTab] = useState('questions');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showAskModal, setShowAskModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<number | null>(null);
  const [newAnswer, setNewAnswer] = useState('');

  const handleVote = (questionId: number, voteType: 'upvote' | 'downvote') => {
    setQuestions(questions.map(question => {
      if (question.id === questionId) {
        let newUpvotes = question.upvotes;
        let newDownvotes = question.downvotes;
        let newUserVote = voteType;

        if (question.userVote === voteType) {
          if (voteType === 'upvote') newUpvotes--;
          else newDownvotes--;
          newUserVote = null;
        } else if (question.userVote) {
          if (question.userVote === 'upvote') newUpvotes--;
          else newDownvotes--;
          if (voteType === 'upvote') newUpvotes++;
          else newDownvotes++;
        } else {
          if (voteType === 'upvote') newUpvotes++;
          else newDownvotes++;
        }

        return {
          ...question,
          upvotes: newUpvotes,
          downvotes: newDownvotes,
          userVote: newUserVote
        };
      }
      return question;
    }));
  };

  const handleBookmark = (questionId: number) => {
    setQuestions(questions.map(question => 
      question.id === questionId 
        ? { ...question, isBookmarked: !question.isBookmarked }
        : question
    ));
  };

  const handleAnswerSubmit = (questionId: number) => {
    if (!newAnswer.trim()) return;

    const answer = {
      id: answers.length + 1,
      questionId,
      content: newAnswer,
      author: {
        name: currentUser.name,
        avatar: currentUser.avatar,
        year: `${currentUser.year}rd Year`,
        karma: currentUser.karma,
        badges: currentUser.badges
      },
      timestamp: 'Just now',
      upvotes: 0,
      downvotes: 0,
      userVote: null,
      isAccepted: false,
      isEndorsed: false
    };

    setAnswers([...answers, answer]);
    setQuestions(questions.map(question => 
      question.id === questionId 
        ? { ...question, answers: question.answers + 1 }
        : question
    ));
    setNewAnswer('');
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300';
      case 'Intermediate':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300';
      case 'Advanced':
        return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  const getVoteColor = (question: any, voteType: 'upvote' | 'downvote') => {
    if (question.userVote === voteType) {
      return voteType === 'upvote' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
    }
    return 'text-gray-500 dark:text-gray-400';
  };

  const filteredQuestions = questions.filter(question => {
    const matchesSearch = question.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         question.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         question.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesFilter = selectedFilter === 'all' ||
                         (selectedFilter === 'unanswered' && question.answers === 0) ||
                         (selectedFilter === 'bounty' && question.bounty > 0) ||
                         (selectedFilter === 'solved' && question.hasAcceptedAnswer);
    
    return matchesSearch && matchesFilter;
  });

  const renderQuestionsTab = () => (
    <div className="space-y-6">
      {filteredQuestions.map((question) => (
        <div key={question.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:border-gray-300 dark:hover:border-gray-600 transition-colors duration-200">
          {/* Question Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer">
                  {question.title}
                </h3>
                {question.hasAcceptedAnswer && (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
                {question.bounty > 0 && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 font-medium">
                    <Award className="h-3 w-3 mr-1" />
                    {question.bounty} bounty
                  </span>
                )}
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">{question.content}</p>
              
              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {question.tags.map((tag, index) => (
                  <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300">
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </span>
                ))}
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getDifficultyColor(question.difficulty)}`}>
                  {question.difficulty}
                </span>
              </div>
            </div>

            {/* Vote Section */}
            <div className="flex flex-col items-center space-y-2 ml-6">
              <button
                onClick={() => handleVote(question.id, 'upvote')}
                className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${getVoteColor(question, 'upvote')}`}
              >
                <TrendingUp className="h-5 w-5" />
              </button>
              <span className="text-lg font-bold text-gray-700 dark:text-gray-300">
                {question.upvotes - question.downvotes}
              </span>
              <button
                onClick={() => handleVote(question.id, 'downvote')}
                className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${getVoteColor(question, 'downvote')}`}
              >
                <TrendingDown className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Question Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <img
                  src={question.author.avatar}
                  alt={question.author.name}
                  className="w-8 h-8 rounded-full object-cover mr-2"
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{question.author.name}</span>
                    {question.author.badges.map((badge, index) => (
                      <span key={index} className="inline-flex items-center px-1 py-0.5 rounded text-xs bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300">
                        {badge}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                    <span>{question.author.year}</span>
                    <span>•</span>
                    <span>{question.author.karma} karma</span>
                    <span>•</span>
                    <span>{question.timestamp}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center">
                  <MessageCircle className="h-4 w-4 mr-1" />
                  <span>{question.answers} answers</span>
                </div>
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  <span>{question.views} views</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleBookmark(question.id)}
                  className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                    question.isBookmarked ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  <Bookmark className="h-4 w-4" />
                </button>
                <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 dark:text-gray-400">
                  <Share2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setSelectedQuestion(selectedQuestion === question.id ? null : question.id)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Answer
                </button>
              </div>
            </div>
          </div>

          {/* Answer Section */}
          {selectedQuestion === question.id && (
            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
              {/* Existing Answers */}
              <div className="space-y-4 mb-6">
                {answers
                  .filter(answer => answer.questionId === question.id)
                  .map(answer => (
                    <div key={answer.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <img
                          src={answer.author.avatar}
                          alt={answer.author.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="font-medium text-gray-900 dark:text-white">{answer.author.name}</span>
                            {answer.author.badges.map((badge, index) => (
                              <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300">
                                {badge}
                              </span>
                            ))}
                            {answer.isAccepted && (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            )}
                            {answer.isEndorsed && (
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            )}
                          </div>
                          <div className="text-gray-800 dark:text-gray-200 mb-3 whitespace-pre-line">
                            {answer.content}
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center space-x-1">
                              <button className="hover:text-green-600 dark:hover:text-green-400">
                                <TrendingUp className="h-4 w-4" />
                              </button>
                              <span>{answer.upvotes}</span>
                            </div>
                            <span>{answer.timestamp}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Add Answer */}
              <div className="flex space-x-3">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1">
                  <textarea
                    value={newAnswer}
                    onChange={(e) => setNewAnswer(e.target.value)}
                    placeholder="Write your answer..."
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={4}
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={() => handleAnswerSubmit(question.id)}
                      disabled={!newAnswer.trim()}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                    >
                      Post Answer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderMentorshipTab = () => (
    <div className="space-y-6">
      {mockMentorshipRequests.map((request) => (
        <div key={request.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:border-gray-300 dark:hover:border-gray-600 transition-colors duration-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <Users className="h-5 w-5 text-blue-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{request.title}</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">{request.description}</p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {request.skills.map((skill, index) => (
                  <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300">
                    {skill}
                  </span>
                ))}
              </div>

              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center">
                  <img
                    src={request.requester.avatar}
                    alt={request.requester.name}
                    className="w-6 h-6 rounded-full object-cover mr-2"
                  />
                  <span>{request.requester.name} • {request.requester.year}</span>
                </div>
                <span>•</span>
                <span>{request.timestamp}</span>
                <span>•</span>
                <span>{request.responses} responses</span>
              </div>
            </div>
            
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Offer Help
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto p-4 lg:p-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 space-y-4 lg:space-y-0">
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-2">Q&A & Mentorship</h2>
            <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400">Get help from the community and find mentors</p>
          </div>
          <button
            onClick={() => setShowAskModal(true)}
            className="bg-blue-600 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center text-sm lg:text-base w-full lg:w-auto justify-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Ask Question
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1 mb-6 w-full lg:w-fit overflow-x-auto">
          <button
            onClick={() => setActiveTab('questions')}
            className={`px-3 lg:px-4 py-2 rounded-md transition-colors font-medium text-sm lg:text-base whitespace-nowrap ${
              activeTab === 'questions'
                ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border border-gray-200 dark:border-gray-600'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <HelpCircle className="h-4 w-4 inline mr-2" />
            Questions
          </button>
          <button
            onClick={() => setActiveTab('mentorship')}
            className={`px-3 lg:px-4 py-2 rounded-md transition-colors font-medium text-sm lg:text-base whitespace-nowrap ${
              activeTab === 'mentorship'
                ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border border-gray-200 dark:border-gray-600'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Users className="h-4 w-4 inline mr-2" />
            Mentorship
          </button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 lg:p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${activeTab}...`}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            {activeTab === 'questions' && (
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center space-y-2 lg:space-y-0 lg:space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter className="h-5 w-5 text-gray-400" />
                  <select
                    value={selectedFilter}
                    onChange={(e) => setSelectedFilter(e.target.value)}
                    className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-3 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Questions</option>
                    <option value="unanswered">Unanswered</option>
                    <option value="bounty">With Bounty</option>
                    <option value="solved">Solved</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        {activeTab === 'questions' ? renderQuestionsTab() : renderMentorshipTab()}

        {/* Ask Question Modal */}
        {showAskModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Ask a Question</h3>
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="What's your question?"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={6}
                      placeholder="Provide more details about your question..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tags</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="algorithms, react, database"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Difficulty Level</label>
                    <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Bounty (Optional)</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                      min="0"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Offer karma points to attract better answers</p>
                  </div>
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowAskModal(false)}
                      className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Ask Question
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};