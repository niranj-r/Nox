import { useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  primary_image: string;
  hover_image?: string;
  collection: string;
  stock_quantity: number;
  is_low_stock: boolean;
  is_limited_edition?: boolean;
}

interface ProductCardProps {
  product: Product;
  onClick: () => void;
}

export default function ProductCard({ product, onClick }: ProductCardProps) {
  const { addToCart } = useCart();
  const [isHovered, setIsHovered] = useState(false);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (adding) return;

    setAdding(true);
    try {
      await addToCart(product.id, 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (error) {
      console.error("Add to cart failed:", error);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div
      className="group relative flex flex-col w-full max-w-[400px] mx-auto cursor-pointer p-4 rounded-[1rem] border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 transition-all hover:shadow-xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* 
        Image Container 
        - Rounded extremely heavily (approx 2.5rem / 40px)
        - Top Right cutout effect simulated by positioning branding/badge
      */}
      <div className="relative aspect-[4/5] w-full rounded-[1rem] overflow-hidden bg-gray-100 shadow-sm">
        <img
          src={isHovered && product.hover_image ? product.hover_image : product.primary_image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {/* 
          Top Right Badge (The Red Pill) 
          - Positioned to look like a tab
        */}
        {(product.is_limited_edition || product.stock_quantity < 10) && (
          <div className="absolute top-6 right-6 px-6 py-3 bg-[#FF0000] rounded-full shadow-lg z-10">
            <span className="text-white font-black uppercase tracking-wider text-xs">
              {product.stock_quantity === 0 ? "SOLD OUT" :
                product.stock_quantity < 10 ? "LOW STOCK" :
                  "LIMITED"}
            </span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="pt-6 px-2 flex flex-col flex-1">
        {/* Title */}
        <h3 className="font-black text-2xl uppercase leading-none tracking-tight text-black dark:text-white mb-2">
          {product.name}
        </h3>

        {/* Description / Subtitle */}
        <p className="text-gray-500 text-sm leading-snug line-clamp-3 mb-6 font-medium">
          {product.description}
        </p>

        {/* Bottom Row: Price & Action */}
        <div className="mt-auto flex items-center justify-between">
          {/* Price - Massive & Bold */}
          <div className="font-black text-3xl tracking-tighter text-black dark:text-white">
            ${product.price}
          </div>

          {/* Action Button - Purple Pill */}
          <button
            onClick={handleAddToCart}
            disabled={product.stock_quantity === 0 || adding}
            className={`
              h-14 px-8 rounded-full flex items-center justify-center transition-all duration-300
              ${product.stock_quantity === 0 ? 'bg-gray-200 cursor-not-allowed opacity-50' :
                added ? 'bg-green-500 scale-105 shadow-lg shadow-green-500/20' :
                  'bg-[#C084FC] hover:bg-[#A855F7] hover:scale-105 shadow-lg shadow-purple-500/20'}
            `}
          >
            {added ? (
              <span className="text-white font-bold uppercase tracking-wide">ADDED</span>
            ) : (
              <ShoppingCart className={`w-6 h-6 ${product.stock_quantity === 0 ? 'text-gray-400' : 'text-white'}`} strokeWidth={2.5} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
