import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ScanLine, 
  Camera, 
  Smartphone,
  AlertCircle
} from 'lucide-react';

interface QRScannerProps {
  qrInput: string;
  setQrInput: (value: string) => void;
  cameraActive: boolean;
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  onStartCamera: () => void;
  onStopCamera: () => void;
  onCaptureFrame: () => void;
  onQRScan: () => void;
}

export const QRScanner: React.FC<QRScannerProps> = ({
  qrInput,
  setQrInput,
  cameraActive,
  videoRef,
  canvasRef,
  onStartCamera,
  onStopCamera,
  onCaptureFrame,
  onQRScan
}) => {
  return (
    <>
      {/* Camera Scanner */}
      <Card className="mb-6 backdrop-blur-sm bg-white/90 shadow-xl border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Scanner Cameră
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!cameraActive ? (
            <Button 
              onClick={onStartCamera}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
            >
              <Camera className="w-4 h-4 mr-2" />
              Activează Camera
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="relative bg-gray-900 rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 border-2 border-green-400 rounded-lg pointer-events-none">
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-green-400 rounded-lg"></div>
                </div>
              </div>
              <canvas ref={canvasRef} className="hidden" />
              <div className="flex gap-2">
                <Button 
                  onClick={onCaptureFrame}
                  className="flex-1 bg-green-500 hover:bg-green-600"
                >
                  <ScanLine className="w-4 h-4 mr-2" />
                  Scanează
                </Button>
                <Button 
                  onClick={onStopCamera}
                  variant="outline"
                  className="flex-1"
                >
                  Oprește
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Manual QR Input */}
      <Card className="mb-6 backdrop-blur-sm bg-white/90 shadow-xl border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Introducere Manuală
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Rugați clientul să copieze datele QR din aplicația lor și să vi le trimită
            </AlertDescription>
          </Alert>
          <div>
            <Label htmlFor="qr-input">Date QR Code</Label>
            <Input
              id="qr-input"
              placeholder="Lipește datele din QR code aici..."
              value={qrInput}
              onChange={(e) => setQrInput(e.target.value)}
              className="font-mono text-sm"
            />
          </div>
          <Button 
            onClick={onQRScan}
            disabled={!qrInput.trim()}
            className="w-full"
          >
            <ScanLine className="w-4 h-4 mr-2" />
            Procesează QR Code
          </Button>
        </CardContent>
      </Card>
    </>
  );
};