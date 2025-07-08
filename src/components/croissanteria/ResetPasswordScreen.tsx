import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Croissant, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ResetPasswordScreenProps {
  onSuccess: () => void;
}

export const ResetPasswordScreen: React.FC<ResetPasswordScreenProps> = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [passwords, setPasswords] = useState({
    password: '',
    confirmPassword: ''
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!passwords.password || !passwords.confirmPassword) {
        toast({
          title: "Câmpuri obligatorii",
          description: "Vă rugăm să completați ambele câmpuri de parolă",
          variant: "destructive"
        });
        return;
      }

      if (passwords.password !== passwords.confirmPassword) {
        toast({
          title: "Parolele nu se potrivesc",
          description: "Vă rugăm să introduceți aceeași parolă în ambele câmpuri",
          variant: "destructive"
        });
        return;
      }

      if (passwords.password.length < 6) {
        toast({
          title: "Parola prea scurtă",
          description: "Parola trebuie să aibă cel puțin 6 caractere",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password: passwords.password
      });

      if (error) {
        toast({
          title: "Eroare la resetarea parolei",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Parola a fost resetată!",
          description: "V-ați conectat cu succes cu noua parolă",
        });
        onSuccess();
      }
    } catch (error) {
      console.error('Reset password error:', error);
      toast({
        title: "Eroare",
        description: "A apărut o problemă neașteptată",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setPasswords(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md backdrop-blur-sm bg-white/90 shadow-2xl border-0">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
              <Croissant className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
            Croissanteria
          </h1>
          <p className="text-gray-600 mt-2">
            Setează o parolă nouă
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Parola nouă
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Introduceți parola nouă"
                  value={passwords.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="pl-10 h-12 border-gray-200 focus:border-amber-500 focus:ring-amber-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                Confirmă parola nouă
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirmați parola nouă"
                  value={passwords.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className="pl-10 h-12 border-gray-200 focus:border-amber-500 focus:ring-amber-500"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold shadow-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50"
            >
              {loading ? 'Se salvează...' : 'Salvează parola nouă'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};