import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export const Instructions: React.FC = () => {
  return (
    <Card className="mb-6 backdrop-blur-sm bg-blue-50/90 shadow-lg border-blue-200">
      <CardContent className="p-4">
        <h4 className="font-semibold text-blue-800 mb-2">Instrucțiuni:</h4>
        <ol className="text-sm text-blue-700 space-y-1">
          <li>1. Rugați clientul să deschidă aplicația (mod Client)</li>
          <li>2. Scanați cu camera sau cereți datele QR</li>
          <li>3. Introduceți suma achiziției</li>
          <li>4. Confirmați adăugarea punctelor</li>
        </ol>
      </CardContent>
    </Card>
  );
};