export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export type CartItem = {
  id: string;
  title: string;
  slug: string;
  variant: string;
  sku: string;
  combinationKey?: string;
  image: string;
  quantity: number;
};

export type CartContextType = {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">) => void;
  updateQuantity: (index: number, newQuantity: number) => void;
  removeFromCart: (index: number) => void;
  clearCart: () => void;
};

export type ImageType = { url: string; alt?: string };

export interface Certificate {
  id: string;
  image: { url: string; alt?: string };
  document?: { url: string };
  name: string;
  issuer?: string;
  description?: string;
}
