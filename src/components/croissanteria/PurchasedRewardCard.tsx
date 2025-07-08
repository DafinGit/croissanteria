import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingDown } from 'lucide-react';
import { formatDate } from '@/utils/rewardUtils';

interface PurchasedRewardCardProps {
  transaction: any;
}

export const PurchasedRewardCard: React.FC<PurchasedRewardCardProps> = ({ transaction }) => {
  return (
    <Card className="backdrop-blur-sm bg-orange-50/80 shadow-lg border-0">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-orange-500">
              <TrendingDown className="w-5 h-5 text-white" />
            </div>
            
            <div>
              <h3 className="font-medium text-gray-800 mb-1">
                {transaction.description?.replace('Folosit: ', '') || 'Recompensă'}
              </h3>
              <p className="text-sm text-gray-500">
                {formatDate(transaction.created_at)}
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-lg font-bold text-orange-600">
              {transaction.points_change}
            </div>
            <Badge className="text-xs bg-orange-100 text-orange-700">
              Folosită
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};