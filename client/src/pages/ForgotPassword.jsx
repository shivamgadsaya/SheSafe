import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Spinner } from '../components/Spinner';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [resetRequested, setResetRequested] = useState(false);
  const [resetLink, setResetLink] = useState('');
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  
  const { forgotPassword, networkStatus } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setMessage({ type: 'error', text: 'Please enter a valid email address' });
      return;
    }
    
    try {
      setIsSubmitting(true);
      setMessage(null);
      
      if (!networkStatus.isOnline) {
        setMessage({ type: 'error', text: 'You are offline. Please check your internet connection and try again.' });
        return;
      }
      
      const result = await forgotPassword(email);
      
      if (result.success) {
        setResetRequested(true);
        setMessage({ type: 'success', text: 'Password reset instructions have been sent to your email. Please check your inbox (and spam folder) for the reset link.' });
        
        // Store reset link for development display
        if (result.resetLink) {
          setResetLink(result.resetLink);
          // In development, automatically show debug info
          if (process.env.NODE_ENV !== 'production') {
            setShowDebugInfo(true);
          }
        }
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to send reset link. Please try again.' });
      }
    } catch (error) {
      console.error('Request reset error:', error);
      setMessage({ type: 'error', text: 'An unexpected error occurred. Please try again later.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
          Password Reset
        </h2>
        <p className="mt-2 text-center text-sm text-gray-400">
          Enter your email to request a password reset link.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {resetRequested ? (
            <div className="text-center py-4">
              <svg className="mx-auto h-12 w-12 text-green-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-white">Reset Link Sent</h3>
              <p className="mt-1 text-sm text-gray-400">
                We've sent a password reset link to <span className="font-medium text-gray-300">{email}</span>. 
                Please check your email inbox and spam folder.
              </p>
              <p className="mt-3 text-xs text-gray-500">
                If you don't receive an email within a few minutes, try requesting again.
              </p>
              
              {/* Debug section - for development only */}
              {resetLink && (
                <div className="mt-6">
                  <button
                    type="button"
                    className="text-sm text-gray-400 hover:text-indigo-400 flex items-center"
                    onClick={() => setShowDebugInfo(!showDebugInfo)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {showDebugInfo ? "Hide Debug Info" : "Show Debug Info"}
                  </button>
                  
                  {showDebugInfo && (
                    <div className="mt-2 p-3 bg-gray-900 border border-gray-700 rounded-md text-xs text-left">
                      <p className="text-gray-400 mb-1">For development purposes only:</p>
                      <div className="mb-2">
                        <p className="text-gray-400">Reset Link:</p>
                        <div className="mt-1 p-2 bg-gray-800 rounded overflow-x-auto">
                          <a 
                            href={resetLink} 
                            className="text-indigo-400 break-all hover:underline"
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            {resetLink}
                          </a>
                        </div>
                        <button
                          type="button"
                          className="mt-2 text-xs text-indigo-500 hover:text-indigo-400 flex items-center"
                          onClick={() => {
                            navigator.clipboard.writeText(resetLink);
                            alert('Reset link copied to clipboard!');
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                          </svg>
                          Copy to clipboard
                        </button>
                      </div>
                      <p className="text-yellow-500 text-xs mt-2">
                        Note: In production, this link is sent via email instead of being displayed here.
                      </p>
                    </div>
                  )}
                </div>
              )}

              <button
                type="button"
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-900"
                onClick={() => {
                  setResetRequested(false);
                  setEmail('');
                  setMessage(null);
                }}
              >
                Try another email
              </button>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              {message && (
                <div className={`p-4 ${message.type === 'error' ? 'bg-red-900/30 border-l-4 border-red-400' : 'bg-green-900/30 border-l-4 border-green-400'}`}>
                  <div className="flex">
                    <div className="flex-shrink-0">
                      {message.type === 'error' ? (
                        <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div className="ml-3">
                      <p className={`text-sm ${message.type === 'error' ? 'text-red-300' : 'text-green-300'}`}>{message.text}</p>
                    </div>
                  </div>
                </div>
              )}

              {!networkStatus.isOnline && (
                <div className="bg-yellow-900/30 border-l-4 border-yellow-400 p-4 mb-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-300">
                        <strong>You are currently offline.</strong> Please check your internet connection.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="appearance-none block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm placeholder-gray-500 bg-gray-700 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Spinner size="sm" className="mr-2" />
                      Sending...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </div>
            </form>
          )}
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-800 text-gray-400">
                  Or
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3">
              <div>
                <Link
                  to="/login"
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-600 rounded-md shadow-sm bg-gray-700 text-sm font-medium text-gray-200 hover:bg-gray-600 hover:text-white"
                >
                  Back to login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword; 