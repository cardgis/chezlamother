import React, { useState } from 'react';

const ImageWithFallback = ({ 
  src, 
  alt, 
  className = '', 
  fallbackText = 'Image à venir',
  width = 400,
  height = 300 
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  // Placeholder SVG en cas d'erreur
  const PlaceholderSVG = () => (
    <div className={`bg-gray-100 flex items-center justify-center ${className}`}>
      <svg width={width} height={height} className="max-w-full max-h-full">
        <rect width="100%" height="100%" fill="#f3f4f6"/>
        <text 
          x="50%" 
          y="45%" 
          dominantBaseline="middle" 
          textAnchor="middle" 
          className="text-gray-500 text-sm font-medium"
          fill="#6b7280"
        >
          {fallbackText}
        </text>
        <text 
          x="50%" 
          y="60%" 
          dominantBaseline="middle" 
          textAnchor="middle" 
          className="text-gray-400 text-xs"
          fill="#9ca3af"
        >
          {alt}
        </text>
      </svg>
    </div>
  );

  if (imageError) {
    return <PlaceholderSVG />;
  }

  return (
    <div className="relative">
      {!imageLoaded && (
        <div className={`absolute inset-0 bg-gray-100 animate-pulse ${className}`}>
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500 text-sm">Chargement...</div>
          </div>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} ${!imageLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onError={handleImageError}
        onLoad={handleImageLoad}
        loading="lazy"
      />
    </div>
  );
};

export default ImageWithFallback;
