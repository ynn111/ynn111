import { categoryNames } from '../data/foods';

interface CategoryFilterProps {
  selectedCategory: string;
  onChange: (category: string) => void;
}

export default function CategoryFilter({ selectedCategory, onChange }: CategoryFilterProps) {
  const categories = ['all', 'protein', 'carb', 'fat', 'vegetable', 'fruit'];

  return (
    <div className="category-filter">
      {categories.map((category) => (
        <button
          key={category}
          className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
          onClick={() => onChange(category)}
        >
          {category === 'all' ? '全部' : categoryNames[category]}
        </button>
      ))}
    </div>
  );
}
