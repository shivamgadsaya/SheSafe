import React, { useState } from 'react';
import { motion } from 'framer-motion';

const FAQ = () => {
  // FAQ items with questions and answers
  const faqItems = [
    {
      id: 1,
      question: 'What is SheSafe?',
      answer: 'SheSafe is a comprehensive safety platform designed specifically for women. We provide real-time protection tools, community support, emergency response features, and educational resources to empower women to feel safer in their daily lives.'
    },
    {
      id: 2,
      question: 'How does the SOS feature work?',
      answer: 'The SOS feature allows you to quickly send an emergency alert to your designated emergency contacts with your current location. In serious situations, simply activate the SOS feature and your guardians will be immediately notified of your situation and location so they can provide assistance.'
    },
    {
      id: 3,
      question: 'Is my personal information secure on SheSafe?',
      answer: 'Yes, we take data security and privacy very seriously. All personal information is encrypted and stored securely. We do not share your information with third parties without your explicit consent, and we follow strict data protection protocols.'
    },
    {
      id: 4,
      question: 'Can I use SheSafe without an internet connection?',
      answer: 'Some basic features may work offline, but most of SheSafe\'s functionality requires an internet connection to send alerts, update your location, and communicate with emergency contacts. We recommend having a data plan or regular access to WiFi for the best experience.'
    },
    {
      id: 5,
      question: 'How do I add emergency contacts?',
      answer: 'To add emergency contacts, go to your Profile page and scroll to the Emergency Contacts section. Click "Add Contact" and enter their name, phone number, and relationship to you. They\'ll be notified and can confirm their status as your emergency contact.'
    },
    {
      id: 6,
      question: 'Is SheSafe available internationally?',
      answer: 'Currently, SheSafe is available in select countries with plans for global expansion. Please check our website for the most up-to-date information on availability in your region.'
    },
    {
      id: 7,
      question: 'How much does SheSafe cost?',
      answer: 'SheSafe offers both free and premium subscription options. The basic safety features are available for free, while advanced features like 24/7 professional monitoring are available with our premium subscription plans. Visit our pricing page for more details.'
    },
    {
      id: 8,
      question: 'Can men use SheSafe too?',
      answer: 'While SheSafe is designed with women\'s safety needs in mind, anyone concerned about their safety can use our platform. Our features are helpful for all individuals who want to enhance their personal safety.'
    }
  ];

  // State to track which FAQs are expanded
  const [expandedId, setExpandedId] = useState(null);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Get answers to common questions about SheSafe and our safety features.
            </p>
          </div>

          {/* FAQ Accordion */}
          <div className="space-y-4">
            {faqItems.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: item.id * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-soft overflow-hidden"
              >
                <button
                  onClick={() => toggleExpand(item.id)}
                  className="w-full px-6 py-4 text-left flex justify-between items-center focus:outline-none"
                >
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    {item.question}
                  </span>
                  <svg
                    className={`w-5 h-5 text-gray-500 dark:text-gray-400 transform transition-transform ${
                      expandedId === item.id ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                <div
                  className={`px-6 pb-4 transition-all duration-200 ${
                    expandedId === item.id ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
                  }`}
                >
                  <p className="text-gray-600 dark:text-gray-300">
                    {item.answer}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Contact Section */}
          <div className="mt-12 text-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Didn't Find Your Answer?
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Contact our support team and we'll get back to you as soon as possible.
            </p>
            <a
              href="/contact"
              className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              Contact Us
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default FAQ; 