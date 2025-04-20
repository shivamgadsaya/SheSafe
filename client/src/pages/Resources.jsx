import React, { useState } from 'react';
import { motion } from 'framer-motion';

const Resources = () => {
  const [expandedResource, setExpandedResource] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Expand/collapse a resource
  const toggleResource = (id) => {
    if (expandedResource === id) {
      setExpandedResource(null);
    } else {
      setExpandedResource(id);
    }
  };
  
  // Filter resources by category
  const filterByCategory = (category) => {
    setSelectedCategory(category);
    setExpandedResource(null);
  };

  // Resource categories
  const resourceCategories = [
    {
      id: 'self_defense',
      title: 'Self-Defense Tips',
      icon: '🥋',
      description: 'Learn basic self-defense techniques to protect yourself.'
    },
    {
      id: 'legal',
      title: 'Legal Resources',
      icon: '⚖️',
      description: 'Information about legal rights and resources available to women.'
    },
    {
      id: 'safety',
      title: 'Safety Guidelines',
      icon: '📝',
      description: 'Practical guidelines for staying safe in various situations.'
    },
    {
      id: 'local',
      title: 'Local Support',
      icon: '🏢',
      description: 'Find support centers and helplines in your area.'
    }
  ];
  
  // Detailed resources
  const resources = [
    {
      id: 1,
      title: 'Basic Self-Defense Moves',
      category: 'self_defense',
      description: 'Learn five essential self-defense moves that can help you escape dangerous situations.',
      content: `
        <h3>5 Essential Self-Defense Techniques</h3>
        <ol>
          <li><strong>Palm Strike:</strong> Use the heel of your palm to strike the attacker's nose or chin. Keep your fingers bent to avoid injury.</li>
          <li><strong>Elbow Strike:</strong> Use your elbow to strike an attacker who is close to you. Aim for the chin, neck, or solar plexus.</li>
          <li><strong>Knee Strike:</strong> Drive your knee upward into the attacker's groin or thigh.</li>
          <li><strong>Front Kick:</strong> Kick directly forward with the bottom of your foot, aiming for the attacker's knee or groin.</li>
          <li><strong>Wrist Release:</strong> If someone grabs your wrist, rotate your arm toward the attacker's thumb (the weakest part of their grip) and pull sharply away.</li>
        </ol>
        <p>Remember, the goal of self-defense is to create an opportunity to escape, not to engage in a prolonged fight.</p>
      `,
      downloadLink: '#',
      videoLink: 'https://www.youtube.com/watch?v=example1',
      thumbnail: 'https://images.unsplash.com/photo-1517637382994-f02da38c6728'
    },
    {
      id: 2,
      title: 'Situational Awareness Guide',
      category: 'safety',
      description: 'How to stay aware of your surroundings and identify potential threats before they become dangerous.',
      content: `
        <h3>Developing Situational Awareness</h3>
        <p>Situational awareness is the practice of being aware of what's happening around you and identifying potential threats.</p>
        <h4>Key Elements:</h4>
        <ul>
          <li>Stay off your phone when walking alone</li>
          <li>Notice people who seem out of place or are paying undue attention to you</li>
          <li>Be aware of potential escape routes</li>
          <li>Trust your instincts - if something feels wrong, it probably is</li>
          <li>Plan your route before you leave, especially at night</li>
        </ul>
        <p>Remember the color code system:</p>
        <ul>
          <li><strong>White:</strong> Unaware and unprepared</li>
          <li><strong>Yellow:</strong> Relaxed alert, aware of surroundings</li>
          <li><strong>Orange:</strong> Specific alert, something is not right</li>
          <li><strong>Red:</strong> Ready to take action</li>
        </ul>
        <p>Most people should stay in Yellow when in public places.</p>
      `,
      downloadLink: '#',
      thumbnail: 'https://images.unsplash.com/photo-1551825687-f9de1603ed8b'
    },
    {
      id: 3,
      title: 'Know Your Rights Handbook',
      category: 'legal',
      description: 'A comprehensive guide to legal protections for women dealing with harassment or discrimination.',
      content: `
        <h3>Legal Rights Every Woman Should Know</h3>
        <h4>Workplace Rights:</h4>
        <ul>
          <li>Protection from sexual harassment under Title VII</li>
          <li>Right to equal pay for equal work</li>
          <li>Protection from pregnancy discrimination</li>
          <li>Right to reasonable accommodations for pregnancy and related conditions</li>
        </ul>
        <h4>Domestic Situations:</h4>
        <ul>
          <li>Right to obtain a restraining order/order of protection</li>
          <li>Protection under the Violence Against Women Act</li>
          <li>Access to emergency housing and support services</li>
        </ul>
        <h4>Public Safety:</h4>
        <ul>
          <li>Right to report crimes without fear of retaliation</li>
          <li>Right to a sexual assault forensic exam without filing a police report</li>
          <li>Right to a victim advocate during medical and legal proceedings</li>
        </ul>
        <p>Remember: Legal rights vary by jurisdiction. Consult with a qualified attorney for advice specific to your situation.</p>
      `,
      downloadLink: '#',
      thumbnail: 'https://images.unsplash.com/photo-1589994965851-a7f82d10097b'
    },
    {
      id: 4,
      title: 'Campus Safety Checklist',
      category: 'safety',
      description: 'Essential safety tips for college students living on or off campus.',
      content: `
        <h3>Campus Safety Checklist</h3>
        <h4>Dorm/Apartment Safety:</h4>
        <ul>
          <li>Always lock your door, even for quick trips to the bathroom</li>
          <li>Never prop open exterior doors</li>
          <li>Don't let strangers tailgate into buildings</li>
          <li>Have a plan for emergencies including fire escapes</li>
        </ul>
        <h4>Walking on Campus:</h4>
        <ul>
          <li>Use well-lit, populated paths</li>
          <li>Utilize campus safety escorts when available</li>
          <li>Let someone know where you're going and when you expect to arrive</li>
          <li>Keep your phone charged but not in your hand while walking</li>
        </ul>
        <h4>Party Safety:</h4>
        <ul>
          <li>Go with friends and leave with the same friends</li>
          <li>Never leave drinks unattended</li>
          <li>Set drink limits in advance</li>
          <li>Have a designated driver or plan for safe transportation</li>
        </ul>
        <h4>Digital Safety:</h4>
        <ul>
          <li>Use caution when sharing your location on social media</li>
          <li>Adjust privacy settings on social accounts</li>
          <li>Be cautious about sharing class schedules publicly</li>
        </ul>
      `,
      downloadLink: '#',
      thumbnail: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1'
    },
    {
      id: 5,
      title: 'Local Support Directory',
      category: 'local',
      description: 'A comprehensive list of support services, shelters, and crisis centers in your area.',
      content: `
        <h3>Emergency Resources</h3>
        <ul>
          <li><strong>National Domestic Violence Hotline:</strong> 1-800-799-7233</li>
          <li><strong>RAINN (Rape, Abuse & Incest National Network):</strong> 1-800-656-HOPE (4673)</li>
          <li><strong>Crisis Text Line:</strong> Text HOME to 741741</li>
        </ul>
        
        <h3>Local Support Centers</h3>
        <ul>
          <li><strong>Women's Center:</strong> 123 Main St, Cityville • (555) 123-4567</li>
          <li><strong>Safe Harbor Shelter:</strong> 456 Oak Ave, Cityville • (555) 234-5678</li>
          <li><strong>Community Legal Aid:</strong> 789 Pine Blvd, Cityville • (555) 345-6789</li>
          <li><strong>Mental Health Services:</strong> 321 Maple Dr, Cityville • (555) 456-7890</li>
        </ul>
        
        <p>Most services offer 24/7 support and confidential assistance. Many provide services regardless of ability to pay.</p>
        
        <h3>Mobile Apps</h3>
        <ul>
          <li><strong>Circle of 6:</strong> Quickly contact 6 trusted friends with pre-programmed messages</li>
          <li><strong>SafeTrek:</strong> Hold a button when you feel unsafe, release and enter pin when safe</li>
          <li><strong>bSafe:</strong> SOS alerts with GPS location to designated contacts</li>
        </ul>
      `,
      downloadLink: '#',
      thumbnail: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca'
    },
    {
      id: 6,
      title: 'Travel Safety Guide',
      category: 'safety',
      description: 'Essential tips for staying safe while traveling domestically or internationally.',
      content: `
        <h3>Travel Safety Tips</h3>
        <h4>Before Your Trip:</h4>
        <ul>
          <li>Research your destination thoroughly</li>
          <li>Share your itinerary with trusted contacts</li>
          <li>Register with the embassy if traveling internationally</li>
          <li>Purchase travel insurance that includes medical evacuation</li>
          <li>Learn a few key phrases in the local language</li>
        </ul>
        <h4>Accommodation Safety:</h4>
        <ul>
          <li>Choose well-reviewed, safe neighborhoods</li>
          <li>Request rooms away from ground level and stairwells</li>
          <li>Use all additional locks when in your room</li>
          <li>Don't answer your door without verifying who's there</li>
        </ul>
        <h4>Day-to-Day Safety:</h4>
        <ul>
          <li>Keep valuables concealed and distributed (not all in one bag)</li>
          <li>Carry a dummy wallet with a small amount of cash</li>
          <li>Stay in well-lit, populated areas</li>
          <li>Use official transportation options</li>
          <li>Trust your instincts - if something feels wrong, leave the situation</li>
        </ul>
        <h4>Digital Safety:</h4>
        <ul>
          <li>Use a VPN when connecting to public WiFi</li>
          <li>Be cautious about sharing real-time location updates</li>
          <li>Consider a temporary travel phone</li>
        </ul>
      `,
      downloadLink: '#',
      thumbnail: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf'
    }
  ];
  
  // Filter resources based on selected category
  const filteredResources = selectedCategory === 'all' 
    ? resources 
    : resources.filter(resource => resource.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              📚 Safety Resources
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Access valuable resources to enhance your safety and well-being. From self-defense tips to legal guidance, we're here to support you.
            </p>
          </div>
          
          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <button
              onClick={() => filterByCategory('all')}
              className={`px-5 py-3 rounded-lg text-sm font-medium shadow-sm ${
                selectedCategory === 'all'
                  ? 'bg-primary text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              All Resources
            </button>
            {resourceCategories.map(category => (
              <button
                key={category.id}
                onClick={() => filterByCategory(category.id)}
                className={`px-5 py-3 rounded-lg text-sm font-medium shadow-sm ${
                  selectedCategory === category.id
                    ? 'bg-primary text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                <span className="mr-2">{category.icon}</span> {category.title}
              </button>
            ))}
          </div>

          {/* Filtered Resources */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {selectedCategory === 'all' ? 'All Resources' : 
                resourceCategories.find(c => c.id === selectedCategory)?.title || 'Resources'}
              {selectedCategory !== 'all' && (
                <span className="text-gray-500 dark:text-gray-400 text-lg font-normal ml-3">
                  ({filteredResources.length} {filteredResources.length === 1 ? 'resource' : 'resources'})
                </span>
              )}
            </h2>
            
            <div className="space-y-6">
              {filteredResources.map(resource => (
                <motion.div
                  key={resource.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-soft overflow-hidden"
                >
                  <div 
                    className="p-6 cursor-pointer flex items-center justify-between"
                    onClick={() => toggleResource(resource.id)}
                  >
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        {resource.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        {resource.description}
                      </p>
                    </div>
                    <div>
                      <svg 
                        className={`h-6 w-6 text-gray-500 transform transition-transform ${expandedResource === resource.id ? 'rotate-180' : ''}`} 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  
                  {expandedResource === resource.id && (
                    <div className="p-6 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
                      <div className="flex flex-col md:flex-row gap-6">
                        {resource.thumbnail && (
                          <div className="md:w-1/3">
                            <img 
                              src={resource.thumbnail} 
                              alt={resource.title} 
                              className="w-full h-48 object-cover rounded-lg"
                            />
                          </div>
                        )}
                        <div className={resource.thumbnail ? "md:w-2/3" : "w-full"}>
                          <div 
                            className="prose dark:prose-invert max-w-none" 
                            dangerouslySetInnerHTML={{ __html: resource.content }}
                          />
                          
                          <div className="mt-4 flex flex-wrap gap-2">
                            {resource.downloadLink && (
                              <a 
                                href={resource.downloadLink} 
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 inline-flex items-center"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Download PDF
                              </a>
                            )}
                            {resource.videoLink && (
                              <a 
                                href={resource.videoLink} 
                                className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 inline-flex items-center"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Watch Video
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
            
            {filteredResources.length === 0 && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-8 text-center">
                <p className="text-gray-500 dark:text-gray-400">
                  No resources found in this category.
                </p>
              </div>
            )}
          </div>

          {/* Coming Soon Section */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg mt-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              More Resources Coming Soon
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              We're constantly expanding our resource library to provide you with the most comprehensive safety information. Check back regularly for updates!
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Resources; 