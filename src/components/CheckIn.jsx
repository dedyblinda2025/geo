import React, { useState, useEffect } from 'react';
import { Button, Box, Typography, CircularProgress, Alert } from '@mui/material';
import { GoogleMap, LoadScript, Marker, Circle } from '@react-google-maps/api';
import CameraComponent from './Camera';

// Office location (example coordinates - replace with your office location)
const OFFICE_LOCATION = {
  lat: -8.699533461763505, // Replace with your office latitude
  lng: 115.17766812036525 // Replace with your office longitude
};
const ALLOWED_RADIUS = 100; // Radius in meters within which check-in is allowed

const CheckIn = () => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isWithinRange, setIsWithinRange] = useState(false);
  const [selfieImage, setSelfieImage] = useState(null);

  // Calculate distance between two points in meters
  const calculateDistance = (point1, point2) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = point1.lat * Math.PI/180;
    const φ2 = point2.lat * Math.PI/180;
    const Δφ = (point2.lat - point1.lat) * Math.PI/180;
    const Δλ = (point2.lng - point1.lng) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setCurrentLocation(userLocation);
          
          // Check if user is within allowed radius
          const distance = calculateDistance(userLocation, OFFICE_LOCATION);
          setIsWithinRange(distance <= ALLOWED_RADIUS);
          setLoading(false);
        },
        (error) => {
          setError('Error getting location: ' + error.message);
          setLoading(false);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
    }
  }, []);

  const handleCapture = (image) => {
    setSelfieImage(image);
  };

  const handleCheckIn = () => {
    if (currentLocation && isWithinRange && selfieImage) {
      console.log('Checking in at:', currentLocation);
      console.log('Selfie image:', selfieImage);
      // Here you would typically send both location and selfie to your backend
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Check In
      </Typography>
      {currentLocation && (
        <>
          <Box sx={{ height: '400px', width: '100%', mb: 2 }}>
            <LoadScript googleMapsApiKey="AIzaSyAv4PqIHO3efPh8xcZGG-IirtKn6g46D10">
              <GoogleMap
                mapContainerStyle={{ height: '100%', width: '100%' }}
                center={OFFICE_LOCATION}
                zoom={15}
              >
                <Marker position={currentLocation} />
                <Marker 
                  position={OFFICE_LOCATION}
                  icon="http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
                />
                <Circle
                  center={OFFICE_LOCATION}
                  radius={ALLOWED_RADIUS}
                  options={{
                    fillColor: '#0088ff',
                    fillOpacity: 0.2,
                    strokeColor: '#0088ff',
                    strokeOpacity: 0.5,
                  }}
                />
              </GoogleMap>
            </LoadScript>
          </Box>
          {!isWithinRange && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              You must be within {ALLOWED_RADIUS} meters of the office to check in
            </Alert>
          )}
          {isWithinRange && !selfieImage && (
            <Box sx={{ my: 2 }}>
              <CameraComponent onCapture={handleCapture} />
            </Box>
          )}
          {selfieImage && (
            <Box sx={{ my: 2, textAlign: 'center' }}>
              <img 
                src={selfieImage} 
                alt="Selfie" 
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '200px', 
                  borderRadius: '8px' 
                }} 
              />
            </Box>
          )}
        </>
      )}
      <Button
        variant="contained"
        color="primary"
        onClick={handleCheckIn}
        disabled={!currentLocation || !isWithinRange || !selfieImage}
      >
        Check In
      </Button>
    </Box>
  );
};

export default CheckIn;