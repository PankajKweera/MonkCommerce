export interface ProductVariant {
  id: number;
  product_id: number;
  title: string;
  price: string;
}

export interface ProductImage {
  id: number;
  product_id: number;
  src: string;
}

export interface Product {
  id: number;
  title: string;
  variants: ProductVariant[];
  image: ProductImage;
}

export interface Discount {
  type: 'flat' | 'percentage';
  value: number;
}

export interface SelectedProduct {
  product: Product;
  selectedVariants: number[];
  discount?: Discount;
  variantDiscounts?: Record<number, Discount>;
}

