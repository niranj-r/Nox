import { motion } from 'framer-motion';
import { ShoppingCart, Eye, Star, Loader, Plus, Minus } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useState } from 'react';

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
  ring_sizes?: string[];
}

interface ProductCardProps {
  product: Product;
  onQuickView: (product: Product) => void;
}

export default function ProductCard({ product, onQuickView }: ProductCardProps) {
  const { items, addToCart, updateQuantity, removeFromCart } = useCart();
  const [isHovered, setIsHovered] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  // Find if item is in cart
  const quantityInCart = items.filter(item => item.product_id === product.id).reduce((sum, item) => sum + item.quantity, 0);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.stock_quantity === 0) return;

    if (product.ring_sizes && product.ring_sizes.length > 0) {
      onQuickView(product);
      return;
    }

    setAddingToCart(true);
    try {
      await addToCart(product.id);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleUpdateQuantity = async (e: React.MouseEvent, newQty: number) => {
    e.stopPropagation();
    if (newQty === 0) {
      await removeFromCart(product.id);
    } else if (newQty <= product.stock_quantity) {
      await updateQuantity(product.id, newQty);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group bg-white dark:bg-[#1A1A1A] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-[#121212]">
        <motion.img
          src={isHovered && product.hover_image ? product.hover_image : product.primary_image}
          alt={product.name}
          className="h-full w-full object-cover object-center transition-opacity duration-500"
          initial={false}
          animate={{ scale: isHovered ? 1.05 : 1 }}
          transition={{ duration: 0.6 }}
        />

        {/* Badges */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
          {product.stock_quantity === 0 ? (
            <span className="px-3 py-1 bg-gray-900 text-white text-xs font-medium rounded-full">
              Out of Stock
            </span>
          ) : product.stock_quantity < 10 ? (
            <span className="px-3 py-1 bg-red-500 text-white text-xs font-medium rounded-full shadow-sm">
              Low Stock
            </span>
          ) : null}
        </div>

        {/* Quick View Button (Bottom-Left) */}
        <div className={`absolute bottom-3 left-3 pointer-events-none ${isHovered ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}>
          <button
            onClick={() => onQuickView(product)}
            className="pointer-events-auto p-2.5 bg-white/95 dark:bg-[#121212]/95 backdrop-blur-sm text-gray-900 dark:text-gray-100 rounded-full shadow-lg hover:bg-white dark:hover:bg-[#363636] transition-all duration-300 hover:scale-110"
            aria-label="Quick View"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Details Container */}
      <div className="p-5">
        <div className="cursor-pointer" onClick={() => onQuickView(product)}>
          <h3 className="text-xl font-serif font-bold text-gray-900 dark:text-gray-100 mb-1 leading-tight group-hover:text-primary dark:group-hover:text-white transition-colors">
            {product.name}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            {product.material} &bull; {product.color}
          </p>

          <div className="flex items-center space-x-1 mb-4">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${i < Math.round(product.rating || 0) ? 'fill-current' : 'text-gray-300 dark:text-gray-600'}`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              ({product.review_count || 0})
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-auto">
          <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
            ₹{product.price.toFixed(2)}
          </p>

          <div className="h-10">
            {quantityInCart > 0 && !(product.ring_sizes && product.ring_sizes.length > 0) ? (
              // Quantity Selector
              <div onClick={(e) => e.stopPropagation()} className="flex items-center bg-gray-900 dark:bg-white text-white dark:text-[#363636] rounded-lg h-full px-1 shadow-md">
                <button
                  onClick={(e) => handleUpdateQuantity(e, quantityInCart - 1)}
                  className="w-8 h-full flex items-center justify-center hover:bg-white/10 rounded transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-8 text-center font-medium text-sm tabular-nums">
                  {quantityInCart}
                </span>
                <button
                  onClick={(e) => handleUpdateQuantity(e, quantityInCart + 1)}
                  disabled={quantityInCart >= product.stock_quantity}
                  className={`w-8 h-full flex items-center justify-center rounded transition-colors ${quantityInCart >= product.stock_quantity ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/10'}`}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              // Add to Cart Button
              <button
                onClick={handleAddToCart}
                disabled={addingToCart || product.stock_quantity === 0}
                className={`h-10 w-10 flex items-center justify-center rounded-lg transition-all duration-200 
                  ${product.stock_quantity === 0
                    ? 'bg-gray-100 dark:bg-[#121212] text-gray-400 cursor-not-allowed'
                    : 'bg-gray-900 dark:bg-white text-white dark:text-[#363636] hover:bg-primary dark:hover:bg-gray-300 hover:scale-105 shadow-sm'}`}
                aria-label="Add to cart"
              >
                {addingToCart ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  <ShoppingCart className="w-5 h-5" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
