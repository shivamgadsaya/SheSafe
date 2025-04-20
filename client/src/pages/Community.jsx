import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

// API base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003';

const Community = () => {
  const [activeTab, setActiveTab] = useState('safety_reports');
  const [loading, setLoading] = useState(true);
  const [showNewTopicForm, setShowNewTopicForm] = useState(false);
  const [showNewReportForm, setShowNewReportForm] = useState(false);
  const [newTopic, setNewTopic] = useState({
    title: '',
    content: '',
    tags: ''
  });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [reportFormData, setReportFormData] = useState({
    title: '',
    description: '',
    incidentType: 'suspicious_activity',
    address: '',
    severity: 'medium'
  });
  const [reportFormErrors, setReportFormErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [reports, setReports] = useState([]);
  const [reportFilters, setReportFilters] = useState({
    incidentType: 'all',
    severity: 'all',
    timeframe: 'all'
  });
  const { user, token } = useAuth();
  
  // Mock data for different community sections
  const [forumTopics, setForumTopics] = useState([]);
  const [events, setEvents] = useState([]);
  const [supportGroups, setSupportGroups] = useState([]);
  
  useEffect(() => {
    // Load data
    setLoading(true);
    
    // Try to load forums, events, and support groups from localStorage
    const storedForumTopics = localStorage.getItem('forumTopics');
    const storedEvents = localStorage.getItem('events');
    const storedSupportGroups = localStorage.getItem('supportGroups');
    
    // Set forum topics from localStorage or mock data
    if (storedForumTopics) {
      setForumTopics(JSON.parse(storedForumTopics));
    } else {
      setForumTopics(mockForumTopics);
      // Save mock data to localStorage
      localStorage.setItem('forumTopics', JSON.stringify(mockForumTopics));
    }
    
    // Set events from localStorage or mock data
    if (storedEvents) {
      setEvents(JSON.parse(storedEvents));
    } else {
      setEvents(mockEvents);
      // Save mock data to localStorage
      localStorage.setItem('events', JSON.stringify(mockEvents));
    }
    
    // Set support groups from localStorage or mock data
    if (storedSupportGroups) {
      setSupportGroups(JSON.parse(storedSupportGroups));
    } else {
      setSupportGroups(mockSupportGroups);
      // Save mock data to localStorage
      localStorage.setItem('supportGroups', JSON.stringify(mockSupportGroups));
    }
    
    // Fetch reports from API
    const fetchReports = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/reports`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        // Transform API data to match our expected format
        const apiReports = response.data.map(report => ({
          id: report._id,
          title: report.title,
          description: report.description,
          incidentType: report.incidentType,
          location: report.address,
          severity: report.severity || 'medium',
          date: report.createdAt,
          status: report.status,
          reportedBy: report.user?.name || "Anonymous"
        }));
        
        setReports(apiReports);
      } catch (error) {
        console.error('Error fetching reports:', error);
        // Fall back to mock data if API fails
        const storedReports = localStorage.getItem('reports');
        if (storedReports) {
          setReports(JSON.parse(storedReports));
        } else {
          setReports(mockReports);
          localStorage.setItem('reports', JSON.stringify(mockReports));
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchReports();
  }, [token]);
  
  const handleNewTopicChange = (e) => {
    const { name, value } = e.target;
    setNewTopic(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear any errors when user starts typing
    if (formError) setFormError('');
  };

  const handleNewTopicSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!newTopic.title.trim()) {
      setFormError('Please enter a title for your topic');
      return;
    }
    
    if (!newTopic.content.trim() || newTopic.content.length < 10) {
      setFormError('Please enter content with at least 10 characters');
      return;
    }
    
    // Simulate API call
    setSubmitting(true);
    
    setTimeout(() => {
      // Create new topic object
      const tagsArray = newTopic.tags.split(',')
        .map(tag => tag.trim().toLowerCase())
        .filter(tag => tag.length > 0);
      
      const newTopicObj = {
        id: forumTopics.length + 1,
        title: newTopic.title.trim(),
        author: "Current User", // In a real app, this would be the current user
        replies: 0,
        views: 1,
        lastActive: new Date().toISOString(),
        tags: tagsArray.length > 0 ? tagsArray : ["general"],
        excerpt: newTopic.content.trim().substring(0, 120) + "...",
        solved: false
      };
      
      // Add to existing topics
      const updatedTopics = [newTopicObj, ...forumTopics];
      setForumTopics(updatedTopics);
      
      // Save to localStorage
      localStorage.setItem('forumTopics', JSON.stringify(updatedTopics));
      
      // Reset form
      setNewTopic({
        title: '',
        content: '',
        tags: ''
      });
      
      // Show success message
      setFormSuccess('Your topic has been posted successfully!');
      
      // Hide success after 3 seconds
      setTimeout(() => {
        setFormSuccess('');
        setShowNewTopicForm(false);
      }, 3000);
      
      setSubmitting(false);
    }, 1000);
  };

  // Toggle new topic form
  const toggleNewTopicForm = () => {
    setShowNewTopicForm(!showNewTopicForm);
    // Clear form state when toggling
    if (!showNewTopicForm) {
      setNewTopic({
        title: '',
        content: '',
        tags: ''
      });
      setFormError('');
      setFormSuccess('');
    }
  };
  
  // Handle report form submission
  const handleReportSubmit = async (e) => {
    e.preventDefault();
    
    // Clear any previous API errors
    setApiError('');
    
    // Check if user is authenticated
    if (!user) {
      setApiError('You must be logged in to submit a report. Please log in and try again.');
      return;
    }
    
    // Validate form
    const errors = {};
    if (!reportFormData.title.trim()) {
      errors.title = 'Title is required';
    }
    
    if (!reportFormData.description.trim()) {
      errors.description = 'Description is required';
    }
    
    if (!reportFormData.address.trim()) {
      errors.address = 'Location is required';
    }
    
    if (Object.keys(errors).length > 0) {
      setReportFormErrors(errors);
      return;
    }
    
    // Submit report to API
    setSubmitting(true);
    
    try {
      // Prepare data for API
      const reportData = {
        title: reportFormData.title,
        description: reportFormData.description,
        incidentType: reportFormData.incidentType,
        address: reportFormData.address,
        severity: reportFormData.severity
      };
      
      // Send to API
      const response = await axios.post(`${API_BASE_URL}/api/reports`, reportData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Add the new report to the reports list (with frontend format)
      const newReport = {
        id: response.data._id,
        title: response.data.title,
        description: response.data.description,
        incidentType: response.data.incidentType,
        location: response.data.address,
        severity: response.data.severity || 'medium',
        date: response.data.createdAt,
        status: response.data.status,
        reportedBy: user?.name || "Current User"
      };
      
      const updatedReports = [newReport, ...reports];
      setReports(updatedReports);
      
      // Save updated reports to localStorage
      localStorage.setItem('reports', JSON.stringify(updatedReports));
      
      // Reset form
      setReportFormData({
        title: '',
        description: '',
        incidentType: 'suspicious_activity',
        address: '',
        severity: 'medium'
      });
      
      setReportFormErrors({});
      setShowNewReportForm(false);
      setSubmitting(false);
      
      // Show success notification
      alert('Report submitted successfully!');
    } catch (error) {
      console.error('Error submitting report:', error);
      setApiError(error.response?.data?.message || 'Failed to submit report. Please try again.');
      setSubmitting(false);
    }
  };
  
  // Handle report form changes
  const handleReportFormChange = (e) => {
    const { name, value } = e.target;
    setReportFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field if any
    if (reportFormErrors[name]) {
      setReportFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  // Toggle report form
  const toggleReportForm = () => {
    setShowNewReportForm(!showNewReportForm);
    
    if (showNewReportForm) {
      // Reset form when closing
      setReportFormData({
        title: '',
        description: '',
        incidentType: 'suspicious_activity',
        address: '',
        severity: 'medium'
      });
      setReportFormErrors({});
    }
  };
  
  // Handle report filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setReportFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Filter reports based on current filters
  const filteredReports = reports.filter(report => {
    // Filter by incident type
    if (reportFilters.incidentType !== 'all' && report.incidentType !== reportFilters.incidentType) {
      return false;
    }
    
    // Filter by severity
    if (reportFilters.severity !== 'all' && report.severity !== reportFilters.severity) {
      return false;
    }
    
    // Filter by timeframe
    if (reportFilters.timeframe !== 'all') {
      const reportDate = new Date(report.date);
      const now = new Date();
      
      switch (reportFilters.timeframe) {
        case 'today':
          if (reportDate.toDateString() !== now.toDateString()) {
            return false;
          }
          break;
        case 'week':
          const weekAgo = new Date();
          weekAgo.setDate(now.getDate() - 7);
          if (reportDate < weekAgo) {
            return false;
          }
          break;
        case 'month':
          const monthAgo = new Date();
          monthAgo.setMonth(now.getMonth() - 1);
          if (reportDate < monthAgo) {
            return false;
          }
          break;
        default:
          break;
      }
    }
    
    return true;
  });
  
  // Mock data for forums
  const mockForumTopics = [
    {
      id: 1,
      title: "Safety tips for college students",
      author: "Sarah J.",
      replies: 24,
      views: 356,
      lastActive: "2025-04-12T14:30:00",
      tags: ["college", "education", "safety-tips"],
      excerpt: "Let's share some practical safety advice for students who are living away from home for the first time...",
      solved: true
    },
    {
      id: 2,
      title: "Safety apps recommendations",
      author: "TechSavvy22",
      replies: 37,
      views: 412,
      lastActive: "2025-04-13T09:15:00",
      tags: ["technology", "apps", "recommendations"],
      excerpt: "I'm looking for recommendations on the best safety apps that work well with both iOS and Android...",
      solved: false
    },
    {
      id: 3,
      title: "Travel safety for solo female travelers",
      author: "GlobeTrotter",
      replies: 56,
      views: 728,
      lastActive: "2025-04-11T16:45:00",
      tags: ["travel", "solo", "international"],
      excerpt: "Planning a solo trip to Southeast Asia and looking for specific safety advice from others who have traveled there...",
      solved: false
    },
    {
      id: 4,
      title: "How to handle street harassment?",
      author: "CityDweller",
      replies: 48,
      views: 652,
      lastActive: "2025-04-12T20:10:00",
      tags: ["harassment", "public-safety", "advice"],
      excerpt: "Recently experienced street harassment on my commute. Looking for effective ways to respond and stay safe...",
      solved: true
    },
    {
      id: 5,
      title: "Best self-defense classes in Chicago?",
      author: "WindyCity123",
      replies: 19,
      views: 187,
      lastActive: "2025-04-10T11:05:00",
      tags: ["self-defense", "chicago", "classes"],
      excerpt: "I'm looking to join a self-defense class in Chicago. Has anyone attended any good ones they would recommend?",
      solved: true
    }
  ];
  
  // Mock data for events
  const mockEvents = [
    {
      id: 1,
      title: "Personal Safety Workshop",
      date: "2025-04-20T14:00:00",
      location: "Community Center, Downtown",
      organizer: "SafetyFirst Organization",
      attendees: 27,
      capacity: 50,
      description: "Learn practical techniques for staying safe in various situations. This workshop covers awareness, prevention, and basic self-defense.",
      image: "https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"
    },
    {
      id: 2,
      title: "Women's Empowerment Network Meetup",
      date: "2025-04-25T18:30:00",
      location: "The Hub Cafe",
      organizer: "WEN Association",
      attendees: 35,
      capacity: 40,
      description: "Monthly networking event for women to share experiences, resources, and support each other in personal and professional growth.",
      image: "https://images.unsplash.com/photo-1573164713988-8665fc963095?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"
    },
    {
      id: 3,
      title: "Tech for Safety Hackathon",
      date: "2025-05-15T09:00:00",
      location: "Innovation Center",
      organizer: "TechSafe Initiative",
      attendees: 42,
      capacity: 100,
      description: "Join developers, designers, and safety experts to build innovative technology solutions addressing women's safety challenges.",
      image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"
    }
  ];
  
  // Mock data for support groups
  const mockSupportGroups = [
    {
      id: 1,
      name: "Survivors Circle",
      members: 145,
      meetingSchedule: "Every Tuesday, 6:00 PM - 7:30 PM",
      format: "In-person & Virtual",
      description: "A supportive community for survivors of assault or abuse to connect, share experiences, and heal together in a safe space.",
      icon: "❤️"
    },
    {
      id: 2,
      name: "Working Women Safety Network",
      members: 210,
      meetingSchedule: "First Monday of each month, 7:00 PM - 8:30 PM",
      format: "Virtual Only",
      description: "Professional women sharing workplace safety concerns, strategies for addressing issues, and supporting each other.",
      icon: "👩‍💼"
    },
    {
      id: 3,
      name: "College Safety Alliance",
      members: 167,
      meetingSchedule: "Every other Thursday, 5:00 PM - 6:30 PM",
      format: "In-person & Virtual",
      description: "For college students to discuss campus safety, share resources, and create peer support networks.",
      icon: "🎓"
    },
    {
      id: 4,
      name: "Parents for Safer Communities",
      members: 192,
      meetingSchedule: "Third Saturday of each month, 10:00 AM - 11:30 AM",
      format: "In-person",
      description: "Parents working together to make neighborhoods and schools safer for children and families.",
      icon: "👪"
    }
  ];
  
  // Mock data for reports
  const mockReports = [
    {
      id: 1,
      title: "Suspicious vehicle parked for days",
      description: "A black van has been parked on Oak Street for 3 days with no movement. No license plates visible.",
      incidentType: "suspicious_activity",
      location: "Oak Street & 5th Avenue",
      severity: "medium",
      date: "2025-04-10T15:30:00",
      status: "verified",
      reportedBy: "JaneD"
    },
    {
      id: 2,
      title: "Street light out",
      description: "The street light at the corner of Elm and Pine has been out for a week, making the area very dark at night.",
      incidentType: "infrastructure",
      location: "Elm Street & Pine Avenue",
      severity: "low",
      date: "2025-04-12T09:45:00",
      status: "resolved",
      reportedBy: "SafetyFirst"
    },
    {
      id: 3,
      title: "Aggressive individual at bus stop",
      description: "Man in red jacket shouting at people at the downtown bus terminal. Appears intoxicated and unpredictable.",
      incidentType: "harassment",
      location: "Downtown Bus Terminal",
      severity: "high",
      date: "2025-04-13T18:20:00",
      status: "pending",
      reportedBy: "CityCommuter"
    },
    {
      id: 4,
      title: "Flooding on Main Street",
      description: "After heavy rain, the intersection at Main and 3rd is completely flooded. Cars getting stuck.",
      incidentType: "infrastructure",
      location: "Main Street & 3rd Avenue",
      severity: "high",
      date: "2025-04-11T12:00:00",
      status: "verified",
      reportedBy: "LocalResident"
    },
    {
      id: 5,
      title: "Group of teens vandalizing park",
      description: "A group of approximately 5-6 teenagers spray painting the playground equipment at Central Park.",
      incidentType: "vandalism",
      location: "Central Park playground",
      severity: "medium",
      date: "2025-04-13T16:15:00",
      status: "pending",
      reportedBy: "ParkWatcher"
    }
  ];
  
  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Format time for display
  const formatTime = (dateString) => {
    const options = { hour: 'numeric', minute: 'numeric' };
    return new Date(dateString).toLocaleTimeString(undefined, options);
  };
  
  // Calculate time since last activity
  const getTimeSince = (dateString) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffInSeconds = Math.floor((now - past) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  // Incident type options
  const incidentTypes = [
    { id: 'all', label: 'All Types' },
    { id: 'suspicious_activity', label: 'Suspicious Activity' },
    { id: 'harassment', label: 'Harassment' },
    { id: 'infrastructure', label: 'Infrastructure Issue' },
    { id: 'vandalism', label: 'Vandalism' },
    { id: 'other', label: 'Other' }
  ];
  
  // Severity options
  const severityOptions = [
    { id: 'all', label: 'All Severity Levels' },
    { id: 'low', label: 'Low' },
    { id: 'medium', label: 'Medium' },
    { id: 'high', label: 'High' }
  ];
  
  // Timeframe options
  const timeframeOptions = [
    { id: 'all', label: 'All Time' },
    { id: 'today', label: 'Today' },
    { id: 'week', label: 'Past Week' },
    { id: 'month', label: 'Past Month' }
  ];
  
  // Get label for incident type
  const getIncidentTypeLabel = (id) => {
    const type = incidentTypes.find(type => type.id === id);
    return type ? type.label : 'Unknown';
  };
  
  // Get severity color
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'low':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'medium':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };
  
  // Get status color and label
  const getStatusInfo = (status) => {
    switch (status) {
      case 'pending':
        return {
          color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
          label: 'Pending Review'
        };
      case 'verified':
        return {
          color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
          label: 'Verified'
        };
      case 'resolved':
        return {
          color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
          label: 'Resolved'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
          label: status
        };
    }
  };

  // Emergency report form section
  const renderEmergencyReportForm = () => {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Report Safety Concern</h2>
        
        {apiError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md">
            <p className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {apiError}
            </p>
          </div>
        )}
        
        <form onSubmit={handleReportSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={reportFormData.title}
              onChange={handleReportFormChange}
              placeholder="Brief title of the incident"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
              disabled={submitting}
            />
            {reportFormErrors.title && (
              <p className="mt-1 text-sm text-red-600">{reportFormErrors.title}</p>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="incidentType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Incident Type *
              </label>
              <select
                id="incidentType"
                name="incidentType"
                value={reportFormData.incidentType}
                onChange={handleReportFormChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                disabled={submitting}
              >
                <option value="suspicious_activity">Suspicious Activity</option>
                <option value="harassment">Harassment</option>
                <option value="vandalism">Vandalism</option>
                <option value="theft">Theft</option>
                <option value="infrastructure">Infrastructure Issue</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="severity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Severity *
              </label>
              <select
                id="severity"
                name="severity"
                value={reportFormData.severity}
                onChange={handleReportFormChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                disabled={submitting}
              >
                <option value="low">Low - Awareness Only</option>
                <option value="medium">Medium - Concerning</option>
                <option value="high">High - Immediate Attention Needed</option>
              </select>
            </div>
          </div>
          
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Location *
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={reportFormData.address}
              onChange={handleReportFormChange}
              placeholder="Address or landmark"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
              disabled={submitting}
            />
            {reportFormErrors.address && (
              <p className="mt-1 text-sm text-red-600">{reportFormErrors.address}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              rows="4"
              value={reportFormData.description}
              onChange={handleReportFormChange}
              placeholder="Please provide details about what you observed..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
              disabled={submitting}
            ></textarea>
            {reportFormErrors.description && (
              <p className="mt-1 text-sm text-red-600">{reportFormErrors.description}</p>
            )}
          </div>
          
          <div className="pt-2 flex justify-end space-x-3">
            <button
              type="button"
              onClick={toggleReportForm}
              className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 flex items-center"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </>
              ) : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    );
  };

  // Report filters section
  const renderReportFilters = () => {
    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 md:mb-0">
            Filter Reports
          </h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={toggleReportForm}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              New Report
            </button>
          </div>
        </div>
        
        {!user && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-600 rounded-md">
            <p className="flex items-center text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span>Please <Link to="/login" className="font-medium underline">log in</Link> to submit reports and interact with the community.</span>
            </p>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="incidentType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Incident Type
            </label>
            <select
              id="incidentType"
              name="incidentType"
              value={reportFilters.incidentType}
              onChange={handleFilterChange}
              className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white text-sm"
            >
              <option value="all">All Types</option>
              <option value="suspicious_activity">Suspicious Activity</option>
              <option value="harassment">Harassment</option>
              <option value="vandalism">Vandalism</option>
              <option value="theft">Theft</option>
              <option value="infrastructure">Infrastructure Issue</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="severity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Severity
            </label>
            <select
              id="severity"
              name="severity"
              value={reportFilters.severity}
              onChange={handleFilterChange}
              className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white text-sm"
            >
              <option value="all">All Severities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="timeframe" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Timeframe
            </label>
            <select
              id="timeframe"
              name="timeframe"
              value={reportFilters.timeframe}
              onChange={handleFilterChange}
              className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white text-sm"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Past Week</option>
              <option value="month">Past Month</option>
            </select>
          </div>
        </div>
      </div>
    );
  };

  // Reports list section
  const renderReportsList = () => {
    if (loading) {
      return (
        <div className="text-center p-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading reports...</p>
        </div>
      );
    }
    
    if (filteredReports.length === 0) {
      return (
        <div className="text-center p-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p className="text-gray-600 dark:text-gray-300">No reports match your current filters.</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        {filteredReports.map(report => (
          <div key={report.id} className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-md border-l-4 border-opacity-70" 
               style={{ borderColor: getSeverityColor(report.severity) }}>
            <div className="flex flex-col md:flex-row justify-between mb-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{report.title}</h3>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="px-2 py-0.5 text-xs font-medium rounded-full" 
                        style={{ 
                          backgroundColor: `${getSeverityColor(report.severity)}30`,
                          color: getSeverityColor(report.severity)
                        }}>
                    {report.severity.charAt(0).toUpperCase() + report.severity.slice(1)}
                  </span>
                  <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-full">
                    {getIncidentTypeLabel(report.incidentType)}
                  </span>
                  {report.status && (
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                      report.status === 'verified' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                      report.status === 'resolved' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                      'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                    }`}>
                      {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                    </span>
                  )}
                </div>
              </div>
              <div className="mt-2 md:mt-0 text-right">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(report.date)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {getTimeSince(report.date)} ago
                </div>
              </div>
            </div>
            
            <p className="text-gray-600 dark:text-gray-300 mb-3">{report.description}</p>
            
            <div className="flex flex-wrap items-center justify-between mt-2 text-sm">
              <div className="flex items-center text-gray-500 dark:text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                {report.location}
              </div>
              <div className="text-gray-500 dark:text-gray-400 mt-1 md:mt-0">
                Reported by: {report.reportedBy}
              </div>
            </div>
            
            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-end space-x-2">
              <button className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-sm rounded hover:bg-blue-100 dark:hover:bg-blue-900/30">
                Follow
              </button>
              <button className="px-3 py-1 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-600">
                Share
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  // Main community reports tab content
  const renderSafetyReportsTab = () => {
    return (
      <div className="space-y-6">
        {showNewReportForm ? (
          renderEmergencyReportForm()
        ) : (
          <>
            {renderReportFilters()}
            {renderReportsList()}
          </>
        )}
      </div>
    );
  };

  // Community tab navigation and content rendering
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
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Community Safety
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Stay informed and connected with your local safety community
            </p>
          </div>
          
          {/* Tabs */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <div className="flex overflow-x-auto border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setActiveTab('safety_reports')}
                className={`px-6 py-3 font-medium text-sm flex items-center whitespace-nowrap ${
                  activeTab === 'safety_reports' 
                  ? 'border-b-2 border-primary text-primary' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z" clipRule="evenodd" />
                </svg>
                Safety Reports
              </button>
              <button
                onClick={() => setActiveTab('forums')}
                className={`px-6 py-3 font-medium text-sm flex items-center whitespace-nowrap ${
                  activeTab === 'forums' 
                  ? 'border-b-2 border-primary text-primary' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                  <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                </svg>
                Discussion Forums
              </button>
              <button
                onClick={() => setActiveTab('events')}
                className={`px-6 py-3 font-medium text-sm flex items-center whitespace-nowrap ${
                  activeTab === 'events' 
                  ? 'border-b-2 border-primary text-primary' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                Safety Events
              </button>
              <button
                onClick={() => setActiveTab('support_groups')}
                className={`px-6 py-3 font-medium text-sm flex items-center whitespace-nowrap ${
                  activeTab === 'support_groups' 
                  ? 'border-b-2 border-primary text-primary' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
                Support Groups
              </button>
            </div>
            
            {/* Loading State */}
            {loading ? (
              <div className="p-8 text-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-300">Loading community data...</p>
              </div>
            ) : (
              <div className="p-6">
                {/* Tab Content */}
                {activeTab === 'safety_reports' && renderSafetyReportsTab()}
                
                {activeTab === 'forums' && (
                  <div className="space-y-6">
                    {/* Forum actions */}
                    <div className="flex justify-between items-center">
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Discussion Forums</h2>
                      <button
                        onClick={toggleNewTopicForm}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        New Topic
                      </button>
                    </div>
                    
                    {/* Error and success messages */}
                    {formError && (
                      <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg">
                        {formError}
                      </div>
                    )}
                    
                    {formSuccess && (
                      <div className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 p-4 rounded-lg">
                        {formSuccess}
                      </div>
                    )}
                    
                    {/* New Topic Form */}
                    {showNewTopicForm && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-soft p-6"
                      >
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                          Create New Topic
                        </h3>
                        
                        <form onSubmit={handleNewTopicSubmit} className="space-y-4">
                          <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Title *
                            </label>
                            <input
                              type="text"
                              id="title"
                              name="title"
                              value={newTopic.title}
                              onChange={handleNewTopicChange}
                              placeholder="Enter a descriptive title"
                              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-700 dark:text-white focus:ring-primary focus:border-primary"
                              required
                            />
                          </div>
                          
                          <div>
                            <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Content *
                            </label>
                            <textarea
                              id="content"
                              name="content"
                              value={newTopic.content}
                              onChange={handleNewTopicChange}
                              placeholder="Describe your topic in detail"
                              rows={6}
                              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-700 dark:text-white focus:ring-primary focus:border-primary"
                              required
                            />
                          </div>
                          
                          <div>
                            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Tags (comma separated)
                            </label>
                            <input
                              type="text"
                              id="tags"
                              name="tags"
                              value={newTopic.tags}
                              onChange={handleNewTopicChange}
                              placeholder="e.g. safety, advice, question"
                              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-700 dark:text-white focus:ring-primary focus:border-primary"
                            />
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                              Optional: Add tags to help others find your topic
                            </p>
                          </div>
                          
                          <div className="flex justify-end space-x-3 pt-2">
                            <button
                              type="button"
                              onClick={toggleNewTopicForm}
                              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={submitting}
                              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                            >
                              {submitting ? (
                                <>
                                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  Posting...
                                </>
                              ) : 'Post Topic'}
                            </button>
                          </div>
                        </form>
                      </motion.div>
                    )}
                    
                    {/* Forum Topics List */}
                    {!showNewTopicForm && (
                      <div className="bg-white dark:bg-gray-800 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                          <thead className="bg-gray-50 dark:bg-gray-900">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Topic
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                                Author
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">
                                Replies
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                                Last Activity
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {forumTopics.map((topic) => (
                              <tr key={topic.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                                <td className="px-6 py-4">
                                  <div className="flex items-start">
                                    <div>
                                      <div className="flex items-center">
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">{topic.title}</span>
                                        {topic.solved && (
                                          <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                            Solved
                                          </span>
                                        )}
                                      </div>
                                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{topic.excerpt}</p>
                                      <div className="mt-2 flex flex-wrap gap-1">
                                        {topic.tags.map((tag, index) => (
                                          <span key={index} className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                                            {tag}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 hidden sm:table-cell">
                                  <div className="text-sm text-gray-700 dark:text-gray-300">{topic.author}</div>
                                </td>
                                <td className="px-6 py-4 hidden md:table-cell">
                                  <div className="flex flex-col">
                                    <span className="text-sm text-gray-700 dark:text-gray-300">{topic.replies}</span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">{topic.views} views</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                                  <div className="text-sm text-gray-700 dark:text-gray-300">{getTimeSince(topic.lastActive)}</div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
                
                {activeTab === 'events' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Upcoming Community Events
                      </h2>
                      <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
                        Submit Event
                      </button>
                    </div>
                    
                    {/* Events Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {events.map((event) => (
                        <motion.div
                          key={event.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                          className="bg-white dark:bg-gray-800 rounded-lg shadow-soft overflow-hidden"
                        >
                          <div className="h-48 overflow-hidden relative">
                            <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                              <div className="text-white font-semibold">{formatDate(event.date)}</div>
                              <div className="text-white/90 text-sm">{formatTime(event.date)}</div>
                            </div>
                          </div>
                          <div className="p-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                              {event.title}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                              {event.description}
                            </p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {event.location}
                              </div>
                              <div className="text-sm text-primary font-medium">
                                {event.attendees}/{event.capacity} attending
                              </div>
                            </div>
                            <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                              Organized by: {event.organizer}
                            </div>
                            <button className="mt-4 w-full py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
                              Join Event
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    
                    {/* Event Calendar Placeholder */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-soft p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Monthly Event Calendar
                      </h3>
                      <div className="h-64 flex justify-center items-center bg-gray-100 dark:bg-gray-700 rounded-lg">
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                          (Calendar view would be displayed here)
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {activeTab === 'support_groups' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Support Groups
                      </h2>
                      <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
                        Create Group
                      </button>
                    </div>
                    
                    {/* Support Groups Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {supportGroups.map((group) => (
                        <motion.div
                          key={group.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                          className="bg-white dark:bg-gray-800 rounded-lg shadow-soft p-6"
                        >
                          <div className="flex items-center mb-4">
                            <div className="text-3xl mr-4">{group.icon}</div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {group.name}
                              </h3>
                              <div className="text-sm text-primary mt-1">
                                {group.members} members
                              </div>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                            {group.description}
                          </p>
                          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-4">
                            <div className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                              <span className="font-medium">Meeting Schedule:</span> {group.meetingSchedule}
                            </div>
                            <div className="text-sm text-gray-700 dark:text-gray-300">
                              <span className="font-medium">Format:</span> {group.format}
                            </div>
                          </div>
                          <div className="flex space-x-3">
                            <button className="flex-1 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
                              Join Group
                            </button>
                            <button className="py-2 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                              Learn More
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    
                    {/* Resource Section */}
                    <div className="bg-primary/10 dark:bg-primary/5 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                        Need Immediate Support?
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        If you need immediate assistance or are in crisis, please reach out to these resources:
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                          <div className="font-medium text-gray-900 dark:text-white mb-2">Crisis Helpline</div>
                          <div className="text-primary font-semibold">1-800-123-4567</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">Available 24/7</div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                          <div className="font-medium text-gray-900 dark:text-white mb-2">Text Support</div>
                          <div className="text-primary font-semibold">Text HELP to 988</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">Available 24/7</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Community; 