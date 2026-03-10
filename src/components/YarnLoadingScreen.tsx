import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Circle, Cloud } from "lucide-react";

export const YarnLoadingScreen = () => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
        }, 1800); // show for 1.8 seconds max on initial load
        return () => clearTimeout(timer);
    }, []);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
                    className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-[#fff0f5]"
                >
                    {/* Decorative Clouds */}
                    <motion.div
                        animate={{ x: [-20, 20, -20] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-1/4 left-1/4 text-pink-200"
                    >
                        <Cloud className="w-24 h-24 fill-current" />
                    </motion.div>

                    <motion.div
                        animate={{ x: [20, -20, 20] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-1/3 right-1/4 text-purple-200"
                    >
                        <Cloud className="w-32 h-32 fill-current" />
                    </motion.div>

                    {/* Rolling Yarn Ball */}
                    <motion.div
                        initial={{ x: -150, rotate: -360 }}
                        animate={{ x: 0, rotate: 0 }}
                        transition={{ duration: 1.2, type: "spring", bounce: 0.4 }}
                        className="relative"
                    >
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="text-pink-500 relative z-10 bg-white rounded-full p-2 shadow-xl border-4 border-pink-200"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="#fbcfe8" stroke="#ec4899" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" /><path d="M12 2a10 10 0 0 1 10 10 10 10 0 0 1-10 10 10 10 0 0 1-10-10A10 10 0 0 1 12 2z" /><path d="M2.2 14.5c4-1 6.5-4 7.5-8" /><path d="M21.8 9.5c-4 1-6.5 4-7.5 8" /><path d="M10 21c-2-3-2-7 1-9.5" /><path d="M14 3c2 3 2 7-1 9.5" /><path d="M6 3c2 2 3 5 2 8" /><path d="M18 21c-2-2-3-5-2-8" /></svg>
                        </motion.div>

                        {/* Yarn Trail */}
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: 150 }}
                            transition={{ duration: 1.2, type: "spring", bounce: 0.4 }}
                            className="absolute top-1/2 left-full h-3 bg-pink-400 rounded-full -translate-y-1/2 z-0"
                        />
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
