import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Banknote, 
  Plus, 
  RefreshCw
} from 'lucide-react';

interface PurchaseFormProps {
  amount: string;
  setAmount: (amount: string) => void;
  processingPoints: boolean;
  onAddPoints: () => void;
  hasScannedCustomer: boolean;
}

export const PurchaseForm: React.FC<PurchaseFormProps> = ({
  amount,
  setAmount,
  processingPoints,
  onAddPoints,
  hasScannedCustomer
}) => {
  const getPointsToAdd = () => {
    const purchaseAmount = parseFloat(amount) || 0;
    return Math.floor(purchaseAmount * 10); // 1 LEI = 10 points
  };

  return (
    <>
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
        onClick={onAddPoints}
        disabled={!hasScannedCustomer || !amount || processingPoints}
        className="w-full h-12 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold shadow-lg mb-6"
      >
        {processingPoints ? (
          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Plus className="w-4 h-4 mr-2" />
        )}
        {processingPoints ? "Se procesează..." : `Adaugă ${getPointsToAdd()} Puncte`}
      </Button>
    </>
  );
};