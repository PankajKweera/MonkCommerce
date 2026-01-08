import { useState, useEffect, useRef, useCallback } from 'react';
import type { Product } from '../types';
import { fetchProducts } from '../services/api';

interface ProductPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (products: Product[], selectedVariants: Record<number, number[]>) => void;
  existingProductIds: number[];
  editingProductId?: number | null;
}

export default function ProductPicker({
  isOpen,
  onClose,
  onSelect,
  existingProductIds,
  editingProductId,
}: ProductPickerProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<Set<number>>(new Set());
  const [selectedVariants, setSelectedVariants] = useState<Record<number, Set<number>>>({});
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const loadingRef = useRef(false);

  const loadProducts = useCallback(async (page: number, search: string, append: boolean = false) => {
    if (loadingRef.current) return;
    
    loadingRef.current = true;
    setLoading(true);
    setError(null);
    try {
      const newProducts = await fetchProducts({
        search,
        page,
        limit: 10,
      });

      if (newProducts.length === 0) {
        setHasMore(false);
      } else {
        setProducts((prev) => append ? [...prev, ...newProducts] : newProducts);
        setHasMore(newProducts.length === 10);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load products';
      setError(errorMessage);
      console.error('Error loading products:', error);
      if (page === 0 && !append) {
        setProducts([]);
      }
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setCurrentPage(0);
      setHasMore(true);
      loadProducts(0, searchQuery, false);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, isOpen, loadProducts]);

  useEffect(() => {
    if (isOpen) {
      setProducts([]);
      setCurrentPage(0);
      setHasMore(true);
      setSelectedProducts(new Set());
      setSelectedVariants({});
      setError(null);
      setSearchQuery('');
      loadProducts(0, '', false);
    }
  }, [isOpen, loadProducts]);

  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container || loadingRef.current || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    if (scrollHeight - scrollTop <= clientHeight + 100) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      loadProducts(nextPage, searchQuery, true);
    }
  }, [currentPage, searchQuery, hasMore, loadProducts]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  const toggleProduct = (productId: number) => {
    setSelectedProducts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
        setSelectedVariants((prevVars) => {
          const newVars = { ...prevVars };
          delete newVars[productId];
          return newVars;
        });
      } else {
        newSet.add(productId);
        const product = products.find((p) => p.id === productId);
        if (product) {
          setSelectedVariants((prevVars) => ({
            ...prevVars,
            [productId]: new Set(product.variants.map((v) => v.id)),
          }));
        }
      }
      return newSet;
    });
  };

  const toggleVariant = (productId: number, variantId: number) => {
    setSelectedVariants((prev) => {
      const newVars = { ...prev };
      if (!newVars[productId]) {
        newVars[productId] = new Set();
      }
      const variantSet = new Set(newVars[productId]);
      if (variantSet.has(variantId)) {
        variantSet.delete(variantId);
      } else {
        variantSet.add(variantId);
      }
      newVars[productId] = variantSet;
      return newVars;
    });
  };

  const handleConfirm = () => {
    const selectedProductsList = products.filter((p) => selectedProducts.has(p.id));
    const variantsMap: Record<number, number[]> = {};
    
    selectedProductsList.forEach((product) => {
      const variantSet = selectedVariants[product.id];
      if (variantSet && variantSet.size > 0) {
        variantsMap[product.id] = Array.from(variantSet);
      } else {
        variantsMap[product.id] = product.variants.map((v) => v.id);
      }
    });

    onSelect(selectedProductsList, variantsMap);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Select Products</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto p-6"
        >
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="text-red-800 font-semibold mb-2">Error Loading Products</div>
              <div className="text-red-600 text-sm">{error}</div>
              {error.includes('API Key') && (
                <div className="mt-3 text-sm text-red-700">
                  <p>To fix this:</p>
                  <ol className="list-decimal list-inside mt-1 space-y-1">
                    <li>Create a <code className="bg-red-100 px-1 rounded">.env</code> file in the project root</li>
                    <li>Add: <code className="bg-red-100 px-1 rounded">VITE_API_KEY=your_api_key_here</code></li>
                    <li>Restart the development server</li>
                  </ol>
                </div>
              )}
            </div>
          )}

          {products.length === 0 && !loading && !error && (
            <div className="text-center text-gray-500 py-8">
              No products found
            </div>
          )}

          {products.map((product) => {
            const isProductSelected = selectedProducts.has(product.id);
            const productVariants = selectedVariants[product.id] || new Set();
            const isDisabled = existingProductIds.includes(product.id) && 
                              product.id !== editingProductId && 
                              !isProductSelected;

            return (
              <div
                key={product.id}
                className={`mb-4 border rounded-lg p-4 ${
                  isDisabled ? 'opacity-50 bg-gray-100' : ''
                } ${isProductSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
              >
                <div className="flex items-start gap-4">
                  <img
                    src={product.image?.src || '/placeholder.png'}
                    alt={product.title}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isProductSelected}
                          onChange={() => toggleProduct(product.id)}
                          disabled={isDisabled}
                          className="w-5 h-5"
                        />
                        <span className="font-semibold">{product.title}</span>
                      </label>
                      {isDisabled && (
                        <span className="text-xs text-red-500">Already in list</span>
                      )}
                    </div>

                    {isProductSelected && (
                      <div className="mt-3 space-y-2">
                        <div className="text-sm font-medium text-gray-700">Select Variants:</div>
                        {product.variants.map((variant) => (
                          <label
                            key={variant.id}
                            className="flex items-center gap-2 cursor-pointer text-sm"
                          >
                            <input
                              type="checkbox"
                              checked={productVariants.has(variant.id)}
                              onChange={() => toggleVariant(product.id, variant.id)}
                              className="w-4 h-4"
                            />
                            <span>
                              {variant.title} - ${variant.price}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="text-center text-gray-500 py-4">Loading...</div>
          )}

          {!hasMore && products.length > 0 && (
            <div className="text-center text-gray-500 py-4">No more products</div>
          )}
        </div>

        <div className="p-6 border-t flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={selectedProducts.size === 0}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirm Selection ({selectedProducts.size})
          </button>
        </div>
      </div>
    </div>
  );
}

