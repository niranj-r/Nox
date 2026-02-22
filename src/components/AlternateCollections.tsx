import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, X } from 'lucide-react';
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
    detail_images?: string[];
    ring_sizes?: string[];
}

interface AlternateCollectionsProps {
    products: Product[];
    externalSelectedIndex?: number;
    onSelectionChange?: (index: number) => void;
}

export default function AlternateCollections({ products, externalSelectedIndex = 0, onSelectionChange }: AlternateCollectionsProps) {
    const { addToCart } = useCart();
    const [addingToCart, setAddingToCart] = useState<string | null>(null);
    const [selectedSize, setSelectedSize] = useState<string>('');
    const [showRingChart, setShowRingChart] = useState(false);
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

    const selectedProduct = products && products.length > 0 ? (products[selectedIndex] || products[0]) : null;

    useEffect(() => {
        if (selectedProduct?.ring_sizes && selectedProduct.ring_sizes.length > 0) {
            if (!selectedSize || !selectedProduct.ring_sizes.includes(selectedSize)) {
                setSelectedSize(selectedProduct.ring_sizes[0]);
            }
        } else {
            setSelectedSize('');
        }
    }, [selectedProduct, selectedSize]);

    if (!products || products.length === 0 || !selectedProduct) {
        return (
            <div className="h-[85vh] flex items-center justify-center bg-gray-50 dark:bg-[#121212] transition-colors duration-500">
                <div className="animate-pulse text-gray-500 dark:text-white/60 tracking-[0.2em] uppercase text-xs font-bold">
                    Loading Collection...
                </div>
            </div>
        );
    }

    const handleAddToCart = async (product: Product) => {
        if (!product || product.stock_quantity <= 0) return;
        if (product.ring_sizes && product.ring_sizes.length > 0 && !selectedSize) return;

        setAddingToCart(product.id);
        await addToCart(product.id, 1, selectedSize);
        setTimeout(() => setAddingToCart(null), 1000); // Visual feedback delay
    };

    return (
        <>
            <section className="relative w-full h-[100vh] min-h-[800px] bg-gray-50 dark:bg-[#121212] overflow-hidden font-sans text-primary dark:text-white flex flex-col md:flex-row border-b border-gray-200 dark:border-white/10 transition-colors duration-500 select-none">

                {/* LEFT PANEL */}
                <div className="w-full md:w-[35%] lg:w-[30%] h-[40%] md:h-full py-8 px-6 lg:px-20 lg:py-16 flex flex-col justify-center relative z-20 border-b md:border-b-0 md:border-r border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#121212] shadow-[10px_0_30px_-10px_rgba(0,0,0,0.05)] dark:shadow-[10px_0_30px_-10px_rgba(0,0,0,0.5)] transition-colors duration-500">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={selectedProduct.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="flex flex-col h-full justify-center"
                        >
                            <p className="text-[10px] md:text-xs tracking-[0.2em] font-bold text-gray-500 dark:text-white/60 mb-2 uppercase transition-colors duration-500">
                                Item {(selectedIndex + 1).toString().padStart(2, '0')} / {products.length.toString().padStart(2, '0')}
                            </p>

                            <h2 className="text-4xl md:text-5xl lg:text-[4.5rem] font-black uppercase tracking-tighter mb-8 md:mb-12 leading-[0.85] break-words text-primary dark:text-white transition-colors duration-500">
                                {selectedProduct.name}
                            </h2>

                            <div className="grid grid-cols-2 gap-y-6 md:gap-y-8 gap-x-4 w-full text-[10px] sm:text-xs font-bold uppercase tracking-[0.15em] mt-auto md:mt-0">
                                <div className="text-gray-500 dark:text-white/60 transition-colors duration-500">Status</div>
                                <div className="text-gray-900 dark:text-white transition-colors duration-500">{selectedProduct.stock_quantity > 0 ? 'Available' : 'Archive'}</div>

                                <div className="text-gray-500 dark:text-white/60 transition-colors duration-500">Color</div>
                                <div className="text-gray-900 dark:text-white transition-colors duration-500">{selectedProduct.color || 'Onyx'}</div>

                                <div className="text-gray-500 dark:text-white/60 transition-colors duration-500">Material</div>
                                <div className="text-gray-900 dark:text-white transition-colors duration-500">{selectedProduct.material || 'Sterling'}</div>

                                <div className="text-gray-500 dark:text-white/60 transition-colors duration-500">Value</div>
                                <div className="text-gray-900 dark:text-white transition-colors duration-500">${selectedProduct.price?.toFixed(2)}</div>
                            </div>

                            {selectedProduct.ring_sizes && selectedProduct.ring_sizes.length > 0 && (
                                <div className="mt-8 transition-opacity duration-300">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.1em] text-gray-500 dark:text-white/60">Select Size</span>
                                        <button onClick={() => setShowRingChart(true)} className="text-[10px] md:text-xs underline text-primary dark:text-white uppercase tracking-[0.1em] hover:text-gray-500 transition-colors">Size Guide</button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedProduct.ring_sizes.map(size => (
                                            <button
                                                key={size}
                                                onClick={() => setSelectedSize(size)}
                                                className={`px-4 py-2 text-xs font-bold uppercase tracking-[0.1em] transition-all duration-300 ${selectedSize === size ? 'bg-primary dark:bg-white text-white dark:text-[#121212] border border-primary dark:border-white' : 'bg-transparent text-primary dark:text-white border border-gray-300 dark:border-[#4A4A4A] hover:border-gray-500 dark:hover:border-gray-300'}`}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={() => handleAddToCart(selectedProduct)}
                                disabled={selectedProduct.stock_quantity === 0 || addingToCart === selectedProduct.id}
                                className={`mt-10 md:mt-12 w-full py-4 px-6 flex items-center justify-center space-x-3 rounded-lg font-bold uppercase tracking-[0.2em] transition-all duration-300 text-xs ${selectedProduct.stock_quantity === 0
                                    ? 'bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                                    : addingToCart === selectedProduct.id
                                        ? 'bg-green-600 text-white shadow-lg shadow-green-600/20'
                                        : 'bg-primary dark:bg-white text-white dark:text-[#363636] hover:bg-primary-light dark:hover:bg-gray-100 shadow-xl shadow-primary/20 dark:shadow-white/10 hover:-translate-y-1'
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

            {/* PRODUCT DETAILS GALLERY SECTION */}
            <AnimatePresence mode="wait">
                {selectedProduct.detail_images && selectedProduct.detail_images.length > 0 && (
                    <motion.section
                        key={selectedProduct.id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -30 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="w-full bg-white dark:bg-[#1A1A1A] transition-colors duration-500 py-24 border-b border-gray-200 dark:border-white/10"
                    >
                        <div className="container mx-auto px-8 md:px-16">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5 }}
                                className="flex flex-col items-start mb-16"
                            >
                                <h3 className="text-3xl md:text-4xl lg:text-5xl font-black uppercase tracking-tighter text-primary dark:text-white mb-4 text-left transition-colors duration-500">
                                    Finer Details
                                </h3>
                                <p className="text-gray-500 dark:text-white/60 tracking-[0.2em] font-bold uppercase text-xs text-left transition-colors duration-500">
                                    {selectedProduct.name}
                                </p>
                            </motion.div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
                                {selectedProduct.detail_images.map((image, idx) => (
                                    <motion.div
                                        key={`detail-${selectedProduct.id}-${idx}`}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true, margin: "-100px" }}
                                        transition={{ duration: 0.7, delay: idx * 0.15, ease: "easeOut" }}
                                        className="group relative aspect-[4/5] overflow-hidden bg-gray-100 dark:bg-[#121212]/50 shadow-sm"
                                    >
                                        <img
                                            src={image}
                                            alt={`${selectedProduct.name} detail ${idx + 1}`}
                                            className="w-full h-full object-cover object-center transition-transform duration-[1.5s] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-[1.05]"
                                            loading="lazy"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 dark:group-hover:bg-black/40 transition-colors duration-700 pointer-events-none" />
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.section>
                )}
            </AnimatePresence>

            {/* Ring Chart Modal */}
            <AnimatePresence>
                {showRingChart && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm"
                        onClick={() => setShowRingChart(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="relative bg-white dark:bg-[#1A1A1A] p-6 md:p-8 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col items-center"
                            onClick={e => e.stopPropagation()}
                        >
                            <button onClick={() => setShowRingChart(false)} className="absolute top-4 right-4 p-2 bg-gray-100 dark:bg-[#2A2A2A] rounded-full hover:bg-gray-200 dark:hover:bg-[#363636] transition-colors z-10">
                                <X className="w-5 h-5 text-gray-800 dark:text-gray-200" />
                            </button>
                            <h3 className="text-2xl font-black uppercase tracking-tighter text-primary dark:text-white mb-6 text-center">Ring Size Guide</h3>
                            <div className="w-full bg-gray-50 dark:bg-[#121212] rounded-xl p-4 flex items-center justify-center">
                                <img src="/Ring_Chart.png" alt="Ring Chart" className="max-w-full h-auto object-contain rounded drop-shadow-md" />
                            </div>
                            <p className="text-sm font-medium tracking-wide text-center text-gray-500 dark:text-gray-400 mt-6 max-w-md">
                                For best accuracy, measure the inside diameter of an existing ring or wrap a string around your finger to find the circumference.
                            </p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
