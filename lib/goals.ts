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

// Get storage key scoped to user address
const getStorageKey = (userAddress?: string): string => {
  if (userAddress) {
    return `stash-goals-${userAddress.toLowerCase()}`;
  }
  return 'stash-goals';
};

// Default goals for initial seed
const getDefaultGoals = (): SavingsGoal[] => [
  {
    id: 'goal_1',
    name: 'Vacation Fund',
    emoji: '\u{1F3D6}\u{FE0F}',
    targetAmount: 5000,
    currentAmount: 1250,
    linkedAccountId: 'dollar',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'goal_2',
    name: 'Emergency Fund',
    emoji: '\u{1F6E1}\u{FE0F}',
    targetAmount: 10000,
    currentAmount: 3500,
    linkedAccountId: 'dollar',
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
  },
];

const saveGoals = (goals: SavingsGoal[], userAddress?: string): void => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(getStorageKey(userAddress), JSON.stringify(goals));
    } catch (error) {
      console.error('Failed to save goals to localStorage:', error);
    }
  }
};

export const loadGoals = (userAddress?: string): SavingsGoal[] => {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(getStorageKey(userAddress));
      if (stored) {
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) ? parsed : getDefaultGoals();
      }
    } catch (error) {
      console.error('Failed to load goals from localStorage:', error);
    }
  }
  return getDefaultGoals();
};

export const createGoal = (goal: Omit<SavingsGoal, 'id' | 'createdAt' | 'updatedAt'>, userAddress?: string): SavingsGoal => {
  const goals = loadGoals(userAddress);
  const newGoal: SavingsGoal = {
    ...goal,
    id: `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  goals.push(newGoal);
  saveGoals(goals, userAddress);
  return newGoal;
};

export const updateGoal = (id: string, updates: Partial<SavingsGoal>, userAddress?: string): SavingsGoal | null => {
  const goals = loadGoals(userAddress);
  const goalIndex = goals.findIndex(g => g.id === id);

  if (goalIndex === -1) return null;

  goals[goalIndex] = {
    ...goals[goalIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  saveGoals(goals, userAddress);
  return goals[goalIndex];
};

export const deleteGoal = (id: string, userAddress?: string): boolean => {
  const goals = loadGoals(userAddress);
  const initialLength = goals.length;
  const filteredGoals = goals.filter(g => g.id !== id);

  if (filteredGoals.length < initialLength) {
    saveGoals(filteredGoals, userAddress);
    return true;
  }

  return false;
};

export const updateGoalProgress = (goalId: string, newAmount: number, userAddress?: string): SavingsGoal | null => {
  return updateGoal(goalId, { currentAmount: newAmount }, userAddress);
};

export const getGoalProgress = (goal: SavingsGoal): number => {
  if (goal.targetAmount <= 0) return 0;
  return Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
};
