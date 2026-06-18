import React from 'react';
import { motion } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';

interface CardProps extends HTMLMotionProps<"div"> {
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', hoverable = false, ...props }) => {
  const baseStyles = "bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden";
  const hoverStyles = hoverable ? "hover:shadow-md transition-shadow cursor-pointer" : "";

  return (
    <motion.div 
      className={`${baseStyles} ${hoverStyles} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};
