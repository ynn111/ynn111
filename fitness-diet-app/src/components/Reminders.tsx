import { useState, useEffect } from 'react';

interface Reminder {
  id: string;
  type: 'exercise' | 'water';
  time: string;
  message: string;
  enabled: boolean;
}

interface RemindersProps {
  onClose: () => void;
}

export default function Reminders({ onClose }: RemindersProps) {
  const [reminders, setReminders] = useState<Reminder[]>(() => {
    const saved = localStorage.getItem('reminders');
    return saved ? JSON.parse(saved) : [
      { id: '1', type: 'water', time: '09:00', message: '该喝水了！', enabled: true },
      { id: '2', type: 'water', time: '11:00', message: '记得补充水分', enabled: true },
      { id: '3', type: 'water', time: '14:00', message: '休息一下，喝杯水', enabled: true },
      { id: '4', type: 'water', time: '16:00', message: '多喝水有益健康', enabled: true },
      { id: '5', type: 'water', time: '18:00', message: '运动前记得补水', enabled: true },
      { id: '6', type: 'exercise', time: '08:00', message: '早上好，该运动了！', enabled: false },
      { id: '7', type: 'exercise', time: '19:00', message: '晚上好，健身时间到！', enabled: true },
    ];
  });

  const [newTime, setNewTime] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [newType, setNewType] = useState<'exercise' | 'water'>('water');
  const [waterIntake, setWaterIntake] = useState(() => {
    const saved = localStorage.getItem('waterIntake');
    const today = new Date().toDateString();
    const data = saved ? JSON.parse(saved) : { date: '', amount: 0 };
    if (data.date !== today) {
      return { date: today, amount: 0 };
    }
    return data;
  });

  useEffect(() => {
    localStorage.setItem('reminders', JSON.stringify(reminders));
  }, [reminders]);

  useEffect(() => {
    localStorage.setItem('waterIntake', JSON.stringify(waterIntake));
  }, [waterIntake]);

  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      
      reminders.forEach(reminder => {
        if (reminder.enabled && reminder.time === currentTime) {
          if (Notification.permission === 'granted') {
            new Notification(reminder.message, {
              icon: reminder.type === 'water' ? '💧' : '🏃'
            });
          }
        }
      });
    };

    const interval = setInterval(checkReminders, 60000);
    return () => clearInterval(interval);
  }, [reminders]);

  const toggleReminder = (id: string) => {
    setReminders(reminders.map(r => 
      r.id === id ? { ...r, enabled: !r.enabled } : r
    ));
  };

  const addReminder = () => {
    if (!newTime || !newMessage) return;
    
    const newReminder: Reminder = {
      id: Date.now().toString(),
      type: newType,
      time: newTime,
      message: newMessage,
      enabled: true
    };
    
    setReminders([...reminders, newReminder]);
    setNewTime('');
    setNewMessage('');
  };

  const addWater = (amount: number) => {
    const today = new Date().toDateString();
    if (waterIntake.date !== today) {
      setWaterIntake({ date: today, amount });
    } else {
      setWaterIntake({ ...waterIntake, amount: waterIntake.amount + amount });
    }
  };

  const requestNotificationPermission = () => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  const waterProgress = Math.min((waterIntake.amount / 2000) * 100, 100);

  return (
    <div className="reminders-overlay" onClick={onClose}>
      <div className="reminders-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🔔 每日提醒</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="reminders-content">
          <div className="water-section">
            <h3>💧 今日喝水</h3>
            <div className="water-progress-bar">
              <div 
                className="water-progress" 
                style={{ width: `${waterProgress}%` }}
              />
            </div>
            <p className="water-stats">已喝 {waterIntake.amount}ml / 目标 2000ml ({waterProgress.toFixed(0)}%)</p>
            <div className="water-buttons">
              <button className="water-btn" onClick={() => addWater(200)}>200ml</button>
              <button className="water-btn" onClick={() => addWater(300)}>300ml</button>
              <button className="water-btn" onClick={() => addWater(500)}>500ml</button>
            </div>
          </div>

          <div className="notification-permission">
            <button className="perm-btn" onClick={requestNotificationPermission}>
              🔔 开启浏览器通知
            </button>
          </div>

          <div className="reminders-list-section">
            <h3>提醒列表</h3>
            <div className="reminders-list">
              {reminders.map(reminder => (
                <div 
                  key={reminder.id} 
                  className={`reminder-item ${reminder.enabled ? 'enabled' : 'disabled'}`}
                >
                  <span className="reminder-icon">
                    {reminder.type === 'water' ? '💧' : '🏃'}
                  </span>
                  <span className="reminder-time">{reminder.time}</span>
                  <span className="reminder-message">{reminder.message}</span>
                  <button 
                    className="toggle-btn"
                    onClick={() => toggleReminder(reminder.id)}
                  >
                    {reminder.enabled ? '✓' : '○'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="add-reminder-section">
            <h3>添加新提醒</h3>
            <div className="add-form">
              <select 
                value={newType} 
                onChange={(e) => setNewType(e.target.value as 'exercise' | 'water')}
              >
                <option value="water">💧 喝水</option>
                <option value="exercise">🏃 运动</option>
              </select>
              <input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
              />
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="提醒内容"
              />
              <button className="add-btn" onClick={addReminder}>添加</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
