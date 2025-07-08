import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getRewardIcon, canRedeem } from '@/utils/rewardUtils';

interface RewardCardProps {
  reward: any;
  userPoints: number;
  onRedeem: (reward: any) => void;
  disabled?: boolean;
}

export const RewardCard: React.FC<RewardCardProps> = ({ reward, userPoints, onRedeem, disabled = false }) => {
  const IconComponent = getRewardIcon(reward.name || 'reward');
  const canUserRedeem = canRedeem(userPoints, reward.points_cost || 0) && !disabled;
  
  return (
    <Card 
      className={`backdrop-blur-sm shadow-lg border-0 transition-all duration-200 ${
        canUserRedeem 
          ? 'bg-white/90 hover:bg-white/95 hover:shadow-xl' 
          : 'bg-gray-100/60 opacity-75'
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              canUserRedeem 
                ? 'bg-gradient-to-br from-amber-400 to-orange-500' 
                : 'bg-gray-400'
            }`}>
              <IconComponent className="w-6 h-6 text-white" />
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-800 mb-1">
                {reward.name}
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                {reward.description}
              </p>
              <Badge 
                variant="secondary" 
                className={`${
                  canUserRedeem 
                    ? 'bg-amber-100 text-amber-800' 
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {reward.points_cost} puncte
              </Badge>
            </div>
          </div>
          
          <Button
            onClick={() => onRedeem(reward)}
            disabled={!canUserRedeem}
            className={`${
              canUserRedeem
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            } transition-all duration-200`}
          >
            {canUserRedeem ? 'Folosește' : 'Ai nevoie de mai multe puncte'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};