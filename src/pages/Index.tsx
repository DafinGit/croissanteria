import React, { useState, useEffect } from 'react';
import { AuthScreen } from '@/components/croissanteria/AuthScreen';
import { Dashboard } from '@/components/croissanteria/Dashboard';
import { RewardsScreen } from '@/components/croissanteria/RewardsScreen';
import { HistoryScreen } from '@/components/croissanteria/HistoryScreen';
import { ProfileScreen } from '@/components/croissanteria/ProfileScreen';
import { NavigationBar } from '@/components/croissanteria/NavigationBar';
import { ResetPasswordScreen } from '@/components/croissanteria/ResetPasswordScreen';
import { BaristaScanner } from '@/components/croissanteria/BaristaScanner';
import { supabase } from '@/integrations/supabase/client';
import { Croissant } from 'lucide-react';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';

export type User = {
  id: string;
  name: string;
  email: string;
  birthday?: string;
  points: number;
  avatar_url?: string;
};

export type Screen = 'auth' | 'dashboard' | 'rewards' | 'history' | 'profile' | 'reset-password';

const Index = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('auth');
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPasswordReset, setIsPasswordReset] = useState(false);

  useEffect(() => {
    // Check URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const isReset = urlParams.get('reset') === 'true';
    const isBarista = window.location.pathname === '/barista' || urlParams.get('barista') === 'true';
    
    // Show barista interface if requested
    if (isBarista) {
      setLoading(false);
      return;
    }
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        
        // Handle password reset flow
        if (event === 'PASSWORD_RECOVERY' || (session?.user && isReset)) {
          setIsPasswordReset(true);
          setCurrentScreen('reset-password');
          setLoading(false);
          return;
        }
        
        if (session?.user && !isPasswordReset) {
          // Defer database call to avoid auth deadlock
          setTimeout(async () => {
            try {
              // Fetch user data from customers table
              let { data: customerData, error } = await supabase
                .from('customers')
                .select('*')
                .eq('id', session.user.id)
                .single();

              if (error && error.code === 'PGRST116') {
                // Customer record doesn't exist, create it
                const { data: newCustomer, error: insertError } = await supabase
                  .from('customers')
                  .insert({
                    id: session.user.id,
                    name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
                    email: session.user.email || '',
                    birthday: null,
                    points: 0
                  })
                  .select()
                  .single();

                if (!insertError) {
                  customerData = newCustomer;
                }
              }

              if (customerData) {
                setUser({
                  id: session.user.id,
                  name: customerData.name || '',
                  email: customerData.email,
                  birthday: customerData.birthday || undefined,
                  points: customerData.points || 0,
                  avatar_url: customerData.avatar_url || undefined
                });
                setCurrentScreen('dashboard');
              }
            } catch (err) {
              console.error('Error fetching user data:', err);
              setCurrentScreen('auth');
            }
            setLoading(false);
          }, 0);
        } else if (!session?.user) {
          setUser(null);
          setCurrentScreen('auth');
          setIsPasswordReset(false);
          setLoading(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setCurrentScreen('auth');
  };

  const updateUserPoints = async (newPoints: number) => {
    if (user && session?.user) {
      // Update in database
      const { error } = await supabase
        .from('customers')
        .update({ points: newPoints })
        .eq('id', session.user.id);

      if (!error) {
        // Update local state
        setUser({ ...user, points: newPoints });
      }
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const handleResetSuccess = () => {
    setIsPasswordReset(false);
    // Clear URL parameter
    window.history.replaceState({}, document.title, window.location.pathname);
    // The auth state change will handle redirecting to dashboard
  };

  const renderScreen = () => {
    // Check if we should show barista interface
    const urlParams = new URLSearchParams(window.location.search);
    const isBarista = window.location.pathname === '/barista' || urlParams.get('barista') === 'true';
    
    if (isBarista) {
      return <BaristaScanner />;
    }

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100">
          <div className="flex flex-col items-center space-y-4 animate-fade-in">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center animate-spin">
              <Croissant className="w-8 h-8 text-white" />
            </div>
            <div className="text-xl font-semibold text-amber-700">Se încarcă...</div>
            <div className="w-32 h-1 bg-amber-200 rounded-full overflow-hidden">
              <div className="w-full h-full bg-gradient-to-r from-amber-400 to-orange-500 animate-pulse"></div>
            </div>
          </div>
        </div>
      );
    }

    switch (currentScreen) {
      case 'auth':
        return <AuthScreen />;
      case 'dashboard':
        return user ? (
          <Dashboard 
            user={user}
            onLogout={handleLogout}
          />
        ) : null;
      case 'rewards':
        return user ? (
          <RewardsScreen 
            user={user}
            onUpdatePoints={updateUserPoints}
          />
        ) : null;
      case 'history':
        return user ? (
          <HistoryScreen 
            user={user}
          />
        ) : null;
      case 'profile':
        return user ? (
          <ProfileScreen 
            user={user}
            onUpdateUser={updateUser}
          />
        ) : null;
      case 'reset-password':
        return <ResetPasswordScreen onSuccess={handleResetSuccess} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      {renderScreen()}
      
      {user && currentScreen !== 'auth' && (
        <NavigationBar 
          currentScreen={currentScreen}
          onScreenChange={setCurrentScreen}
        />
      )}
    </div>
  );
};

export default Index;