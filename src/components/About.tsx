import { motion } from 'framer-motion';

export default function About() {
    return (
        <section id="about" className="w-full bg-[#F6F6F6] dark:bg-[#121212] flex flex-col md:flex-row border-b border-gray-200 dark:border-white/10 transition-colors duration-500">
            {/* LEFT PANEL - TITLE */}
            <div className="w-full md:w-[35%] lg:w-[30%] py-16 md:py-32 px-6 lg:px-20 border-b md:border-b-0 md:border-r border-gray-200 dark:border-white/10 flex flex-col justify-start">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <span className="text-[10px] md:text-xs tracking-[0.2em] font-bold text-gray-500 dark:text-white/60 mb-4 block uppercase transition-colors duration-500">
                        The Story
                    </span>
                    <h2 className="text-4xl md:text-5xl lg:text-[4.5rem] font-black uppercase tracking-tighter leading-[0.85] whitespace-nowrap text-[#111] dark:text-white transition-colors duration-500">
                        ABOUT<br />NOX
                    </h2>
                </motion.div>
            </div>

            {/* RIGHT PANEL - CONTENT */}
            <div className="w-full md:w-[65%] lg:w-[70%] py-16 md:py-32 px-6 lg:px-20 lg:pr-32 flex flex-col justify-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    className="max-w-[900px]"
                >
                    <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold uppercase tracking-tight text-[#111] dark:text-white leading-[1.3] mb-8">
                        NOX is more than just a brand to me — it’s something I’ve dreamed about building for a long time. I’ve always wanted to create something of my own, something real, and this is my very first step into that world. Starting with rings felt natural to me. There’s something deeply personal about them — the way they quietly become part of your everyday life, carrying memories, moods, and meaning.
                    </p>
                    <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold uppercase tracking-tight leading-[1.3] mb-12 text-[#111]/60 dark:text-white/60">
                        This first launch includes 12 carefully chosen designs, each one handpicked and thoughtfully crafted with a vintage, aesthetic soul that reflects what I genuinely love. It’s a small beginning, but it comes with big hopes and many more collections to follow. When you choose NOX, you’re not just buying a ring — you’re becoming part of a journey that started with a simple dream and the courage to finally begin.
                    </p>

                    <div className="flex items-center gap-6">
                        <div className="h-[2px] bg-[#111] dark:bg-white w-12"></div>
                        <span className="text-[10px] md:text-xs uppercase tracking-[0.3em] font-black text-[#111] dark:text-white">Noel Bijesh,The Founder</span>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
