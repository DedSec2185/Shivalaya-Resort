export default function TopItemsChart({ topItems, maxCount }) {
  if (!topItems.length) {
    return (
      <div className="chart-section">
        <h3 className="chart-section__title">Top Items</h3>
        <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>No served orders yet</p>
      </div>
    );
  }

  return (
    <div className="chart-section">
      <h3 className="chart-section__title">Top Items</h3>
      <div className="bar-chart">
        {topItems.map((item) => (
          <div key={item.name} className="bar-row">
            <span className="bar-row__label" title={item.name}>{item.name}</span>
            <div className="bar-row__track">
              <div
                className="bar-row__fill"
                style={{ width: `${(item.count / maxCount) * 100}%` }}
              />
            </div>
            <span className="bar-row__count">{item.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
