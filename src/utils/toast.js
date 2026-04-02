let toastListeners = [];
let toastId = 0;

export function toast(message, type = 'success', duration = 3500) {
  const id = ++toastId;
  const t = { id, message, type, duration };
  toastListeners.forEach(fn => fn(prev => [...prev, t]));
  return id;
}

toast.success = (msg, dur) => toast(msg, 'success', dur);
toast.error   = (msg, dur) => toast(msg, 'error', dur);
toast.warning = (msg, dur) => toast(msg, 'warning', dur);
toast.info    = (msg, dur) => toast(msg, 'info', dur);

export { toastListeners };
