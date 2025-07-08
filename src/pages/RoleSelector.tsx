import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QrCode, ScanLine, Coffee, Smartphone } from 'lucide-react';

export const RoleSelector: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Coffee className="w-8 h-8 text-amber-600" />
            <h1 className="text-4xl font-bold text-gray-800">Croissanteria</h1>
          </div>
          <p className="text-gray-600 text-lg">Alege rolul tău pentru a continua</p>
        </div>

        {/* Role Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          
          {/* Client Card */}
          <Card className="backdrop-blur-sm bg-white/90 shadow-xl border-0 hover:scale-105 transition-transform duration-300">
            <CardHeader className="text-center pb-4">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Smartphone className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-800">Sunt Client</CardTitle>
              <p className="text-gray-600">Vreau să câștig puncte cu achizițiile mele</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Ce pot face:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Afișez QR-ul meu unic pentru puncte</li>
                  <li>• Văd istoricul achizițiilor</li>
                  <li>• Verific recompensele disponibile</li>
                  <li>• Urmăresc progresul către niveluri superioare</li>
                </ul>
              </div>
              <Button 
                onClick={() => navigate('/client')}
                className="w-full h-12 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold"
              >
                <QrCode className="w-5 h-5 mr-2" />
                Intru ca Client
              </Button>
            </CardContent>
          </Card>

          {/* Barista Card */}
          <Card className="backdrop-blur-sm bg-white/90 shadow-xl border-0 hover:scale-105 transition-transform duration-300">
            <CardHeader className="text-center pb-4">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Coffee className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-800">Sunt Barista</CardTitle>
              <p className="text-gray-600">Scanez QR-urile clienților pentru puncte</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">Ce pot face:</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Scanez QR-uri cu camera</li>
                  <li>• Adaug puncte pentru achiziții</li>
                  <li>• Procesez recompense</li>
                  <li>• Văd validarea codurilor în timp real</li>
                </ul>
              </div>
              <Button 
                onClick={() => navigate('/barista')}
                className="w-full h-12 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold"
              >
                <ScanLine className="w-5 h-5 mr-2" />
                Intru ca Barista
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-500 text-sm">
            Aplicația funcționează symbiotic - clientul afișează QR-ul, barista îl scanează
          </p>
        </div>
      </div>
    </div>
  );
};

export default RoleSelector;