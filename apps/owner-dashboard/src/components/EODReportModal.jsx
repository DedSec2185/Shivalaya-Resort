import { exportEODCSV } from '../utils/csvExport';

export default function EODReportModal({ report, onClose }) {
  if (!report) return null;

  function handlePrint() {
    window.print();
  }

  function handleExport() {
    exportEODCSV(report);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2 className="modal__title">End of Day Report — {report.date}</h2>
          <button type="button" className="modal__close" onClick={onClose}>×</button>
        </div>
        <div className="modal__body">
          <div className="eod-summary">
            <div className="eod-stat">
              <div className="eod-stat__label">Total Orders</div>
              <div className="eod-stat__value">{report.totalOrders}</div>
            </div>
            <div className="eod-stat">
              <div className="eod-stat__label">Served</div>
              <div className="eod-stat__value">{report.servedOrders}</div>
            </div>
            <div className="eod-stat">
              <div className="eod-stat__label">Cancelled</div>
              <div className="eod-stat__value">{report.cancelledOrders}</div>
            </div>
            <div className="eod-stat">
              <div className="eod-stat__label">Revenue</div>
              <div className="eod-stat__value" style={{ color: 'var(--gold)' }}>₹{report.revenue.toLocaleString('en-IN')}</div>
            </div>
          </div>

          <div className="modal__actions">
            <button type="button" className="btn btn--primary" onClick={handlePrint}>Print Report</button>
            <button type="button" className="btn btn--gold" onClick={handleExport}>Export CSV</button>
          </div>
        </div>
      </div>
    </div>
  );
}
