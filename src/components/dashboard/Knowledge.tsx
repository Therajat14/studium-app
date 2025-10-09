import React, { useState } from 'react';
import { 
  Upload, 
  Download, 
  Star, 
  FileText, 
  Filter,
  Search,
  Calendar,
  User,
  Tag,
  Eye,
  Plus,
  Bookmark,
  Share2,
  Edit3,
  Users,
  Clock,
  BookOpen,
  Award,
  TrendingUp,
  File,
  Image,
  Video,
  Archive
} from 'lucide-react';

interface KnowledgeProps {
  currentUser: any;
}

const mockResources = [
  {
    id: 1,
    title: 'Data Structures and Algorithms - Complete Notes',
    description: 'Comprehensive notes covering trees, graphs, sorting algorithms, and time complexity analysis. Perfect for exam preparation and interview prep.',
    type: 'PDF',
    subject: 'Computer Science',
    course: 'CS 201',
    uploadedBy: {
      name: 'Sarah Chen',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      karma: 2450
    },
    uploadDate: '2 days ago',
    downloads: 145,
    rating: 4.8,
    reviews: 32,
    size: '2.3 MB',
    tags: ['algorithms', 'data-structures', 'notes', 'exam-prep'],
    thumbnail: 'https://images.pexels.com/photos/4164418/pexels-photo-4164418.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
    isBookmarked: false,
    isCollaborative: false,
    contributors: 1,
    lastUpdated: '2 days ago'
  },
  {
    id: 2,
    title: 'Machine Learning Study Guide - Collaborative',
    description: 'Community-driven study guide for ML concepts. Multiple contributors have added explanations, examples, and practice problems.',
    type: 'Collaborative Doc',
    subject: 'Computer Science',
    course: 'CS 450',
    uploadedBy: {
      name: 'Mike Rodriguez',
      avatar: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      karma: 1800
    },
    uploadDate: '1 week ago',
    downloads: 89,
    rating: 4.9,
    reviews: 18,
    size: 'Live Document',
    tags: ['machine-learning', 'collaborative', 'study-guide'],
    thumbnail: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
    isBookmarked: true,
    isCollaborative: true,
    contributors: 8,
    lastUpdated: '3 hours ago'
  },
  {
    id: 3,
    title: 'Database Design Project Template',
    description: 'Complete ER diagram and SQL implementation template for the final project. Includes sample data and queries.',
    type: 'ZIP',
    subject: 'Computer Science',
    course: 'CS 340',
    uploadedBy: {
      name: 'Emma Thompson',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      karma: 950
    },
    uploadDate: '3 days ago',
    downloads: 67,
    rating: 4.7,
    reviews: 12,
    size: '5.2 MB',
    tags: ['database', 'project', 'template', 'sql'],
    thumbnail: 'https://images.pexels.com/photos/590020/pexels-photo-590020.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
    isBookmarked: false,
    isCollaborative: false,
    contributors: 1,
    lastUpdated: '3 days ago'
  },
  {
    id: 4,
    title: 'Operating Systems Lab Solutions',
    description: 'Solutions to all OS lab assignments with detailed explanations. Covers process management, memory allocation, and file systems.',
    type: 'PDF',
    subject: 'Computer Science',
    course: 'CS 350',
    uploadedBy: {
      name: 'Alex Kumar',
      avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      karma: 1650
    },
    uploadDate: '5 days ago',
    downloads: 123,
    rating: 4.6,
    reviews: 25,
    size: '1.8 MB',
    tags: ['operating-systems', 'lab', 'solutions'],
    thumbnail: 'https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
    isBookmarked: false,
    isCollaborative: false,
    contributors: 1,
    lastUpdated: '5 days ago'
  }
];

const mockCollaborativeDocs = [
  {
    id: 1,
    title: 'First Year Survival Guide',
    description: 'Community guide for new students covering everything from course selection to campus life.',
    contributors: 15,
    lastUpdated: '1 hour ago',
    sections: 8,
    views: 234,
    isPublic: true
  },
  {
    id: 2,
    title: 'Placement Interview Questions Bank',
    description: 'Crowdsourced collection of interview questions from various companies.',
    contributors: 23,
    lastUpdated: '2 hours ago',
    sections: 12,
    views: 456,
    isPublic: true
  }
];

export const Knowledge: React.FC<KnowledgeProps> = ({ currentUser }) => {
  const [resources, setResources] = useState(mockResources);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('resources');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadType, setUploadType] = useState<'file' | 'collaborative'>('file');

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesFilter = selectedFilter === 'all' || 
                         (selectedFilter === 'collaborative' && resource.isCollaborative) ||
                         (selectedFilter !== 'collaborative' && resource.type.toLowerCase() === selectedFilter);
    
    const matchesTab = activeTab === 'resources' || 
                      (activeTab === 'bookmarked' && resource.isBookmarked) ||
                      (activeTab === 'collaborative' && resource.isCollaborative);
    
    return matchesSearch && matchesFilter && matchesTab;
  });

  const handleDownload = (resourceId: number) => {
    setResources(resources.map(resource => 
      resource.id === resourceId 
        ? { ...resource, downloads: resource.downloads + 1 }
        : resource
    ));
  };

  const handleBookmark = (resourceId: number) => {
    setResources(resources.map(resource => 
      resource.id === resourceId 
        ? { ...resource, isBookmarked: !resource.isBookmarked }
        : resource
    ));
  };

  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf':
        return <FileText className="h-6 w-6 text-red-500" />;
      case 'zip':
        return <Archive className="h-6 w-6 text-purple-500" />;
      case 'collaborative doc':
        return <Edit3 className="h-6 w-6 text-blue-500" />;
      case 'image':
        return <Image className="h-6 w-6 text-green-500" />;
      case 'video':
        return <Video className="h-6 w-6 text-orange-500" />;
      default:
        return <File className="h-6 w-6 text-gray-500 dark:text-gray-400" />;
    }
  };

  const renderResourceCard = (resource: any) => (
    <div key={resource.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:border-gray-300 dark:hover:border-gray-600 transition-colors duration-200">
      {/* Resource Thumbnail */}
      <div className="h-48 bg-gray-100 dark:bg-gray-700 relative">
        <img
          src={resource.thumbnail}
          alt={resource.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 left-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-2 border border-gray-200 dark:border-gray-600">
            {getFileIcon(resource.type)}
          </div>
        </div>
        <div className="absolute top-4 right-4 flex space-x-2">
          <span className="bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
            {resource.type}
          </span>
          {resource.isCollaborative && (
            <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded flex items-center">
              <Users className="h-3 w-3 mr-1" />
              {resource.contributors}
            </span>
          )}
        </div>
        <div className="absolute bottom-4 right-4">
          <button
            onClick={() => handleBookmark(resource.id)}
            className={`p-2 rounded-lg transition-colors ${
              resource.isBookmarked
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600'
            }`}
          >
            <Bookmark className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Resource Info */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white leading-tight line-clamp-2">
            {resource.title}
          </h3>
        </div>
        
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
          {resource.description}
        </p>

        <div className="flex flex-wrap gap-1 mb-4">
          {resource.tags.slice(0, 3).map((tag, index) => (
            <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
              <Tag className="h-3 w-3 mr-1" />
              {tag}
            </span>
          ))}
          {resource.tags.length > 3 && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              +{resource.tags.length - 3} more
            </span>
          )}
        </div>

        <div className="space-y-2 mb-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img
                src={resource.uploadedBy.avatar}
                alt={resource.uploadedBy.name}
                className="w-5 h-5 rounded-full object-cover mr-2"
              />
              <span>{resource.uploadedBy.name}</span>
            </div>
            <div className="flex items-center">
              <Award className="h-4 w-4 mr-1 text-blue-500" />
              <span>{resource.uploadedBy.karma}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              <span>{resource.uploadDate}</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              <span>Updated {resource.lastUpdated}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Eye className="h-4 w-4 mr-2" />
              <span>{resource.downloads} downloads</span>
            </div>
            <div className="flex items-center">
              <Star className="h-4 w-4 mr-1 text-yellow-500 fill-current" />
              <span>{resource.rating}</span>
              <span className="text-gray-400 dark:text-gray-500 ml-1">({resource.reviews})</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {resource.course} • {resource.size}
          </span>
          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <Share2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleDownload(resource.id)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center text-sm"
            >
              {resource.isCollaborative ? (
                <>
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCollaborativeTab = () => (
    <div className="space-y-6">
      {mockCollaborativeDocs.map((doc) => (
        <div key={doc.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:border-gray-300 dark:hover:border-gray-600 transition-colors duration-200">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <Edit3 className="h-6 w-6 text-blue-500" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{doc.title}</h3>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300">
                  <Users className="h-3 w-3 mr-1" />
                  {doc.contributors} contributors
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">{doc.description}</p>
              <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center">
                  <BookOpen className="h-4 w-4 mr-1" />
                  <span>{doc.sections} sections</span>
                </div>
                <div className="flex items-center">
                  <Eye className="h-4 w-4 mr-1" />
                  <span>{doc.views} views</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>Updated {doc.lastUpdated}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
                <Edit3 className="h-4 w-4 mr-2" />
                Contribute
              </button>
              <button className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <Share2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto p-4 lg:p-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 space-y-4 lg:space-y-0">
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-2">Knowledge Hub</h2>
            <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400">Collaborative learning and resource sharing</p>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="bg-blue-600 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center text-sm lg:text-base w-full lg:w-auto justify-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Resource
          </button>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap lg:flex-nowrap space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1 mb-6 w-full lg:w-fit overflow-x-auto">
          <button
            onClick={() => setActiveTab('resources')}
            className={`px-3 lg:px-4 py-2 rounded-md transition-colors font-medium text-sm lg:text-base whitespace-nowrap ${
              activeTab === 'resources'
                ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border border-gray-200 dark:border-gray-600'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <FileText className="h-4 w-4 inline mr-2" />
            All Resources
          </button>
          <button
            onClick={() => setActiveTab('collaborative')}
            className={`px-3 lg:px-4 py-2 rounded-md transition-colors font-medium text-sm lg:text-base whitespace-nowrap ${
              activeTab === 'collaborative'
                ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border border-gray-200 dark:border-gray-600'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Edit3 className="h-4 w-4 inline mr-2" />
            Collaborative Docs
          </button>
          <button
            onClick={() => setActiveTab('bookmarked')}
            className={`px-3 lg:px-4 py-2 rounded-md transition-colors font-medium text-sm lg:text-base whitespace-nowrap ${
              activeTab === 'bookmarked'
                ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border border-gray-200 dark:border-gray-600'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Bookmark className="h-4 w-4 inline mr-2" />
            My Library
          </button>
        </div>

        {/* Search and Filters */}
        {activeTab !== 'collaborative' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 lg:p-6 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search resources by title, description, or tags..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center space-y-2 lg:space-y-0 lg:space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter className="h-5 w-5 text-gray-400" />
                  <select
                    value={selectedFilter}
                    onChange={(e) => setSelectedFilter(e.target.value)}
                    className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-3 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Types</option>
                    <option value="pdf">PDF</option>
                    <option value="zip">ZIP</option>
                    <option value="collaborative">Collaborative</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        {activeTab === 'collaborative' ? (
          renderCollaborativeTab()
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
            {filteredResources.map(renderResourceCard)}
          </div>
        )}

        {filteredResources.length === 0 && activeTab !== 'collaborative' && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No resources found</h3>
            <p className="text-gray-500 dark:text-gray-400">Try adjusting your search criteria or upload a new resource.</p>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add Resource</h3>
              
              <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1 mb-4">
                <button
                  onClick={() => setUploadType('file')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    uploadType === 'file'
                      ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-300'
                  }`}
                >
                  <Upload className="h-4 w-4 inline mr-1" />
                  Upload File
                </button>
                <button
                  onClick={() => setUploadType('collaborative')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    uploadType === 'collaborative'
                      ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-300'
                  }`}
                >
                  <Edit3 className="h-4 w-4 inline mr-1" />
                  Create Doc
                </button>
              </div>

              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter resource title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Describe your resource"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Course</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., CS 201"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tags</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="algorithms, notes, exam-prep"
                  />
                </div>
                {uploadType === 'file' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">File</label>
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-500 dark:hover:border-blue-400 transition-colors cursor-pointer">
                      <Upload className="h-8 w-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 dark:text-gray-300">Click to upload or drag and drop</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">PDF, DOC, ZIP up to 10MB</p>
                    </div>
                  </div>
                )}
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {uploadType === 'file' ? 'Upload' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};