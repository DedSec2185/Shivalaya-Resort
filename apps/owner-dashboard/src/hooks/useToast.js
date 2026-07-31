import { useState } from 'react';

/**
 * Simple toast hook. Returns { showToast, ToastEl }.
 * Usage: const { showToast, ToastEl } = useToast();
 *        showToast('Message here');
 *        render: {ToastEl}
 */
export function useToast() {
  const [msg, setMsg]     = useState('');
  const [visible, setVisible] = useState(false);
  let timer = null;

  const showToast = (message) => {
    setMsg(message);
    setVisible(true);
    clearTimeout(timer);
    timer = setTimeout(() => setVisible(false), 2800);
  };

  const ToastEl = (
    <div className={`toast ${visible ? 'show' : ''}`}>
      <span className="toast-dot" />
      <span>{msg}</span>
    </div>
  );

  return { showToast, ToastEl };
}
