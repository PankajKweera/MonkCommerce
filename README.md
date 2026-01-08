# Monk Commerce - Product Manager

A React-based e-commerce product management application that allows store owners to create and manage product lists with variants, discounts, and drag-and-drop reordering.

## Features

- **Product List Management**: Add, remove, and reorder products using drag and drop
- **Product Variants**: Support for products with single or multiple variants
- **Discount System**: Apply flat or percentage discounts at product or variant level
- **Product Picker**: Search and select products from your store with scroll-based pagination
- **Edit Products**: Replace products by selecting new ones from the picker
- **Duplicate Prevention**: Prevents adding the same product multiple times

## Tech Stack

- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **@dnd-kit** for drag and drop functionality

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd monk
```

2. Install dependencies:
```bash
npm install
```

3. Configure API Key:
   - Create a `.env` file in the root directory:
   ```bash
   VITE_API_KEY=your_api_key_here
   ```
   - Replace `your_api_key_here` with your actual API key (shared via email)
   - The `.env` file is already in `.gitignore`, so it won't be committed
   - **Important**: Without the API key, you'll get a 401 Unauthorized error

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:5173`

## Building for Production

```bash
npm run build
```

The production build will be in the `dist` directory.

## Deployment to Netlify

### Option 1: Using Netlify CLI

1. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Build the project:
```bash
npm run build
```

3. Deploy:
```bash
netlify deploy --prod --dir=dist
```

### Option 2: Using Netlify Dashboard

1. Push your code to GitHub
2. Go to [Netlify](https://app.netlify.com)
3. Click "Add new site" → "Import an existing project"
4. Connect your GitHub repository
5. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
6. Add environment variable for API key (if using):
   - Go to Site settings → Environment variables
   - Add `VITE_API_KEY` with your API key value
7. Click "Deploy site"

### Environment Variables (Optional)

If you want to use environment variables for the API key:

1. Create a `.env` file in the root:
```
VITE_API_KEY=your_api_key_here
```

2. Update `src/services/api.ts`:
```typescript
const API_KEY = import.meta.env.VITE_API_KEY || 'YOUR_API_KEY_HERE';
```

3. Add `.env` to `.gitignore` (already included)

## Project Structure

```
monk/
├── src/
│   ├── components/
│   │   ├── ProductList.tsx      # Main product list with drag-drop
│   │   ├── ProductItem.tsx     # Individual product item
│   │   └── ProductPicker.tsx   # Product selection dialog
│   ├── services/
│   │   └── api.ts              # API service for fetching products
│   ├── types.ts                # TypeScript type definitions
│   ├── App.tsx                 # Main application component
│   ├── main.tsx                # Application entry point
│   └── index.css               # Global styles
├── public/                     # Static assets
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Usage

### Adding Products

1. Click the "Add Product" button
2. Search for products in the picker dialog
3. Select products and their variants
4. Click "Confirm Selection"

### Managing Products

- **Reorder**: Drag products using the handle icon (three horizontal lines)
- **Edit**: Click the edit icon to replace a product with new selections
- **Remove**: Click the "×" icon to remove a product (only shown when there are multiple products)
- **Show/Hide Variants**: Click the "Show Variants" button for products with multiple variants

### Adding Discounts

1. Click "Add Discount" on a product or variant
2. Choose discount type (Flat $ or Percentage %)
3. Enter the discount value
4. Click "Apply"
5. To remove a discount, click "Remove Discount" in the discount dialog

## API Integration

The application uses the Monk Commerce API:

- **Endpoint**: `https://stageapi.monkcommerce.app/task/products/search`
- **Method**: GET
- **Headers**: `x-api-key` (required)
- **Query Parameters**:
  - `search`: Search query string
  - `page`: Page number (0-indexed)
  - `limit`: Number of results per page (default: 10)

## Thought Process & Design Decisions

### Component Architecture

**Approach**: I followed a component-based architecture with clear separation of concerns to ensure maintainability and reusability.

- **ProductList**: Central component managing the product list state and drag-drop context. Uses `DndContext` from `@dnd-kit` to handle product reordering.
- **ProductItem**: Self-contained component handling individual product display, variant management, and discount UI. Implements nested drag-and-drop for variants using a separate `DndContext`.
- **ProductPicker**: Modal dialog component with its own state management for search, pagination, and product selection. Uses debouncing to optimize API calls.

**Why this approach**: 
- Each component is independently testable
- Clear data flow from parent to child components
- Easy to extend or modify individual features without affecting others

### Drag and Drop Implementation

**Challenge**: Implementing drag-and-drop for both products and variants while maintaining proper state updates.

**Solution**: 
- Used `@dnd-kit` library for its accessibility features and modern API
- Created separate drag contexts: one for products (in ProductList) and one for variants (nested in ProductItem)
- Used `useRef` for loading state to prevent infinite re-renders in callbacks
- Implemented proper ID mapping (`product-${id}` and `variant-${id}`) to avoid conflicts

**Key Decisions**:
- Chose `@dnd-kit` over `react-beautiful-dnd` for better TypeScript support and accessibility
- Used `closestCenter` collision detection for intuitive drag behavior
- Added visual feedback (opacity change) during dragging for better UX

### Pagination & API Optimization

**Challenge**: Implementing scroll-based pagination without causing performance issues or duplicate API calls.

**Solution**:
- Implemented infinite scroll with a threshold (100px from bottom) to trigger next page load
- Used `useRef` for `loadingRef` to track loading state without causing re-renders
- Debounced search input (300ms delay) to reduce API calls while typing
- Reset pagination state when search query changes

**Performance Considerations**:
- Limited API calls to 10 products per page to balance load time and user experience
- Prevented duplicate requests by checking `loadingRef.current` before making API calls
- Used `useCallback` to memoize functions and prevent unnecessary re-renders

### Discount System Design

**Challenge**: Supporting both product-level and variant-level discounts with inline editing (matching the design requirements).

**Solution**:
- Implemented inline discount controls (input + dropdown) instead of modal dialogs for better UX
- Created separate state management for product discounts and variant discounts
- Used a unified discount type (`flat` | `percentage`) for consistency
- Real-time price calculation with visual indication (strikethrough original price, highlighted discounted price)

**Design Decisions**:
- Inline editing matches the provided design mockups
- Immediate visual feedback when discount is applied
- Easy removal with a simple × button

### State Management Strategy

**Approach**: Used React's built-in state management with hooks, keeping state as local as possible.

**Structure**:
- **App.tsx**: Manages the main product list state and picker visibility
- **ProductList**: Handles product reordering and discount updates
- **ProductItem**: Manages variant visibility and discount dialogs
- **ProductPicker**: Manages search, selection, and pagination independently

**Why not Redux/Context API**: 
- The application state is relatively simple and doesn't require global state management
- Local state with prop drilling is sufficient and keeps the code simpler
- Easier to understand and maintain for this scope

### Error Handling & Edge Cases

**Implemented**:
- API key validation with clear error messages
- Network error handling with user-friendly messages
- Graceful handling of missing product images (fallback to placeholder)
- Input validation for discount values (min/max constraints)
- Prevention of duplicate products using Set-based tracking
- Handling of products with single vs multiple variants

**Error Recovery**:
- Clear error messages guide users to fix configuration issues
- API errors are logged for debugging while showing user-friendly messages
- Empty states handled gracefully (no products, no search results)

### Code Quality & Best Practices

**TypeScript**: 
- Strict typing throughout for better IDE support and catch errors at compile time
- Defined interfaces for all data structures (Product, SelectedProduct, Discount)

**Performance**:
- Memoized callbacks with `useCallback` to prevent unnecessary re-renders
- Used refs for values that don't need to trigger re-renders
- Optimized re-renders by keeping state local to components

**Code Organization**:
- Removed all comments for cleaner code (as per requirements)
- Consistent naming conventions
- Modular file structure for easy navigation

### Technical Challenges & Solutions

1. **Infinite API Call Loop**: 
   - **Problem**: `loadProducts` callback was being recreated on every render due to `loading` dependency
   - **Solution**: Used `loadingRef` instead of `loading` state in dependencies, preventing callback recreation

2. **Nested Drag-and-Drop**:
   - **Problem**: Variants needed drag-and-drop within products, which required nested contexts
   - **Solution**: Created separate `DndContext` for variants with its own sensors and collision detection

3. **Variant Reordering State**:
   - **Problem**: Maintaining variant order while allowing reordering
   - **Solution**: Used `selectedVariants` array to preserve order, mapped to actual variant objects for display

4. **Duplicate Product Prevention**:
   - **Problem**: Need to prevent same product being added twice, but allow re-selecting when editing
   - **Solution**: Track `existingProductIds` and `editingProductId` separately, allowing edit but blocking duplicates

## Future Improvements

- Add loading states for better UX
- Implement error boundaries
- Add undo/redo functionality
- Export product list to JSON/CSV
- Add product preview before adding
- Implement variant-level drag and drop reordering
- Add bulk discount application
- Save product list to localStorage

## License

This project is created for the Monk Commerce frontend developer task.

