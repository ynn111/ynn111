import { useState, useEffect } from 'react';

interface WeightRecord {
  date: string;
  weight: number;
  notes: string;
}

interface WeightTrackerProps {
  onClose: () => void;
}

export default function WeightTracker({ onClose }: WeightTrackerProps) {
  const [records, setRecords] = useState<WeightRecord[]>(() => {
    const saved = localStorage.getItem('weightRecords');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentWeight, setCurrentWeight] = useState('');
  const [notes, setNotes] = useState('');
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    localStorage.setItem('weightRecords', JSON.stringify(records));
  }, [records]);

  const addRecord = () => {
    if (!currentWeight) return;
    
    const newRecord: WeightRecord = {
      date: new Date().toLocaleDateString('zh-CN'),
      weight: parseFloat(currentWeight),
      notes: notes || '无'
    };
    
    setRecords([newRecord, ...records]);
    setCurrentWeight('');
    setNotes('');
  };

  const getStats = () => {
    if (records.length < 2) return null;
    
    const firstWeight = records[records.length - 1].weight;
    const latestWeight = records[0].weight;
    const totalDays = records.length;
    const weightChange = (latestWeight - firstWeight).toFixed(1);
    const avgDaily = (parseFloat(weightChange) / totalDays).toFixed(2);
    
    return {
      firstWeight,
      latestWeight,
      totalDays,
      weightChange,
      avgDaily
    };
  };

  const stats = getStats();

  return (
    <div className="weight-tracker-overlay" onClick={onClose}>
      <div className="weight-tracker-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🏋️ 减肥打卡</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="tracker-content">
          <div className="input-section">
            <div className="input-group">
              <label>今日体重 (kg)</label>
              <input
                type="number"
                step="0.1"
                value={currentWeight}
                onChange={(e) => setCurrentWeight(e.target.value)}
                placeholder="输入体重"
              />
            </div>
            <div className="input-group">
              <label>备注</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="今日感受..."
              />
            </div>
            <button className="submit-btn" onClick={addRecord}>
              ✅ 打卡
            </button>
          </div>

          <div className="stats-toggle">
            <button 
              className={`stats-btn ${showStats ? 'active' : ''}`}
              onClick={() => setShowStats(!showStats)}
            >
              {showStats ? '📈 隐藏统计' : '📈 查看统计'}
            </button>
          </div>

          {showStats && stats && (
            <div className="stats-section">
              <div className="stat-item">
                <span className="stat-label">初始体重</span>
                <span className="stat-value">{stats.firstWeight} kg</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">当前体重</span>
                <span className="stat-value">{stats.latestWeight} kg</span>
              </div>
              <div className="stat-item highlight">
                <span className="stat-label">总体变化</span>
                <span className={`stat-value ${parseFloat(stats.weightChange) < 0 ? 'positive' : 'negative'}`}>
                  {parseFloat(stats.weightChange) > 0 ? '+' : ''}{stats.weightChange} kg
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">打卡天数</span>
                <span className="stat-value">{stats.totalDays} 天</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">日均变化</span>
                <span className={`stat-value ${parseFloat(stats.avgDaily) < 0 ? 'positive' : 'negative'}`}>
                  {parseFloat(stats.avgDaily) > 0 ? '+' : ''}{stats.avgDaily} kg/天
                </span>
              </div>
            </div>
          )}

          <div className="history-section">
            <h3>打卡记录</h3>
            {records.length > 0 ? (
              <div className="history-list">
                {records.slice(0, 20).map((record, index) => (
                  <div key={index} className="history-item">
                    <span className="history-date">{record.date}</span>
                    <span className="history-weight">{record.weight} kg</span>
                    <span className="history-notes">{record.notes}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-text">还没有打卡记录，开始你的减肥之旅吧！</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
