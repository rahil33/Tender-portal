import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  fullScreen = false 
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-16 h-16 border-4',
  };

  const spinner = (
    <div className="flex items-center justify-center">
      <div
        className={`${sizeClasses[size]} border-gray-200 border-t-gray-900 rounded-full animate-spin`}
      />
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
};

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circle' | 'rect' | 'card';
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  className = '', 
  variant = 'text' 
}) => {
  const baseClasses = 'animate-pulse bg-gray-200 rounded';
  
  const variantClasses = {
    text: 'h-4 w-full',
    circle: 'rounded-full w-10 h-10',
    rect: 'w-full h-24',
    card: 'w-full h-40',
  };

  return <div className={`${baseClasses} ${variantClasses[variant]} ${className}`} />;
};

interface LoadingOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
  isLoading, 
  children,
  message = 'Loading...'
}) => {
  return (
    <div className="relative">
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10"
          >
            <div className="text-center">
              <LoadingSpinner size="lg" />
              {message && <p className="mt-4 text-gray-600">{message}</p>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </div>
  );
};

export default LoadingSpinner;