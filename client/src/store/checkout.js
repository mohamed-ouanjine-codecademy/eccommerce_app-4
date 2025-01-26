// client/src/store/checkout.js
import { create } from 'zustand';
import { shallow } from 'zustand/shallow';

const useCheckoutStore = create((set) => ({
  orderConfirmation: null,
  paymentIntent: null,
  
  setOrderConfirmation: (order) => set({ orderConfirmation: order }),
  clearCheckoutData: () => set({ orderConfirmation: null, paymentIntent: null })
}));

export default useCheckoutStore;