import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Heart } from "lucide-react";

interface Particle {
    id: number;
    x: number;
    y: number;
    type: "star" | "heart";
    color: string;
    size: number;
}

const COLORS = ["#f472b6", "#a855f7", "#facc15", "#fb7185", "#60a5fa"];

export const MouseTrail = () => {
    const [particles, setParticles] = useState<Particle[]>([]);

    useEffect(() => {
        let particleId = 0;
        let lastMove = 0;

        const handleMouseMove = (e: MouseEvent) => {
            const now = Date.now();
            // Throttle slightly to avoid too many particles
            if (now - lastMove < 40) return;
            lastMove = now;

            const type = Math.random() > 0.5 ? "star" : "heart";
            const color = COLORS[Math.floor(Math.random() * COLORS.length)];
            const size = Math.random() * 12 + 8; // 8px to 20px

            const newParticle: Particle = {
                id: particleId++,
                x: e.clientX,
                y: e.clientY,
                type,
                color,
                size
            };

            setParticles((prev) => [...prev.slice(-15), newParticle]); // keep max 15
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    return (
        <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
            <AnimatePresence>
                {particles.map((p) => (
                    <motion.div
                        key={p.id}
                        initial={{ opacity: 0.8, scale: 0.5, x: p.x, y: p.y, rotate: 0 }}
                        animate={{
                            opacity: 0,
                            scale: 1.5,
                            y: p.y + (Math.random() * 40 - 20),
                            x: p.x + (Math.random() * 40 - 20),
                            rotate: Math.random() * 90 - 45
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2"
                        style={{ color: p.color }}
                    >
                        {p.type === "star" ? (
                            <Star
                                className="fill-current"
                                style={{ width: p.size, height: p.size }}
                            />
                        ) : (
                            <Heart
                                className="fill-current"
                                style={{ width: p.size, height: p.size }}
                            />
                        )}
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};
