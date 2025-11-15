// app/Previous/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function PreviousPage() {
  // Sample images - replace with your actual image URLs
  const images = [
    {
      id: 1,
      src: "/20251018_014712.png",
      alt: "Event 1",
      title: "Digital Workshop 2024"
    },
    {
      id: 2,
      src: "/20251018_014712.png", 
      alt: "Event 2",
      title: "Data Analytics Summit"
    },
    {
      id: 3,
      src: "/20251018_014712.png",
      alt: "Event 3", 
      title: "Tech Innovation Fair"
    },
    {
      id: 4,
      src: "/20251018_014712.png",
      alt: "Event 4",
      title: "AI Conference 2024"
    },
    {
      id: 5,
      src: "/20251018_014712.png",
      alt: "Event 5",
      title: "Startup Showcase"
    },
    {
      id: 6,
      src: "/20251018_014712.png",
      alt: "Event 6",
      title: "Coding Bootcamp"
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState('right');

  // Auto-slide functionality
  const handleNext = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setDirection('right');
    
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
      setIsAnimating(false);
    }, 300);
  }, [isAnimating, images.length]);

  useEffect(() => {
    const interval = setInterval(() => {
      handleNext();
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval);
  }, [handleNext]);

  const handlePrev = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setDirection('left');
    
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
      setIsAnimating(false);
    }, 300);
  };

  const goToSlide = (index: number) => {
    if (isAnimating || index === currentIndex) return;
    setIsAnimating(true);
    setDirection(index > currentIndex ? 'right' : 'left');
    
    setTimeout(() => {
      setCurrentIndex(index);
      setIsAnimating(false);
    }, 300);
  };

  const getVisibleImages = () => {
    const visibleCount = 3; // Show 3 images at once
    const result = [];
    
    for (let i = 0; i < visibleCount; i++) {
      const index = (currentIndex + i) % images.length;
      result.push({
        ...images[index],
        position: i
      });
    }
    
    return result;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-gray-900/80 backdrop-blur-xl border-b border-cyan-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Previous Events
              </h1>
            </div>
            <Link
              href="/"
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-12 px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-4">
            Previous Events Gallery
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Explore our successful past events and memorable moments
          </p>
        </div>

        {/* Main Gallery */}
        <div className="max-w-6xl mx-auto">
          {/* Large Display Area */}
          <div className="relative mb-12 overflow-hidden">
            <div className="flex justify-center items-center min-h-[400px]">
              {getVisibleImages().map((image, index) => (
                <div
                  key={image.id}
                  className={`
                    relative transition-all duration-500 ease-in-out mx-4
                    ${index === 1 
                      ? 'scale-110 z-20 shadow-2xl shadow-cyan-500/50' 
                      : 'scale-90 z-10 opacity-70'
                    }
                    ${isAnimating 
                      ? direction === 'right' 
                        ? 'transform translate-x-4' 
                        : 'transform -translate-x-4'
                      : ''
                    }
                  `}
                >
                  <div className="bg-gray-800/50 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-4 w-80 h-80">
                    <div className="relative w-full h-64 mb-4 rounded-lg overflow-hidden">
                      <Image
                        src={image.src}
                        alt={image.alt}
                        fill
                        className="object-cover hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <h3 className="text-white text-center font-semibold text-lg">
                      {image.title}
                    </h3>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-cyan-600/80 hover:bg-cyan-600 text-white p-3 rounded-full transition-colors z-30"
              disabled={isAnimating}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-cyan-600/80 hover:bg-cyan-600 text-white p-3 rounded-full transition-colors z-30"
              disabled={isAnimating}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Thumbnail Navigation */}
          <div className="flex justify-center space-x-2 mb-8">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`
                  w-4 h-4 rounded-full transition-all duration-300
                  ${index === currentIndex 
                    ? 'bg-cyan-500 scale-125' 
                    : 'bg-gray-600 hover:bg-gray-500'
                  }
                `}
                disabled={isAnimating}
              />
            ))}
          </div>

          {/* Grid View */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-white text-center mb-8">All Events</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {images.map((image, index) => (
                <div
                  key={image.id}
                  className={`
                    bg-gray-800/50 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-4 
                    hover:border-cyan-500/40 transition-all duration-300 hover:transform hover:scale-105 
                    cursor-pointer
                    ${index === currentIndex ? 'ring-2 ring-cyan-500' : ''}
                  `}
                  onClick={() => goToSlide(index)}
                >
                  <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden">
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      className="object-cover hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="text-white text-center font-semibold">
                    {image.title}
                  </h3>
                </div>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="text-center">
            <div className="inline-flex items-center gap-4 bg-gray-800/50 backdrop-blur-xl border border-cyan-500/20 rounded-xl p-4">
              <button
                onClick={handlePrev}
                className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
                disabled={isAnimating}
              >
                Previous
              </button>
              
              <span className="text-white font-medium">
                {currentIndex + 1} of {images.length}
              </span>
              
              <button
                onClick={handleNext}
                className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
                disabled={isAnimating}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
