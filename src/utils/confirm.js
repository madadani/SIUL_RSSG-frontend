let confirmResolver = null;
let setConfirmStateFn = null;

export function confirmDialog(options = {}) {
  return new Promise((resolve) => {
    confirmResolver = resolve;
    if (setConfirmStateFn) {
      setConfirmStateFn({
        isOpen: true,
        title: options.title || 'Konfirmasi',
        message: options.message || 'Apakah Anda yakin?',
        type: options.type || 'warning',
        confirmText: options.confirmText || 'Ya, Lanjutkan',
        cancelText: options.cancelText || 'Batal',
        showInput: options.showInput || false,
        inputPlaceholder: options.inputPlaceholder || '',
        inputRequired: options.inputRequired || false,
        inputValue: '',
      });
    }
  });
}

export function getConfirmResolver() { return confirmResolver; }
export function setConfirmResolver(val) { confirmResolver = val; }
export function getSetConfirmStateFn() { return setConfirmStateFn; }
export function setSetConfirmStateFn(val) { setConfirmStateFn = val; }
