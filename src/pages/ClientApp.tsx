import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dashboard } from '@/components/croissanteria/Dashboard';
import { AuthScreen } from '@/components/croissanteria/AuthScreen';
import { NavigationBar } from '@/components/croissanteria/NavigationBar';
import { HistoryScreen } from '@/components/croissanteria/HistoryScreen';
import { RewardsScreen } from '@/components/croissanteria/RewardsScreen';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';

export interface User {
  id: string;
  name: string;
  email: string;
  points: number;
  birthday?: string;
  avatar_url?: string;
}

type ClientScreen = 'dashboard' | 'history' | 'rewards';

export const ClientApp: React.FC = () => {
  const navigate = useNavigate();
  const [currentScreen, setCurrentScreen] = useState<ClientScreen>('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchUserData(session.user);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      if (session?.user) {
        await fetchUserData(session.user);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserData = async (supabaseUser: SupabaseUser) => {
    try {
      // Fetch or create customer record
      const { data: customer, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // Customer doesn't exist, create one
        const customerName = supabaseUser.user_metadata?.full_name || 
                           supabaseUser.user_metadata?.name || 
                           'Client Nou';

        const newCustomer = {
          id: supabaseUser.id,
          email: supabaseUser.email!,
          name: customerName,
          points: 0,
          birthday: null
        };

        const { data: createdCustomer, error: createError } = await supabase
          .from('customers')
          .insert(newCustomer)
          .select()
          .single();

        if (createError) {
          console.error('Error creating customer:', createError);
          setLoading(false);
          return;
        }

        setUser({
          id: createdCustomer.id,
          name: createdCustomer.name!,
          email: createdCustomer.email,
          points: createdCustomer.points || 0,
          birthday: createdCustomer.birthday || undefined,
          avatar_url: createdCustomer.avatar_url || undefined
        });
      } else if (customer) {
        // Use name from user metadata if available, otherwise use customer name
        const actualName = supabaseUser.user_metadata?.full_name || 
                          supabaseUser.user_metadata?.name || 
                          customer.name || 
                          'Client';

        setUser({
          id: customer.id,
          name: actualName,
          email: customer.email,
          points: customer.points || 0,
          birthday: customer.birthday || undefined,
          avatar_url: customer.avatar_url || undefined
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  const handleBackToRoleSelector = () => {
    navigate('/');
  };

  const handleUpdatePoints = async (newPoints: number) => {
    if (user) {
      setUser({ ...user, points: newPoints });
      // Update in database
      await supabase
        .from('customers')
        .update({ points: newPoints })
        .eq('id', user.id);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Se încarcă...</p>
        </div>
      </div>
    );
  }

  if (!session || !user) {
    return <AuthScreen />;
  }

  const renderScreen = () => {
    if (!user) return null;
    
    switch (currentScreen) {
      case 'dashboard':
        return <Dashboard user={user} onLogout={handleLogout} />;
      case 'history':
        return <HistoryScreen user={user} />;
      case 'rewards':
        return <RewardsScreen user={user} onUpdatePoints={handleUpdatePoints} />;
      default:
        return <Dashboard user={user} onLogout={handleLogout} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      {/* Back Button */}
      <div className="absolute top-4 left-4 z-50">
        <Button
          onClick={handleBackToRoleSelector}
          variant="ghost"
          size="sm"
          className="bg-white/80 backdrop-blur-sm shadow-md hover:bg-white/90"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Înapoi la Alegerea Rolului
        </Button>
      </div>

      {/* Client Header */}
      <div className="text-center pt-16 pb-4">
        <div className="bg-white/80 backdrop-blur-sm mx-4 rounded-lg shadow-md p-3">
          <h1 className="text-lg font-bold text-blue-600">Mod Client</h1>
          <p className="text-sm text-gray-600">Afișează QR-ul pentru a câștiga puncte</p>
        </div>
      </div>

      {/* Screen Content */}
      {renderScreen()}

      {/* Navigation */}
      <NavigationBar 
        currentScreen={currentScreen as any} 
        onScreenChange={(screen) => setCurrentScreen(screen as ClientScreen)} 
      />
    </div>
  );
};

export default ClientApp;