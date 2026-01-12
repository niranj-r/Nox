import { useState } from 'react';
import { Eye, ShoppingCart, Star } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  material: string;
  color: string;
  collection: string;
  stock_quantity: number;
  is_limited_edition: boolean;
  is_low_stock: boolean;
  primary_image: string;
  hover_image: string;
  detail_images: string[];
  rating?: number;
  review_count?: number;
}

interface ProductCardProps {
  product: Product;
  onQuickView: (product: Product) => void;
}

export default function ProductCard({ product, onQuickView }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { addToCart } = useCart();
  const [adding, setAdding] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setAdding(true);
    await addToCart(product.id);
    setTimeout(() => setAdding(false), 1000);
  };

  return (
    <div
      className="group relative bg-white dark:bg-primary-light rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-smooth cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onQuickView(product)}
    >
      <div className="relative aspect-square overflow-hidden">
        <img
          src={isHovered ? product.hover_image : product.primary_image}
          alt={product.name}
          className="w-full h-full object-cover transition-smooth"
        />

        {product.is_limited_edition && (
          <span className="absolute top-4 left-4 px-3 py-1 bg-accent text-primary text-xs font-medium rounded-full">
            Limited Edition
          </span>
        )}

        {product.stock_quantity === 0 ? (
          <span className="absolute top-4 right-4 px-3 py-1 bg-gray-800 text-white text-xs font-medium rounded-full">
            Out of Stock
          </span>
        ) : product.stock_quantity < 10 ? (
          <span className="absolute top-4 right-4 px-3 py-1 bg-red-500 text-white text-xs font-medium rounded-full">
            Low Stock
          </span>
        ) : null}

        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-smooth flex items-center justify-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-smooth bg-white dark:bg-primary text-primary dark:text-accent px-6 py-3 rounded-lg font-medium flex items-center space-x-2"
          >
            <Eye className="w-5 h-5" />
            <span>Quick View</span>
          </button>
        </div>
      </div>

      <div className="p-6">
        <div className="mb-2">
          <h3 className="text-lg font-serif font-semibold text-gray-900 dark:text-gray-100 mb-1">
            {product.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {product.material} • {product.color}
          </p>
          <div className="flex items-center mt-1">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="ml-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              {product.rating ? product.rating.toFixed(1) : 'New'}
            </span>
            {product.review_count ? (
              <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
                ({product.review_count})
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-primary dark:text-accent">
            ${product.price.toFixed(2)}
          </span>

          <button
            onClick={handleAddToCart}
            disabled={adding || product.stock_quantity === 0}
            className="p-2 bg-primary dark:bg-accent text-white dark:text-primary rounded-lg hover:bg-primary-light dark:hover:bg-accent-dark transition-smooth disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {adding ? (
              <span className="text-sm">Added!</span>
            ) : (
              <ShoppingCart className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
