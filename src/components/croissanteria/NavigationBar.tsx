
import React from 'react';
import { CreditCard, Gift, History, QrCode, User } from 'lucide-react';
import { Screen } from '@/pages/Index';

interface NavigationBarProps {
  currentScreen: Screen;
  onScreenChange: (screen: Screen) => void;
}

export const NavigationBar: React.FC<NavigationBarProps> = ({ 
  currentScreen, 
  onScreenChange 
}) => {
  const navItems = [
    { 
      id: 'dashboard' as Screen, 
      label: 'Card', 
      icon: QrCode,
      activeColor: 'text-amber-600'
    },
    { 
      id: 'rewards' as Screen, 
      label: 'Recompense', 
      icon: Gift,
      activeColor: 'text-orange-600'
    },
    { 
      id: 'history' as Screen, 
      label: 'Istoric', 
      icon: History,
      activeColor: 'text-blue-600'
    },
    { 
      id: 'profile' as Screen, 
      label: 'Profil', 
      icon: User,
      activeColor: 'text-purple-600'
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 safe-area-pb">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = currentScreen === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onScreenChange(item.id)}
              className={`flex flex-col items-center justify-center p-3 rounded-lg transition-all duration-200 ${
                isActive 
                  ? `${item.activeColor} bg-current/10 transform scale-105` 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              <IconComponent className={`w-6 h-6 mb-1 ${isActive ? 'stroke-2' : 'stroke-1.5'}`} />
              <span className={`text-xs font-medium ${isActive ? 'font-semibold' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
