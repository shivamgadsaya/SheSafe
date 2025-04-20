import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaShieldAlt, FaPhone, FaExclamationTriangle, FaBook, FaArrowRight, FaUsers, FaHeart, FaHandsHelping, FaLightbulb, FaBell, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { IoMdAlert } from 'react-icons/io';

// Daily Safety Tips Component
const DailySafetyTips = () => {
  // Extended safety tips with categories
  const allSafetyTips = [
    {
      category: "Personal Safety",
      tips: [
        "When walking alone at night, stay in well-lit areas and keep a friend updated about your location.",
        "Share your live location with a trusted friend when traveling to new places.",
        "Always keep emergency numbers saved and easily accessible on your phone.",
        "Consider taking self-defense classes to build confidence and skills.",
        "Use the buddy system when possible in unfamiliar areas or at night.",
        "Trust your instincts - if something feels wrong, remove yourself from the situation.",
        "Avoid displaying valuable items in public that might attract attention."
      ]
    },
    {
      category: "Travel Safety",
      tips: [
        "Research your destination thoroughly before traveling, especially regarding safe areas.",
        "Keep your ID and emergency contact info on you at all times while traveling.",
        "Use registered transportation services and verify vehicle details before entering.",
        "Stay alert when using public transportation, especially during late hours.",
        "Keep digital copies of important documents accessible from your secure cloud storage.",
        "Learn a few phrases in the local language if traveling internationally."
      ]
    },
    {
      category: "Digital Safety",
      tips: [
        "Use strong, unique passwords for each of your important accounts.",
        "Enable two-factor authentication on all your important digital accounts.",
        "Be cautious about sharing personal information on social media platforms.",
        "Regularly update your device operating systems and applications.",
        "Use a VPN when connecting to public Wi-Fi networks.",
        "Review app permissions regularly - limit location access to when the app is in use."
      ]
    }
  ];

  // Flatten all tips for easy access
  const flattenedTips = allSafetyTips.flatMap(category => category.tips);
  
  const [tipIndex, setTipIndex] = useState(0);
  const [currentCategory, setCurrentCategory] = useState("Personal Safety");
  
  useEffect(() => {
    // Rotate safety tips every 24 hours
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    setTipIndex(dayOfYear % flattenedTips.length);
    
    // Find the category of the current tip
    for (const category of allSafetyTips) {
      if (category.tips.includes(flattenedTips[tipIndex])) {
        setCurrentCategory(category.category);
        break;
      }
    }
  }, [tipIndex]);
  
  const nextTip = () => {
    setTipIndex((prevIndex) => (prevIndex + 1) % flattenedTips.length);
  };
  
  const prevTip = () => {
    setTipIndex((prevIndex) => (prevIndex - 1 + flattenedTips.length) % flattenedTips.length);
  };
  
  return (
    <motion.div 
      className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-xl shadow-md"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <span className="mr-2">💡</span> Daily Safety Tip
          <span className="ml-2 text-xs px-2 py-1 bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 rounded-full">{currentCategory}</span>
        </h3>
        <div className="flex space-x-2">
          <button 
            onClick={prevTip} 
            className="p-1 rounded-full hover:bg-yellow-200 dark:hover:bg-yellow-800 transition-colors"
            aria-label="Previous tip"
          >
            <FaChevronLeft className="text-yellow-700 dark:text-yellow-300" />
          </button>
          <button 
            onClick={nextTip} 
            className="p-1 rounded-full hover:bg-yellow-200 dark:hover:bg-yellow-800 transition-colors"
            aria-label="Next tip"
          >
            <FaChevronRight className="text-yellow-700 dark:text-yellow-300" />
          </button>
        </div>
      </div>
      <p className="text-gray-600 dark:text-gray-300 mt-2">
        {flattenedTips[tipIndex]}
      </p>
      <div className="mt-4 flex justify-between items-center">
        <div className="flex">
          {[...Array(5)].map((_, i) => (
            <div 
              key={i} 
              className={`h-1.5 w-1.5 rounded-full mx-0.5 ${Math.floor(tipIndex/5) === i ? 'bg-yellow-500' : 'bg-yellow-200 dark:bg-yellow-700'}`}
            />
          ))}
        </div>
        <Link to="/resources" className="text-sm text-yellow-700 dark:text-yellow-300 hover:underline flex items-center">
          More Safety Tips
          <FaArrowRight className="ml-1 h-3 w-3" />
        </Link>
      </div>
    </motion.div>
  );
};

const Dashboard = () => {
  const { user, loading } = useAuth();
  const [safetyScore, setSafetyScore] = useState(78);
  const [recentActivity, setRecentActivity] = useState([
    { id: 1, type: 'report', title: 'Suspicious activity reported near Central Park', time: '2 hours ago' },
    { id: 2, type: 'forum', title: 'New safety discussion: Evening commute routes', time: '3 hours ago' },
    { id: 3, type: 'alert', title: 'Safety alert: Construction area on Main Street', time: '5 hours ago' },
  ]);
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1 
      } 
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  // Add navigation hook for SOS button
  const navigate = useNavigate();

  // Function to handle emergency SOS click
  const handleEmergencySOS = () => {
    navigate('/sos');
  };

  // Add a fallback UI for when data is not ready
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-10">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-10"
        >
          {/* Welcome Header with Safety Score */}
          <motion.div 
            variants={itemVariants}
            className="bg-gradient-to-r from-primary/10 to-blue-400/10 dark:from-primary/20 dark:to-blue-400/20 p-8 rounded-2xl"
          >
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-center md:text-left mb-6 md:mb-0">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome, {user?.name || 'Friend'}!
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
                  Your personal safety dashboard is ready.
                </p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md flex items-center space-x-4">
                <div className="relative w-16 h-16">
                  <svg className="w-full h-full" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#eee"
                      strokeWidth="3"
                      strokeDasharray="100, 100"
                    />
                    <path
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke={safetyScore > 75 ? "#4ade80" : safetyScore > 50 ? "#facc15" : "#f87171"}
                      strokeWidth="3"
                      strokeDasharray={`${safetyScore}, 100`}
                    />
                    <text x="18" y="21" textAnchor="middle" className="text-lg font-semibold fill-gray-900 dark:fill-white">{safetyScore}</text>
                  </svg>
            </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Safety Score</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Update your profile to improve</p>
            </div>
            </div>
            </div>
          </motion.div>

          {/* Quick Access */}
          <motion.div variants={itemVariants}>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              Quick Access
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Emergency SOS */}
              <Link to="/sos" className="block">
                <div className="bg-red-500 rounded-lg p-6 text-white h-full hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-center mb-4">
                    <div className="text-4xl">🚨</div>
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-center">Emergency SOS</h3>
                  <p className="text-sm text-center">
                    Send alert with your location to emergency contacts
                  </p>
                </div>
              </Link>
              
              {/* Community Safety */}
              <Link to="/community" className="block">
                <div className="bg-blue-500 rounded-lg p-6 text-white h-full hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-center mb-4">
                    <div className="text-4xl">👥</div>
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-center">Community Safety</h3>
                  <p className="text-sm text-center">
                    View and report safety concerns in your community
                  </p>
                </div>
              </Link>
              
              {/* Guardian Network */}
              <Link to="/guardians" className="block">
                <div className="bg-green-500 rounded-lg p-6 text-white h-full hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-center mb-4">
                    <div className="text-4xl">👭</div>
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-center">Guardian Network</h3>
                  <p className="text-sm text-center">
                    Manage your trusted contacts and guardians
                  </p>
                </div>
              </Link>
              
              {/* Report Incident */}
              <Link to="/report-incident" className="block">
                <div className="bg-yellow-500 rounded-lg p-6 text-white h-full hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-center mb-4">
                    <div className="text-4xl">⚠️</div>
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-center">Report Incident</h3>
                  <p className="text-sm text-center">
                    Report safety concerns or incidents in your area
                  </p>
                </div>
              </Link>
            </div>
          </motion.div>

          {/* Activity Summary and Recent Community Activity - Two Column Layout */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Activity Summary */}
            <div className="md:col-span-1 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your Activity</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-300">Guardian Contacts</span>
                  <span className="font-medium text-gray-900 dark:text-white">3</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-300">Reports Submitted</span>
                  <span className="font-medium text-gray-900 dark:text-white">2</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-300">Forum Contributions</span>
                  <span className="font-medium text-gray-900 dark:text-white">5</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">SOS Alerts (30 days)</span>
                  <span className="font-medium text-gray-900 dark:text-white">0</span>
                </div>
                <Link to="/profile" className="block mt-4">
                  <button className="w-full py-2 px-4 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors">
                    View Full Activity
                  </button>
                </Link>
              </div>
            </div>
            
            {/* Recent Community Activity */}
            <div className="md:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Community Activity</h3>
              <div className="space-y-4">
                {recentActivity.map(activity => (
                  <div key={activity.id} className="flex items-start space-x-4 pb-4 border-b dark:border-gray-700">
                    <div className={`mt-1 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white
                      ${activity.type === 'report' ? 'bg-yellow-500' : 
                        activity.type === 'forum' ? 'bg-blue-500' : 'bg-red-500'}`}>
                      {activity.type === 'report' ? '📝' : 
                        activity.type === 'forum' ? '💬' : '🔔'}
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900 dark:text-white font-medium">{activity.title}</p>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">{activity.time}</p>
                    </div>
                  </div>
                ))}
                <Link to="/community" className="block text-center">
                  <button className="py-2 px-4 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors">
                    View All Community Activity
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Stats Section */}
          <motion.div 
            variants={itemVariants}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">SheSafe Community Impact</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">10K+</div>
                <div className="text-gray-500 dark:text-gray-400">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">500+</div>
                <div className="text-gray-500 dark:text-gray-400">Emergency Responders</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">24/7</div>
                <div className="text-gray-500 dark:text-gray-400">Support Available</div>
              </div>
            </div>
          </motion.div>

          {/* Daily Safety Tip */}
          <DailySafetyTips />
          
          {/* Safety Resources */}
          <motion.div variants={itemVariants}>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Safety Resources
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/20 rounded-full flex items-center justify-center">
                    <span className="text-2xl">📚</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Emergency Contacts</h3>
                </div>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li className="flex items-center">
                    <span className="mr-2">•</span>
                    <span>Police Emergency: <strong>911</strong></span>
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">•</span>
                    <span>Women's Helpline: <strong>1-800-799-7233</strong></span>
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">•</span>
                    <span>Crisis Text Line: Text <strong>HOME to 741741</strong></span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🔍</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Safety Guides</h3>
                </div>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li className="flex items-center">
                    <span className="mr-2">•</span>
                    <Link to="/resources" className="text-primary hover:underline">Personal Safety Guidelines</Link>
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">•</span>
                    <Link to="/resources" className="text-primary hover:underline">Travel Safety Tips</Link>
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">•</span>
                    <Link to="/resources" className="text-primary hover:underline">Digital Privacy Protection</Link>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
      
      {/* Fixed Floating SOS Button */}
      <button 
        onClick={handleEmergencySOS}
        className="fixed-sos-button"
        aria-label="Emergency SOS"
      >
        <IoMdAlert size={28} />
        <span>SOS</span>
      </button>
      
      <style jsx>{`
        .fixed-sos-button {
          position: fixed;
          bottom: 30px;
          right: 30px;
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ff4d4d, #ff0000);
          color: white;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border: none;
          box-shadow: 0 4px 15px rgba(255, 0, 0, 0.4), 0 0 20px rgba(255, 0, 0, 0.2);
          cursor: pointer;
          z-index: 1000;
          transition: all 0.3s ease;
          font-weight: bold;
          font-size: 16px;
          animation: pulse 2s infinite;
        }
        
        .fixed-sos-button:hover {
          transform: scale(1.05);
          box-shadow: 0 6px 18px rgba(255, 0, 0, 0.5), 0 0 25px rgba(255, 0, 0, 0.3);
        }
        
        .fixed-sos-button:active {
          transform: scale(0.95);
        }
        
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(255, 0, 0, 0.7);
          }
          70% {
            box-shadow: 0 0 0 15px rgba(255, 0, 0, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(255, 0, 0, 0);
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard; 