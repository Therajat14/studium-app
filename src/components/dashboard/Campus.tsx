import React, { useState } from 'react';
import { 
  MapPin, 
  Star, 
  MessageCircle, 
  Search, 
  Filter,
  Plus,
  User,
  Clock,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  Coffee,
  Book,
  Home,
  Utensils,
  Car
} from 'lucide-react';

interface CampusProps {
  currentUser: any;
}

const mockReviews = [
  {
    id: 1,
    category: 'Faculty',
    title: 'Prof. Anderson - Machine Learning',
    rating: 4.8,
    content: 'Excellent professor! Explains complex concepts clearly and is always available for help. The assignments are challenging but fair.',
    author: {
      name: 'Sarah Chen',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      year: '3rd Year'
    },
    timestamp: '2 days ago',
    helpful: 23,
    notHelpful: 2,
    userVote: null
  },
  {
    id: 2,
    category: 'Course',
    title: 'CS 450 - Machine Learning',
    rating: 4.5,
    content: 'Great course with practical projects. Heavy workload but you learn a lot. Make sure to start assignments early!',
    author: {
      name: 'Mike Rodriguez',
      avatar: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      year: '4th Year'
    },
    timestamp: '1 week ago',
    helpful: 18,
    notHelpful: 1,
    userVote: 'helpful'
  },
  {
    id: 3,
    category: 'Facility',
    title: 'Central Library',
    rating: 4.2,
    content: 'Good study environment with plenty of resources. Can get crowded during exam season. The 24/7 access is a huge plus.',
    author: {
      name: 'Emma Thompson',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      year: '2nd Year'
    },
    timestamp: '3 days ago',
    helpful: 15,
    notHelpful: 3,
    userVote: null
  }
];

const mockCampusHelp = [
  {
    id: 1,
    question: 'Where can I get affordable printing on campus?',
    answer: 'Library basement has the cheapest printing at $0.05/page. Computer lab in Engineering building is also good.',
    author: {
      name: 'Alex Kumar',
      avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
    },
    timestamp: '1 day ago',
    upvotes: 12,
    category: 'Services'
  },
  {
    id: 2,
    question: 'Best places to eat near campus?',
    answer: 'Joe\'s Pizza (2 blocks north) has great deals for students. Campus cafeteria is decent but pricey. Food trucks on Main St are worth trying!',
    author: {
      name: 'Lisa Wang',
      avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
    },
    timestamp: '2 days ago',
    upvotes: 28,
    category: 'Food'
  }
];

const mockLostFound = [
  {
    id: 1,
    type: 'lost',
    item: 'Black iPhone 13 with blue case',
    description: 'Lost near the library yesterday evening. Has a small crack on the screen. Please contact if found!',
    location: 'Central Library area',
    author: {
      name: 'John Smith',
      avatar: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
    },
    timestamp: '1 day ago',
    status: 'active'
  },
  {
    id: 2,
    type: 'found',
    item: 'Red water bottle with stickers',
    description: 'Found this water bottle in the computer lab. Has various tech company stickers on it.',
    location: 'Computer Lab B',
    author: {
      name: 'Maria Garcia',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
    },
    timestamp: '3 hours ago',
    status: 'active'
  }
];

export const Campus: React.FC<CampusProps> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState('reviews');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'faculty':
        return <User className="h-5 w-5 text-blue-500" />;
      case 'course':
        return <Book className="h-5 w-5 text-green-500" />;
      case 'facility':
        return <Home className="h-5 w-5 text-purple-500" />;
      case 'food':
        return <Utensils className="h-5 w-5 text-orange-500" />;
      case 'services':
        return <Coffee className="h-5 w-5 text-brown-500" />;
      case 'parking':
        return <Car className="h-5 w-5 text-gray-500" />;
      default:
        return <MapPin className="h-5 w-5 text-gray-500" />;
    }
  };

  const handleVote = (reviewId: number, voteType: 'helpful' | 'notHelpful') => {
    // Implementation for voting on reviews
    console.log(`Voted ${voteType} on review ${reviewId}`);
  };

  const renderReviewsTab = () => (
    <div className="space-y-6">
      {mockReviews.map((review) => (
        <div key={review.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:border-gray-300 dark:hover:border-gray-600 transition-colors duration-200">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              {getCategoryIcon(review.category)}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{review.title}</h3>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300">
                  {review.category}
                </span>
              </div>
            </div>
            <div className="flex items-center">
              <div className="flex items-center mr-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(review.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300 dark:text-gray-600'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{review.rating}</span>
            </div>
          </div>

          <p className="text-gray-700 dark:text-gray-300 mb-4">{review.content}</p>

          <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center">
              <img
                src={review.author.avatar}
                alt={review.author.name}
                className="w-8 h-8 rounded-full object-cover"
              />
              <div className="ml-2">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{review.author.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{review.author.year}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500 dark:text-gray-400">{review.timestamp}</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleVote(review.id, 'helpful')}
                  className={`flex items-center space-x-1 px-2 py-1 rounded transition-colors ${
                    review.userVote === 'helpful' ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400'
                  }`}
                >
                  <ThumbsUp className="h-4 w-4" />
                  <span className="text-sm">{review.helpful}</span>
                </button>
                <button
                  onClick={() => handleVote(review.id, 'notHelpful')}
                  className={`flex items-center space-x-1 px-2 py-1 rounded transition-colors ${
                    review.userVote === 'notHelpful' ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400' : 'text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400'
                  }`}
                >
                  <ThumbsDown className="h-4 w-4" />
                  <span className="text-sm">{review.notHelpful}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderCampusHelpTab = () => (
    <div className="space-y-6">
      {mockCampusHelp.map((help) => (
        <div key={help.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:border-gray-300 dark:hover:border-gray-600 transition-colors duration-200">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                <MessageCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{help.question}</h3>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300">
                  {help.category}
                </span>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-4">{help.answer}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <img
                    src={help.author.avatar}
                    alt={help.author.name}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">{help.author.name}</span>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center">
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    {help.upvotes}
                  </div>
                  <span>{help.timestamp}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderLostFoundTab = () => (
    <div className="space-y-6">
      {mockLostFound.map((item) => (
        <div key={item.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:border-gray-300 dark:hover:border-gray-600 transition-colors duration-200">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                item.type === 'lost' ? 'bg-red-100 dark:bg-red-900/20' : 'bg-green-100 dark:bg-green-900/20'
              }`}>
                <AlertCircle className={`h-5 w-5 ${
                  item.type === 'lost' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                }`} />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  item.type === 'lost' ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300' : 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                }`}>
                  {item.type.toUpperCase()}
                </span>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{item.item}</h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-2">{item.description}</p>
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-4">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{item.location}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <img
                    src={item.author.avatar}
                    alt={item.author.name}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">{item.author.name}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500 dark:text-gray-400">{item.timestamp}</span>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                    Contact
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Campus Life & Reviews</h2>
            <p className="text-gray-600 dark:text-gray-400">Share experiences and get local campus information</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-4 lg:mt-0 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Review/Post
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1 mb-6 w-fit">
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-4 py-2 rounded-md transition-colors font-medium ${
              activeTab === 'reviews'
                ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border border-gray-200 dark:border-gray-600'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Star className="h-4 w-4 inline mr-2" />
            Reviews
          </button>
          <button
            onClick={() => setActiveTab('help')}
            className={`px-4 py-2 rounded-md transition-colors font-medium ${
              activeTab === 'help'
                ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border border-gray-200 dark:border-gray-600'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <MessageCircle className="h-4 w-4 inline mr-2" />
            Campus Help
          </button>
          <button
            onClick={() => setActiveTab('lostfound')}
            className={`px-4 py-2 rounded-md transition-colors font-medium ${
              activeTab === 'lostfound'
                ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border border-gray-200 dark:border-gray-600'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <AlertCircle className="h-4 w-4 inline mr-2" />
            Lost & Found
          </button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
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
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-gray-400" />
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-3 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Categories</option>
                  {activeTab === 'reviews' && (
                    <>
                      <option value="faculty">Faculty</option>
                      <option value="course">Courses</option>
                      <option value="facility">Facilities</option>
                    </>
                  )}
                  {activeTab === 'help' && (
                    <>
                      <option value="food">Food</option>
                      <option value="services">Services</option>
                      <option value="parking">Parking</option>
                    </>
                  )}
                  {activeTab === 'lostfound' && (
                    <>
                      <option value="lost">Lost Items</option>
                      <option value="found">Found Items</option>
                    </>
                  )}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'reviews' && renderReviewsTab()}
        {activeTab === 'help' && renderCampusHelpTab()}
        {activeTab === 'lostfound' && renderLostFoundTab()}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">What would you like to add?</h3>
              <div className="space-y-3">
                <button className="w-full p-4 text-left border border-gray-200 dark:border-gray-600 rounded-lg hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-yellow-500 mr-3" />
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">Write a Review</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Review faculty, courses, or facilities</p>
                    </div>
                  </div>
                </button>
                <button className="w-full p-4 text-left border border-gray-200 dark:border-gray-600 rounded-lg hover:border-green-300 dark:hover:border-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors">
                  <div className="flex items-center">
                    <MessageCircle className="h-5 w-5 text-green-500 mr-3" />
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">Share Campus Tip</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Help fellow students with local knowledge</p>
                    </div>
                  </div>
                </button>
                <button className="w-full p-4 text-left border border-gray-200 dark:border-gray-600 rounded-lg hover:border-red-300 dark:hover:border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">Lost & Found</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Report lost or found items</p>
                    </div>
                  </div>
                </button>
              </div>
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};