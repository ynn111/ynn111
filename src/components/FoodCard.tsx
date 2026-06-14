import { FoodItem } from '../types';
import { categoryNames } from '../data/foods';

interface FoodCardProps {
  food: FoodItem;
}

export default function FoodCard({ food }: FoodCardProps) {
  return (
    <div className={`food-card ${food.isRecommended ? 'recommended' : 'not-recommended'}`}>
      <div className="food-header">
        <h3>{food.name}</h3>
        <span className={`category-badge ${food.category}`}>
          {categoryNames[food.category]}
        </span>
      </div>
      
      <div className="food-status">
        {food.isRecommended ? (
          <span className="status recommended">推荐</span>
        ) : (
          <span className="status not-recommended">不推荐</span>
        )}
      </div>

      <div className="food-info">
        <p>{food.description}</p>
        
        <div className="nutrition">
          <div className="nutrition-item">
            <span className="label">热量</span>
            <span className="value">{food.calories} kcal</span>
          </div>
          <div className="nutrition-item">
            <span className="label">蛋白质</span>
            <span className="value">{food.protein}g</span>
          </div>
          <div className="nutrition-item">
            <span className="label">碳水</span>
            <span className="value">{food.carbs}g</span>
          </div>
          <div className="nutrition-item">
            <span className="label">脂肪</span>
            <span className="value">{food.fat}g</span>
          </div>
        </div>

        <div className="serving">
          <span className="label">建议份量:</span>
          <span className="value">{food.servingSize}</span>
        </div>

        <div className="tips">
          <strong>💡 小贴士:</strong> {food.tips}
        </div>
      </div>
    </div>
  );
}
