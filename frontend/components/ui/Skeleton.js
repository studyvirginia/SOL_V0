import { motion } from "framer-motion";

/**
 * Premium Skeleton Loader using Framer Motion pulse animations.
 * Visual variants for different AI content types.
 */
export const Skeleton = ({ variant = "text", lines = 3, className = "" }) => {
  const pulse = {
    initial: { opacity: 0.1 },
    animate: { opacity: 0.35 },
    transition: {
      duration: 0.8,
      repeat: Infinity,
      repeatType: "reverse",
      ease: "easeInOut",
    },
  };

  if (variant === "card") {
    return (
      <div className={`w-full p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-4 ${className}`}>
        <motion.div {...pulse} className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded-md" />
        <div className="space-y-2 pt-2">
          <motion.div {...pulse} className="h-4 w-full bg-gray-100 dark:bg-gray-700/50 rounded-md" />
          <motion.div {...pulse} className="h-4 w-5/6 bg-gray-100 dark:bg-gray-700/50 rounded-md" />
          <motion.div {...pulse} className="h-4 w-4/6 bg-gray-100 dark:bg-gray-700/50 rounded-md" />
        </div>
        <div className="flex gap-2 pt-4">
          <motion.div {...pulse} className="h-10 flex-1 bg-gray-50 dark:bg-gray-700/30 rounded-xl" />
          <motion.div {...pulse} className="h-10 flex-1 bg-gray-50 dark:bg-gray-700/30 rounded-xl" />
        </div>
      </div>
    );
  }

  if (variant === "media") {
    return (
      <div className={`w-full aspect-video bg-gray-50 dark:bg-gray-900/40 rounded-2xl flex items-center justify-center border border-dashed border-gray-200 dark:border-gray-800 ${className}`}>
         <motion.div 
           initial={{ scale: 0.9, opacity: 0.2 }}
           animate={{ scale: 1.1, opacity: 0.4 }}
           transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
           className="w-12 h-12 rounded-full border-4 border-blue-500/20 border-t-blue-500/80 animate-spin"
         />
      </div>
    );
  }

  // Default: Text body
  return (
    <div className={`space-y-3 w-full ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <motion.div
          key={i}
          {...pulse}
          className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md"
          style={{ width: i === lines - 1 ? "60%" : "100%" }}
        />
      ))}
    </div>
  );
};

export default Skeleton;
