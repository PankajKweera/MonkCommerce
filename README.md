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

- **Separation of Concerns**: Each component has a single responsibility
  - `ProductList`: Manages the list and drag-drop logic
  - `ProductItem`: Handles individual product display and interactions
  - `ProductPicker`: Manages product selection and search

### Drag and Drop

- Used `@dnd-kit` library for modern, accessible drag-and-drop
- Supports both mouse and keyboard interactions
- Visual feedback during dragging (opacity change)

### Pagination Strategy

- Implemented scroll-based pagination for better UX
- Loads 10 products at a time
- Debounced search to reduce API calls
- Prevents duplicate API calls with loading state

### Discount System

- Supports both product-level and variant-level discounts
- Flat discounts in dollars and percentage discounts
- Visual indication of original and discounted prices
- Easy removal of discounts

### State Management

- Used React hooks (useState) for local state management
- Product state includes selected variants and discounts
- Prevents duplicate products by tracking existing product IDs

### Error Handling

- API errors are logged to console
- Graceful handling of missing images
- Validation for discount values

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

