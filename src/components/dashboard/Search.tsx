import React, { useState } from 'react';
import {
  Search as SearchIcon,
  Filter,
  User,
  BookOpen,
  MessageCircle,
  UserPlus,
  Award,
  Users,
  TrendingUp,
  Download,
  Star,
} from 'lucide-react';

interface SearchProps {
  currentUser: any;
}

const mockStudents = [
  {
    id: 1,
    name: 'Sarah Chen',
    avatar:
      'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    branch: 'Computer Science',
    year: '3rd Year',
    college: 'Stanford University',
    bio: 'Passionate about AI and machine learning. Currently working on neural networks research. Love helping fellow students!',
    mutualConnections: 5,
    isOnline: true,
    karma: 2450,
    badges: ['Top Contributor', 'AI Expert'],
    skills: ['Python', 'TensorFlow', 'Machine Learning'],
  },
  {
    id: 2,
    name: 'Mike Rodriguez',
    avatar:
      'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    branch: 'Computer Science',
    year: '2nd Year',
    college: 'Stanford University',
    bio: 'Full-stack developer interested in web technologies and mobile apps.',
    mutualConnections: 3,
    isOnline: false,
    karma: 1200,
    badges: ['Code Warrior'],
    skills: ['React', 'Node.js', 'MongoDB'],
  },
  {
    id: 3,
    name: 'Emma Thompson',
    avatar:
      'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    branch: 'Computer Science',
    year: '4th Year',
    college: 'Stanford University',
    bio: 'Senior CS student focusing on database systems and distributed computing.',
    mutualConnections: 8,
    isOnline: true,
    karma: 3100,
    badges: ['Database Guru', 'Mentor'],
    skills: ['SQL', 'Distributed Systems', 'Java'],
  },
  {
    id: 4,
    name: 'Alex Kumar',
    avatar:
      'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    branch: 'Computer Science',
    year: '3rd Year',
    college: 'Stanford University',
    bio: 'Operating systems enthusiast and competitive programmer.',
    mutualConnections: 2,
    isOnline: false,
    karma: 1800,
    badges: ['Algorithm Master'],
    skills: ['C++', 'Algorithms', 'System Programming'],
  },
  {
    id: 5,
    name: 'Lisa Wang',
    avatar:
      'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    branch: 'Computer Science',
    year: '2nd Year',
    college: 'Stanford University',
    bio: 'Cybersecurity student with interests in ethical hacking and network security.',
    mutualConnections: 1,
    isOnline: true,
    karma: 950,
    badges: ['Security Expert'],
    skills: ['Cybersecurity', 'Python', 'Network Security'],
  },
];

const mockResources = [
  {
    id: 1,
    title: 'Advanced Algorithms Study Guide',
    type: 'PDF',
    course: 'CS 301',
    author: 'Dr. Smith',
    downloads: 156,
    rating: 4.8,
    description: 'Comprehensive guide covering advanced sorting algorithms, graph theory, and dynamic programming.',
  },
  {
    id: 2,
    title: 'Machine Learning Project Examples',
    type: 'ZIP',
    course: 'CS 450',
    author: 'Prof. Johnson',
    downloads: 234,
    rating: 4.9,
    description: 'Collection of ML projects with datasets and complete implementations.',
  },
  {
    id: 3,
    title: 'Database Normalization Cheat Sheet',
    type: 'PDF',
    course: 'CS 340',
    author: 'TA Mike',
    downloads: 89,
    rating: 4.6,
    description: 'Quick reference for database normalization forms and examples.',
  },
];

export const Search: React.FC<SearchProps> = ({ currentUser }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('students');
  const [yearFilter, setYearFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState('all');

  const filteredStudents = mockStudents.filter((student) => {
    const matchesQuery =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.branch.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.bio.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesYear =
      yearFilter === 'all' || student.year.includes(yearFilter);
    const matchesBranch =
      branchFilter === 'all' || student.branch === branchFilter;

    return matchesQuery && matchesYear && matchesBranch;
  });

  const filteredResources = mockResources.filter(
    (resource) =>
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleConnect = (studentId: number) => {
    console.log('Connecting with student:', studentId);
  };

  const handleMessage = (studentId: number) => {
    console.log('Messaging student:', studentId);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Search & Discover
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Find students and resources in your university
          </p>
        </div>

        {/* Search Bar and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${searchType}...`}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Search Type Toggle */}
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setSearchType('students')}
                className={`px-4 py-2 rounded-md transition-colors font-medium ${
                  searchType === 'students'
                    ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border border-gray-200 dark:border-gray-600'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <User className="h-4 w-4 inline mr-2" />
                Students
              </button>
              <button
                onClick={() => setSearchType('resources')}
                className={`px-4 py-2 rounded-md transition-colors font-medium ${
                  searchType === 'resources'
                    ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border border-gray-200 dark:border-gray-600'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <BookOpen className="h-4 w-4 inline mr-2" />
                Resources
              </button>
            </div>
          </div>

          {/* Filters for Students */}
          {searchType === 'students' && (
            <div className="flex flex-col lg:flex-row gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Filters:
                </span>
              </div>
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Years</option>
                <option value="1st">1st Year</option>
                <option value="2nd">2nd Year</option>
                <option value="3rd">3rd Year</option>
                <option value="4th">4th Year</option>
              </select>
              <select
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Branches</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Engineering">Engineering</option>
                <option value="Mathematics">Mathematics</option>
              </select>
            </div>
          )}
        </div>

        {/* Results */}
        {searchType === 'students' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredStudents.map((student) => (
              <div
                key={student.id}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:border-blue-300 dark:hover:border-blue-600 transition-colors duration-200"
              >
                {/* Header */}
                <div className="bg-gray-50 dark:bg-gray-700 p-4 border-b border-gray-100 dark:border-gray-600">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Award className="h-4 w-4 text-blue-600 dark:text-blue-400 mr-1" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {student.karma} karma
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 text-teal-600 dark:text-teal-400 mr-1" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {student.mutualConnections} mutual
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="relative">
                      <img
                        src={student.avatar}
                        alt={student.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      {student.isOnline && (
                        <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-400 border-2 border-white dark:border-gray-800 rounded-full"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {student.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {student.branch} • {student.year}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {student.college}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-4 line-clamp-2">
                    {student.bio}
                  </p>

                  {/* Skills */}
                  <div className="mt-4 mb-4">
                    <div className="flex flex-wrap gap-1">
                      {student.skills.slice(0, 3).map((skill, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-700"
                        >
                          {skill}
                        </span>
                      ))}
                      {student.skills.length > 3 && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          +{student.skills.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {student.badges.slice(0, 2).map((badge, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-50 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-700"
                        >
                          <Award className="h-3 w-3 mr-1" />
                          {badge}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleMessage(student.id)}
                        className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="Send message"
                      >
                        <MessageCircle className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleConnect(student.id)}
                        className="p-2 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg transition-colors"
                        title="Connect"
                      >
                        <UserPlus className="h-4 w-4" />
                      </button>
                    </div>
                    <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium">
                      View Profile
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredResources.map((resource) => (
              <div
                key={resource.id}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:border-blue-300 dark:hover:border-blue-600 transition-colors duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {resource.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-3">
                      {resource.description}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center">
                        <BookOpen className="h-4 w-4 mr-1" />
                        {resource.type}
                      </span>
                      <span>{resource.course}</span>
                      <span>by {resource.author}</span>
                      <span className="flex items-center">
                        <Download className="h-4 w-4 mr-1" />
                        {resource.downloads}
                      </span>
                      <span className="flex items-center">
                        <Star className="h-4 w-4 mr-1 text-yellow-500" />
                        {resource.rating}
                      </span>
                    </div>
                  </div>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Results */}
        {((searchType === 'students' && filteredStudents.length === 0) ||
          (searchType === 'resources' && filteredResources.length === 0)) &&
          searchQuery.trim() !== '' && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <SearchIcon className="h-8 w-8 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No results found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Try adjusting your search terms or filters to find what you're
                looking for.
              </p>
            </div>
          )}
      </div>
    </div>
  );
};