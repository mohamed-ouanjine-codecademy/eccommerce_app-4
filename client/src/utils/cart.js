// /client/src/utils/cart.js
export const calculateCartTotal = (items) => {
  return items?.reduce((sum, item) => {
    return sum + (item.product?.price || 0) * item.quantity;
  }, 0) || 0;
};

export const getCartItemCount = (items) => {
  return items?.reduce((count, item) => count + item.quantity, 0) || 0;
};