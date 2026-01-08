import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
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
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import type { SelectedProduct, Discount } from '../types';

interface ProductItemProps {
  product: SelectedProduct;
  onEdit: () => void;
  onRemove: () => void;
  onDiscountChange: (discount?: Discount) => void;
  onVariantDiscountChange: (variantId: number, discount?: Discount) => void;
  onVariantReorder: (variantIds: number[]) => void;
  canRemove: boolean;
  index: number;
}

export default function ProductItem({
  product,
  onEdit,
  onRemove,
  onDiscountChange,
  onVariantDiscountChange,
  onVariantReorder,
  canRemove,
  index,
}: ProductItemProps) {
  const [showVariants, setShowVariants] = useState(false);

  const variantSensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `product-${product.product.id}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const hasMultipleVariants = product.product.variants.length > 1;
  const selectedVariants = product.product.variants.filter((v) =>
    product.selectedVariants.includes(v.id)
  );

  const orderedSelectedVariants = product.selectedVariants
    .map((variantId) => selectedVariants.find((v) => v.id === variantId))
    .filter((v): v is NonNullable<typeof v> => v !== undefined);

  const handleVariantDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = orderedSelectedVariants.findIndex(
      (v) => `variant-${v.id}` === active.id
    );
    const newIndex = orderedSelectedVariants.findIndex(
      (v) => `variant-${v.id}` === over.id
    );

    if (oldIndex !== -1 && newIndex !== -1) {
      const reorderedVariants = arrayMove(orderedSelectedVariants, oldIndex, newIndex);
      const newVariantIds = reorderedVariants.map((v) => v.id);
      onVariantReorder(newVariantIds);
    }
  };

  const handleProductDiscountChange = (value: string, type: 'flat' | 'percentage') => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue < 0) {
      onDiscountChange(undefined);
      return;
    }
    onDiscountChange({ type, value: numValue });
  };

  const handleProductDiscountRemove = () => {
    onDiscountChange(undefined);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white border border-gray-200 rounded-lg p-4 mb-4"
    >
      <div className="flex items-start gap-3">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing flex items-center justify-center mt-1 text-gray-400 hover:text-gray-600"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="16"
            viewBox="0 0 12 16"
            fill="currentColor"
          >
            <circle cx="3" cy="4" r="1.5" />
            <circle cx="9" cy="4" r="1.5" />
            <circle cx="3" cy="8" r="1.5" />
            <circle cx="9" cy="8" r="1.5" />
            <circle cx="3" cy="12" r="1.5" />
            <circle cx="9" cy="12" r="1.5" />
          </svg>
        </div>

        <span className="text-gray-600 font-medium mt-1">{index + 1}.</span>

        <img
          src={product.product.image?.src || '/placeholder.png'}
          alt={product.product.title}
          className="w-16 h-16 object-cover rounded"
        />

        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 flex-1">
              <h3 className="font-medium text-gray-900">{product.product.title}</h3>
              <button
                onClick={onEdit}
                className="p-1 text-gray-400 hover:text-blue-500"
                title="Edit Product"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                  />
                </svg>
              </button>
            </div>

            <div className="flex items-center gap-2">
              {product.discount ? (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    step={product.discount.type === 'flat' ? '0.01' : '1'}
                    max={product.discount.type === 'percentage' ? '100' : undefined}
                    value={product.discount.value}
                    onChange={(e) => handleProductDiscountChange(e.target.value, product.discount!.type)}
                    className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <select
                    value={product.discount.type === 'flat' ? 'flat' : 'percentage'}
                    onChange={(e) => handleProductDiscountChange(product.discount!.value.toString(), e.target.value as 'flat' | 'percentage')}
                    className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="flat">flat off</option>
                    <option value="percentage">% off</option>
                  </select>
                  <button
                    onClick={handleProductDiscountRemove}
                    className="px-2 py-1 text-sm text-red-600 hover:text-red-700"
                    title="Remove Discount"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleProductDiscountChange('0', 'percentage')}
                  className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Add Discount
                </button>
              )}

              {canRemove && (
                <button
                  onClick={onRemove}
                  className="p-1 text-gray-400 hover:text-red-500"
                  title="Remove Product"
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {hasMultipleVariants && (
            <button
              onClick={() => setShowVariants(!showVariants)}
              className="text-sm text-blue-500 hover:text-blue-700 mb-2 flex items-center gap-1"
            >
              {showVariants ? (
                <>
                  <span>Hide Variants</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-4 h-4"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                  </svg>
                </>
              ) : (
                <>
                  <span>Show Variants</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-4 h-4"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </>
              )}
            </button>
          )}

          {!hasMultipleVariants && (
            <div className="text-sm text-gray-600">
              {selectedVariants[0]?.title || product.product.variants[0]?.title}
            </div>
          )}

          {showVariants && hasMultipleVariants && (
            <DndContext
              sensors={variantSensors}
              collisionDetection={closestCenter}
              onDragEnd={handleVariantDragEnd}
            >
              <SortableContext
                items={orderedSelectedVariants.map((v) => `variant-${v.id}`)}
                strategy={verticalListSortingStrategy}
              >
                <div className="mt-3 space-y-2">
                  {orderedSelectedVariants.map((variant) => {
                    const variantDiscount = product.variantDiscounts?.[variant.id];
                    return (
                      <VariantItem
                        key={variant.id}
                        variant={variant}
                        variantDiscount={variantDiscount}
                        onDiscountChange={(discount) => onVariantDiscountChange(variant.id, discount)}
                      />
                    );
                  })}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      </div>
    </div>
  );
}

function VariantItem({
  variant,
  variantDiscount,
  onDiscountChange,
}: {
  variant: { id: number; title: string; price: string };
  variantDiscount?: Discount;
  onDiscountChange: (discount?: Discount) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `variant-${variant.id}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleDiscountChange = (value: string, type: 'flat' | 'percentage') => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue < 0) {
      onDiscountChange(undefined);
      return;
    }
    onDiscountChange({ type, value: numValue });
  };

  const handleDiscountRemove = () => {
    onDiscountChange(undefined);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between p-2 bg-gray-50 rounded"
    >
      <div className="flex items-center gap-2 flex-1">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="16"
            viewBox="0 0 12 16"
            fill="currentColor"
          >
            <circle cx="3" cy="4" r="1.5" />
            <circle cx="9" cy="4" r="1.5" />
            <circle cx="3" cy="8" r="1.5" />
            <circle cx="9" cy="8" r="1.5" />
            <circle cx="3" cy="12" r="1.5" />
            <circle cx="9" cy="12" r="1.5" />
          </svg>
        </div>
        <div className="font-medium text-sm">{variant.title}</div>
      </div>

      <div className="flex items-center gap-2">
        {variantDiscount ? (
          <>
            <input
              type="number"
              min="0"
              step={variantDiscount.type === 'flat' ? '0.01' : '1'}
              max={variantDiscount.type === 'percentage' ? '100' : undefined}
              value={variantDiscount.value}
              onChange={(e) => handleDiscountChange(e.target.value, variantDiscount.type)}
              className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <select
              value={variantDiscount.type === 'flat' ? 'flat' : 'percentage'}
              onChange={(e) => handleDiscountChange(variantDiscount.value.toString(), e.target.value as 'flat' | 'percentage')}
              className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="flat">flat off</option>
              <option value="percentage">% off</option>
            </select>
            <button
              onClick={handleDiscountRemove}
              className="px-2 py-1 text-sm text-red-600 hover:text-red-700"
              title="Remove Discount"
            >
              ×
            </button>
          </>
        ) : (
          <button
            onClick={() => handleDiscountChange('0', 'percentage')}
            className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
          >
            Add Discount
          </button>
        )}
      </div>
    </div>
  );
}
