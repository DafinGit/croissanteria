
import React from 'react';
import { Star, Clock } from 'lucide-react';
import { User as UserType } from '@/pages/Index';
import { useRewards } from '@/hooks/useRewards';
import { RewardCard } from './RewardCard';
import { PurchasedRewardCard } from './PurchasedRewardCard';

interface RewardsScreenProps {
  user: UserType;
  onUpdatePoints: (newPoints: number) => void;
}

export const RewardsScreen: React.FC<RewardsScreenProps> = ({ user, onUpdatePoints }) => {
  const { availableRewards, purchasedRewards, loading, redeeming, handleRedeem } = useRewards(user);

  const onRewardRedeem = (reward: any) => {
    handleRedeem(reward, onUpdatePoints);
  };

  return (
    <div className="min-h-screen p-4 pb-20">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Meniul de recompense</h1>
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-500" />
          <span className="text-lg font-semibold text-amber-600">
            {user.points} puncte disponibile
          </span>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
        </div>
      ) : (
        <>
          {/* Available Rewards List */}
          <div className="space-y-4">
            {availableRewards.map((reward) => (
              <RewardCard
                key={reward.id}
                reward={reward}
                userPoints={user.points}
                onRedeem={onRewardRedeem}
                disabled={redeeming}
              />
            ))}
          </div>

          {/* Purchased Rewards */}
          {purchasedRewards.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-600" />
                Recompense folosite recent
              </h2>
              
              <div className="space-y-3">
                {purchasedRewards.map((transaction) => (
                  <PurchasedRewardCard
                    key={transaction.id}
                    transaction={transaction}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
