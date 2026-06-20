import React, { useState } from 'react';

const DataNewsLongImage: React.FC = () => {
  const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null);
  const [editValue, setEditValue] = useState('');

  const [incomeData, setIncomeData] = useState([
    { city: '西安', data: [1202, 1400, 1650, 1890, 2130] },
    { city: '淄博', data: [302, 356, 501, 900, 720] },
    { city: '长沙', data: [1510, 1730, 1980, 2240, 2490] },
    { city: '洛阳', data: [480, 552, 690, 820, 910] },
    { city: '哈尔滨', data: [290, 335, 410, 1320, 980] },
  ]);

  const heatData = [
    { city: '哈尔滨', value: 95, label: '冰雪季' },
    { city: '淄博', value: 88, label: '烧烤季' },
    { city: '长沙', value: 75, label: '全年' },
    { city: '西安', value: 70, label: '全年' },
    { city: '洛阳', value: 55, label: '牡丹季' },
  ];

  const yearLabels = ['2020', '2021', '2022', '2023', '2024'];

  const colors = {
    '西安': '#E74C3C',
    '淄博': '#3498DB',
    '长沙': '#2ECC71',
    '洛阳': '#F39C12',
    '哈尔滨': '#9B59B6',
  };

  const maxIncome = Math.max(...incomeData.flatMap(d => d.data));

  const handleCellClick = (row: number, col: number, value: number) => {
    setEditingCell({ row, col });
    setEditValue(value.toString());
  };

  const handleCellBlur = () => {
    if (editingCell && editValue) {
      const newData = [...incomeData];
      newData[editingCell.row].data[editingCell.col] = parseInt(editValue) || 0;
      setIncomeData(newData);
    }
    setEditingCell(null);
    setEditValue('');
  };

  return (
    <div className="long-image-container">
      <div className="long-image">
        <div className="long-header">
          <div className="header-content">
            <div className="header-badge">数据洞察</div>
            <h1>近5年网红文旅城市热度分化</h1>
            <p className="subtitle">谁在靠流量赚钱，谁只是昙花一现</p>
            <div className="header-date">2025年5月 | 数据新闻专题</div>
          </div>
        </div>

        <div className="long-section">
          <div className="section-title">
            <span className="number">01</span>
            <h2>权威公开数据</h2>
          </div>
          
          <div className="data-table-wrapper">
            <h3 className="table-title">2020-2024年五大网红城市旅游收入（单位：亿元）</h3>
            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>城市</th>
                    {yearLabels.map(year => (
                      <th key={year}>{year}年</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {incomeData.map((cityData, rowIndex) => (
                    <tr key={cityData.city}>
                      <td className="city-name">{cityData.city}</td>
                      {cityData.data.map((val, colIndex) => (
                        <td 
                          key={colIndex} 
                          className={`data-cell ${editingCell?.row === rowIndex && editingCell?.col === colIndex ? 'editing' : ''}`}
                          onClick={() => handleCellClick(rowIndex, colIndex, val)}
                        >
                          {editingCell?.row === rowIndex && editingCell?.col === colIndex ? (
                            <input
                              type="number"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={handleCellBlur}
                              autoFocus
                              className="edit-input"
                            />
                          ) : (
                            val
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="highlight-box">
            <h3>百度指数·网红城市热度峰值对比（由高到低）</h3>
            <div className="ranking-list">
              {heatData.map((item, index) => (
                <div key={item.city} className={`rank-item ${index === 0 ? 'top-rank' : ''}`}>
                  <span className="rank-number">{index + 1}</span>
                  <div className="rank-bar">
                    <div 
                      className="rank-fill" 
                      style={{ 
                        width: `${item.value}%`,
                        backgroundColor: colors[item.city as keyof typeof colors]
                      }}
                    ></div>
                  </div>
                  <span className="rank-city">{item.city}</span>
                  <span className="rank-label">({item.label})</span>
                </div>
              ))}
            </div>
          </div>

          <div className="insight-cards">
            <div className="insight-card stable-card">
              <div className="card-icon">🏛️</div>
              <h4>长效文旅型（稳定留存）</h4>
              <p>长沙、西安，全年热度均匀，依托成熟文旅体系，客流与收入稳步增长，实现流量向消费的持续转化。</p>
            </div>
            <div className="insight-card pulse-card">
              <div className="card-icon">🔥</div>
              <h4>短期爆火型（快速回落）</h4>
              <p>淄博、哈尔滨，热度集中于单一事件/季节，属于脉冲式流量，爆火后配套跟不上，客流与收入迅速回落。</p>
            </div>
          </div>
        </div>

        <div className="long-section">
          <div className="section-title">
            <span className="number">02</span>
            <h2>数据可视化</h2>
          </div>

          <div className="chart-full">
            <h3>2020-2024年五大网红城市旅游收入变化趋势</h3>
            <div className="line-chart-full">
              <div className="y-axis-full">
                {[0, 500, 1000, 1500, 2000, 2500].map(val => (
                  <div key={val} className="y-label-full">{val}</div>
                ))}
              </div>
              <div className="chart-area-full">
                <div className="x-axis-full">
                  {yearLabels.map(year => (
                    <div key={year} className="x-label-full">{year}</div>
                  ))}
                </div>
                {incomeData.map(cityData => (
                  <div key={cityData.city} className="line-group-full">
                    <svg viewBox="0 0 600 250" preserveAspectRatio="none" className="line-svg-full">
                      <defs>
                        <linearGradient id={`gradient-full-${cityData.city}`} x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor={colors[cityData.city as keyof typeof colors]} stopOpacity="0.3" />
                          <stop offset="100%" stopColor={colors[cityData.city as keyof typeof colors]} stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path
                        d={`M ${cityData.data.map((val, i) => 
                          `${(i / 4) * 600},${250 - (val / maxIncome) * 250}`
                        ).join(' L ')}`}
                        fill="none"
                        stroke={colors[cityData.city as keyof typeof colors]}
                        strokeWidth="3"
                        className="line-path-full"
                      />
                      <path
                        d={`M 0,250 L ${cityData.data.map((val, i) => 
                          `${(i / 4) * 600},${250 - (val / maxIncome) * 250}`
                        ).join(' L ')} L 600,250 Z`}
                        fill={`url(#gradient-full-${cityData.city})`}
                      />
                      {cityData.data.map((val, i) => (
                        <circle
                          key={i}
                          cx={(i / 4) * 600}
                          cy={250 - (val / maxIncome) * 250}
                          r="6"
                          fill={colors[cityData.city as keyof typeof colors]}
                          className="data-point-full"
                        />
                      ))}
                    </svg>
                  </div>
                ))}
              </div>
            </div>
            <div className="legend-full">
              {incomeData.map(cityData => (
                <div key={cityData.city} className="legend-item-full">
                  <span className="legend-color-full" style={{ backgroundColor: colors[cityData.city as keyof typeof colors] }}></span>
                  <span>{cityData.city}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="chart-grid">
            <div className="chart-half">
              <h3>网红城市网络热度峰值对比</h3>
              <div className="bar-chart-compact">
                {heatData.map(item => (
                  <div key={item.city} className="bar-row-compact">
                    <span className="bar-label-compact">{item.city}</span>
                    <div className="bar-track-compact">
                      <div 
                        className="bar-fill-compact" 
                        style={{ 
                          width: `${item.value}%`,
                          backgroundColor: colors[item.city as keyof typeof colors]
                        }}
                      >
                        <span className="bar-value-compact">{item.value}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="chart-half">
              <h3>短期爆火 vs 长效网红城市收入对比（2024年）</h3>
              <div className="comparison-chart">
                <div className="comparison-group">
                  <div className="group-label">短期爆火型</div>
                  <div className="bars-group">
                    <div className="bar-item-compact">
                      <div 
                        className="bar-compact" 
                        style={{ 
                          height: `${(720 / 2490) * 100}%`, 
                          backgroundColor: colors['淄博'] 
                        }}
                      ></div>
                      <span className="bar-name">淄博</span>
                      <span className="bar-val">720亿</span>
                    </div>
                    <div className="bar-item-compact">
                      <div 
                        className="bar-compact" 
                        style={{ 
                          height: `${(980 / 2490) * 100}%`, 
                          backgroundColor: colors['哈尔滨'] 
                        }}
                      ></div>
                      <span className="bar-name">哈尔滨</span>
                      <span className="bar-val">980亿</span>
                    </div>
                  </div>
                </div>
                <div className="comparison-group">
                  <div className="group-label">长效文旅型</div>
                  <div className="bars-group">
                    <div className="bar-item-compact">
                      <div 
                        className="bar-compact" 
                        style={{ 
                          height: `${(2130 / 2490) * 100}%`, 
                          backgroundColor: colors['西安'] 
                        }}
                      ></div>
                      <span className="bar-name">西安</span>
                      <span className="bar-val">2130亿</span>
                    </div>
                    <div className="bar-item-compact">
                      <div 
                        className="bar-compact" 
                        style={{ 
                          height: '100%', 
                          backgroundColor: colors['长沙'] 
                        }}
                      ></div>
                      <span className="bar-name">长沙</span>
                      <span className="bar-val">2490亿</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="chart-full">
            <h3>季节性文旅热度波动分析</h3>
            <div className="heat-chart-full">
              <div className="heat-grid-full">
                {['春', '夏', '秋', '冬'].map(season => (
                  <div key={season} className="heat-column-full">
                    <div className="season-label-full">{season}</div>
                    {incomeData.map(city => {
                      const seasonalData = {
                        '西安': [60, 70, 85, 80],
                        '淄博': [30, 90, 40, 35],
                        '长沙': [75, 80, 75, 70],
                        '洛阳': [95, 40, 50, 45],
                        '哈尔滨': [30, 25, 40, 95],
                      };
                      const value = seasonalData[city.city as keyof typeof seasonalData][['春', '夏', '秋', '冬'].indexOf(season)];
                      return (
                        <div 
                          key={city.city} 
                          className="heat-cell-full"
                          style={{ backgroundColor: `rgba(231, 76, 60, ${value / 100})` }}
                        >
                          {value}%
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
              <div className="heat-cities-full">
                {incomeData.map(city => (
                  <span key={city.city} className="city-tag-full">{city.city}</span>
                ))}
              </div>
              <div className="heat-legend-full">
                <span>低</span>
                <div className="legend-gradient-full"></div>
                <span>高</span>
              </div>
            </div>
          </div>
        </div>

        <div className="long-section">
          <div className="section-title">
            <span className="number">03</span>
            <h2>深度分析</h2>
          </div>

          <div className="article-content-full">
            <h3>数据观察｜流量围城：网红城市5年数据，爆红之后差距渐显</h3>
            <p>
              短视频时代，文旅城市的"出圈"变得轻而易举——哈尔滨冰雪游、淄博烧烤、洛阳汉服、长沙烟火气轮番刷屏，流量似乎成为城市文旅增收的"捷径"。但爆红之后，有的城市实现长效盈利，有的城市则昙花一现。本文依托2020-2024年各地文旅公开数据、网络热度大数据，用数据剖析网红城市的流量真相，探究流量转化的核心逻辑。
            </p>
            <p>
              旅游收入数据直观展现了网红城市的分化态势。2020-2024年，五大网红城市旅游收入整体呈上涨趋势，但增长模式差异显著。西安、长沙凭借成熟的文旅IP与配套设施，实现稳步增长：西安五年旅游收入从1202亿元攀升至2130亿元，长沙从1510亿元增长至2490亿元，年均增速稳定，体现出长效文旅的竞争力；而淄博、哈尔滨则呈现"脉冲式暴涨"特征，淄博2023年旅游收入较2022年近乎翻倍至900亿元，2024年回落至720亿元；哈尔滨2023年凭借冰雪季爆火至1320亿元，2024年亦回落至980亿元，短期流量未能转化为长期收益。
            </p>
            <p>
              网络热度数据进一步印证了这一差距。百度指数显示，淄博、哈尔滨的热度高度集中于特定季节或事件，属于季节性、事件型短期流量；而长沙、西安全年热度分布均匀，依靠历史文化、商业业态形成持续吸引力，实现了流量的稳定留存。这种差异背后，是两种截然不同的文旅运营模式：短期爆火型城市依赖单一热点出圈，配套设施、产业规划跟不上游客增长速度，热度消退后难以留住游客；长效运营型城市则注重业态升级、服务优化，将流量转化为实实在在的经济增量。
            </p>
            <p>
              数据背后的启示尤为深刻：短视频可以让一座城市一夜爆红，但城市文旅的核心竞争力从来不是短期热度，而是长期承载力。流量只是起点，唯有做好配套建设、深耕文旅内涵，才能将短暂的流量转化为长期的发展优势。这也为各类文旅城市提供了借鉴——唯有拒绝"流量依赖"，深耕自身特色，才能在网红城市的竞争中站稳脚跟。
            </p>
          </div>
        </div>

        <div className="long-section">
          <div className="section-title">
            <span className="number">04</span>
            <h2>数据来源</h2>
          </div>

          <div className="sources-list">
            <ul>
              <li>各网红城市政府年度文旅统计公报</li>
              <li>百度指数、抖音城市文旅年度报告</li>
              <li>中国旅游研究院全国旅游经济统计数据</li>
              <li>携程年度文旅大数据报告</li>
            </ul>
          </div>
        </div>

        <div className="long-footer">
          <p>© 2025 数据新闻专题 | 用数据洞察文旅发展趋势</p>
        </div>
      </div>
    </div>
  );
};

export default DataNewsLongImage;
