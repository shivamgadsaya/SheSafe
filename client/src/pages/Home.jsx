import React from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Emergency SOS Button - Fixed Position */}
      <div className="fixed top-20 right-6 z-50">
        <button 
          onClick={() => navigate('/sos')} 
          className="group relative flex items-center bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full shadow-lg transition-all duration-300 hover:shadow-red-400/30 hover:shadow-xl"
        >
          <span className="absolute -left-1 -top-1 flex h-5 w-5">
            <span className="animate-ping absolute h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative rounded-full h-5 w-5 bg-red-500 flex items-center justify-center text-xs">
              !
            </span>
          </span>
          <span className="text-sm font-bold mr-1 ml-4">EMERGENCY</span>
          <span className="text-lg">🚨</span>
          <span className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 bg-red-700 text-white text-xs py-1 px-2 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            Tap for SOS Alert
          </span>
        </button>
      </div>

      {/* Hero Section - Improved Contrast */}
      <section className="relative bg-gradient-to-br from-purple-800 to-primary text-white py-24">
        {/* Removed background image overlay to improve readability */}
        <div className="max-w-5xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="space-y-8"
          >
            <h1 className="text-5xl md:text-7xl font-bold leading-none">
              Your Safety<br />
              <span className="text-yellow-300 drop-shadow-sm">Your Power</span>
            </h1>
            
            <p className="text-xl md:text-2xl font-medium text-white max-w-3xl mx-auto leading-relaxed">
              SheSafe empowers women with real-time protection, community support, and resources designed for your safety.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-5 justify-center pt-4">
              {!user ? (
                <>
                  <Link
                    to="/register"
                    className="px-8 py-4 bg-white text-primary font-bold rounded-lg hover:bg-yellow-100 transition-colors shadow-lg text-lg"
                  >
                    Join SheSafe
                  </Link>
                  <Link
                    to="/login"
                    className="px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-lg hover:bg-white/10 transition-colors text-lg"
                  >
                    Sign In
                  </Link>
                </>
              ) : (
                <Link
                  to="/dashboard"
                  className="px-8 py-4 bg-white text-primary font-bold rounded-lg hover:bg-yellow-100 transition-colors shadow-lg text-lg"
                >
                  Go to Dashboard
                </Link>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Features Section - Improved Readability */}
      <section className="py-20 px-6 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white">
              How SheSafe Protects You
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Community Feature - Improved Card */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700"
              >
                <div className="h-3 bg-blue-500"></div>
                <div className="p-8">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center text-2xl mb-5 mx-auto">
                    👥
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-center text-gray-900 dark:text-white">Community Safety</h3>
                  <p className="text-lg text-gray-700 dark:text-gray-300 text-center leading-relaxed">
                    Connect with other women to share safety updates, report incidents, and access local resources.
                  </p>
                  <div className="mt-6 text-center">
                    <button 
                      onClick={() => navigate('/community')} 
                      className="px-6 py-3 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Explore Community
                    </button>
                  </div>
                </div>
              </motion.div>
              
              {/* Guardian Network Feature - Improved Card */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700"
              >
                <div className="h-3 bg-green-500"></div>
                <div className="p-8">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center text-2xl mb-5 mx-auto">
                    👭
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-center text-gray-900 dark:text-white">Guardian Network</h3>
                  <p className="text-lg text-gray-700 dark:text-gray-300 text-center leading-relaxed">
                    Create a trusted network of friends and family who can respond quickly when you need help.
                  </p>
                  <div className="mt-6 text-center">
                    <button 
                      onClick={() => navigate('/guardians')} 
                      className="px-6 py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition-colors"
                    >
                      Set Up Guardians
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Why Choose SheSafe */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-gray-900 dark:text-white">
            Why Women Choose SheSafe
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col"
            >
              <div className="flex items-start mb-8">
                <div className="bg-primary/10 dark:bg-primary/20 p-3 rounded-lg mr-4">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Reliable Protection</h3>
                  <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                    Our SOS system works even in areas with limited connectivity, ensuring you're never truly alone.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start mb-8">
                <div className="bg-primary/10 dark:bg-primary/20 p-3 rounded-lg mr-4">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Community Support</h3>
                  <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                    Connect with a network of supportive women who share safety information and resources.
                  </p>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col"
            >
              <div className="flex items-start mb-8">
                <div className="bg-primary/10 dark:bg-primary/20 p-3 rounded-lg mr-4">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Safety Resources</h3>
                  <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                    Access a comprehensive library of safety guides, tips, and emergency contacts.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start mb-8">
                <div className="bg-primary/10 dark:bg-primary/20 p-3 rounded-lg mr-4">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Privacy Focused</h3>
                  <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                    Your data and location information are encrypted and only shared when you activate an alert.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-6 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            Trusted by Women Everywhere
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white dark:bg-gray-700 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-600"
            >
              <div className="flex items-center mb-4">
                <div className="text-yellow-400 text-2xl">★★★★★</div>
              </div>
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                "SheSafe's emergency feature helped me when I felt unsafe walking home. My guardians were alerted instantly and I felt protected."
              </p>
              <div className="font-bold text-lg text-gray-900 dark:text-white">Sarah K.</div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white dark:bg-gray-700 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-600"
            >
              <div className="flex items-center mb-4">
                <div className="text-yellow-400 text-2xl">★★★★★</div>
              </div>
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                "The community reports feature has made me more aware of areas to avoid. It's like having safety intel from other women in real-time."
              </p>
              <div className="font-bold text-lg text-gray-900 dark:text-white">Michelle T.</div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="bg-white dark:bg-gray-700 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-600"
            >
              <div className="flex items-center mb-4">
                <div className="text-yellow-400 text-2xl">★★★★★</div>
              </div>
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                "As a college student, having SheSafe gives me and my parents peace of mind. The guardian network feature is a game-changer."
              </p>
              <div className="font-bold text-lg text-gray-900 dark:text-white">Jasmine R.</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto bg-primary rounded-xl overflow-hidden shadow-xl">
          <div className="p-10 md:p-14 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Join the SheSafe Community Today</h2>
            <p className="text-xl mb-8 text-white opacity-90 max-w-2xl mx-auto leading-relaxed">
              Your safety matters. Take the first step towards peace of mind with SheSafe's protection tools.
            </p>
            {!user ? (
              <Link
                to="/register"
                className="px-10 py-4 bg-white text-primary font-bold rounded-lg hover:bg-yellow-100 transition-colors shadow-lg text-lg inline-block"
              >
                Sign Up For Free
              </Link>
            ) : (
              <Link
                to="/dashboard"
                className="px-10 py-4 bg-white text-primary font-bold rounded-lg hover:bg-yellow-100 transition-colors shadow-lg text-lg inline-block"
              >
                Go to Dashboard
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 