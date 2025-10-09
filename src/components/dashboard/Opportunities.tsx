import React, { useState } from 'react';
import { 
  Briefcase, 
  Calendar, 
  MapPin, 
  ExternalLink, 
  Users, 
  Clock,
  Filter,
  Search,
  Plus,
  Star,
  Building,
  GraduationCap,
  Code,
  Trophy,
  User
} from 'lucide-react';

interface OpportunitiesProps {
  currentUser: any;
}

const mockJobs = [
  {
    id: 1,
    title: 'Software Engineering Intern',
    company: 'Google',
    location: 'Mountain View, CA',
    type: 'Internship',
    duration: '3 months',
    salary: '$8,000/month',
    description: 'Join our team to work on cutting-edge projects in machine learning and distributed systems.',
    requirements: ['Python', 'Java', 'Data Structures', 'Algorithms'],
    postedBy: {
      name: 'Sarah Chen',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      role: 'Alumni'
    },
    timestamp: '2 days ago',
    applicants: 45,
    deadline: '2024-02-15'
  },
  {
    id: 2,
    title: 'Frontend Developer',
    company: 'Startup Inc.',
    location: 'Remote',
    type: 'Full-time',
    duration: 'Permanent',
    salary: '$70,000 - $90,000',
    description: 'Looking for a passionate frontend developer to join our growing team and build amazing user experiences.',
    requirements: ['React', 'TypeScript', 'CSS', 'JavaScript'],
    postedBy: {
      name: 'Mike Rodriguez',
      avatar: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      role: 'Alumni'
    },
    timestamp: '1 week ago',
    applicants: 23,
    deadline: '2024-02-20'
  }
];

const mockEvents = [
  {
    id: 1,
    title: 'HackTech 2024 - 48 Hour Hackathon',
    organizer: 'Tech Club',
    date: '2024-02-10',
    time: '9:00 AM',
    location: 'Engineering Building, Room 101',
    type: 'Hackathon',
    description: 'Join us for an exciting 48-hour hackathon focused on AI and sustainability. Prizes worth $10,000!',
    tags: ['AI', 'Sustainability', 'Competition'],
    attendees: 156,
    maxAttendees: 200,
    registrationFee: 'Free',
    organizedBy: {
      name: 'Emma Thompson',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
    },
    isRegistered: false
  },
  {
    id: 2,
    title: 'Machine Learning Workshop Series',
    organizer: 'CS Department',
    date: '2024-02-15',
    time: '2:00 PM',
    location: 'Virtual Event',
    type: 'Workshop',
    description: 'Learn the fundamentals of machine learning with hands-on exercises and real-world projects.',
    tags: ['Machine Learning', 'Python', 'Data Science'],
    attendees: 89,
    maxAttendees: 100,
    registrationFee: '$25',
    organizedBy: {
      name: 'Prof. Anderson',
      avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
    },
    isRegistered: true
  }
];

const mockStudyGroups = [
  {
    id: 1,
    name: 'Data Structures Study Group',
    subject: 'Computer Science',
    course: 'CS 201',
    description: 'Weekly study sessions covering trees, graphs, and advanced algorithms. Preparing for midterm exam.',
    members: 8,
    maxMembers: 12,
    meetingTime: 'Wednesdays 6:00 PM',
    location: 'Library Room 204',
    organizer: {
      name: 'Alex Kumar',
      avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      year: '3rd Year'
    },
    tags: ['Data Structures', 'Algorithms', 'Exam Prep'],
    isJoined: false
  },
  {
    id: 2,
    name: 'React Development Circle',
    subject: 'Web Development',
    course: 'Self-Study',
    description: 'Building projects together and sharing knowledge about React, Next.js, and modern web development.',
    members: 15,
    maxMembers: 20,
    meetingTime: 'Fridays 4:00 PM',
    location: 'Computer Lab B',
    organizer: {
      name: 'Lisa Wang',
      avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      year: '4th Year'
    },
    tags: ['React', 'JavaScript', 'Web Development'],
    isJoined: true
  }
];

export const Opportunities: React.FC<OpportunitiesProps> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState('jobs');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showPostModal, setShowPostModal] = useState(false);

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'hackathon':
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 'workshop':
        return <GraduationCap className="h-5 w-5 text-blue-500" />;
      case 'internship':
        return <Building className="h-5 w-5 text-green-500" />;
      case 'full-time':
        return <Briefcase className="h-5 w-5 text-purple-500" />;
      default:
        return <Calendar className="h-5 w-5 text-gray-500" />;
    }
  };

  const renderJobsTab = () => (
    <div className="space-y-6">
      {mockJobs.map((job) => (
        <div key={job.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:border-gray-300 dark:hover:border-gray-600 transition-colors duration-200">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                {getTypeIcon(job.type)}
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{job.title}</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  job.type === 'Internship' ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300' : 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300'
                }`}>
                  {job.type}
                </span>
              </div>
              <div className="flex items-center space-x-4 text-gray-600 dark:text-gray-400 mb-3">
                <div className="flex items-center">
                  <Building className="h-4 w-4 mr-1" />
                  <span className="font-medium">{job.company}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{job.duration}</span>
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-4">{job.description}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {job.requirements.map((req, index) => (
                  <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300">
                    {req}
                  </span>
                ))}
              </div>
            </div>
            <div className="text-right ml-6">
              <div className="text-lg font-semibold text-green-600 dark:text-green-400 mb-2">{job.salary}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Deadline: {new Date(job.deadline).toLocaleDateString()}
              </div>
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center">
                Apply Now
                <ExternalLink className="h-4 w-4 ml-2" />
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center">
              <img
                src={job.postedBy.avatar}
                alt={job.postedBy.name}
                className="w-8 h-8 rounded-full object-cover"
              />
              <div className="ml-2">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{job.postedBy.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{job.postedBy.role}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
              <span>{job.applicants} applicants</span>
              <span>Posted {job.timestamp}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderEventsTab = () => (
    <div className="space-y-6">
      {mockEvents.map((event) => (
        <div key={event.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:border-gray-300 dark:hover:border-gray-600 transition-colors duration-200">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                {getTypeIcon(event.type)}
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{event.title}</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  event.type === 'Hackathon' ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300' : 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300'
                }`}>
                  {event.type}
                </span>
              </div>
              <div className="flex items-center space-x-4 text-gray-600 dark:text-gray-400 mb-3">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{new Date(event.date).toLocaleDateString()} at {event.time}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  <span>{event.attendees}/{event.maxAttendees}</span>
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-4">{event.description}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {event.tags.map((tag, index) => (
                  <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="text-right ml-6">
              <div className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-2">{event.registrationFee}</div>
              <button className={`px-6 py-2 rounded-lg transition-colors duration-200 flex items-center ${
                event.isRegistered 
                  ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 cursor-default' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}>
                {event.isRegistered ? 'Registered' : 'Register'}
                {!event.isRegistered && <ExternalLink className="h-4 w-4 ml-2" />}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center">
              <img
                src={event.organizedBy.avatar}
                alt={event.organizedBy.name}
                className="w-8 h-8 rounded-full object-cover"
              />
              <div className="ml-2">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{event.organizedBy.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Organizer</p>
              </div>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Organized by {event.organizer}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderStudyGroupsTab = () => (
    <div className="space-y-6">
      {mockStudyGroups.map((group) => (
        <div key={group.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:border-gray-300 dark:hover:border-gray-600 transition-colors duration-200">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <Users className="h-5 w-5 text-blue-500" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{group.name}</h3>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300">
                  {group.course}
                </span>
              </div>
              <div className="flex items-center space-x-4 text-gray-600 dark:text-gray-400 mb-3">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{group.meetingTime}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{group.location}</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  <span>{group.members}/{group.maxMembers} members</span>
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-4">{group.description}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {group.tags.map((tag, index) => (
                  <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="text-right ml-6">
              <div className="mb-4">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-2">
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{group.members}</span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 text-center">members</div>
              </div>
              <button className={`px-6 py-2 rounded-lg transition-colors duration-200 ${
                group.isJoined 
                  ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}>
                {group.isJoined ? 'Joined' : 'Join Group'}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center">
              <img
                src={group.organizer.avatar}
                alt={group.organizer.name}
                className="w-8 h-8 rounded-full object-cover"
              />
              <div className="ml-2">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{group.organizer.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{group.organizer.year} • Organizer</p>
              </div>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {group.subject}
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
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Opportunities & Networking</h2>
            <p className="text-gray-600 dark:text-gray-400">Discover jobs, events, and study groups</p>
          </div>
          <button 
            onClick={() => setShowPostModal(true)}
            className="mt-4 lg:mt-0 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Post Opportunity
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1 mb-6 w-fit">
          <button
            onClick={() => setActiveTab('jobs')}
            className={`px-4 py-2 rounded-md transition-colors font-medium ${
              activeTab === 'jobs'
                ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border border-gray-200 dark:border-gray-600'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Briefcase className="h-4 w-4 inline mr-2" />
            Jobs & Internships
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`px-4 py-2 rounded-md transition-colors font-medium ${
              activeTab === 'events'
                ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border border-gray-200 dark:border-gray-600'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Calendar className="h-4 w-4 inline mr-2" />
            Events
          </button>
          <button
            onClick={() => setActiveTab('groups')}
            className={`px-4 py-2 rounded-md transition-colors font-medium ${
              activeTab === 'groups'
                ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border border-gray-200 dark:border-gray-600'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Users className="h-4 w-4 inline mr-2" />
            Study Groups
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
                  <option value="all">All {activeTab}</option>
                  {activeTab === 'jobs' && (
                    <>
                      <option value="internship">Internships</option>
                      <option value="full-time">Full-time</option>
                      <option value="remote">Remote</option>
                    </>
                  )}
                  {activeTab === 'events' && (
                    <>
                      <option value="hackathon">Hackathons</option>
                      <option value="workshop">Workshops</option>
                      <option value="free">Free Events</option>
                    </>
                  )}
                  {activeTab === 'groups' && (
                    <>
                      <option value="open">Open Groups</option>
                      <option value="exam-prep">Exam Prep</option>
                      <option value="project">Project Groups</option>
                    </>
                  )}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'jobs' && renderJobsTab()}
        {activeTab === 'events' && renderEventsTab()}
        {activeTab === 'groups' && renderStudyGroupsTab()}
      </div>

      {/* Post Modal */}
      {showPostModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Post Opportunity</h3>
              <div className="space-y-3">
                <button className="w-full p-4 text-left border border-gray-200 dark:border-gray-600 rounded-lg hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                  <div className="flex items-center">
                    <Briefcase className="h-5 w-5 text-blue-500 mr-3" />
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">Job/Internship</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Share job opportunities and internships</p>
                    </div>
                  </div>
                </button>
                <button className="w-full p-4 text-left border border-gray-200 dark:border-gray-600 rounded-lg hover:border-green-300 dark:hover:border-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-green-500 mr-3" />
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">Event</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Create hackathons, workshops, and seminars</p>
                    </div>
                  </div>
                </button>
                <button className="w-full p-4 text-left border border-gray-200 dark:border-gray-600 rounded-lg hover:border-purple-300 dark:hover:border-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-purple-500 mr-3" />
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">Study Group</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Start a study group for courses or projects</p>
                    </div>
                  </div>
                </button>
              </div>
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowPostModal(false)}
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