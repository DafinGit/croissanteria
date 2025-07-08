import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScanLine, Banknote, Plus, CheckCircle, AlertCircle, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ScannedCustomer {
  customer_id: string;
  name: string;
  token: string;
  timestamp: number;
}

export const BaristaScanner: React.FC = () => {
  const [qrInput, setQrInput] = useState('');
  const [amount, setAmount] = useState('');
  const [scannedCustomer, setScannedCustomer] = useState<ScannedCustomer | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

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

    setLoading(true);

    try {
      // Call the edge function to add points with new format
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
      setQrInput('');
      setAmount('');
      setScannedCustomer(null);

    } catch (error: any) {
      console.error('Error adding points:', error);
      toast({
        title: "Eroare",
        description: error.message || "A apărut o eroare la adăugarea punctelor",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getPointsToAdd = () => {
    const purchaseAmount = parseFloat(amount) || 0;
    return Math.floor(purchaseAmount * 10); // 1 LEI = 10 points
  };

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Scanner Barista</h1>
          <p className="text-gray-600">Scanează QR-ul clientului pentru a adăuga puncte</p>
        </div>

        {/* QR Scanner */}
        <Card className="mb-6 backdrop-blur-sm bg-white/90 shadow-xl border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ScanLine className="w-5 h-5" />
              Scanează QR Code
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="qr-input">Date QR Code</Label>
              <Input
                id="qr-input"
                placeholder="Copiază datele din QR code aici..."
                value={qrInput}
                onChange={(e) => setQrInput(e.target.value)}
                className="font-mono text-sm"
              />
            </div>
            <Button 
              onClick={handleQRScan}
              disabled={!qrInput.trim()}
              className="w-full"
            >
              <ScanLine className="w-4 h-4 mr-2" />
              Procesează QR Code
            </Button>
          </CardContent>
        </Card>

        {/* Customer Info */}
        {scannedCustomer && (
          <Card className="mb-6 backdrop-blur-sm bg-green-50/90 shadow-xl border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-green-800">{scannedCustomer.name}</h3>
                  <p className="text-sm text-green-600">Client validat</p>
                </div>
                <CheckCircle className="w-5 h-5 text-green-500 ml-auto" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Purchase Amount */}
        <Card className="mb-6 backdrop-blur-sm bg-white/90 shadow-xl border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Banknote className="w-5 h-5" />
              Suma Achiziție
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="amount">Suma în Lei</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            
            {amount && (
              <div className="bg-amber-50 p-3 rounded-lg">
                <p className="text-sm text-amber-800">
                  <strong>Puncte de adăugat:</strong> {getPointsToAdd()} puncte
                </p>
                <p className="text-xs text-amber-600 mt-1">
                  (1 LEI = 10 puncte)
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Points Button */}
        <Button
          onClick={handleAddPoints}
          disabled={!scannedCustomer || !amount || loading}
          className="w-full h-12 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold shadow-lg"
        >
          {loading ? (
            "Se procesează..."
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Adaugă {getPointsToAdd()} Puncte
            </>
          )}
        </Button>

        {/* Instructions */}
        <Card className="mt-6 backdrop-blur-sm bg-blue-50/90 shadow-lg border-blue-200">
          <CardContent className="p-4">
            <h4 className="font-semibold text-blue-800 mb-2">Instrucțiuni:</h4>
            <ol className="text-sm text-blue-700 space-y-1">
              <li>1. Rugați clientul să deschidă aplicația</li>
              <li>2. Scanați sau copiați datele din QR code</li>
              <li>3. Introduceți suma achiziției</li>
              <li>4. Confirmați adăugarea punctelor</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};