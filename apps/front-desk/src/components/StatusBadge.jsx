import { useLanguage } from '../context/LanguageContext';

const STATUS_KEYS = {
  new: 'statNew',
  confirmed: 'confirmed',
  preparing: 'inKitchen',
  ready: 'ready',
  served: 'served',
  cancelled: 'cancelled',
};

export default function StatusBadge({ status }) {
  const { t } = useLanguage();
  const key = STATUS_KEYS[status];
  const label = key ? t(key) : status;

  return (
    <span className={`status-badge ${status}`}>
      <span className="status-badge-dot" />
      {label}
    </span>
  );
}
