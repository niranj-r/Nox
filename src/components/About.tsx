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
                        NOX is more than just a brand to me, it’s a dream I’ve carried for a long time. I’ve always wanted to build my own identity through creation, to bring an idea to life that truly represents who I am. Starting with rings felt natural. There’s something deeply personal about them, the way they quietly become part of your everyday life, holding memories, moods, and meaning without ever needing to say a word. NOX is my first real step into turning that long-held vision into reality.
                    </p>
                    <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold uppercase tracking-tight leading-[1.3] mb-12 text-[#111]/60 dark:text-white/60">
                        This first launch features 12 carefully selected designs, each chosen with intention and crafted with an animal aesthetic that reflects what I genuinely love. It’s a small beginning, but it carries big ambition and a future filled with many more collections. Rings are only the start for NOX, there is much more ahead. When you choose NOX, you’re not just wearing jewellery, you’re becoming part of a journey that began with a simple dream and the courage to finally bring it to life.
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
