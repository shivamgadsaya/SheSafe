import React from 'react';
import { motion } from 'framer-motion';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-soft p-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Privacy Policy
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Last Updated: April 15, 2025
          </p>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
              1. Introduction
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Welcome to SheSafe. We are committed to protecting your privacy and providing a safe and secure experience for all our users. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and website.
            </p>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the application.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
              2. Information We Collect
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              We collect information that you provide directly to us when you:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-600 dark:text-gray-300">
              <li>Register for an account</li>
              <li>Fill out your profile</li>
              <li>Add emergency contacts</li>
              <li>Use our SOS features</li>
              <li>Communicate with us</li>
              <li>Report safety concerns</li>
            </ul>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              The types of information we may collect include:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-600 dark:text-gray-300">
              <li>Personal identifiers (name, email address, phone number)</li>
              <li>Emergency contact information</li>
              <li>Location data (when you use our location-based services)</li>
              <li>Device information and usage data</li>
              <li>Communication data (messages sent through our platform)</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
              3. How We Use Your Information
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              We use the information we collect for various purposes, including to:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-600 dark:text-gray-300">
              <li>Provide, maintain, and improve our services</li>
              <li>Process and complete transactions</li>
              <li>Send alerts and notifications to your emergency contacts</li>
              <li>Respond to your comments, questions, and requests</li>
              <li>Communicate with you about products, services, and events</li>
              <li>Monitor and analyze trends, usage, and activities</li>
              <li>Detect, investigate, and prevent fraudulent transactions and other illegal activities</li>
              <li>Comply with our legal obligations</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
              4. Sharing Your Information
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              We may share the information we collect in various ways, including:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-600 dark:text-gray-300">
              <li>With your emergency contacts when you activate SOS features</li>
              <li>With vendors, consultants, and other service providers who need access to such information to carry out work on our behalf</li>
              <li>In response to a request for information if we believe disclosure is in accordance with, or required by, any applicable law or legal process</li>
              <li>If we believe your actions are inconsistent with our user agreements or policies, or to protect the rights, property, and safety of SheSafe or others</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
              5. Your Choices
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Account Information: You may update, correct, or delete your account information at any time by logging into your account settings. If you wish to delete your account, please contact us.
            </p>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Location Information: You can prevent us from collecting location information by disabling location services on your device, but this may limit your ability to use certain features of our Services.
            </p>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Cookies: Most web browsers are set to accept cookies by default. If you prefer, you can usually choose to set your browser to remove or reject browser cookies.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
              6. Data Security
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction. However, no internet or email transmission is ever fully secure or error-free.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
              7. Children's Privacy
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Our Services are not directed to children under 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and you believe your child has provided us with personal information without your consent, please contact us.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
              8. Changes to this Privacy Policy
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              We may change this privacy policy from time to time. If we make changes, we will notify you by revising the date at the top of the policy and, in some cases, we may provide you with additional notice.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
              9. Contact Us
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              If you have any questions about this privacy policy or our privacy practices, please contact us at:
            </p>
            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mb-4">
              <p className="text-gray-700 dark:text-gray-300">SheSafe Privacy Team</p>
              <p className="text-gray-700 dark:text-gray-300">Email: privacy@shesafe.com</p>
              <p className="text-gray-700 dark:text-gray-300">Phone: +1 (555) 123-4567</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PrivacyPolicy; 