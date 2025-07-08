import { Coffee, Croissant, Cookie, Award } from 'lucide-react';

export const getRewardIcon = (name: string) => {
  if (name.toLowerCase().includes('coffee') || name.toLowerCase().includes('cappuccino') || name.toLowerCase().includes('espresso') || name.toLowerCase().includes('latte')) {
    return Coffee;
  }
  if (name.toLowerCase().includes('croissant')) {
    return Croissant;
  }
  if (name.toLowerCase().includes('cookie') || name.toLowerCase().includes('pastry')) {
    return Cookie;
  }
  return Award;
};

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ro-RO', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const canRedeem = (userPoints: number, pointsRequired: number) => userPoints >= pointsRequired;