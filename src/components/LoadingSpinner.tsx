import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const LoadingSpinner = ({ size = "md", className = "" }: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-10 h-10",
    lg: "w-16 h-16",
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <motion.div
        className="relative"
        animate={{ rotate: 360 }}
        transition={{
          duration: 1.2,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        <motion.div
          className={`absolute inset-0 rounded-full border-4 border-pink-200 ${sizeClasses[size]}`}
        />
        <motion.div
          className={`absolute inset-0 rounded-full border-4 border-transparent border-t-pink-400 border-r-pink-400 ${sizeClasses[size]}`}
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <Loader2 className={`absolute inset-0 m-auto text-pink-500 ${sizeClasses[size]}`} />
      </motion.div>
    </div>
  );
};

export default LoadingSpinner;
