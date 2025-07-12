import { motion } from "framer-motion";

interface ProgressIndicatorProps {
  progress: number;
  text?: string;
  className?: string;
}

export default function ProgressIndicator({
  progress,
  text,
  className = "",
}: ProgressIndicatorProps) {
  return (
    <div className={`w-full ${className}`}>
      <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-cyan-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      </div>
      {text && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-2 text-sm text-white/70 text-center"
        >
          {text}
        </motion.p>
      )}
    </div>
  );
} 