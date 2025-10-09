import React, { useState } from 'react';
import {
  Camera,
  Mail,
  School,
  BookOpen,
  Calendar,
  MapPin,
  Link as LinkIcon,
  Edit3,
  Save,
  X,
  Award,
  Users,
  TrendingUp,
  Github,
  Linkedin,
  Plus,
  Globe,
  Hash,
} from 'lucide-react';

interface ProfileProps {
  currentUser: any;
}

export const Profile: React.FC<ProfileProps> = ({ currentUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: currentUser.name,
    email: currentUser.email,
    rollNumber: currentUser.rollNumber,
    college: currentUser.college,
    branch: currentUser.branch,
    year: currentUser.year,
    bio: currentUser.bio,
    location: 'Stanford, CA',
    website: 'https://alexjohnson.dev',
    github: 'https://github.com/alexjohnson',
    linkedin: 'https://linkedin.com/in/alexjohnson',
  });

  const handleSave = () => {
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const stats = [
    {
      label: 'Karma Points',
      value: currentUser.karma.toLocaleString(),
      icon: Award,
      color: 'text-blue-600',
    },
    {
      label: 'Connections',
      value: currentUser.connections.toString(),
      icon: Users,
      color: 'text-teal-600',
    },
    { 
      label: 'Posts', 
      value: '23', 
      icon: TrendingUp, 
      color: 'text-green-600' 
    },
    {
      label: 'Resources Shared',
      value: '12',
      icon: BookOpen,
      color: 'text-purple-600',
    },
  ];

  const recentActivity = [
    {
      id: 1,
      type: 'resource',
      title: 'Uploaded Data Structures Notes',
      time: '2 days ago',
    },
    {
      id: 2,
      type: 'post',
      title: 'Posted about algorithm study group',
      time: '3 days ago',
    },
    {
      id: 3,
      type: 'comment',
      title: 'Commented on Machine Learning discussion',
      time: '1 week ago',
    },
    {
      id: 4,
      type: 'resource',
      title: 'Downloaded Database Project Template',
      time: '1 week ago',
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 mb-6 relative overflow-hidden">
          <div className="relative">
            <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
              <div className="relative">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-gray-700"
                />
                <button className="absolute bottom-0 right-0 bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 p-2 rounded-full border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                  <Camera className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                  <div>
                    <h1 className="text-2xl lg:text-3xl font-bold mb-2 text-gray-900 dark:text-white">
                      {profileData.name}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 text-lg">
                      {profileData.branch} • Year {profileData.year}
                    </p>
                    <p className="text-gray-500 dark:text-gray-400">{profileData.college}</p>
                    <div className="flex items-center mt-2 text-sm text-gray-500 dark:text-gray-400">
                      <Hash className="h-4 w-4 mr-1" />
                      <span>Roll: {profileData.rollNumber}</span>
                    </div>
                  </div>

                  <div className="mt-4 lg:mt-0">
                    {!isEditing ? (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center"
                      >
                        <Edit3 className="h-4 w-4 mr-2" />
                        Edit Profile
                      </button>
                    ) : (
                      <div className="flex space-x-3">
                        <button
                          onClick={handleSave}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                        >
                          <Save className="h-4 w-4 mr-2" />
                          Save
                        </button>
                        <button
                          onClick={handleCancel}
                          className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 text-center hover:border-blue-300 dark:hover:border-blue-600 transition-colors duration-200"
            >
              <div className="flex items-center justify-center mb-2">
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Badges */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Achievements & Badges
          </h3>
          <div className="flex flex-wrap gap-3">
            {currentUser.badges.map((badge: string, index: number) => (
              <div
                key={index}
                className="flex items-center bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 px-4 py-2 rounded-full border border-blue-200 dark:border-blue-700"
              >
                <Award className="h-4 w-4 mr-2 text-blue-600 dark:text-blue-400" />
                <span className="font-medium">{badge}</span>
              </div>
            ))}
            <div className="flex items-center bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-4 py-2 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600">
              <Plus className="h-4 w-4 mr-2" />
              <span>Earn more badges</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Information */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Profile Information
              </h2>

              <div className="space-y-6">
                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Bio
                  </label>
                  {isEditing ? (
                    <textarea
                      value={profileData.bio}
                      onChange={(e) =>
                        setProfileData({ ...profileData, bio: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={4}
                    />
                  ) : (
                    <p className="text-gray-600 dark:text-gray-300">{profileData.bio}</p>
                  )}
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Mail className="h-4 w-4 mr-2" />
                      Email
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            email: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-600 dark:text-gray-300">{profileData.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <MapPin className="h-4 w-4 mr-2" />
                      Location
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.location}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            location: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-600 dark:text-gray-300">{profileData.location}</p>
                    )}
                  </div>
                </div>

                {/* Academic Information */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <School className="h-4 w-4 mr-2" />
                      University
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.college}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            college: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-600 dark:text-gray-300">{profileData.college}</p>
                    )}
                  </div>

                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Course/Major
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.branch}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            branch: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-600 dark:text-gray-300">{profileData.branch}</p>
                    )}
                  </div>

                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Calendar className="h-4 w-4 mr-2" />
                      Year of Study
                    </label>
                    {isEditing ? (
                      <select
                        value={profileData.year}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            year: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="1">1st Year</option>
                        <option value="2">2nd Year</option>
                        <option value="3">3rd Year</option>
                        <option value="4">4th Year</option>
                        <option value="graduate">Graduate</option>
                      </select>
                    ) : (
                      <p className="text-gray-600 dark:text-gray-300">Year {profileData.year}</p>
                    )}
                  </div>
                </div>

                {/* Social Links */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Globe className="h-4 w-4 mr-2" />
                      Website
                    </label>
                    {isEditing ? (
                      <input
                        type="url"
                        value={profileData.website}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            website: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <a
                        href={profileData.website}
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {profileData.website}
                      </a>
                    )}
                  </div>

                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Github className="h-4 w-4 mr-2" />
                      GitHub
                    </label>
                    {isEditing ? (
                      <input
                        type="url"
                        value={profileData.github}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            github: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <a
                        href={profileData.github}
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {profileData.github}
                      </a>
                    )}
                  </div>

                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Linkedin className="h-4 w-4 mr-2" />
                      LinkedIn
                    </label>
                    {isEditing ? (
                      <input
                        type="url"
                        value={profileData.linkedin}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            linkedin: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <a
                        href={profileData.linkedin}
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {profileData.linkedin}
                      </a>
                    )}
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Skills
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={currentUser.skills.join(', ')}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Python, React, Machine Learning..."
                    />
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {currentUser.skills.map(
                        (skill: string, index: number) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-700"
                          >
                            {skill}
                          </span>
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Recent Activity
            </h2>

            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="border-l-4 border-blue-200 dark:border-blue-700 pl-4 py-2"
                >
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {activity.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};