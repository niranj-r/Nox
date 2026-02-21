import { motion } from 'framer-motion';

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

interface AlternateHeroProps {
    products: Product[];
    onProductClick: (index: number) => void;
    onNavigate?: (page: string) => void;
}

export default function AlternateHero({ products, onProductClick, onNavigate }: AlternateHeroProps) {

    if (!products || products.length === 0) {
        return (
            <div className="h-[60vh] flex items-center justify-center bg-gray-50 dark:bg-[#121212] transition-colors duration-500">
                <div className="animate-pulse text-gray-500 dark:text-white/60 tracking-[0.2em] uppercase text-xs font-bold">
                    Loading...
                </div>
            </div>
        );
    }

    return (
        <section className="w-full bg-[#F6F6F6] dark:bg-[#121212] overflow-hidden font-sans text-[#111] dark:text-white transition-colors duration-500 select-none pb-12 pt-2">

            {/* Collection Title section */}
            <div className="max-w-[1400px] mx-auto px-6 lg:px-12 mb-20 flex justify-between items-end">
                <div
                    className="flex flex-col gap-2 cursor-pointer group"
                    onClick={() => {
                        const el = document.getElementById('collections');
                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                >
                    <span className="text-[10px] md:text-xs tracking-[0.2em] font-bold text-black/40 dark:text-white/40 uppercase group-hover:text-black dark:group-hover:text-white transition-colors">
                        COLLECTION 01 / 01
                    </span>
                    <h1 className="text-5xl md:text-7xl lg:text-[6rem] font-black uppercase tracking-tighter leading-none group-hover:opacity-80 transition-opacity">
                        COLLECTION
                    </h1>
                </div>

                <div className="hidden md:flex gap-12 text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase">
                    <span className="text-black/40 dark:text-white/40">PRODUCTS</span>
                    <span>{products.length}</span>
                </div>
            </div>


            {/* Continuously Scrolling Marquee of Rings */}
            <div className="relative w-full overflow-hidden bg-transparent mb-16 h-[320px]">
                {/* 
                    Using framer-motion approach for a seamless marquee loop. 
                    We duplicate the products array to ensure no gaps as it scrolls.
                */}
                <motion.div
                    className="flex items-center gap-16 md:gap-24 absolute top-0 left-0"
                    animate={{
                        x: ['0%', '-50%'], // Move from 0 to -50% (since we duplicated items, 50% is the end of the first set)
                    }}
                    transition={{
                        x: {
                            repeat: Infinity,
                            repeatType: "loop",
                            duration: products.length * 3, // Speed based on item count
                            ease: "linear",
                        },
                    }}
                    style={{ width: "max-content", height: "100%" }}
                >
                    {[...products, ...products].map((p, idx) => (
                        <div
                            key={`${p.id}-${idx}`}
                            onClick={() => onProductClick(idx % products.length)} // modulo to get original index
                            className="relative flex-shrink-0 flex flex-col items-center justify-center cursor-pointer group"
                            style={{ width: '180px', height: '240px' }}
                        >
                            <img
                                src={p.primary_image}
                                alt={p.name}
                                draggable={false}
                                className="w-full h-[180px] object-contain drop-shadow-xl dark:drop-shadow-[0_20px_20px_rgba(255,255,255,0.05)] transition-transform duration-500 group-hover:scale-125 group-hover:-translate-y-4"
                            />
                            <div className="mt-6 text-center">
                                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-primary dark:text-white transition-colors duration-300">
                                    {p.name}
                                </span>
                            </div>
                        </div>
                    ))}
                </motion.div>
            </div>

            {/* Footer Discover section */}
            <div className="max-w-[1400px] mx-auto px-6 lg:px-12 flex justify-between items-center text-[10px] font-bold tracking-[0.15em] uppercase text-black/40 dark:text-white/40 bg-white/50 dark:bg-[#0A0A0A]/80 p-4 border border-black/5 dark:border-white/10">
                <span>{products.length} Products</span>
                <span onClick={() => {
                    if (onNavigate) onNavigate('home');
                    setTimeout(() => {
                        const el = document.getElementById('collections');
                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 100);
                }} className="cursor-pointer hover:text-black dark:hover:text-white transition-colors">DISCOVER</span>
            </div>

        </section>
    );
}
