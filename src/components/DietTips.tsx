export default function DietTips() {
  const tips = [
    {
      title: '蛋白质摄入',
      content: '增肌期每公斤体重建议摄入1.6-2.2g蛋白质，减脂期可适当提高至2.0-2.5g。'
    },
    {
      title: '碳水选择',
      content: '优先选择低GI碳水化合物，如糙米、燕麦、红薯等，避免精制碳水。'
    },
    {
      title: '脂肪来源',
      content: '选择健康脂肪，如牛油果、坚果、橄榄油，减少饱和脂肪和反式脂肪摄入。'
    },
    {
      title: '进餐时间',
      content: '训练后30-60分钟是补充营养的黄金窗口，此时摄入蛋白质和碳水效果最佳。'
    },
    {
      title: '水分补充',
      content: '每天饮水量建议2-3升，训练前后适当补充电解质。'
    },
    {
      title: '膳食纤维',
      content: '保证每天摄入足够的膳食纤维，促进肠道健康，增加饱腹感。'
    }
  ];

  return (
    <div className="diet-tips">
      <h2 className="section-title">📖 饮食建议</h2>
      <div className="tips-grid">
        {tips.map((tip, index) => (
          <div key={index} className="tip-card">
            <h3>{tip.title}</h3>
            <p>{tip.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
