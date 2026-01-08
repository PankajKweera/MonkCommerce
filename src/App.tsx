import { useState } from 'react';
import ProductList from './components/ProductList';
import ProductPicker from './components/ProductPicker';
import type { Product, SelectedProduct } from './types';

function App() {
  const [products, setProducts] = useState<SelectedProduct[]>([]);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleAddProduct = () => {
    setIsPickerOpen(true);
    setEditingIndex(null);
  };

  const handleEditProduct = (index: number) => {
    setEditingIndex(index);
    setIsPickerOpen(true);
  };

  const handleProductSelect = (
    selectedProducts: Product[],
    selectedVariants: Record<number, number[]>
  ) => {
    const newSelectedProducts: SelectedProduct[] = selectedProducts.map((product) => ({
      product,
      selectedVariants: selectedVariants[product.id] || product.variants.map((v) => v.id),
    }));

    if (editingIndex !== null) {
      const newProducts = [...products];
      newProducts.splice(editingIndex, 1, ...newSelectedProducts);
      setProducts(newProducts);
    } else {
      const existingIds = new Set(products.map((p) => p.product.id));
      const uniqueNewProducts = newSelectedProducts.filter(
        (p) => !existingIds.has(p.product.id)
      );
      setProducts([...products, ...uniqueNewProducts]);
    }

    setIsPickerOpen(false);
    setEditingIndex(null);
  };

  const existingProductIds = products.map((p) => p.product.id);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Product Manager</h1>
          <p className="text-gray-600 mt-2">
            Manage your product list, add discounts, and organize your store
          </p>
        </header>

        <div className="mb-6">
          <button
            onClick={handleAddProduct}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
            Add Product
          </button>
        </div>

        <ProductList
          products={products}
          onProductsChange={setProducts}
          onEditProduct={handleEditProduct}
        />

        <ProductPicker
          isOpen={isPickerOpen}
          onClose={() => {
            setIsPickerOpen(false);
            setEditingIndex(null);
          }}
          onSelect={handleProductSelect}
          existingProductIds={existingProductIds}
          editingProductId={editingIndex !== null ? products[editingIndex]?.product.id : null}
        />
      </div>
    </div>
  );
}

export default App;

