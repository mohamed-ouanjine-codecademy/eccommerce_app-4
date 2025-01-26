// server/types/index.d.ts
declare namespace Ecommerce {
  interface Product {
    id: string;
    name: string;
    price: number;
    category: string;
    stock: number;
  }

  interface Order {
    id: string;
    user: string;
    items: OrderItem[];
    total: number;
    status: OrderStatus;
  }

  type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered';
}