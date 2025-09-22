// Simple cart manager for Next.js client-side
export class CartManager {
  constructor() {
    this.items = this.getCartFromStorage();
    this.listeners = [];
  }

  getCartFromStorage() {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem('chez-la-mother-cart');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      return [];
    }
  }

  saveCartToStorage() {
    if (typeof window === 'undefined') return;
    localStorage.setItem('chez-la-mother-cart', JSON.stringify(this.items));
    this.notifyListeners();
  }

  addListener(callback) {
    this.listeners.push(callback);
  }

  removeListener(callback) {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  notifyListeners() {
    this.listeners.forEach(callback => callback(this.items));
  }

  addItem(product, quantity = 1) {
    const existingItem = this.items.find(item => item.id === product.id);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.items.push({ ...product, quantity });
    }
    this.saveCartToStorage();
    return this.items;
  }

  removeItem(productId) {
    this.items = this.items.filter(item => item.id !== productId);
    this.saveCartToStorage();
    return this.items;
  }

  updateQuantity(productId, quantity) {
    const item = this.items.find(item => item.id === productId);
    if (item) {
      if (quantity <= 0) {
        return this.removeItem(productId);
      }
      item.quantity = quantity;
      this.saveCartToStorage();
    }
    return this.items;
  }

  getTotal() {
    return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  getTotalItems() {
    return this.items.reduce((total, item) => total + item.quantity, 0);
  }

  clear() {
    this.items = [];
    this.saveCartToStorage();
    return this.items;
  }

  getItems() {
    return [...this.items];
  }
}

export const cart = new CartManager();
