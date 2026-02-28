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

// Default goals for initial seed
const getDefaultGoals = (): SavingsGoal[] => [
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

const saveGoals = (goals: SavingsGoal[]): void => {
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
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) ? parsed : getDefaultGoals();
      }
    } catch (error) {
      console.error('Failed to load goals from localStorage:', error);
    }
  }
  // Return default goals if localStorage is not available or empty
  return getDefaultGoals();
};

export const createGoal = (goal: Omit<SavingsGoal, 'id' | 'createdAt' | 'updatedAt'>): SavingsGoal => {
  const goals = loadGoals();
  const newGoal: SavingsGoal = {
    ...goal,
    id: `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  goals.push(newGoal);
  saveGoals(goals);
  return newGoal;
};

export const updateGoal = (id: string, updates: Partial<SavingsGoal>): SavingsGoal | null => {
  const goals = loadGoals();
  const goalIndex = goals.findIndex(g => g.id === id);
  
  if (goalIndex === -1) return null;
  
  goals[goalIndex] = {
    ...goals[goalIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  saveGoals(goals);
  return goals[goalIndex];
};

export const deleteGoal = (id: string): boolean => {
  const goals = loadGoals();
  const initialLength = goals.length;
  const filteredGoals = goals.filter(g => g.id !== id);
  
  if (filteredGoals.length < initialLength) {
    saveGoals(filteredGoals);
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