import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft,
  Coffee,
  LogOut
} from 'lucide-react';

interface BaristaCode {
  id: string;
  code: string;
  name: string;
  is_active: boolean;
}

interface BaristaHeaderProps {
  baristaCode: BaristaCode;
  onLogout: () => void;
}

export const BaristaHeader: React.FC<BaristaHeaderProps> = ({
  baristaCode,
  onLogout
}) => {
  const navigate = useNavigate();

  const handleBackToRoleSelector = () => {
    navigate('/');
  };

  return (
    <>
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

      {/* Barista Header */}
      <div className="text-center pt-16 pb-4">
        <div className="bg-white/80 backdrop-blur-sm mx-4 rounded-lg shadow-md p-3">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Coffee className="w-5 h-5 text-green-600" />
            <h1 className="text-lg font-bold text-green-600">Mod Barista</h1>
            <Button
              onClick={onLogout}
              variant="ghost"
              size="sm"
              className="ml-auto text-gray-600 hover:text-gray-800"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-sm text-gray-600">Scanează QR-ul clientului pentru a adăuga puncte</p>
          <p className="text-xs text-green-600 font-medium">Conectat ca: {baristaCode.name}</p>
          <p className="text-xs text-gray-500">Cod: {baristaCode.code}</p>
        </div>
      </div>
    </>
  );
};