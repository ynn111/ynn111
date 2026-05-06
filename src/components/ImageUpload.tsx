import { useState, useRef } from 'react';
import * as mobilenet from '@tensorflow-models/mobilenet';
import { foodDatabase } from '../data/foods';

interface ImageUploadProps {
  onClose: () => void;
}

export default function ImageUpload({ onClose }: ImageUploadProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [model, setModel] = useState<mobilenet.MobileNet | null>(null);
  const [results, setResults] = useState<Array<{ food: string; probability: number; recommendation: boolean }>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadModel = async () => {
    setIsLoading(true);
    try {
      const loadedModel = await mobilenet.load();
      setModel(loadedModel);
    } catch (error) {
      console.error('模型加载失败:', error);
    }
    setIsLoading(false);
  };

  const findMatchingFood = (predictions: Array<{ className: string; probability: number }>) => {
    const foodKeywords = [
      'chicken', 'beef', 'pork', 'fish', 'salmon', 'egg', 'rice', 'bread', 
      'pasta', 'noodle', 'vegetable', 'broccoli', 'spinach', 'apple', 'banana',
      'orange', 'tomato', 'potato', 'carrot', 'cheese', 'milk', 'yogurt', 'butter',
      'oil', 'nut', 'almond', 'peanut', 'avocado', 'salad', 'soup', 'pizza',
      'hamburger', 'hotdog', 'steak', 'bacon', 'sausage', 'egg', 'toast',
      '鸡肉', '牛肉', '猪肉', '鱼', '三文鱼', '鸡蛋', '米饭', '面包',
      '面条', '蔬菜', '西兰花', '菠菜', '苹果', '香蕉', '橙子', '番茄',
      '土豆', '胡萝卜', '奶酪', '牛奶', '酸奶', '黄油', '油', '坚果',
      '杏仁', '花生', '牛油果', '沙拉', '汤', '披萨', '汉堡', '热狗',
      '牛排', '培根', '香肠', '吐司', '薯条', '甜甜圈', '蛋糕', '饼干',
      '可乐', '炸鸡', '薯片', '冰淇淋', '巧克力', '糖果'
    ];

    const unhealthyKeywords = ['burger', 'pizza', 'hotdog', 'fries', 'donut', 'cake', 'cookie', 'candy', 'ice cream', 'chocolate', 'chips', 'fried', '可乐', '炸', '薯片', '冰淇淋', '巧克力', '甜甜圈', '蛋糕'];

    const matchedResults: Array<{ food: string; probability: number; recommendation: boolean }> = [];

    for (const pred of predictions) {
      const className = pred.className.toLowerCase();
      const probability = pred.probability;

      if (probability > 0.1) {
        const isMatch = foodKeywords.some(keyword => className.includes(keyword.toLowerCase()));
        if (isMatch) {
          const isUnhealthy = unhealthyKeywords.some(keyword => className.includes(keyword.toLowerCase()));
          matchedResults.push({
            food: pred.className,
            probability: probability,
            recommendation: !isUnhealthy
          });
        }
      }
    }

    return matchedResults.slice(0, 5);
  };

  const classifyImage = async (imageElement: HTMLImageElement) => {
    if (!model) {
      await loadModel();
    }

    if (model) {
      const predictions = await model.classify(imageElement);
      const matchedResults = findMatchingFood(predictions);
      
      if (matchedResults.length > 0) {
        setResults(matchedResults);
      } else {
        setResults([{
          food: '无法识别为食物',
          probability: 0,
          recommendation: false
        }]);
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = () => {
    if (imageUrl && !results.length) {
      setIsLoading(true);
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = imageUrl;
      img.onload = () => classifyImage(img);
      setIsLoading(false);
    }
  };

  const getFoodFromDatabase = (foodName: string) => {
    const lowerName = foodName.toLowerCase();
    return foodDatabase.find(food => 
      lowerName.includes(food.name.toLowerCase()) ||
      food.name.toLowerCase().includes(lowerName.split(' ')[0])
    );
  };

  return (
    <div className="image-upload-overlay" onClick={onClose}>
      <div className="image-upload-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📷 图片识别</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-content">
          {!imageUrl ? (
            <div 
              className="upload-area"
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                style={{ display: 'none' }}
              />
              <div className="upload-icon">🍽️</div>
              <p className="upload-text">点击或拖拽上传图片</p>
              <p className="upload-hint">支持 JPG、PNG 格式</p>
            </div>
          ) : (
            <div className="image-preview">
              <img src={imageUrl} alt="预览" />
              <button 
                className="change-image-btn"
                onClick={() => {
                  setImageUrl(null);
                  setResults([]);
                }}
              >
                更换图片
              </button>
            </div>
          )}

          {imageUrl && results.length === 0 && (
            <button 
              className="analyze-btn"
              onClick={handleAnalyze}
              disabled={isLoading}
            >
              {isLoading ? '🔄 识别中...' : '🔍 开始识别'}
            </button>
          )}

          {results.length > 0 && (
            <div className="results-section">
              <h3>识别结果</h3>
              <div className="results-list">
                {results.map((result, index) => {
                  const dbFood = getFoodFromDatabase(result.food);
                  return (
                    <div 
                      key={index} 
                      className={`result-item ${result.recommendation ? 'recommended' : 'not-recommended'}`}
                    >
                      <div className="result-header">
                        <span className="food-name">
                          {dbFood ? dbFood.name : result.food}
                        </span>
                        <span className={`status-badge ${result.recommendation ? 'recommended' : 'not-recommended'}`}>
                          {result.recommendation ? '✓ 推荐' : '✗ 不推荐'}
                        </span>
                      </div>
                      
                      <div className="result-confidence">
                        匹配度: {(result.probability * 100).toFixed(1)}%
                      </div>

                      {dbFood && (
                        <div className="food-details">
                          <div className="nutrition-row">
                            <span>热量: {dbFood.calories} kcal</span>
                            <span>蛋白质: {dbFood.protein}g</span>
                            <span>碳水: {dbFood.carbs}g</span>
                            <span>脂肪: {dbFood.fat}g</span>
                          </div>
                          <p className="food-tip">💡 {dbFood.tips}</p>
                        </div>
                      )}

                      {!dbFood && result.probability > 0 && (
                        <p className="general-advice">
                          {result.recommendation 
                            ? '✅ 这是一个健康的食物选择，可以适量食用。'
                            : '⚠️ 这个食物热量较高或营养价值较低，建议减少食用频率。'}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
