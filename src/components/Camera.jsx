import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Box, Button, IconButton, Typography } from '@mui/material';
import { Camera, FlipCameraIos } from '@mui/icons-material';

const CameraComponent = ({ onCapture }) => {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [facingMode, setFacingMode] = useState('user');
  const [error, setError] = useState(null);

  const startCamera = async () => {
    try {
      const constraints = {
        video: {
          facingMode: facingMode, // Menggunakan facingMode
        },
        audio: false,
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.setAttribute('playsinline', true);

        await videoRef.current.play().catch((e) => {
          console.error('Video play error:', e);
          setError('Failed to play video stream');
        });

        setStream(mediaStream);
        setError(null);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError(`Camera error: ${err.message}`);
      setStream(null);
    }
  };

  useEffect(() => {
    startCamera();
    
    return () => {
      stopCamera();
    };
  }, [facingMode]); // Perubahan facingMode akan memulai ulang kamera

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  const switchCamera = useCallback(() => {
    setFacingMode(prevMode => (prevMode === 'user' ? 'environment' : 'user'));
  }, []);

  const takePicture = useCallback(() => {
    if (!videoRef.current) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
    
    const image = canvas.toDataURL('image/jpeg');
    onCapture(image);
    stopCamera();
  }, [onCapture, stopCamera]);

  return (
    <Box sx={{ position: 'relative', width: '100%', maxWidth: 400, margin: 'auto' }}>
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      {!stream ? (
        <Button
          variant="contained"
          startIcon={<Camera />}
          onClick={() => {
            setError(null);
            startCamera();
          }}
          fullWidth
        >
          Open Camera
        </Button>
      ) : (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{ 
              width: '100%', 
              borderRadius: '8px',
              transform: facingMode === 'user' ? 'scaleX(-1)' : 'none'
            }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
            <IconButton onClick={switchCamera}>
              <FlipCameraIos />
            </IconButton>
            <Button variant="contained" color="primary" onClick={takePicture}>
              Take Photo
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
};

export default CameraComponent;
