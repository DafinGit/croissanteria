import { useState, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface ScannedCustomer {
  customer_id: string;
  name: string;
  token: string;
  timestamp: number;
}

export const useQRScanner = () => {
  const [qrInput, setQrInput] = useState('');
  const [scannedCustomer, setScannedCustomer] = useState<ScannedCustomer | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Use back camera on mobile
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
        toast({
          title: "Camera activată",
          description: "Îndreptați camera către QR code-ul clientului",
        });
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: "Eroare cameră",
        description: "Nu pot accesa camera. Folosiți introducerea manuală.",
        variant: "destructive"
      });
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const captureFrame = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);
        
        // Convert to data URL and try to parse QR
        // This is a simplified version - in real app you'd use a QR library
        toast({
          title: "Imagine capturată",
          description: "Pentru această demonstrație, folosiți introducerea manuală",
        });
      }
    }
  };

  const handleQRScan = () => {
    try {
      // Parse QR code data
      const qrData = JSON.parse(qrInput);
      
      if (!qrData.customer_id || !qrData.token || !qrData.name) {
        toast({
          title: "QR Code invalid",
          description: "Codul QR nu este valid sau este prea vechi",
          variant: "destructive"
        });
        return;
      }

      // Check if QR code is not too old (max 5 minutes)
      const qrAge = Date.now() - qrData.timestamp;
      if (qrAge > 5 * 60 * 1000) {
        toast({
          title: "QR Code expirat",
          description: "Acest cod QR a expirat. Rugați clientul să refresheze codul.",
          variant: "destructive"
        });
        return;
      }

      setScannedCustomer({
        customer_id: qrData.customer_id,
        name: qrData.name,
        token: qrData.token,
        timestamp: qrData.timestamp
      });

      toast({
        title: "QR Code valid!",
        description: `Client: ${qrData.name}`,
      });

    } catch (error) {
      toast({
        title: "Eroare QR Code",
        description: "Nu pot citi codul QR. Verificați formatul.",
        variant: "destructive"
      });
    }
  };

  const resetScanner = () => {
    setQrInput('');
    setScannedCustomer(null);
    stopCamera();
  };

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return {
    qrInput,
    setQrInput,
    scannedCustomer,
    cameraActive,
    videoRef,
    canvasRef,
    startCamera,
    stopCamera,
    captureFrame,
    handleQRScan,
    resetScanner
  };
};