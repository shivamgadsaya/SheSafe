import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { safeApiCall } from '../utils/apiUtils';
import axios from 'axios';
import { Link } from 'react-router-dom';

// Mock SMS function since we can't access real SMS API in this environment
const sendSMS = async (to, message) => {
  console.log(`Sending SMS to ${to}: ${message}`);
  return { success: true };
};

const SOS = () => {
  const { user, api } = useAuth();
  const navigate = useNavigate();
  const [location, setLocation] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [sosActive, setSosActive] = useState(false);
  const [watchId, setWatchId] = useState(null);
  const [description, setDescription] = useState('');
  const [activeAlert, setActiveAlert] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [notifiedContacts, setNotifiedContacts] = useState([]);
  const [locationUpdates, setLocationUpdates] = useState([]);
  const [countdownTimer, setCountdownTimer] = useState(5);
  const [showCountdown, setShowCountdown] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [componentMounted, setComponentMounted] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [showFallbackConfirm, setShowFallbackConfirm] = useState(false);
  const [mapInitialized, setMapInitialized] = useState(false);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const pathRef = useRef(null);
  const accuracyCircleRef = useRef(null);
  const [sosAlertId, setSosAlertId] = useState(null);
  const [countdown, setCountdown] = useState(5);
  const [confirmSOS, setConfirmSOS] = useState(false);
  const locationHistoryRef = useRef([]);
  const [permissionStatus, setPermissionStatus] = useState(null);
  const [isPermissionChecking, setIsPermissionChecking] = useState(true);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  
  // Add missing refs here
  const lastLocationUpdateRef = useRef(null);
  const apiRetryTimeoutRef = useRef(null);
  const failedEndpointsRef = useRef(new Set());
  const locationUpdateErrorsRef = useRef(0);
  
  // Declare setupLocationTracking as a function reference to avoid "not defined" errors
  const setupLocationTrackingRef = useRef(null);
  
  // Add a state variable to track cancellation attempts
  const [cancelAttempts, setCancelAttempts] = useState(0);
  
  // Add state for navigation modal
  const [showNavigationModal, setShowNavigationModal] = useState(false);
  
  // Add reference for the timer sound
  const timerSoundRef = useRef(null);
  const hasPlayedSoundRef = useRef({});
  
  // Play timer sound for each countdown number
  useEffect(() => {
    if (showCountdown && countdownTimer > 0) {
      // Play different sounds based on the countdown value
      if (!hasPlayedSoundRef.current[countdownTimer]) {
        // Create a new audio element each time
        const audio = new Audio();
        
        // Use different sound for last second
        if (countdownTimer === 1) {
          audio.src = "https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3";
          audio.volume = 0.7;
        } else {
          audio.src = "https://assets.mixkit.co/sfx/preview/mixkit-interface-click-1126.mp3"; 
          audio.volume = 0.5;
        }
        
        audio.play().catch(e => console.log("Audio play error:", e));
        hasPlayedSoundRef.current[countdownTimer] = true;
      }
    } else if (!showCountdown) {
      // Reset played sounds when countdown is hidden
      hasPlayedSoundRef.current = {};
    }
  }, [showCountdown, countdownTimer]);
  
  // Enhanced setupLocationTracking with permission handling
  setupLocationTrackingRef.current = () => {
    // Only attempt to track if permission is granted
    if (permissionStatus === 'denied') {
      console.warn('Geolocation permission denied, cannot track location');
      setError('Location permission denied. Please enable location services in your browser settings.');
        setInitialLoadComplete(true);
      return;
      }

      // Fallback location for testing if geolocation fails
      const fallbackLocation = {
        lat: 37.7749,
        lng: -122.4194,
        accuracy: 50,
        timestamp: new Date().toISOString()
      };

      if (!navigator.geolocation) {
        console.warn('Geolocation not supported by browser');
        setError('Geolocation is not supported by your browser. Using fallback location.');
        setLocation(fallbackLocation);
        setInitialLoadComplete(true);
        return;
      }

      // Set a timeout for geolocation to prevent hanging
      const locationTimeout = setTimeout(() => {
        if (!location) {
          console.warn('Geolocation timed out');
          setError('Unable to get your location. Using fallback location.');
          setLocation(fallbackLocation);
          setInitialLoadComplete(true);
        }
      }, 5000);

    // Get initial position with high accuracy
      navigator.geolocation.getCurrentPosition(
        (position) => {
          clearTimeout(locationTimeout);
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date().toISOString()
          };
          
        console.log('Got current position:', newLocation);
          setLocation(newLocation);
        setPermissionStatus('granted');
          
          // Add to location history if SOS is active
          if (sosActive) {
            setLocationUpdates(prev => [...prev, newLocation]);
            updateLocationOnMap(newLocation);
          }
          
          setError('');
          setInitialLoadComplete(true);
        },
        (geoError) => {
          clearTimeout(locationTimeout);
          console.error('Geolocation error:', geoError);
          
          // Use the helper function to get a meaningful error message
          const errorMessage = getLocationErrorMessage(geoError);
          setError(errorMessage);
          
        if (geoError.code === 1) {
          // Permission denied
          setPermissionStatus('denied');
          // Show permission modal
          setShowPermissionModal(true);
        } else {
          // Only use fallback if not a permission error (which user needs to fix)
            setLocation(fallbackLocation);
          }
          
          setInitialLoadComplete(true);
        },
      { 
        enableHighAccuracy: true, 
        timeout: 10000, 
        maximumAge: 0 
      }
    );

    // Set up continuous tracking with high accuracy
    try {
      // Clear any existing watch
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
      
      // Start new watch with high accuracy
      const id = navigator.geolocation.watchPosition(
        (position) => {
            const newLocation = {
            lat: position.coords.latitude,
              lng: position.coords.longitude,
              accuracy: position.coords.accuracy,
              timestamp: new Date().toISOString()
            };
            
          console.log('Location update from watch:', newLocation);
            setLocation(newLocation);
          setPermissionStatus('granted');
            
            // Add to location history if SOS is active
            if (sosActive) {
              setLocationUpdates(prev => [...prev, newLocation]);
              updateLocationOnMap(newLocation);
              
              // Send location update to server if SOS is active
            if (activeAlert && (activeAlert._id || activeAlert.alertId)) {
              const alertId = activeAlert._id || activeAlert.alertId;
              
              // Only update location on server at most once every 5 seconds
              const now = Date.now();
              if (!lastLocationUpdateRef.current || (now - lastLocationUpdateRef.current) > 5000) {
                lastLocationUpdateRef.current = now;
                
                // Log the location update attempt
                console.log(`Attempting to update location for alert ${alertId}`);
                
                // Use the safe API call utility - don't wait for result to avoid blocking UI
                safeApiCall(
                  `/sos/${alertId}/location`,
                  'post',
                  {
                    location: {
                      latitude: newLocation.lat,
                      longitude: newLocation.lng,
                      accuracy: newLocation.accuracy
                    }
                  }
                ).catch(err => {
                  // Just log errors - don't affect user experience
                  console.warn('Location update error:', err.message || 'Unknown error');
                  });
                }
              }
            }
            
          setError('');
        },
        (geoError) => {
          console.error('Geolocation watch error:', geoError);
            
            // Only update error for permission issues
            if (geoError.code === 1) {
              setError(getLocationErrorMessage(geoError));
            setPermissionStatus('denied');
            // Show permission modal
            setShowPermissionModal(true);
          }
        },
        { 
          enableHighAccuracy: true, 
          timeout: 10000, 
          maximumAge: 0 
        }
      );
      
      setWatchId(id);
    } catch (err) {
      console.error('Error setting up location watching:', err);
    }
  };
  
  // Mark component as mounted
  useEffect(() => {
    console.log("SOS Component mounted");
    setComponentMounted(true);
    
    // Check geolocation permission status first
    checkGeolocationPermission();
    
    // Load OpenStreetMap script
    const loadOpenStreetMap = () => {
      // Check if Leaflet is already loaded
      if (window.L) {
        console.log("Leaflet already loaded");
        return Promise.resolve();
      }
      
      // Load Leaflet CSS
      const linkElem = document.createElement('link');
      linkElem.rel = 'stylesheet';
      linkElem.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(linkElem);
      
      // Load Leaflet JavaScript
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
      script.crossOrigin = '';
      document.head.appendChild(script);
      
      return new Promise((resolve) => {
        script.onload = () => {
          console.log("Leaflet loaded successfully");
          resolve();
        };
      });
    };
    
    loadOpenStreetMap().then(() => {
      console.log("OpenStreetMap (Leaflet) loaded successfully");
      setInitialLoadComplete(true);
    }).catch(err => {
      console.error("Failed to load OpenStreetMap:", err);
    });
    
    return () => {
      console.log("SOS Component unmounted");
      setComponentMounted(false);
    };
  }, []);

  // New function to check geolocation permission
  const checkGeolocationPermission = async () => {
    setIsPermissionChecking(true);
    try {
      // Check if geolocation is supported
      if (!navigator.geolocation) {
        console.warn('Geolocation not supported by browser');
        setError('Geolocation is not supported by your browser.');
        setPermissionStatus('unsupported');
        setIsPermissionChecking(false);
        return;
      }
      
      // Try to get permission status if supported
      if (navigator.permissions && navigator.permissions.query) {
        const result = await navigator.permissions.query({ name: 'geolocation' });
        console.log(`Geolocation permission status: ${result.state}`);
        
        setPermissionStatus(result.state);
        
        // Set up a listener for permission changes
        result.onchange = () => {
          console.log(`Permission changed to: ${result.state}`);
          setPermissionStatus(result.state);
          
          if (result.state === 'granted') {
            // Permission was just granted, try to get location
                      setError('');
            setupLocationTrackingRef.current();
          } else if (result.state === 'denied') {
            setError('Location permission denied. Please enable location services.');
            // Show modal with instructions
            setShowPermissionModal(true);
          }
        };
        
        // If permission is already granted, get location
        if (result.state === 'granted') {
          setupLocationTrackingRef.current();
        } else if (result.state === 'prompt') {
          // Will be prompted, call geolocation to trigger prompt
          requestGeolocationPermission();
        } else if (result.state === 'denied') {
          setError('Location permission denied. Please enable location services.');
          // Show modal with instructions
          setShowPermissionModal(true);
        }
      } else {
        // Permissions API not supported, try directly
        requestGeolocationPermission();
      }
    } catch (error) {
      console.error('Error checking permission:', error);
      // Fallback to direct permission request
      requestGeolocationPermission();
    } finally {
      setIsPermissionChecking(false);
    }
  };

  // New function to request geolocation permission directly
  const requestGeolocationPermission = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Success means permission granted
        console.log('Geolocation permission granted');
        setPermissionStatus('granted');
        setError('');
        
        // Process location
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date().toISOString()
        };
        
        setLocation(newLocation);
        
        // Continue with location tracking
        setupLocationTrackingRef.current();
      },
      (geoError) => {
        console.error('Geolocation permission error:', geoError);
        
        // If permission denied
        if (geoError.code === 1) {
          setPermissionStatus('denied');
          setError('Location permission denied. Please enable location services.');
          // Show modal with instructions
          setShowPermissionModal(true);
        } else {
          // Other errors
          setError(getLocationErrorMessage(geoError));
          setPermissionStatus('error');
          }
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
  };

  // Check for active SOS and get current location
  useEffect(() => {
    const checkActiveAlert = async () => {
      try {
        const response = await safeApiCall('/sos/active', 'get', null, { 
          timeout: 5000 
        });
        
        if (response && response.data && response.data.active) {
          setSosActive(true);
          
          // Ensure we have all the needed properties
          const alertData = {
            ...response.data.alert,
            _id: response.data.alert._id || response.data.alert.alertId,
            alertId: response.data.alert._id || response.data.alert.alertId,
            status: response.data.alert.status || 'active'
          };
          
          setActiveAlert(alertData);
          
          // Calculate elapsed time
          const startTime = new Date(response.data.alert.createdAt).getTime();
          const currentTime = new Date().getTime();
          setElapsedTime(Math.floor((currentTime - startTime) / 1000));
          
          // Get notified contacts if available
          if (response.data.notifiedContacts) {
            setNotifiedContacts(response.data.notifiedContacts);
          }
          
          // If there are previously recorded locations
          if (response.data.alert.locationHistory) {
            setLocationUpdates(response.data.alert.locationHistory);
          }
        }
      } catch (err) {
        // Just log errors - don't affect user experience
        console.warn('Error checking active SOS:', err.message || 'Unknown error');
      } finally {
        setInitialLoadComplete(true);
      }
    };

    if (componentMounted) {
      // Don't check for active alerts and setup tracking if permission is denied
      if (permissionStatus !== 'denied') {
    checkActiveAlert();
        
        // Only setup tracking if permission isn't being checked currently
        if (!isPermissionChecking && setupLocationTrackingRef.current) {
          setupLocationTrackingRef.current();
        }
      } else {
        // Just set initial load complete if permission is denied
        setInitialLoadComplete(true);
      }
    }

    // Clean up watch position on component unmount
    return () => {
      if (watchId !== null) {
        try {
        navigator.geolocation.clearWatch(watchId);
        } catch (error) {
          console.error("Error clearing watch:", error);
        }
      }
    };
  }, [api, componentMounted, permissionStatus, isPermissionChecking, sosActive, activeAlert]);
  
  // Initialize map when component mounts or location changes
  useEffect(() => {
    if (mapRef.current && location && window.L && !mapInitialized) {
      console.log("Initializing OpenStreetMap with location:", location);
      
      try {
        // Initialize map if it doesn't exist
        const map = window.L.map(mapRef.current).setView([location.lat, location.lng], 16);
        
        // Add OpenStreetMap tile layer
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
        
        // Create marker for user's position with accuracy circle
        const marker = window.L.marker([location.lat, location.lng])
          .addTo(map)
          .bindPopup("Your location")
          .openPopup();
        
        // Create accuracy circle
        const circle = window.L.circle([location.lat, location.lng], {
          color: '#1bb6ff',
            fillColor: '#61a0bf',
            fillOpacity: 0.15,
          radius: location.accuracy || 50,
          weight: 1
        }).addTo(map);
        
        // Store references
        mapInstanceRef.current = map;
        markerRef.current = marker;
        accuracyCircleRef.current = circle;
        setMapInitialized(true);
        
        // Create path if we have multiple location updates (for SOS tracking)
        if (sosActive && locationUpdates.length > 1) {
          const pathPoints = locationUpdates.map(loc => [loc.lat, loc.lng]);
          pathRef.current = window.L.polyline(pathPoints, {color: 'red', weight: 3}).addTo(map);
        }
        
        console.log("Map initialized successfully");
      } catch (error) {
        console.error("Error initializing map:", error);
      }
    } else if (mapInstanceRef.current && location && window.L && mapInitialized) {
      // Just update the location on the existing map
        updateLocationOnMap(location);
      }
  }, [location, mapInitialized, sosActive, locationUpdates]);
  
  // Helper function to update location on map
  const updateLocationOnMap = (location) => {
    console.log("Updating map with location:", location);
    
    if (!location || !location.lat || !location.lng) {
      console.warn("Invalid location for map update:", location);
      return;
    }
    
    // Add to location history
    if (componentMounted) {
      locationHistoryRef.current = [...locationHistoryRef.current, location];
      
      // Only keep the last 50 points to avoid performance issues
      if (locationHistoryRef.current.length > 50) {
        locationHistoryRef.current = locationHistoryRef.current.slice(-50);
      }
      
      // Update map if it exists
      if (mapInstanceRef.current) {
        try {
      // Update marker position
          if (markerRef.current) {
            const latLng = [
              location.lat || location.latitude, 
              location.lng || location.longitude
            ];
            markerRef.current.setLatLng(latLng);
            markerRef.current.getPopup().setContent(`Your location (${new Date().toLocaleTimeString()})`);
          } else {
            // Create marker if it doesn't exist
            markerRef.current = window.L.marker([
              location.lat || location.latitude,
              location.lng || location.longitude
            ])
            .addTo(mapInstanceRef.current)
            .bindPopup(`Your location (${new Date().toLocaleTimeString()})`)
            .openPopup();
          }
          
          // Update accuracy circle
          if (accuracyCircleRef.current) {
            const latLng = [
              location.lat || location.latitude, 
              location.lng || location.longitude
            ];
            accuracyCircleRef.current.setLatLng(latLng);
            accuracyCircleRef.current.setRadius(location.accuracy || location.coords?.accuracy || 50);
          } else if (mapInstanceRef.current) {
            // Create accuracy circle if it doesn't exist
            accuracyCircleRef.current = window.L.circle([
              location.lat || location.latitude,
              location.lng || location.longitude
            ], {
              color: '#1bb6ff',
              fillColor: '#61a0bf',
              fillOpacity: 0.15,
              radius: location.accuracy || location.coords?.accuracy || 50,
              weight: 1
            }).addTo(mapInstanceRef.current);
          }
          
          // Update path
          if (pathRef.current && locationHistoryRef.current.length > 1) {
            const points = locationHistoryRef.current.map(loc => [
              loc.lat || loc.latitude, 
              loc.lng || loc.longitude
            ]);
            pathRef.current.setLatLngs(points);
          } else if (!pathRef.current && locationHistoryRef.current.length > 1 && mapInstanceRef.current) {
            const points = locationHistoryRef.current.map(loc => [
              loc.lat || loc.latitude, 
              loc.lng || loc.longitude
            ]);
            pathRef.current = window.L.polyline(points, { color: 'red' }).addTo(mapInstanceRef.current);
          }
          
          // Center map on current location
          mapInstanceRef.current.setView([
            location.lat || location.latitude, 
            location.lng || location.longitude
          ], mapInstanceRef.current.getZoom());
          
          console.log("Map updated successfully with new location");
        } catch (error) {
          console.error("Error updating map with location:", error);
        }
      } else {
        console.warn("Map instance not available for update");
      }
    }
  };
  
  // Timer for active SOS alert
  useEffect(() => {
    let timerInterval;
    
    if (sosActive) {
      timerInterval = setInterval(() => {
        setElapsedTime(prevTime => prevTime + 1);
      }, 1000);
    }
    
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [sosActive]);
  
  // Countdown timer effect
  useEffect(() => {
    let countdown;
    
    if (showCountdown && countdownTimer > 0) {
      countdown = setInterval(() => {
        setCountdownTimer(prevTime => {
          if (prevTime <= 1) {
            clearInterval(countdown);
            setShowCountdown(false);
            handleSOSActivation();
            return 5; // Reset for next time
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (countdown) {
        clearInterval(countdown);
      }
    };
  }, [showCountdown, countdownTimer]);
  
  // Format elapsed time as HH:MM:SS
  const formatElapsedTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return [
      hrs.toString().padStart(2, '0'),
      mins.toString().padStart(2, '0'),
      secs.toString().padStart(2, '0')
    ].join(':');
  };

  // Helper function to decode GeolocationPositionError codes
  const getLocationErrorMessage = (error) => {
    if (!error) return "Unknown location error";
    
    switch(error.code) {
      case 1:
        return "Permission denied. You must allow location access in your browser settings.";
      case 2:
        return "Position unavailable. Your device couldn't determine your location.";
      case 3:
        return "Location request timed out. Please try again.";
      default:
        return `Location error (${error.code}): ${error.message}`;
    }
  };

  // Function to provide instructions on enabling location
  const renderLocationHelp = () => {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg mt-4 border-l-4 border-yellow-500">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
          <span className="mr-2">ℹ️</span> How to enable location services
        </h3>
        <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
          <p><strong>For Chrome:</strong> Click the lock/info icon in the address bar → Site settings → Allow location access</p>
          <p><strong>For Firefox:</strong> Click the shield icon in the address bar → Site permissions → Allow location access</p>
          <p><strong>For Safari:</strong> Go to Settings → Safari → Location → Allow location access</p>
          <p><strong>For Mobile:</strong> Check your device settings to ensure location services are enabled for your browser</p>
          
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
          >
            Refresh page after enabling location
          </button>
        </div>
      </div>
    );
  };

  // Modified start SOS countdown to check permission first
  const startSOSCountdown = (e) => {
    if (e) e.preventDefault();
    
    console.log("Starting SOS countdown, refreshing location first...");
    
    // First, check if we have permission
    if (permissionStatus !== 'granted') {
      // Request permission explicitly
      checkGeolocationPermission();
      return;
    }
    
    // Force a fresh location update before starting countdown
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log("Got fresh location before SOS activation:", position);
        const freshLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date().toISOString()
        };
        
        // Update state with fresh location
        setLocation(freshLocation);
        
        // Update map with fresh location
        if (mapInstanceRef.current) {
          updateLocationOnMap(freshLocation);
        }
        
        // Begin countdown with the new location
    if (!location) {
      setError('Location not available. Please enable location access in your browser and try again.');
      
      // Show the help instructions
      const locationHelp = document.getElementById('location-help-section');
      if (locationHelp) {
        locationHelp.scrollIntoView({ behavior: 'smooth' });
      }
      
      return;
    }

        // Check if it's a fallback location
    const isFallbackLocation = 
      location.lat === 37.7749 && 
      location.lng === -122.4194;
    
    if (isFallbackLocation) {
          // Show the confirmation modal
      setShowFallbackConfirm(true);
      return;
    }

        // If not using fallback location, proceed with activation
    proceedWithActivation();
      },
      (error) => {
        console.error("Error getting fresh location:", error);
        
        // Continue with existing location if we have one
        if (location) {
          // Check if it's a fallback location
          const isFallbackLocation = 
            location.lat === 37.7749 && 
            location.lng === -122.4194;
          
          if (isFallbackLocation) {
            // Show the confirmation modal
            setShowFallbackConfirm(true);
            return;
          }
          
          // If not using fallback location, proceed with activation
          proceedWithActivation();
        } else {
          setError('Location not available. Please enable location access in your browser and try again.');
        }
      },
      { 
        enableHighAccuracy: true, 
        timeout: 3000, 
        maximumAge: 0 
      }
    );
  };
  
  // Function to proceed with SOS activation
  const proceedWithActivation = () => {
    setIsActivating(true);
    setShowCountdown(true);
    setCountdownTimer(5);
    setShowFallbackConfirm(false);
  };
  
  // Cancel the fallback confirmation
  const cancelFallbackConfirm = () => {
    setShowFallbackConfirm(false);
  };
  
  // Cancel SOS countdown
  const cancelSOSCountdown = () => {
    setShowCountdown(false);
    setCountdownTimer(5);
    setIsActivating(false);
  };

  // Handle actual SOS activation after countdown
  const handleSOSActivation = async () => {
    setIsActivating(false);
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await safeApiCall('/sos', 'post', {
        location: {
          latitude: location.lat,
          longitude: location.lng,
          accuracy: location.accuracy
        },
        description
      });
      
      if (!response) {
        throw new Error('Unable to contact the server. Please try again later.');
      }
      
      // Create a valid alert object with necessary properties
      const alertData = {
        alertId: response.data?.alertId,
        _id: response.data?.alertId,
        status: 'active',
        createdAt: new Date().toISOString()
      };
      
      setSosActive(true);
      setActiveAlert(alertData);
      setSuccess('SOS alert sent successfully! Help is on the way.');
      setElapsedTime(0);
      
      // If we have emergency contacts, send SMS to them
      const contacts = user?.emergencyContacts || [];
      if (contacts.length > 0) {
        const notifiedIds = [];
        
        // Send SMS to each contact
        for (const contact of contacts) {
          try {
            if (contact.phone) {
              // Send emergency SMS
              const message = `EMERGENCY ALERT: ${user.name} has triggered an SOS alert. Their location is: https://maps.google.com/?q=${location.lat},${location.lng}`;
              await sendSMS(contact.phone, message);
              notifiedIds.push(contact._id || contact.id);
            }
          } catch (err) {
            console.error(`Failed to notify contact ${contact.name}:`, err);
          }
        }
        
        setNotifiedContacts(notifiedIds);
      }
      
      // Clear description after successful submission
      setDescription('');
    } catch (err) {
      console.error('SOS error:', err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.status === 401) {
        setError('You need to login again to send an alert.');
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Failed to send SOS alert. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Function to check device type
  const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  // Function to check if device is iOS
  const isIOSDevice = () => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  };

  // Enhanced function to open navigation with options for different map apps
  const openGoogleMapsDirections = () => {
    if (!location) {
      setError('Cannot navigate: Location data is unavailable');
      return;
    }

    // For mobile devices, show a modal with options
    if (isMobileDevice()) {
      setShowNavigationModal(true);
      
      // Auto-dismiss navigation modal after 10 seconds if not interacted with
      setTimeout(() => {
        setShowNavigationModal(false);
      }, 10000);
      
      return;
    }
    
    // For desktop, default to Google Maps
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`;
    window.open(googleMapsUrl, '_blank');
  };

  // Function to open specific map application based on user choice
  const openMapApp = (mapType) => {
    if (!location) {
      setError('Cannot navigate: Location data is unavailable');
      return;
    }
    
    let navigationUrl = '';
    
    switch (mapType) {
      case 'google':
        navigationUrl = `https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`;
        break;
      case 'apple':
        navigationUrl = `maps://maps.apple.com/?daddr=${location.lat},${location.lng}&dirflg=d`;
        break;
      default:
        navigationUrl = `https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`;
    }
    
    setShowNavigationModal(false);
    window.open(navigationUrl, '_blank');
  };

  // Simplify the handleCancelSOS function to guarantee first-attempt success
  const handleCancelSOS = () => {
    // Set loading state
    setLoading(true);
    setError('');
    setSuccess('');
    
    console.log('Emergency cancel initiated - forcing immediate state change');
    
    // IMMEDIATELY update UI state for instant user feedback
      setSosActive(false);
      setActiveAlert(null);
      setElapsedTime(0);
      setLocationUpdates([]);
      
    // Reset map path if exists (without awaiting any network request)
    if (pathRef.current && mapInstanceRef.current) {
      try {
        pathRef.current.remove();
        pathRef.current = null;
      } catch (mapErr) {
        console.error('Error cleaning up map:', mapErr);
      }
    }
    
    // Show immediate success message
    setSuccess('Emergency alert cancelled successfully.');
    
    // THEN try to sync with server as a background operation
      setTimeout(() => {
      // Try to notify the server in the background (don't block UI on this)
      const token = localStorage.getItem('token');
      
      // Use a simple fetch with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      console.log('Attempting to notify server about cancellation');
      
      fetch(`${process.env.REACT_APP_API_URL || '/api'}/sos/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        signal: controller.signal
      })
      .then(response => {
        clearTimeout(timeoutId);
        console.log('Server notified of cancellation, status:', response.status);
      })
      .catch(err => {
        console.log('Server notification failed, but UI already updated:', err.message);
        // Don't change the UI or show error - user already sees success
      })
      .finally(() => {
        // Release loading state after background operation
        setLoading(false);
        
        // Auto-hide success message after a few seconds
        setTimeout(() => {
          setSuccess('');
        }, 3000);
      });
    }, 300);
    
    // Also store cancellation in session storage for persistence
    sessionStorage.setItem('sos_manually_cancelled', 'true');
    sessionStorage.setItem('sos_cancelled_time', new Date().toISOString());
  };

  // Update the emergency cancel function for guaranteed instant cancellation
  const emergencyCancelSOS = () => {
    try {
      // Immediately show UI feedback
      alert('Emergency mode will be cancelled immediately.');
      
      // Force UI state update first
      setSosActive(false);
      setActiveAlert(null);
      setElapsedTime(0);
      setLocationUpdates([]);
      setSuccess('Emergency alert cancelled successfully.');
      
      // Persist cancellation in storage
      localStorage.setItem('sos_active', 'false');
      sessionStorage.setItem('sos_manually_cancelled', 'true');
      sessionStorage.setItem('sos_cancelled_time', new Date().toISOString());
      
      // Try background server notification without waiting for response
      const token = localStorage.getItem('token');
      if (token) {
        console.log('Background notification to server about emergency cancellation');
        fetch(`${process.env.REACT_APP_API_URL || '/api'}/sos/cancel`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }).catch(err => console.log('Server notification error (ignored):', err.message));
      }
      
      // Force app reset after a short delay to show the success state
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err) {
      console.error('Critical error in emergencyCancelSOS:', err);
      
      // Absolutely guaranteed cancellation even if JS errors occur
      localStorage.setItem('sos_active', 'false');
      sessionStorage.setItem('sos_manually_cancelled', 'true');
      alert('SOS cancelled. Page will refresh now.');
      window.location.reload();
    }
  };
  
  // Add an event listener for F2 key to trigger emergency cancel
  useEffect(() => {
    const handleKeyDown = (e) => {
      // F2 key for emergency cancel
      if (e.key === 'F2' && sosActive) {
        console.log('F2 pressed - triggering emergency cancel');
        emergencyCancelSOS();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sosActive]);
  
  // Add a useEffect to check for manual cancellation on page load
  useEffect(() => {
    const manualCancelled = sessionStorage.getItem('sos_manually_cancelled');
    if (manualCancelled === 'true') {
      console.log('SOS was manually cancelled before page reload');
      setSosActive(false);
      setActiveAlert(null);
      
      // Clear the flag
      sessionStorage.removeItem('sos_manually_cancelled');
      sessionStorage.removeItem('sos_cancelled_time');
      
      // Show a success message
      setSuccess('Emergency mode has been successfully cancelled.');
      setTimeout(() => setSuccess(''), 5000);
    }
  }, []);
  
  // Force Cancel component for extreme cases
  {cancelAttempts >= 2 && sosActive && (
    /* Removed ForceCancel component */
    <></>
  )}

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Add Emergency Fallback Button at the very top */}
      {sosActive && (
        <div className="fixed top-0 left-0 right-0 bg-red-600 text-white py-3 px-4 z-[9999] flex items-center justify-center shadow-lg">
          <p className="text-white font-bold">
            <span className="inline-block w-3 h-3 bg-white rounded-full mr-2 animate-pulse"></span>
            Emergency SOS Active
          </p>
        </div>
      )}

      {/* New Permission Request Modal */}
      {showPermissionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-[9999] flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full shadow-xl m-4">
            <div className="flex items-center justify-center mb-4 text-red-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center">
              Location access required
            </h2>
            <p className="mb-6 text-gray-700 dark:text-gray-300 text-center">
              Emergency SOS requires location access to send your position to emergency contacts.
            </p>
            
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg mb-6 border-l-4 border-yellow-500">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                How to enable location services
              </h3>
              <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                <p><strong>For Chrome:</strong> Click the lock/info icon in the address bar → Site settings → Allow location access</p>
                <p><strong>For Firefox:</strong> Click the shield icon in the address bar → Site permissions → Allow location access</p>
                <p><strong>For Safari:</strong> Go to Settings → Safari → Location → Allow location access</p>
                <p><strong>For Mobile:</strong> Check your device settings to ensure location services are enabled for your browser</p>
              </div>
          </div>

            <div className="flex flex-col space-y-3">
              <button 
                onClick={() => {
                  setShowPermissionModal(false);
                  // Wait a moment then retry permission
                  setTimeout(checkGeolocationPermission, 500);
                }}
                className="px-4 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600"
              >
                I've Enabled Location Access
              </button>
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium"
              >
                Refresh Page
              </button>
              <button 
                onClick={() => setShowPermissionModal(false)}
                className="px-4 py-2 text-gray-500 hover:text-gray-700 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Countdown Modal with timer animation */}
      {showCountdown && (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-[9999] flex items-center justify-center" style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0}}>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full text-center shadow-xl border-2 border-red-500">
            <div className="absolute -top-3 -right-3 w-8 h-8 bg-red-600 rounded-full animate-ping"></div>
            <div className="absolute -top-3 -left-3 w-8 h-8 bg-red-600 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
            
            <h2 className="text-2xl font-bold text-red-600 mb-4">EMERGENCY ALERT ACTIVATING</h2>
            <p className="mb-6 text-gray-700 dark:text-gray-300">
              <span className="font-semibold">Warning:</span> SOS mode will be activated in:
            </p>
            <div className="relative mx-auto mb-8" style={{ width: '180px', height: '180px' }}>
              {/* Outer ring animation */}
              <div className="absolute inset-0 rounded-full border-4 border-red-200 opacity-60"></div>
              <div className="absolute inset-0 rounded-full border-4 border-red-300 opacity-60 animate-ping" style={{ animationDuration: '2s' }}></div>
              
              {/* Circular progress background */}
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle 
                  cx="50" cy="50" r="42" 
                  fill="none" 
                  stroke="#f1f1f1" 
                  strokeWidth="10"
                />
                <circle 
                  cx="50" cy="50" r="42" 
                  fill="none" 
                  stroke="#ef4444" 
                  strokeWidth="10"
                  strokeDasharray="264"
                  strokeDashoffset={264 - (264 * countdownTimer / 5)}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-linear"
                />
              </svg>
              {/* Timer text overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-7xl font-bold text-red-600" style={{ 
                  textShadow: '0 0 10px rgba(239, 68, 68, 0.5)',
                  animation: 'pulse 1s infinite'
                }}>{countdownTimer}</span>
          </div>
            </div>
            <div className="mb-6 text-gray-600 dark:text-gray-300 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
              <p className="flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Your exact location will be shared with emergency contacts
              </p>
            </div>
            <button
              onClick={cancelSOSCountdown}
              className="w-full py-4 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors text-lg"
            >
              Cancel Emergency
            </button>
          </div>
        </div>
      )}
      
      {/* Fallback Location Confirmation Modal - moved to top level */}
          {showFallbackConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-[9999] flex items-center justify-center" style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0}}>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full shadow-xl">
                <h2 className="text-2xl font-bold text-red-600 mb-4">Location Warning</h2>
                <p className="mb-6 text-gray-700 dark:text-gray-300">
                  Using approximate location. Emergency contacts will not receive your exact position. Continue anyway?
                </p>
                <div className="flex justify-between">
                  <button
                    onClick={cancelFallbackConfirm}
                    className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={proceedWithActivation}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          )}

      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Header - modified to add permission check button */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Emergency SOS
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Your safety is our priority. Help is just a tap away.
            </p>
            
            {/* Permission status indicator */}
            {permissionStatus && permissionStatus !== 'granted' && (
              <div className="mt-2 flex justify-center">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  permissionStatus === 'denied' ? 'bg-red-100 text-red-800' : 
                  permissionStatus === 'prompt' ? 'bg-yellow-100 text-yellow-800' : 
                  'bg-gray-100 text-gray-800'
                }`}>
                  {permissionStatus === 'denied' ? (
                    <>
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
                      </svg>
                      Location Disabled
                    </>
                  ) : permissionStatus === 'prompt' ? (
                    <>
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 2a8 8 0 100 16zm0 14a6 6 0 110-12 6 6 0 010 12z"></path>
                        <path d="M10 6a1 1 0 00-1 1v3a1 1 0 002 0V7a1 1 0 00-1-1zm0 8a1 1 0 100-2 1 1 0 000 2z"></path>
                      </svg>
                      Permission Needed
                    </>
          ) : (
            <>
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"></path>
                      </svg>
                      Location Status Unknown
                    </>
                  )}
                </span>
            </div>
          )}

            {/* Emergency SOS Button or Cancel Button */}
            <div className="mt-6 flex justify-center">
              {permissionStatus === 'denied' ? (
                <button
                  onClick={() => setShowPermissionModal(true)}
                  className="px-10 py-4 bg-blue-600 text-white rounded-lg font-bold text-xl hover:bg-blue-700 transition-colors"
                >
                  Enable Location Access
                </button>
              ) : sosActive ? (
                <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-lg text-center">
                  <p className="text-red-600 dark:text-red-400 font-bold">
                    <span className="inline-block w-3 h-3 bg-red-600 rounded-full mr-2 animate-pulse"></span>
                    Emergency SOS is active
                  </p>
                  <p className="mt-1 text-gray-600 dark:text-gray-300 text-sm">
                    Your emergency contacts have been notified.
                  </p>
                  
                  {/* Cancel button */}
                    <button
                    onClick={handleCancelSOS}
                    disabled={loading}
                    className="mt-4 px-8 py-3 bg-green-500 text-white rounded-lg font-bold text-lg hover:bg-green-600 transition-all disabled:opacity-50 flex items-center justify-center mx-auto"
                  >
                    {loading ? (
                      <>
                        <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                        Cancelling...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Cancel Emergency Alert
                      </>
                    )}
                    </button>
                  </div>
              ) : (
                // Show SOS activation button - Enhanced version
                <div className="flex flex-col items-center">
                  <button
                    onClick={startSOSCountdown}
                    disabled={loading || permissionStatus === 'prompt'}
                    className={`px-10 py-6 ${
                      permissionStatus !== 'granted' ? 'bg-red-300' : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800'
                    } text-white rounded-xl font-bold text-xl transition-all disabled:opacity-70 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-1 relative overflow-hidden group animate-pulse border-2 border-red-400`}
                    style={{ minWidth: '250px' }}
                  >
                    {loading ? (
                      <>
                        <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                        <span className="relative z-10">Sending Alert...</span>
                      </>
                    ) : (
                      <>
                        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
                        <div className="absolute -top-10 -left-10 w-16 h-16 bg-red-500 opacity-20 rounded-full group-hover:scale-[6] transition-all duration-500"></div>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 mr-3 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span className="relative z-10 tracking-wide font-black text-shadow">EMERGENCY SOS</span>
                      </>
                    )}
                    <span className="absolute -right-2 -top-2 flex h-6 w-6">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-300 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500"></span>
                    </span>
                  </button>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Press to activate emergency mode and alert your contacts
                  </p>
                </div>
              )}
            </div>
            
            {/* Help Information & Safety Tips - NEW SECTION */}
            {!sosActive && (
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-xl border border-blue-100 dark:border-blue-800">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    What happens when you activate SOS?
                  </h3>
                  <div className="mt-3 space-y-3 text-sm text-gray-600 dark:text-gray-300">
                    <div className="flex items-start">
                      <div className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 mr-2 flex-shrink-0">1</div>
                      <p>Your emergency contacts will receive an immediate notification with your location</p>
                    </div>
                    <div className="flex items-start">
                      <div className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 mr-2 flex-shrink-0">2</div>
                      <p>Your location will be continuously tracked and updated until you cancel the alert</p>
                      </div>
                    <div className="flex items-start">
                      <div className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 mr-2 flex-shrink-0">3</div>
                      <p>Local responders will be notified if they are available in your area</p>
                      </div>
                    </div>
                  </div>
                  
                <div className="bg-orange-50 dark:bg-orange-900/20 p-5 rounded-xl border border-orange-100 dark:border-orange-800">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    Quick Safety Tips
                  </h3>
                  <div className="mt-3 space-y-3 text-sm text-gray-600 dark:text-gray-300">
                    <div className="flex items-start">
                      <span className="text-orange-500 mr-2 font-bold">•</span>
                      <p>Stay in well-lit, public areas whenever possible</p>
                        </div>
                    <div className="flex items-start">
                      <span className="text-orange-500 mr-2 font-bold">•</span>
                      <p>Share your journey details with a trusted contact</p>
                        </div>
                    <div className="flex items-start">
                      <span className="text-orange-500 mr-2 font-bold">•</span>
                      <p>Keep your phone charged and accessible at all times</p>
                      </div>
                    <div className="flex items-start">
                      <span className="text-orange-500 mr-2 font-bold">•</span>
                      <p>Trust your instincts if a situation feels unsafe</p>
                        </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                <div 
                  ref={mapRef} 
              className="h-[300px] w-full bg-gray-100 dark:bg-gray-700 relative mt-6"
                >
              {!initialLoadComplete && (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center p-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                    <p>Loading map...</p>
                  </div>
                </div>
              )}
              {initialLoadComplete && !location && (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center p-4">
                    <p className="text-yellow-600 dark:text-yellow-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      Waiting for location data...
                </p>
              </div>
                    </div>
                  )}
                
              {/* In-map navigation button */}
              {location && initialLoadComplete && (
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-[400]">
                  <button 
                    onClick={() => openGoogleMapsDirections(
                      location.lat || location.latitude, 
                      location.lng || location.longitude
                    )}
                    className="flex flex-col items-center justify-center p-3 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-all hover:scale-110"
                    aria-label="Get directions to this location"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                    <span className="text-xs mt-1 font-medium">Go</span>
                  </button>
                </div>
              )}
              </div>

            {location && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-sm text-blue-700 dark:text-blue-300 border-t border-blue-100 dark:border-blue-800 flex justify-between items-center">
                <p className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                  <span>Tap on the map for directions</span>
                </p>
                
                <button
                  onClick={() => openGoogleMapsDirections(
                    location.lat || location.latitude, 
                    location.lng || location.longitude
                  )}
                  className="text-xs flex items-center text-blue-600 hover:text-blue-800 font-medium"
                >
                  Open in Maps
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </button>
                        </div>
            )}
                      </div>
        </motion.div>
                      </div>
                      
    {/* Navigation Options Modal */}
    {showNavigationModal && (
      <div className="modal-overlay">
        <div className="modal-content navigation-modal">
          <h3>Choose Navigation App</h3>
          <div className="navigation-buttons">
                        <button 
              className="btn google-maps-btn"
                          onClick={() => {
                window.open(
                  `https://www.google.com/maps/dir/?api=1&destination=${location.lat || location.latitude},${location.lng || location.longitude}`,
                  '_blank'
                );
                setShowNavigationModal(false);
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#1a73e8">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
              </svg>
              Google Maps
                        </button>
            {isIOSDevice() && (
                        <button 
                className="btn apple-maps-btn"
                onClick={() => {
                  window.open(
                    `http://maps.apple.com/?daddr=${location.lat || location.latitude},${location.lng || location.longitude}`,
                    '_blank'
                  );
                  setShowNavigationModal(false);
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#007aff">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                  <path d="M13 6l-4 4h3v7h2v-7h3z"/>
                </svg>
                Apple Maps
                        </button>
            )}
                <button
              className="btn cancel-btn"
              onClick={() => {
                setCancelAttempts(cancelAttempts + 1);
                setShowNavigationModal(false);
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#555">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
              Cancel
                </button>
            </div>
                </div>
            </div>
          )}

    {/* Floating Navigation Button (only shows when map and location are available) */}
    {mapInitialized && location && (
      <motion.button
        className="floating-nav-button"
        onClick={() => openGoogleMapsDirections(
          location.lat || location.latitude, 
          location.lng || location.longitude
        )}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label="Navigate to location"
      >
        <div className="button-content">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
            <path d="M21.71 11.29l-9-9a.996.996 0 00-1.41 0l-9 9a.996.996 0 000 1.41l9 9c.39.39 1.02.39 1.41 0l9-9a.996.996 0 000-1.41zM14 14.5V12h-4v3H8v-4c0-.55.45-1 1-1h5V7.5l3.5 3.5-3.5 3.5z"/>
          </svg>
          <span>Navigate</span>
          </div>
      </motion.button>
    )}

    {/* Emergency Status Indicator - During active SOS */}
    {sosActive && (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 bg-red-50 dark:bg-red-900/20 rounded-xl p-5 border-2 border-red-300 dark:border-red-800"
      >
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="relative mr-4">
              <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center border-4 border-red-300 dark:border-red-700">
                <span className="absolute w-4 h-4 bg-red-500 rounded-full top-0 right-0 animate-ping"></span>
                <span className="absolute w-3 h-3 bg-red-600 rounded-full top-0 right-0"></span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                    </div>
            </div>
                <div>
              <h3 className="text-lg font-bold text-red-700 dark:text-red-400">Emergency Alert Active</h3>
              <div className="flex items-center text-gray-600 dark:text-gray-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                <span>Active for: <span className="font-mono">{formatElapsedTime(elapsedTime)}</span></span>
                    </div>
                  </div>
              </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
                    <button 
              onClick={() => openGoogleMapsDirections()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center justify-center hover:bg-blue-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Navigate Here
                    </button>
            <button 
                onClick={handleCancelSOS}
              className="px-4 py-2 bg-green-500 text-white rounded-lg flex items-center justify-center hover:bg-green-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancel Alert
            </button>
            </div>
          </div>

        {notifiedContacts.length > 0 && (
          <div className="mt-4 pt-4 border-t border-red-200 dark:border-red-800">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              <span className="font-medium">Emergency contacts notified:</span> {notifiedContacts.length}
            </p>
            <div className="flex -space-x-2">
              {notifiedContacts.map((_, index) => (
                <div key={index} className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center border-2 border-white dark:border-gray-800 text-xs">
                  {index + 1}
          </div>
              ))}
            </div>
            </div>
          )}
        </motion.div>
    )}

    {/* Emergency Contact Information - NEW SECTION */}
    {!sosActive && (
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
        <div className="p-5 bg-gradient-to-r from-indigo-500 to-purple-600">
          <h2 className="text-xl font-bold text-white">Emergency Resources</h2>
          <p className="text-indigo-100 text-sm">Quick access to emergency services and contacts</p>
      </div>
        
        <div className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex items-start">
              <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center text-red-600 mr-3 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
                    <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Emergency Services</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Emergency: <strong className="text-red-600 dark:text-red-400">911</strong></p>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Police Non-Emergency: <strong>311</strong></p>
                <a href="tel:911" className="text-indigo-600 dark:text-indigo-400 text-sm mt-1 inline-block hover:underline">Call Now</a>
                    </div>
            </div>
            
            <div className="flex items-start">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 mr-3 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                              </svg>
                    </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Helplines</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Domestic Violence: <strong>1-800-799-7233</strong></p>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Crisis Text Line: <strong>Text HOME to 741741</strong></p>
                <Link to="/guardians" className="text-indigo-600 dark:text-indigo-400 text-sm mt-1 inline-block hover:underline">Manage My Contacts</Link>
                  </div>
              </div>
          </div>
          
          {/* Remove the buttons grid, keeping only the emergency contact information */}
          </div>
        </div>
      )}

      {/* Navigation Modal Styles */}
      <style jsx>{`
        /* Enhanced Navigation Button Styles */
        .floating-nav-button {
          position: fixed;
          bottom: 90px;
          right: 20px;
          background: linear-gradient(135deg, #ff5f6d, #ff2b67);
          color: white;
          border: none;
          border-radius: 50%;
          width: 70px;
          height: 70px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(255, 47, 103, 0.5);
          cursor: pointer;
          z-index: 1000;
          transition: all 0.3s ease;
          animation: pulse 2s infinite;
        }
        
        .floating-nav-button .button-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        
        .floating-nav-button:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 20px rgba(255, 47, 103, 0.6);
          animation: none;
        }
        
        .floating-nav-button span {
          font-size: 12px;
          margin-top: 3px;
          font-weight: 700;
          letter-spacing: 0.5px;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
        }
        
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(255, 47, 103, 0.8);
          }
          70% {
            box-shadow: 0 0 0 20px rgba(255, 47, 103, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(255, 47, 103, 0);
          }
        }
        
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(3px);
          z-index: 9998;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: fadeIn 0.2s ease-out;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .modal-content {
          position: relative;
          background: white;
          border-radius: 20px;
          padding: 28px;
          z-index: 9999;
          width: 90%;
          max-width: 400px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
          animation: slideUp 0.3s ease-out;
        }
        
        @keyframes slideUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        .navigation-modal h3 {
          margin-top: 0;
          color: #333;
          font-size: 22px;
          text-align: center;
          font-weight: 700;
          margin-bottom: 20px;
        }
        
        .navigation-buttons {
          display: flex;
          flex-direction: column;
          gap: 14px;
          margin-top: 24px;
        }
        
        .navigation-buttons .btn {
          padding: 16px;
          border-radius: 14px;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 16px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
        }
        
        .navigation-buttons .btn svg {
          margin-right: 12px;
        }
        
        .google-maps-btn {
          background-color: #e8f0fe;
          color: #1a73e8;
        }
        
        .google-maps-btn:hover {
          background-color: #d2e3fc;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(26, 115, 232, 0.2);
        }
        
        .apple-maps-btn {
          background-color: #e9f5ff;
          color: #007aff;
        }
        
        .apple-maps-btn:hover {
          background-color: #d0ebff;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 122, 255, 0.2);
        }
        
        .cancel-btn {
          background-color: #f2f2f2;
          color: #555;
          margin-top: 6px;
        }
        
        .cancel-btn:hover {
          background-color: #e5e5e5;
          transform: translateY(-2px);
        }
        
        /* Additional pulse animations for SOS button */
        @keyframes sos-pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.7);
          }
          70% {
            box-shadow: 0 0 0 15px rgba(220, 38, 38, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(220, 38, 38, 0);
          }
        }
        
        @keyframes sos-glow {
          0%, 100% {
            filter: drop-shadow(0 0 6px rgba(239, 68, 68, 0.7));
          }
          50% {
            filter: drop-shadow(0 0 12px rgba(239, 68, 68, 0.9));
          }
        }
        
        .sos-pulse-effect {
          animation: sos-pulse 2s infinite cubic-bezier(0.66, 0, 0, 1);
          position: relative;
        }
        
        .sos-pulse-effect:before {
          content: '';
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          background-color: rgba(220, 38, 38, 0.3);
          border-radius: 10px;
          z-index: -1;
          animation: sos-glow 3s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default SOS; 