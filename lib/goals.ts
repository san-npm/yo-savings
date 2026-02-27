import { AccountId } from './accounts';

export interface SavingsGoal {
  id: string;
  name: string;
  emoji: string;
  targetAmount: number;
  currentAmount: number;
  linkedAccountId: AccountId;
  createdAt: string;
  updatedAt: string;
}

// Mock data for demo - in real app this would be localStorage or database
const mockGoals: SavingsGoal[] = [
  {
    id: 'goal_1',
    name: 'Vacation Fund',
    emoji: '🏖️',
    targetAmount: 5000,
    currentAmount: 1250,
    linkedAccountId: 'dollar',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'goal_2',
    name: 'Emergency Fund',
    emoji: '🛡️',
    targetAmount: 10000,
    currentAmount: 3500,
    linkedAccountId: 'dollar',
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
  },
];

export const saveGoals = (goals: SavingsGoal[]): void => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('savingsGoals', JSON.stringify(goals));
    } catch (error) {
      console.error('Failed to save goals to localStorage:', error);
    }
  }
};

export const loadGoals = (): SavingsGoal[] => {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('savingsGoals');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load goals from localStorage:', error);
    }
  }
  // Return demo goals as fallback
  return mockGoals;
};

export const createGoal = (goal: Omit<SavingsGoal, 'id' | 'createdAt' | 'updatedAt'>): SavingsGoal => {
  const newGoal: SavingsGoal = {
    ...goal,
    id: `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  mockGoals.push(newGoal);
  return newGoal;
};

export const updateGoal = (id: string, updates: Partial<SavingsGoal>): SavingsGoal | null => {
  const goalIndex = mockGoals.findIndex(g => g.id === id);
  
  if (goalIndex === -1) return null;
  
  mockGoals[goalIndex] = {
    ...mockGoals[goalIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  return mockGoals[goalIndex];
};

export const deleteGoal = (id: string): boolean => {
  const initialLength = mockGoals.length;
  const index = mockGoals.findIndex(g => g.id === id);
  
  if (index !== -1) {
    mockGoals.splice(index, 1);
    return true;
  }
  
  return false;
};

export const updateGoalProgress = (goalId: string, newAmount: number): SavingsGoal | null => {
  return updateGoal(goalId, { currentAmount: newAmount });
};

export const getGoalProgress = (goal: SavingsGoal): number => {
  if (goal.targetAmount <= 0) return 0;
  return Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
};