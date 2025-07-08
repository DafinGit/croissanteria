import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BaristaCode {
  id: string;
  code: string;
  name: string;
  is_active: boolean;
}

export const useBaristaCode = () => {
  const [baristaCode, setBaristaCode] = useState<BaristaCode | null>(null);
  const [accessCode, setAccessCode] = useState('');
  const [checkingCode, setCheckingCode] = useState(false);
  const [showCodeInput, setShowCodeInput] = useState(true);
  const { toast } = useToast();

  const handleCodeSubmit = async () => {
    if (!accessCode.trim()) {
      toast({
        title: "Cod necesar",
        description: "Introduceți codul de acces barista",
        variant: "destructive"
      });
      return;
    }

    setCheckingCode(true);

    try {
      const { data: codeData, error } = await supabase
        .from('barista_access_codes')
        .select('*')
        .eq('code', accessCode.trim())
        .eq('is_active', true)
        .maybeSingle();

      if (error) {
        console.error('Error checking code:', error);
        toast({
          title: "Eroare",
          description: "Nu am putut verifica codul de acces",
          variant: "destructive"
        });
        return;
      }

      if (!codeData) {
        toast({
          title: "Cod invalid",
          description: "Codul de acces nu este valid sau a fost dezactivat",
          variant: "destructive"
        });
        return;
      }

      // Update last used timestamp
      await supabase
        .from('barista_access_codes')
        .update({ last_used_at: new Date().toISOString() })
        .eq('id', codeData.id);

      setBaristaCode(codeData);
      setShowCodeInput(false);
      
      toast({
        title: "Acces acordat!",
        description: `Bun venit, ${codeData.name}`,
      });

    } catch (error) {
      console.error('Error checking barista code:', error);
      toast({
        title: "Eroare",
        description: "A apărut o eroare la verificarea codului",
        variant: "destructive"
      });
    } finally {
      setCheckingCode(false);
    }
  };

  const handleLogout = () => {
    setBaristaCode(null);
    setAccessCode('');
    setShowCodeInput(true);
  };

  return {
    baristaCode,
    accessCode,
    setAccessCode,
    checkingCode,
    showCodeInput,
    handleCodeSubmit,
    handleLogout
  };
};