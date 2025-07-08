
import { User } from '@/pages/Index';

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Andrei Popescu',
    email: 'andrei@example.com',
    birthday: '1990-05-15',
    points: 750
  },
  {
    id: '2',
    name: 'Maria Ionescu',
    email: 'maria@example.com',
    birthday: '1985-08-22',
    points: 320
  }
];

export const mockRewards = [
  {
    id: '1',
    name: 'Espresso gratuit',
    description: 'O doza perfectă din amestecul nostru special de espresso',
    points_required: 150,
    is_active: true
  },
  {
    id: '2',
    name: 'Cappuccino gratuit',
    description: 'Cappuccino cremos cu artă latte artistică',
    points_required: 200,
    is_active: true
  },
  {
    id: '3',
    name: 'Croissant cu unt',
    description: 'Croissant proaspăt și fraged cu unt, copt zilnic',
    points_required: 180,
    is_active: true
  },
  {
    id: '4',
    name: 'Croissant cu ciocolată',
    description: 'Croissant cu unt umplut cu ciocolată bogată',
    points_required: 220,
    is_active: true
  },
  {
    id: '5',
    name: 'Cafea + Patiserie gratis',
    description: 'Orice băutură cu cafea plus patiseria la alegere',
    points_required: 350,
    is_active: true
  },
  {
    id: '6',
    name: '20% reducere la următoarea achiziție',
    description: 'Obțineți 20% reducere la întreaga comandă următoare',
    points_required: 250,
    is_active: true
  }
];

export const mockTransactions = [
  {
    id: '1',
    customer_id: '1',
    type: 'purchase',
    points: 25,
    description: 'Achiziție - Cafea & Croissant de dimineață',
    created_at: '2024-12-15T09:30:00Z'
  },
  {
    id: '2',
    customer_id: '1',
    type: 'purchase',
    points: 35,
    description: 'Achiziție - Combo de prânz',
    created_at: '2024-12-14T12:15:00Z'
  },
  {
    id: '3',
    customer_id: '1',
    type: 'redemption',
    points: -250,
    description: 'Folosit: 20% reducere la următoarea achiziție',
    created_at: '2024-12-13T16:45:00Z'
  },
  {
    id: '3a',
    customer_id: '1',
    type: 'redemption',
    points: -200,
    description: 'Folosit: Cappuccino gratuit',
    created_at: '2024-12-12T16:45:00Z'
  },
  {
    id: '4',
    customer_id: '1',
    type: 'purchase',
    points: 50,
    description: 'Achiziție - Bonus ziua de naștere',
    created_at: '2024-12-12T14:20:00Z'
  },
  {
    id: '5',
    customer_id: '2',
    type: 'purchase',
    points: 20,
    description: 'Achiziție - Ceai de după-amiază',
    created_at: '2024-12-15T15:30:00Z'
  }
];
