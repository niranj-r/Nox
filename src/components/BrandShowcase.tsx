import { motion, useScroll, useTransform, useSpring, useMotionValue, useMotionTemplate, useVelocity } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { useMediaQuery } from 'react-responsive';
import { Diamond, Menu, ArrowRight } from 'lucide-react';

export default function BrandShowcase() {
    const containerRef = useRef<HTMLDivElement>(null);
    const isMobile = useMediaQuery({ maxWidth: 768 });

    // --- Scroll Logic ---
    const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start end", "end start"] });
    const smoothProgress = useSpring(scrollYProgress, { mass: 0.2, stiffness: 30, damping: 10, restDelta: 0.001 });

    // Transforms
    const lineProgress = useTransform(smoothProgress, [0.1, 0.4], [0, 1]);
    const archClip = useTransform(smoothProgress, [0.2, 0.5], ["inset(100% 0 0 0)", "inset(0% 0 0 0)"]);
    const opacity = useTransform(smoothProgress, [0.1, 0.25, 0.45, 0.8, 0.95], [0, 1, 1, 1, 0]);
    const scale = useTransform(smoothProgress, [0.1, 0.4, 0.8], [0.95, 1, 0.98]);

    // --- Interactive ---
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const [isHovered, setIsHovered] = useState(false);
    const handleMouseMove = (e: React.MouseEvent) => {
        if (isMobile) return;
        const rect = e.currentTarget.getBoundingClientRect();
        mouseX.set(e.clientX - rect.left);
        mouseY.set(e.clientY - rect.top);
    };
    const glowConfig = useMotionTemplate`radial-gradient(400px circle at ${mouseX}px ${mouseY}px, rgba(255, 237, 168, 0.1), transparent 70%)`;


    return (
        <section
            ref={containerRef}
            onMouseMove={handleMouseMove}
            className="relative w-full bg-[#003631] dark:bg-[#121212] text-accent dark:text-white font-serif overflow-hidden select-none isolate"
            style={{ height: isMobile ? 'auto' : '140vh' }} // Taller to fit the elongated layout comfortably
        >
            {/* Background Ambience */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.04] mix-blend-overlay -z-20" />
            {!isMobile && <motion.div className="absolute inset-0 pointer-events-none -z-10" style={{ background: glowConfig }} />}

            {/* --- GRID LINES (Exact Replica Structure) --- */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                {/* Top Horizontal Line (Under precision header) */}
                <motion.div style={{ scaleX: lineProgress }} className="absolute top-[120px] left-0 right-0 h-px bg-white/10 origin-left" />

                {/* Left Vertical Line (Defining left sidebar) */}
                <motion.div style={{ scaleY: lineProgress }} className="absolute top-[120px] bottom-0 left-[25%] w-px bg-white/10 origin-top" />

                {/* Right Vertical Line (Defining right sidebar) */}
                <motion.div style={{ scaleY: lineProgress }} className="absolute top-[120px] bottom-0 right-[25%] w-px bg-white/10 origin-top" />

                {/* Middle Horizontal Split (Left Side only) */}
                <motion.div style={{ scaleX: lineProgress }} className="absolute top-[45%] left-0 w-[25%] h-px bg-white/10 origin-left" />

                {/* Middle Horizontal Split (Right Side only) */}
                <motion.div style={{ scaleX: lineProgress }} className="absolute top-[45%] right-0 w-[25%] h-px bg-white/10 origin-right" />
            </div>


            {/* --- CONTENT LAYER --- */}
            <div className="relative z-10 w-full h-full flex flex-col">

                {/* 2. MAIN GRID BODY */}
                <div className="flex-1 w-full relative flex flex-col md:flex-row">

                    {/* --- LEFT COLUMN --- */}
                    <div className="hidden md:flex w-full md:w-[25%] h-[50vh] md:h-full relative flex-col order-2 md:order-none border-t md:border-t-0 border-white/10 md:border-transparent">
                        {/* Top Quadrant: Portrait/Date */}
                        <div className="h-[40%]  p-12 flex flex-col justify-center">
                            <div className="flex gap-6 items-end">
                                <div className="w-16 h-20 bg-black/20 overflow-hidden">
                                    <img src="/nox_men_model.png" alt="Male model wearing NOX jewelry" className="w-full h-full object-cover opacity-60 grayscale hover:grayscale-0 transition-all duration-700" />
                                </div>

                                <div className="text-white/80 font-serif">
                                    <div className="text-3xl">12.01</div>
                                    <div className="text-[0.6rem] tracking-widest mt-1 opacity-60 font-sans">SERIES V<br />LAUNCH</div>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Quadrant: Oval Rings */}
                        <div className="flex-1 p-12 flex flex-col justify-end items-center relative overflow-hidden">
                            <motion.div
                                style={{ y: useTransform(smoothProgress, [0, 1], [50, -50]) }}
                                className="w-48 h-64 rounded-[100px] overflow-hidden relative shadow-2xl border border-white/5"
                            >
                                <img src="/nox_men_rings_detail.png" alt="Detailed view of NOX men's rings" className="w-full h-full object-cover scale-110" />

                                {/* Dark overlay for text readability */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            </motion.div>
                            <p className="mt-8 text-xs text-center text-white/50 max-w-[200px] leading-relaxed">
                                One of NOX's finest for fine art, opening its doors for a new fashion era.
                            </p>
                        </div>
                    </div>


                    {/* --- CENTER COLUMN (HERO) --- */}
                    <div className="w-full md:flex-1 h-[100vh] md:h-full relative border-x border-transparent flex flex-col items-center pt-16 overflow-hidden order-1 md:order-none">

                        {/* Diamond Icon Floating */}
                        <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
                            <Diamond size={32} className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]" strokeWidth={1} />
                        </motion.div>

                        {/* Main Typography */}
                        <motion.div style={{ scale, opacity }} className="text-center mt-12 mb-8 relative z-20 mix-blend-screen">
                            <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif text-[#F2F0E9]">Men's Fashion</h1>
                            <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif text-[#FFEDA8] dark:text-white italic -mt-2 md:-mt-4">Reimagined</h1>
                        </motion.div>

                        {/* THE ARCH */}
                        <div className="flex-1 w-full max-w-[500px] relative px-4">
                            <motion.div
                                style={{ clipPath: isMobile ? undefined : archClip }}
                                className="w-full h-full bg-[#002420] dark:bg-[#0A0A0A] rounded-t-[300px] relative overflow-hidden border-t border-x border-white/10"
                            >
                                <div className="absolute inset-0 bg-red-900 mix-blend-multiply opacity-20" /> {/* Slight warm tint like reference */}
                                <img src="/nox_men_model.png" alt="Signature series NOX model" className="w-full h-full object-cover opacity-90 scale-105" />


                                {/* Overlay Text inside Arch */}
                                <div className="absolute top-24 left-0 right-0 text-center">
                                    <p className="text-[0.6rem] tracking-[0.2em] text-white/70 uppercase">Trace your favourite MV<br />pieces from conception<br />to completion.</p>
                                </div>
                            </motion.div>
                        </div>
                    </div>


                    {/* --- RIGHT COLUMN --- */}
                    <div className="hidden md:flex w-full md:w-[25%] h-[50vh] md:h-full relative flex-col order-3 md:order-none border-t md:border-t-0 border-white/10 md:border-transparent">

                        {/* Top Quadrant: Brand Block */}
                        <div className="h-[40%] border-b border-transparent relative flex flex-col items-center justify-center">
                            <div className="w-full h-full rounded-b-full bg-[#004D45]/30 dark:bg-[#1A1A1A]/30 flex flex-col items-center justify-center relative overflow-hidden">
                                <div className="mt-12 text-center">
                                    <h4 className="font-serif text-2xl text-white">NOX</h4>
                                    <span className="text-[0.5rem] tracking-widest text-white/50 uppercase mt-2 block">Presented By<br />Noel Bijesh E</span>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Quadrant: Earrings Arch */}
                        <div className="flex-1 p-12 flex flex-col items-center">
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                transition={{ duration: 0.5 }}
                                className="w-full aspect-[3/4] rounded-t-full rounded-b-full overflow-hidden border border-white/5 relative group"
                            >
                                <img src="/nox_men_lifestyle.png" alt="NOX men's lifestyle showcase" className="w-full h-full object-cover" />

                                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
                            </motion.div>

                            <div className="mt-12 w-full text-left">
                                <h3 className="text-3xl font-serif text-[#F2F0E9] leading-tight">Time to make<br />somebody<br />happy!</h3>
                                <div className="w-16 h-1 bg-red-800 mt-6" />
                            </div>
                        </div>
                    </div>

                </div>

            </div>

        </section>
    );
}
