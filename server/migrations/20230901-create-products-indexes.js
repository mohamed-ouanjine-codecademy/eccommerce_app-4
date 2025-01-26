// server/migrations/20230901-create-products-indexes.js
export const up = async (db) => {
  await db.collection('products').createIndex({ name: 'text', category: 1 });
  await db.collection('orders').createIndex({ user: 1, status: 1 });
};

export const down = async (db) => {
  await db.collection('products').dropIndex('name_text_category_1');
  await db.collection('orders').dropIndex('user_1_status_1');
};