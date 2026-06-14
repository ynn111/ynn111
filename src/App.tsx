import { useState, useMemo } from 'react';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import CategoryFilter from './components/CategoryFilter';
import FoodCard from './components/FoodCard';
import DietTips from './components/DietTips';
import GoalSelector from './components/GoalSelector';
import ImageUpload from './components/ImageUpload';
import MealPlan from './components/MealPlan';
import WeightTracker from './components/WeightTracker';
import Reminders from './components/Reminders';
import { foodDatabase } from './data/foods';
import { FitnessGoal } from './types';

export default function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [fitnessGoal, setFitnessGoal] = useState<FitnessGoal>('bulking');
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [showMealPlan, setShowMealPlan] = useState(false);
  const [showWeightTracker, setShowWeightTracker] = useState(false);
  const [showReminders, setShowReminders] = useState(false);

  const filteredFoods = useMemo(() => {
    return foodDatabase.filter((food) => {
      const matchesSearch = food.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || food.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  const goalCalories = useMemo(() => {
    switch (fitnessGoal) {
      case 'bulking':
        return '增肌期建议每日摄入比日常多300-500kcal';
      case 'cutting':
        return '减脂期建议每日摄入比日常少300-500kcal';
      case 'maintenance':
        return '维持期建议保持日常热量摄入';
      default:
        return '';
    }
  }, [fitnessGoal]);

  return (
    <div className="app">
      <Header />

      <main className="main-content">
        <div className="action-buttons">
          <button className="action-btn meal-btn" onClick={() => setShowMealPlan(true)}>
            📅 餐食计划
          </button>
          <button className="action-btn tracker-btn" onClick={() => setShowWeightTracker(true)}>
            🏋️ 减肥打卡
          </button>
          <button className="action-btn reminder-btn" onClick={() => setShowReminders(true)}>
            🔔 每日提醒
          </button>
        </div>

        <section className="goal-section">
          <GoalSelector selectedGoal={fitnessGoal} onChange={setFitnessGoal} />
          <p className="calories-hint">{goalCalories}</p>
        </section>

        <section className="search-section">
          <SearchBar value={searchTerm} onChange={setSearchTerm} />
          <CategoryFilter selectedCategory={selectedCategory} onChange={setSelectedCategory} />
        </section>

        <section className="food-list">
          <h2 className="section-title">🍽️ 食物列表</h2>
          {filteredFoods.length > 0 ? (
            <div className="food-grid">
              {filteredFoods.map((food) => (
                <FoodCard key={food.id} food={food} />
              ))}
            </div>
          ) : (
            <div className="no-results">
              <p>没有找到匹配的食物</p>
            </div>
          )}
        </section>

        <DietTips />
      </main>

      <footer className="footer">
        <p>健身饮食助手 - 科学饮食，健康生活</p>
      </footer>

      <button className="image-upload-float-btn" onClick={() => setShowImageUpload(true)}>
        📷 上传图片识别
      </button>

      {showImageUpload && (
        <ImageUpload onClose={() => setShowImageUpload(false)} />
      )}

      {showMealPlan && (
        <MealPlan onClose={() => setShowMealPlan(false)} />
      )}

      {showWeightTracker && (
        <WeightTracker onClose={() => setShowWeightTracker(false)} />
      )}

      {showReminders && (
        <Reminders onClose={() => setShowReminders(false)} />
      )}
    </div>
  );
}
