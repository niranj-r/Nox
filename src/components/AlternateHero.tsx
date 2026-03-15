import { useRef, useEffect } from 'react';

interface Product {
    id: string;
    name: string;
    price: number;
    material: string;
    color: string;
    collection: string;
    primary_image: string;
    stock_quantity: number;
    ring_sizes?: string[];
}

interface AlternateHeroProps {
    products: Product[];
    onProductClick: (index: number) => void;
    onNavigate?: (page: string) => void;
}

export default function AlternateHero({ products, onProductClick, onNavigate }: AlternateHeroProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const el = scrollRef.current;
        if (!el || products.length === 0) return;

        let animationId: number;
        let isInteracting = false;
        let isTouching = false;
        let isHovering = false;
        let scrollTimeout: NodeJS.Timeout;
        let lastProgrammaticScroll = el.scrollLeft;

        const scrollSpeed = 0.5; // Smooth scroll speed

        const handleScrollWrap = (container: HTMLDivElement) => {
            const inner = container.children[0] as HTMLElement;
            if (!inner) return 0;

            const N = products.length;
            if (N === 0 || inner.children.length < N * 3) return 0;

            const firstItem = inner.children[0] as HTMLElement;
            const secondPeriodItem = inner.children[N] as HTMLElement;
            const periodWidth = secondPeriodItem.offsetLeft - firstItem.offsetLeft;

            if (periodWidth <= 0) return 0;

            if (container.scrollLeft >= periodWidth * 2) {
                container.scrollLeft -= periodWidth;
                lastProgrammaticScroll -= periodWidth;
            } else if (container.scrollLeft <= 0) {
                container.scrollLeft += periodWidth;
                lastProgrammaticScroll += periodWidth;
            }
            return periodWidth;
        };

        const step = () => {
            if (!isInteracting) {
                el.scrollLeft += scrollSpeed;
                lastProgrammaticScroll = el.scrollLeft;
                handleScrollWrap(el);
            }
            animationId = requestAnimationFrame(step);
        };

        animationId = requestAnimationFrame(step);

        const handleScroll = () => {
            handleScrollWrap(el);

            // If the delta is tiny, it's our tick
            if (Math.abs(el.scrollLeft - lastProgrammaticScroll) < 2) {
                return;
            }

            // It's a user scroll (finger drag, trackpad, or momentum)
            isInteracting = true;
            
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                if (!isTouching && !isHovering) {
                    isInteracting = false;
                    lastProgrammaticScroll = el.scrollLeft;
                }
            }, 100); // Resume auto-scroll 100ms after last physics scroll
        };

        const handleMouseEnter = () => {
            isHovering = true;
            isInteracting = true;
        };

        const handleMouseLeave = () => {
            isHovering = false;
            if (!isTouching) {
                clearTimeout(scrollTimeout);
                scrollTimeout = setTimeout(() => {
                    isInteracting = false;
                    lastProgrammaticScroll = el.scrollLeft;
                }, 100);
            }
        };

        const handleTouchStart = () => {
            isTouching = true;
            isInteracting = true;
        };

        const handleTouchEnd = () => {
            isTouching = false;
            // Don't resume immediately; let the momentum scroll handler take over
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                if (!isHovering) {
                    isInteracting = false;
                    lastProgrammaticScroll = el.scrollLeft;
                }
            }, 100);
        };

        el.addEventListener('scroll', handleScroll, { passive: true });
        el.addEventListener('mouseenter', handleMouseEnter);
        el.addEventListener('mouseleave', handleMouseLeave);
        el.addEventListener('touchstart', handleTouchStart, { passive: true });
        el.addEventListener('touchend', handleTouchEnd);
        el.addEventListener('touchmove', handleTouchStart, { passive: true });

        const initScroll = () => {
            const inner = el.children[0] as HTMLElement;
            const N = products.length;
            if (inner && inner.children.length >= N * 3) {
                const firstItem = inner.children[0] as HTMLElement;
                const secondPeriodItem = inner.children[N] as HTMLElement;
                
                const raf = requestAnimationFrame(() => {
                    const periodWidth = secondPeriodItem.offsetLeft - firstItem.offsetLeft;
                    if (periodWidth > 0 && el.scrollLeft === 0) {
                        el.scrollLeft = periodWidth;
                        lastProgrammaticScroll = el.scrollLeft;
                    }
                });
                return () => cancelAnimationFrame(raf);
            }
        };
        initScroll();

        return () => {
            cancelAnimationFrame(animationId);
            clearTimeout(scrollTimeout);
            el.removeEventListener('scroll', handleScroll);
            el.removeEventListener('mouseenter', handleMouseEnter);
            el.removeEventListener('mouseleave', handleMouseLeave);
            el.removeEventListener('touchstart', handleTouchStart);
            el.removeEventListener('touchend', handleTouchEnd);
            el.removeEventListener('touchmove', handleTouchStart);
        };
    }, [products.length]);

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
                        CHAPTER 01 / 01
                    </span>
                    <h1 className="text-5xl md:text-7xl lg:text-[6rem] font-black uppercase tracking-tighter leading-none group-hover:opacity-80 transition-opacity">
                        JUNGLE
                    </h1>
                </div>

                <div className="hidden md:flex gap-12 text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase">
                    <span className="text-black/40 dark:text-white/40">PRODUCTS</span>
                    <span>{products.length}</span>
                </div>
            </div>


            {/* Continuously Scrolling Marquee of Rings */}
            <div 
                ref={scrollRef}
                className="relative w-full overflow-x-auto overflow-y-hidden no-scrollbar bg-transparent mb-16 h-[320px] flex items-center cursor-grab active:cursor-grabbing"
                style={{ WebkitOverflowScrolling: 'touch' }} // Smooth momentum scrolling on iOS
            >
                <div className="flex items-center gap-16 md:gap-24 w-max px-8 lg:px-16" style={{ height: "100%" }}>
                    {[...products, ...products, ...products].map((p, idx) => (
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
                </div>
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
