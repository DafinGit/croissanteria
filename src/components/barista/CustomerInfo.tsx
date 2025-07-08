import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { User, CheckCircle } from 'lucide-react';

interface ScannedCustomer {
  customer_id: string;
  name: string;
  token: string;
  timestamp: number;
}

interface CustomerInfoProps {
  customer: ScannedCustomer;
}

export const CustomerInfo: React.FC<CustomerInfoProps> = ({ customer }) => {
  return (
    <Card className="mb-6 backdrop-blur-sm bg-green-50/90 shadow-xl border-green-200">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-green-800">{customer.name}</h3>
            <p className="text-sm text-green-600">Client validat</p>
          </div>
          <CheckCircle className="w-5 h-5 text-green-500 ml-auto" />
        </div>
      </CardContent>
    </Card>
  );
};