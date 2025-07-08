
import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Croissant, Mail, User, Calendar, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AuthScreenProps {}

export const AuthScreen: React.FC<AuthScreenProps> = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    birthday: ''
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (showForgotPassword) {
        // Reset password
        if (!formData.email) {
          toast({
            title: "Email necesar",
            description: "Vă rugăm să introduceți email-ul",
            variant: "destructive"
          });
          return;
        }

        const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
          redirectTo: `${window.location.origin}/?reset=true`,
        });

        if (error) {
          toast({
            title: "Eroare",
            description: error.message,
            variant: "destructive"
          });
        } else {
          toast({
            title: "Email trimis!",
            description: "Verificați email-ul pentru instrucțiuni de resetare a parolei",
          });
          setShowForgotPassword(false);
        }
      } else if (isLogin) {
        // Login with Supabase
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) {
          toast({
            title: "Conectare eșuată",
            description: error.message,
            variant: "destructive"
          });
        } else {
          // Success - let auth state change handle redirect
        }
      } else {
        // Signup validation
        if (!formData.name || !formData.email || !formData.password) {
          toast({
            title: "Câmpuri obligatorii",
            description: "Vă rugăm să completați numele, email-ul și parola",
            variant: "destructive"
          });
          return;
        }

        // Sign up with Supabase
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              full_name: formData.name,
              name: formData.name,
              birthday: formData.birthday || null
            }
          }
        });

        if (error) {
          toast({
            title: "Înregistrare eșuată",
            description: error.message,
            variant: "destructive"
          });
          return;
        }

        if (data.user && data.session) {
          // User was created and logged in immediately
          toast({
            title: "Bun venit la Croissanteria!",
            description: "Contul dumneavoastră a fost creat cu succes",
          });
          // Auth state change will handle the rest
        } else {
          // User created but email confirmation required
          toast({
            title: "Verificare email",
            description: "Vă rugăm să verificați email-ul pentru a activa contul",
          });
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
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
    setFormData(prev => ({ ...prev, [field]: value }));
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
            {showForgotPassword ? 'Resetează parola' : 
             isLogin ? 'Bine ai revenit!' : 'Alătură-te programului nostru de loialitate'}
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && !showForgotPassword && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                  Nume complet
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Introduceți numele"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="pl-10 h-12 border-gray-200 focus:border-amber-500 focus:ring-amber-500"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Adresa de email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Introduceți email-ul"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="pl-10 h-12 border-gray-200 focus:border-amber-500 focus:ring-amber-500"
                />
              </div>
            </div>

            {(isLogin || !isLogin) && !showForgotPassword && (
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Parolă
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Introduceți parola"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="pl-10 h-12 border-gray-200 focus:border-amber-500 focus:ring-amber-500"
                  />
                </div>
              </div>
            )}

            {!isLogin && !showForgotPassword && (
              <div className="space-y-2">
                <Label htmlFor="birthday" className="text-sm font-medium text-gray-700">
                  Ziua de naștere (Opțional)
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="birthday"
                    type="date"
                    value={formData.birthday}
                    onChange={(e) => handleInputChange('birthday', e.target.value)}
                    className="pl-10 h-12 border-gray-200 focus:border-amber-500 focus:ring-amber-500"
                  />
                </div>
              </div>
            )}

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold shadow-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50"
            >
              {loading ? 'Se procesează...' : 
               showForgotPassword ? 'Trimite email resetare' :
               isLogin ? 'Conectare' : 'Înregistrare'}
            </Button>
          </form>

          <div className="text-center space-y-2">
            {!showForgotPassword && (
              <>
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-sm text-amber-600 hover:text-amber-700 font-medium transition-colors"
                >
                  {isLogin 
                    ? "Nu aveți cont? Înregistrați-vă" 
                    : "Aveți deja cont? Conectați-vă"
                  }
                </button>
                
                {isLogin && (
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="block w-full text-sm text-gray-500 hover:text-amber-600 font-medium transition-colors"
                  >
                    Am uitat parola
                  </button>
                )}
              </>
            )}
            
            {showForgotPassword && (
              <button
                type="button"
                onClick={() => {
                  setShowForgotPassword(false);
                  setFormData({ name: '', email: '', password: '', birthday: '' });
                }}
                className="text-sm text-amber-600 hover:text-amber-700 font-medium transition-colors"
              >
                ← Înapoi la conectare
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
