import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { User as UserType } from '@/pages/Index';

export const useRewards = (user: UserType) => {
  const { toast } = useToast();
  const [availableRewards, setAvailableRewards] = useState<any[]>([]);
  const [purchasedRewards, setPurchasedRewards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(false);

  const fetchRewards = async () => {
    try {
      // Fetch available rewards (not purchased yet)
      const { data: available, error: availableError } = await supabase
        .from('rewards')
        .select('*')
        .eq('purchase_status', 'available')
        .eq('is_active', true);

      if (availableError) throw availableError;

      // Fetch user's reward transactions
      const { data: purchased, error: purchasedError } = await supabase
        .from('transactions')
        .select('*')
        .eq('customer_id', user.id)
        .lt('points_change', 0)
        .order('created_at', { ascending: false });

      if (purchasedError) throw purchasedError;

      setAvailableRewards(available || []);
      setPurchasedRewards(purchased || []);
    } catch (error) {
      console.error('Error fetching rewards:', error);
      toast({
        title: "Eroare",
        description: "Nu s-au putut încărca recompensele.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async (reward: any, onUpdatePoints: (newPoints: number) => void) => {
    if (redeeming) return;
    
    if (user.points < reward.points_cost) {
      toast({
        title: "Puncte insuficiente",
        description: `Aveți nevoie de încă ${reward.points_cost - user.points} puncte pentru a folosi această recompensă.`,
        variant: "destructive"
      });
      return;
    }

    setRedeeming(true);

    try {
      // Create transaction record
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          customer_id: user.id,
          points_change: -reward.points_cost,
          description: `Folosit: ${reward.name}`
        });

      if (transactionError) throw transactionError;

      // Update user points
      const newPoints = user.points - reward.points_cost;
      const { error: updateError } = await supabase
        .from('customers')
        .update({ points: newPoints })
        .eq('id', user.id);

      if (updateError) throw updateError;

      onUpdatePoints(newPoints);

      // Refresh rewards list
      await fetchRewards();

      toast({
        title: "Recompensă folosită!",
        description: `Bucurați-vă de ${reward.name}! Arătați acest mesaj la barista.`,
      });
    } catch (error) {
      console.error('Error redeeming reward:', error);
      toast({
        title: "Eroare",
        description: "A apărut o problemă la procesarea recompensei. Încercați din nou.",
        variant: "destructive"
      });
    } finally {
      setRedeeming(false);
    }
  };

  useEffect(() => {
    fetchRewards();
  }, [user.id]);

  return {
    availableRewards,
    purchasedRewards,
    loading,
    redeeming,
    handleRedeem,
    fetchRewards
  };
};