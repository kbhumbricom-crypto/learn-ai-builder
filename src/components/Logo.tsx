import React from 'react';
import Image from 'next/image';

export function Logo({ size = 24, className = "" }: { size?: number, className?: string }) {
  return (
    <Image 
      src="/logo.png" 
      alt="Learn.ai Logo" 
      width={size} 
      height={size} 
      className={className}
      unoptimized
    />
  );
}
