import { useState } from 'react';
import { foodDatabase } from '../data/foods';

interface MealPlanProps {
  onClose: () => void;
}

export default function MealPlan({ onClose }: MealPlanProps) {
  const [breakfast, setBreakfast] = useState<string[]>([]);
  const [dinner, setDinner] = useState<string[]>([]);
  const [selectedMeal, setSelectedMeal] = useState<'breakfast' | 'dinner'>('breakfast');

  const recommendedFoods = foodDatabase.filter(f => f.isRecommended);

  const addFood = (foodId: string) => {
    if (selectedMeal === 'breakfast') {
      if (!breakfast.includes(foodId)) {
        setBreakfast([...breakfast, foodId]);
      }
    } else {
      if (!dinner.includes(foodId)) {
        setDinner([...dinner, foodId]);
      }
    }
  };

  const removeFood = (foodId: string) => {
    if (selectedMeal === 'breakfast') {
      setBreakfast(breakfast.filter(id => id !== foodId));
    } else {
      setDinner(dinner.filter(id => id !== foodId));
    }
  };

  const getFoodCalories = (foodIds: string[]) => {
    return foodIds.reduce((total, id) => {
      const food = foodDatabase.find(f => f.id === id);
      return total + (food?.calories || 0);
    }, 0);
  };

  const getFoodById = (id: string) => foodDatabase.find(f => f.id === id);

  return (
    <div className="meal-plan-overlay" onClick={onClose}>
      <div className="meal-plan-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📅 每日餐食计划</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="meal-tabs">
          <button 
            className={`tab-btn ${selectedMeal === 'breakfast' ? 'active' : ''}`}
            onClick={() => setSelectedMeal('breakfast')}
          >
            🌅 早餐
          </button>
          <button 
            className={`tab-btn ${selectedMeal === 'dinner' ? 'active' : ''}`}
            onClick={() => setSelectedMeal('dinner')}
          >
            🌙 晚餐
          </button>
        </div>

        <div className="meal-plan-content">
          <div className="selected-meals">
            <h3>已选餐食</h3>
            {selectedMeal === 'breakfast' ? (
              breakfast.length > 0 ? (
                <div className="selected-list">
                  {breakfast.map(id => {
                    const food = getFoodById(id);
                    return food ? (
                      <div key={id} className="selected-item">
                        <span className="food-name">{food.name}</span>
                        <span className="food-cal">{food.calories} kcal</span>
                        <button className="remove-btn" onClick={() => removeFood(id)}>×</button>
                      </div>
                    ) : null;
                  })}
                  <div className="total-cal">
                    <strong>总计: {getFoodCalories(breakfast)} kcal</strong>
                  </div>
                </div>
              ) : (
                <p className="empty-text">点击下方食物添加到早餐</p>
              )
            ) : (
              dinner.length > 0 ? (
                <div className="selected-list">
                  {dinner.map(id => {
                    const food = getFoodById(id);
                    return food ? (
                      <div key={id} className="selected-item">
                        <span className="food-name">{food.name}</span>
                        <span className="food-cal">{food.calories} kcal</span>
                        <button className="remove-btn" onClick={() => removeFood(id)}>×</button>
                      </div>
                    ) : null;
                  })}
                  <div className="total-cal">
                    <strong>总计: {getFoodCalories(dinner)} kcal</strong>
                  </div>
                </div>
              ) : (
                <p className="empty-text">点击下方食物添加到晚餐</p>
              )
            )}
          </div>

          <div className="food-options">
            <h3>推荐食物</h3>
            <div className="food-grid-small">
              {recommendedFoods.map(food => (
                <button
                  key={food.id}
                  className={`food-option-btn ${
                    (selectedMeal === 'breakfast' ? breakfast : dinner).includes(food.id)
                      ? 'selected'
                      : ''
                  }`}
                  onClick={() => addFood(food.id)}
                >
                  <span className="option-name">{food.name}</span>
                  <span className="option-cal">{food.calories}kcal</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
