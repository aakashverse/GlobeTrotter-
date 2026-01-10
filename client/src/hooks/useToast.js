import { useCallback } from 'react';
import toast from 'react-hot-toast';

export default function useToast() {
  const showSuccess = useCallback((msg) => toast.success(msg), []);
  const showError = useCallback((msg) => toast.error(msg), []);
  const showLoading = useCallback((msg) => toast.loading(msg), []);
  
  const dismissToast = useCallback((toastId) => {
    toast.dismiss(toastId);
  }, []);

  return { showSuccess, showError, showLoading, dismissToast };
}
