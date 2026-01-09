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
      const isProductVariantCombinationExists = (newProduct: SelectedProduct): boolean => {
        return products.some((existing) => {
          if (existing.product.id !== newProduct.product.id) return false;
          const existingVariantIds = existing.selectedVariants.sort((a, b) => a - b);
          const newVariantIds = newProduct.selectedVariants.sort((a, b) => a - b);
          return JSON.stringify(existingVariantIds) === JSON.stringify(newVariantIds);
        });
      };

      const uniqueNewProducts = newSelectedProducts.filter(
        (p) => !isProductVariantCombinationExists(p)
      );
      setProducts([...products, ...uniqueNewProducts]);
    }

    setIsPickerOpen(false);
    setEditingIndex(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-6xl">
        <header className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Product Manager</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
            Manage your product list, add discounts, and organize your store
          </p>
        </header>

        <div className="mb-4 sm:mb-6">
          <button
            onClick={handleAddProduct}
            className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium flex items-center justify-center gap-2 text-sm sm:text-base"
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
          existingProducts={products}
          editingProductId={editingIndex !== null ? products[editingIndex]?.product.id : null}
          editingProductVariants={editingIndex !== null ? products[editingIndex]?.selectedVariants : undefined}
        />
      </div>
    </div>
  );
}

export default App;

