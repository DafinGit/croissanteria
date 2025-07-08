
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Calendar, Award, Clock } from 'lucide-react';
import { User as UserType } from '@/pages/Index';
import { supabase } from '@/integrations/supabase/client';
import { PurchasedRewardCard } from './PurchasedRewardCard';

interface HistoryScreenProps {
  user: UserType;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({ user }) => {
  const [earnedTransactions, setEarnedTransactions] = useState<any[]>([]);
  const [usedTransactions, setUsedTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, [user.id]);

  const fetchTransactions = async () => {
    try {
      // Fetch all user transactions
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const earned = transactions?.filter(t => t.points_change && t.points_change > 0) || [];
      const used = transactions?.filter(t => t.points_change && t.points_change < 0) || [];
      
      setEarnedTransactions(earned);
      setUsedTransactions(used);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate cumulative total earned points (never decreases)
  const totalEarned = earnedTransactions.reduce((sum, t) => sum + (t.points_change || 0), 0);
  
  // Calculate total used points
  const totalRedeemed = usedTransactions.reduce((sum, t) => sum + Math.abs(t.points_change || 0), 0);

  return (
    <div className="min-h-screen p-4 pb-20">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Istoricul tranzacțiilor</h1>
        <p className="text-gray-600">Urmăriți călătoria punctelor dumneavoastră</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card className="backdrop-blur-sm bg-green-50/80 shadow-lg border-0">
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-700 mb-1">
              {totalEarned}
            </div>
            <p className="text-sm text-green-600">Puncte câștigate</p>
          </CardContent>
        </Card>
        
        <Card className="backdrop-blur-sm bg-orange-50/80 shadow-lg border-0">
          <CardContent className="p-4 text-center">
            <Award className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-orange-700 mb-1">
              {totalRedeemed}
            </div>
            <p className="text-sm text-orange-600">Puncte folosite</p>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
        </div>
      ) : (
        <>
          {/* Earned Points List */}
          {earnedTransactions.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Puncte câștigate
              </h2>
              
              <div className="space-y-3">
                {earnedTransactions.map((transaction) => (
                  <Card 
                    key={transaction.id} 
                    className="backdrop-blur-sm bg-green-50/80 shadow-lg border-0 hover:bg-green-50/90 transition-all duration-200"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-green-500">
                            <TrendingUp className="w-5 h-5 text-white" />
                          </div>
                          
                          <div>
                            <h3 className="font-medium text-gray-800 mb-1">
                              {transaction.description}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {new Date(transaction.created_at).toLocaleDateString('ro-RO', {
                                day: '2-digit',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">
                            +{transaction.points_change}
                          </div>
                          <Badge className="text-xs bg-green-100 text-green-700">
                            Câștigate
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Used Points List */}
          {usedTransactions.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-600" />
                Puncte folosite
              </h2>
              
              <div className="space-y-3">
                {usedTransactions.map((transaction) => (
                  <PurchasedRewardCard
                    key={transaction.id}
                    transaction={transaction}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {earnedTransactions.length === 0 && usedTransactions.length === 0 && (
            <Card className="backdrop-blur-sm bg-white/80 shadow-lg border-0">
              <CardContent className="p-8 text-center">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  Încă nu aveți tranzacții
                </h3>
                <p className="text-gray-500">
                  Începeți să câștigați puncte făcând prima achiziție!
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};
