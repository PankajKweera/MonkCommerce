import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import ProductItem from './ProductItem';
import type { SelectedProduct, Discount } from '../types';

interface ProductListProps {
  products: SelectedProduct[];
  onProductsChange: (products: SelectedProduct[]) => void;
  onEditProduct: (index: number) => void;
}

export default function ProductList({
  products,
  onProductsChange,
  onEditProduct,
}: ProductListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = products.findIndex(
        (p) => `product-${p.product.id}` === active.id
      );
      const newIndex = products.findIndex(
        (p) => `product-${p.product.id}` === over.id
      );

      const newProducts = arrayMove(products, oldIndex, newIndex);
      onProductsChange(newProducts);
    }
  };

  const handleRemove = (index: number) => {
    const newProducts = products.filter((_, i) => i !== index);
    onProductsChange(newProducts);
  };

  const handleDiscountChange = (index: number, discount?: Discount) => {
    const newProducts = [...products];
    newProducts[index] = {
      ...newProducts[index],
      discount,
    };
    onProductsChange(newProducts);
  };

  const handleVariantDiscountChange = (
    index: number,
    variantId: number,
    discount?: Discount
  ) => {
    const newProducts = [...products];
    const variantDiscounts = {
      ...newProducts[index].variantDiscounts,
    };
    if (discount) {
      variantDiscounts[variantId] = discount;
    } else {
      delete variantDiscounts[variantId];
    }
    newProducts[index] = {
      ...newProducts[index],
      variantDiscounts,
    };
    onProductsChange(newProducts);
  };

  const handleVariantReorder = (index: number, variantIds: number[]) => {
    const newProducts = [...products];
    newProducts[index] = {
      ...newProducts[index],
      selectedVariants: variantIds,
    };
    onProductsChange(newProducts);
  };

  if (products.length === 0) {
    return (
      <div className="text-center text-gray-500 py-12">
        <p>No products added yet. Click "Add Product" to get started.</p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={products.map((p) => `product-${p.product.id}`)}
        strategy={verticalListSortingStrategy}
      >
        <div>
          {products.map((product, index) => (
            <ProductItem
              key={`product-${product.product.id}`}
              product={product}
              index={index}
              onEdit={() => onEditProduct(index)}
              onRemove={() => handleRemove(index)}
              onDiscountChange={(discount) => handleDiscountChange(index, discount)}
              onVariantDiscountChange={(variantId, discount) =>
                handleVariantDiscountChange(index, variantId, discount)
              }
              onVariantReorder={(variantIds) => handleVariantReorder(index, variantIds)}
              canRemove={products.length > 1}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

