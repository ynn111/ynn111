export interface FoodItem {
  id: string;
  name: string;
  category: 'protein' | 'carb' | 'fat' | 'vegetable' | 'fruit';
  isRecommended: boolean;
  servingSize: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  description: string;
  tips: string;
}

export interface DietPlan {
  id: string;
  name: string;
  goal: 'bulking' | 'cutting' | 'maintenance';
  meals: Meal[];
}

export interface Meal {
  name: string;
  foods: FoodItem[];
  time: string;
}

export type FitnessGoal = 'bulking' | 'cutting' | 'maintenance';
