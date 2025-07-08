import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useBaristaCode } from '@/hooks/useBaristaCode';
import { useQRScanner } from '@/hooks/useQRScanner';
import { CodeInputForm } from '@/components/barista/CodeInputForm';
import { BaristaHeader } from '@/components/barista/BaristaHeader';
import { QRScanner } from '@/components/barista/QRScanner';
import { CustomerInfo } from '@/components/barista/CustomerInfo';
import { PurchaseForm } from '@/components/barista/PurchaseForm';
import { Instructions } from '@/components/barista/Instructions';

export const BaristaApp: React.FC = () => {
  const [amount, setAmount] = useState('');
  const [processingPoints, setProcessingPoints] = useState(false);
  const { toast } = useToast();
  
  const {
    baristaCode,
    accessCode,
    setAccessCode,
    checkingCode,
    showCodeInput,
    handleCodeSubmit,
    handleLogout
  } = useBaristaCode();

  const {
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
  } = useQRScanner();

  const handleAddPoints = async () => {
    if (!scannedCustomer || !amount) {
      toast({
        title: "Date incomplete",
        description: "Vă rugăm să scanați QR-ul și să introduceți suma",
        variant: "destructive"
      });
      return;
    }

    const purchaseAmount = parseFloat(amount);
    if (purchaseAmount <= 0) {
      toast({
        title: "Sumă invalidă",
        description: "Suma trebuie să fie mai mare de 0",
        variant: "destructive"
      });
      return;
    }

    setProcessingPoints(true);

    try {
      // Call the edge function to add points
      const { data, error } = await supabase.functions.invoke('add-points', {
        body: {
          qr_data: {
            customer_id: scannedCustomer.customer_id,
            token: scannedCustomer.token,
            timestamp: scannedCustomer.timestamp,
            name: scannedCustomer.name
          },
          amount: purchaseAmount
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Puncte adăugate!",
        description: `${data.points_added} puncte adăugate pentru ${scannedCustomer.name}`,
      });

      // Reset form
      setAmount('');
      resetScanner();

    } catch (error: any) {
      console.error('Error adding points:', error);
      toast({
        title: "Eroare",
        description: error.message || "A apărut o eroare la adăugarea punctelor",
        variant: "destructive"
      });
    } finally {
      setProcessingPoints(false);
    }
  };

  const handleBaristaLogout = () => {
    handleLogout();
    setAmount('');
    resetScanner();
  };

  // Show code input screen if no valid code entered
  if (showCodeInput) {
    return (
      <CodeInputForm
        accessCode={accessCode}
        setAccessCode={setAccessCode}
        checkingCode={checkingCode}
        onSubmit={handleCodeSubmit}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <BaristaHeader 
        baristaCode={baristaCode!}
        onLogout={handleBaristaLogout}
      />

      <div className="max-w-md mx-auto px-4">
        <QRScanner
          qrInput={qrInput}
          setQrInput={setQrInput}
          cameraActive={cameraActive}
          videoRef={videoRef}
          canvasRef={canvasRef}
          onStartCamera={startCamera}
          onStopCamera={stopCamera}
          onCaptureFrame={captureFrame}
          onQRScan={handleQRScan}
        />

        {scannedCustomer && (
          <CustomerInfo customer={scannedCustomer} />
        )}

        <PurchaseForm
          amount={amount}
          setAmount={setAmount}
          processingPoints={processingPoints}
          onAddPoints={handleAddPoints}
          hasScannedCustomer={!!scannedCustomer}
        />

        <Instructions />
      </div>
    </div>
  );
};

export default BaristaApp;