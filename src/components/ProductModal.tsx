import { useState, useEffect } from 'react';
import { X, ZoomIn, ShoppingCart } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import ProductReviews from './ProductReviews';

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
  ring_sizes?: string[];
}

interface ProductModalProps {
  product: Product;
  onClose: () => void;
}

export default function ProductModal({ product, onClose }: ProductModalProps) {
  const { addToCart } = useCart();
  const [selectedImage, setSelectedImage] = useState(product.primary_image);
  const [quantity, setQuantity] = useState(1);
  const [showZoom, setShowZoom] = useState(false);
  const [adding, setAdding] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [showRingChart, setShowRingChart] = useState(false);

  useEffect(() => {
    if (product.ring_sizes && product.ring_sizes.length > 0) {
      if (!selectedSize || !product.ring_sizes.includes(selectedSize)) {
        setSelectedSize(product.ring_sizes[0]);
      }
    } else {
      setSelectedSize('');
    }
  }, [product, selectedSize]);

  const allImages = [product.primary_image, product.hover_image, ...product.detail_images];

  const handleAddToCart = async () => {
    if (product.ring_sizes && product.ring_sizes.length > 0 && !selectedSize) return;

    setAdding(true);
    await addToCart(product.id, quantity, selectedSize);
    setTimeout(() => setAdding(false), 1000);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto transition-smooth">
          <div className="sticky top-0 bg-white dark:bg-[#1A1A1A] border-b border-gray-200 dark:border-[#4A4A4A] p-6 flex justify-between items-center z-10">
            <h2 className="text-2xl font-serif font-bold text-primary dark:text-white">
              {product.name}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#363636] transition-smooth"
            >
              <X className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </button>
          </div>

          <div className="p-6 grid md:grid-cols-2 gap-8">
            <div>
              <div className="relative aspect-square rounded-lg overflow-hidden mb-4 group">
                <img
                  src={selectedImage}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setShowZoom(true)}
                  className="absolute top-4 right-4 p-3 bg-white dark:bg-[#121212] rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-smooth"
                >
                  <ZoomIn className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </button>

                {product.is_limited_edition && (
                  <span className="absolute top-4 left-4 px-3 py-1 bg-accent text-primary text-xs font-medium rounded-full">
                    Limited Edition
                  </span>
                )}
              </div>

              <div className="grid grid-cols-4 gap-2">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-smooth ${selectedImage === img
                      ? 'border-primary dark:border-white'
                      : 'border-gray-200 dark:border-[#4A4A4A]'
                      }`}
                  >
                    <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-6">
                <div className="flex items-center space-x-3 mb-4">
                  <span className="px-3 py-1 bg-gray-100 dark:bg-[#121212] text-gray-700 dark:text-gray-300 text-sm rounded-full">
                    {product.collection}
                  </span>
                  {product.stock_quantity === 0 ? (
                    <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-sm rounded-full">
                      Out of Stock
                    </span>
                  ) : product.stock_quantity < 10 ? (
                    <span className="px-3 py-1 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-full">
                      Low Stock: Only {product.stock_quantity} left
                    </span>
                  ) : null}
                </div>

                <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                  {product.description}
                </p>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mb-1">Material</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{product.material}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mb-1">Color</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{product.color}</p>
                  </div>
                </div>

                {product.ring_sizes && product.ring_sizes.length > 0 && (
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm text-gray-500 dark:text-gray-500">Size</p>
                      <button onClick={() => setShowRingChart(true)} className="text-xs text-primary dark:text-white underline hover:text-gray-500 transition-colors">Size Guide</button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {product.ring_sizes.map(size => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`px-4 py-2 border rounded-md text-sm font-medium transition-all duration-300 ${selectedSize === size ? 'border-primary dark:border-white bg-primary dark:bg-white text-white dark:text-[#121212]' : 'border-gray-200 dark:border-[#4A4A4A] hover:border-gray-300 dark:hover:border-gray-500 text-gray-900 dark:text-gray-100'}`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200 dark:border-[#4A4A4A] pt-6">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-3xl font-bold text-primary dark:text-white">
                    ${product.price.toFixed(2)}
                  </span>

                  <div className="flex items-center space-x-3">
                    <label className="text-sm text-gray-600 dark:text-gray-400">Quantity:</label>
                    <div className="flex items-center border border-gray-300 dark:border-[#4A4A4A] rounded-lg">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-[#363636] transition-smooth"
                      >
                        -
                      </button>
                      <span className="px-4 py-2 text-gray-900 dark:text-gray-100">{quantity}</span>
                      <button
                        onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                        className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-[#363636] transition-smooth"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={adding || product.stock_quantity === 0}
                  className="w-full py-4 bg-primary dark:bg-white text-white dark:text-[#363636] font-medium rounded-lg hover:bg-primary-light dark:hover:bg-gray-300 transition-smooth disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {adding ? (
                    <span>Added to Cart!</span>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5" />
                      <span>Add to Cart</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="px-6 pb-6">
            <ProductReviews
              productId={product.id}
              onReviewAdded={(newRating, newCount) => {
                console.log('Review added', newRating, newCount);
              }}
            />
          </div>
        </div>
      </div>

      {showZoom && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-[60] flex items-center justify-center p-4"
          onClick={() => setShowZoom(false)}
        >
          <div className="max-w-6xl max-h-screen">
            <img
              src={selectedImage}
              alt={product.name}
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </div>
      )}

      {showRingChart && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-[70] flex items-center justify-center p-4"
          onClick={() => setShowRingChart(false)}
        >
          <div className="relative bg-white dark:bg-[#1A1A1A] p-6 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowRingChart(false)} className="absolute top-4 right-4 p-2 bg-gray-100 dark:bg-[#363636] rounded-full hover:bg-gray-200 transition-colors z-10">
              <X className="w-5 h-5 text-gray-800 dark:text-gray-200" />
            </button>
            <h3 className="text-2xl font-serif font-bold text-primary dark:text-white mb-6 text-center">Ring Size Guide</h3>
            <img src="/Ring_Chart.png" alt="Ring Chart" className="w-full h-auto object-contain rounded" />
            <p className="text-sm text-center text-gray-500 mt-4">For best accuracy, measure the inside diameter of an existing ring.</p>
          </div>
        </div>
      )}
    </>
  );
}
