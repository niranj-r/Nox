import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

interface Product {
    id: string;
    name: string;
    price: number;
    material: string;
    color: string;
    collection: string;
    primary_image: string;
    stock_quantity: number;
}

interface AlternateCollectionsProps {
    products: Product[];
    externalSelectedIndex?: number;
    onSelectionChange?: (index: number) => void;
}

export default function AlternateCollections({ products, externalSelectedIndex = 0, onSelectionChange }: AlternateCollectionsProps) {
    const { addToCart } = useCart();
    const [addingToCart, setAddingToCart] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

    // Use external index if provided, otherwise default to first item
    const selectedIndex = externalSelectedIndex;

    const scrollToItem = (idx: number) => {
        if (!scrollRef.current) return;
        const container = scrollRef.current;
        const item = itemRefs.current[idx];
        if (item) {
            // calculate item's position relative to the container, not relative to scroll
            const scrollLeft = item.offsetLeft - (container.clientWidth / 2) + (item.clientWidth / 2);
            container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
        }
    };

    const isProgrammaticScroll = useRef(false);

    useEffect(() => {
        if (products.length > 0 && selectedIndex !== undefined) {
            isProgrammaticScroll.current = true;
            const timer = setTimeout(() => {
                scrollToItem(selectedIndex);
                // Reset flag after smooth scroll is likely finished
                setTimeout(() => { isProgrammaticScroll.current = false; }, 600);
            }, 50);
            return () => clearTimeout(timer);
        }
    }, [selectedIndex, products.length]);

    const handleScroll = () => {
        if (!scrollRef.current || isProgrammaticScroll.current) return;
        const container = scrollRef.current;

        // Calculate the center point of the visible viewport of the scrolling container
        const scrollCenter = container.scrollLeft + (container.clientWidth / 2);

        let closestIdx = 0;
        let minDistance = Infinity;

        itemRefs.current.forEach((itemElement, idx) => {
            if (!itemElement) return;

            // Calculate center of each item relative to the scrolling container
            const itemCenter = itemElement.offsetLeft + (itemElement.clientWidth / 2);
            const distance = Math.abs(scrollCenter - itemCenter);

            if (distance < minDistance) {
                minDistance = distance;
                closestIdx = idx;
            }
        });

        if (selectedIndex !== closestIdx && onSelectionChange) {
            onSelectionChange(closestIdx);
        }
    };

    if (!products || products.length === 0) {
        return (
            <div className="h-[85vh] flex items-center justify-center bg-gray-50 dark:bg-primary transition-colors duration-500">
                <div className="animate-pulse text-gray-500 dark:text-accent/60 tracking-[0.2em] uppercase text-xs font-bold">
                    Loading Collection...
                </div>
            </div>
        );
    }

    const selectedProduct = products[selectedIndex] || products[0];

    const handleAddToCart = async (product: Product) => {
        if (!product || product.stock_quantity <= 0) return;
        setAddingToCart(product.id);
        await addToCart(product.id);
        setTimeout(() => setAddingToCart(null), 1000); // Visual feedback delay
    };

    return (
        <section className="relative w-full h-[100vh] min-h-[800px] bg-gray-50 dark:bg-primary overflow-hidden font-sans text-primary dark:text-accent flex flex-col md:flex-row border-b border-gray-200 dark:border-accent/10 transition-colors duration-500 select-none">

            {/* LEFT PANEL */}
            <div className="w-full md:w-[35%] lg:w-[30%] h-[40%] md:h-full p-8 md:p-16 flex flex-col justify-center relative z-20 border-b md:border-b-0 md:border-r border-gray-200 dark:border-accent/10 bg-gray-50 dark:bg-primary shadow-[10px_0_30px_-10px_rgba(0,0,0,0.05)] dark:shadow-[10px_0_30px_-10px_rgba(0,0,0,0.5)] transition-colors duration-500">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={selectedProduct.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="flex flex-col h-full justify-center"
                    >
                        <p className="text-[10px] md:text-xs tracking-[0.2em] font-bold text-gray-500 dark:text-accent/60 mb-2 uppercase transition-colors duration-500">
                            Item {(selectedIndex + 1).toString().padStart(2, '0')} / {products.length.toString().padStart(2, '0')}
                        </p>

                        <h2 className="text-4xl md:text-5xl lg:text-[4.5rem] font-black uppercase tracking-tighter mb-8 md:mb-12 leading-[0.85] break-words text-primary dark:text-white transition-colors duration-500">
                            {selectedProduct.name}
                        </h2>

                        <div className="grid grid-cols-2 gap-y-6 md:gap-y-8 gap-x-4 w-full text-[10px] sm:text-xs font-bold uppercase tracking-[0.15em] mt-auto md:mt-0">
                            <div className="text-gray-500 dark:text-accent/60 transition-colors duration-500">Status</div>
                            <div className="text-gray-900 dark:text-white transition-colors duration-500">{selectedProduct.stock_quantity > 0 ? 'Available' : 'Archive'}</div>

                            <div className="text-gray-500 dark:text-accent/60 transition-colors duration-500">Color</div>
                            <div className="text-gray-900 dark:text-white transition-colors duration-500">{selectedProduct.color || 'Onyx'}</div>

                            <div className="text-gray-500 dark:text-accent/60 transition-colors duration-500">Material</div>
                            <div className="text-gray-900 dark:text-white transition-colors duration-500">{selectedProduct.material || 'Sterling'}</div>

                            <div className="text-gray-500 dark:text-accent/60 transition-colors duration-500">Value</div>
                            <div className="text-gray-900 dark:text-white transition-colors duration-500">${selectedProduct.price?.toFixed(2)}</div>
                        </div>

                        <button
                            onClick={() => handleAddToCart(selectedProduct)}
                            disabled={selectedProduct.stock_quantity === 0 || addingToCart === selectedProduct.id}
                            className={`mt-10 md:mt-12 w-full py-4 px-6 flex items-center justify-center space-x-3 rounded-lg font-bold uppercase tracking-[0.2em] transition-all duration-300 text-xs ${selectedProduct.stock_quantity === 0
                                ? 'bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                                : addingToCart === selectedProduct.id
                                    ? 'bg-green-600 text-white shadow-lg shadow-green-600/20'
                                    : 'bg-primary dark:bg-accent text-white dark:text-primary hover:bg-primary-light dark:hover:bg-accent-light shadow-xl shadow-primary/20 dark:shadow-accent/10 hover:-translate-y-1'
                                }`}
                        >
                            {addingToCart === selectedProduct.id ? (
                                <span>Added to Vault</span>
                            ) : (
                                <>
                                    <ShoppingCart className="w-4 h-4" />
                                    <span>{selectedProduct.stock_quantity === 0 ? 'Out of Stock' : 'Add to Vault'}</span>
                                </>
                            )}
                        </button>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* RIGHT GALLERY PANE */}
            <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="w-full md:w-[65%] lg:w-[70%] h-[60%] md:h-full overflow-x-auto overflow-y-hidden no-scrollbar flex items-center relative cursor-grab active:cursor-grabbing bg-gray-100 dark:bg-black/20 snap-x snap-mandatory transition-colors duration-500"
            >
                {/* Track */}
                <div
                    className="flex items-center h-full space-x-12 sm:space-x-24 min-w-max transition-all"
                    style={{ paddingLeft: 'calc(50% - 130px)', paddingRight: 'calc(50% - 130px)' }}
                >
                    {products.map((p, idx) => {
                        const isSelected = selectedIndex === idx;

                        return (
                            <motion.div
                                key={p.id}
                                ref={el => itemRefs.current[idx] = el}
                                onClick={() => scrollToItem(idx)}
                                animate={{
                                    scale: isSelected ? 1.4 : 0.75,
                                    opacity: isSelected ? 1 : 0.25,
                                    filter: isSelected ? 'blur(0px)' : 'blur(6px)',
                                    y: isSelected ? -20 : 0
                                }}
                                transition={{
                                    duration: 0.6,
                                    ease: [0.32, 0.72, 0, 1]
                                }}
                                className={`carousel-item snap-center relative flex-shrink-0 flex items-center justify-center cursor-pointer will-change-transform ${isSelected ? 'z-30' : 'z-10'}`}
                                style={{ width: '260px', height: '260px' }}
                            >
                                <img
                                    src={p.primary_image}
                                    alt={p.name}
                                    draggable={false}
                                    className="max-w-full max-h-full object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.15)] dark:drop-shadow-[0_20px_30px_rgba(255,255,255,0.05)] transition-transform duration-700 hover:scale-110"
                                />
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
