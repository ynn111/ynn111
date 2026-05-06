import { FitnessGoal } from '../types';

interface GoalSelectorProps {
  selectedGoal: FitnessGoal;
  onChange: (goal: FitnessGoal) => void;
}

export default function GoalSelector({ selectedGoal, onChange }: GoalSelectorProps) {
  const goals: { value: FitnessGoal; label: string; description: string }[] = [
    { value: 'bulking', label: '增肌', description: '增加肌肉量' },
    { value: 'cutting', label: '减脂', description: '减少体脂' },
    { value: 'maintenance', label: '维持', description: '保持体型' }
  ];

  return (
    <div className="goal-selector">
      <h3>选择你的目标</h3>
      <div className="goals">
        {goals.map((goal) => (
          <button
            key={goal.value}
            className={`goal-btn ${selectedGoal === goal.value ? 'active' : ''}`}
            onClick={() => onChange(goal.value)}
          >
            <span className="goal-label">{goal.label}</span>
            <span className="goal-description">{goal.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
