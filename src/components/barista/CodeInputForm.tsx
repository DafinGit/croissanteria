import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  ArrowLeft,
  Coffee,
  RefreshCw,
  CheckCircle
} from 'lucide-react';

interface CodeInputFormProps {
  accessCode: string;
  setAccessCode: (code: string) => void;
  checkingCode: boolean;
  onSubmit: () => void;
}

export const CodeInputForm: React.FC<CodeInputFormProps> = ({
  accessCode,
  setAccessCode,
  checkingCode,
  onSubmit
}) => {
  const navigate = useNavigate();

  const handleBackToRoleSelector = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Back Button */}
      <div className="absolute top-4 left-4 z-50">
        <Button
          onClick={handleBackToRoleSelector}
          variant="ghost"
          size="sm"
          className="bg-white/80 backdrop-blur-sm shadow-md hover:bg-white/90"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Înapoi la Alegerea Rolului
        </Button>
      </div>

      {/* Code Input */}
      <div className="flex items-center justify-center min-h-screen px-4">
        <Card className="w-full max-w-md backdrop-blur-sm bg-white/90 shadow-xl border-0">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Coffee className="w-6 h-6 text-green-600" />
              Acces Barista
            </CardTitle>
            <p className="text-sm text-gray-600 mt-2">
              Introduceți codul de acces pentru a continua
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="access-code">Cod de Acces (15 caractere)</Label>
              <Input
                id="access-code"
                placeholder="ABC123DEF456GHI"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                maxLength={15}
                className="font-mono text-center text-lg tracking-wider"
              />
            </div>
            
            <Button 
              onClick={onSubmit}
              disabled={!accessCode.trim() || checkingCode}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
            >
              {checkingCode ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-2" />
              )}
              {checkingCode ? "Se verifică..." : "Verifică Codul"}
            </Button>

            <div className="bg-blue-50 p-3 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Coduri de test:</h4>
              <div className="space-y-1 text-sm text-blue-700 font-mono">
                <p>ABC123DEF456GHI - Barista Principal</p>
                <p>XYZ789JKL012MNO - Barista Secundar</p>
                <p>PQR345STU678VWX - Barista Manager</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};