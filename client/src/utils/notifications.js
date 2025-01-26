// client/src/utils/notifications.js
import toast from 'react-hot-toast';

export const showErrorToast = (message) => toast.error(message);
export const showSuccessToast = (message) => toast.success(message);