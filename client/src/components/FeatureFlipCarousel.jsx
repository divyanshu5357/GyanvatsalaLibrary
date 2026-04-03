import React, { useState, useEffect, useRef } from 'react';

export default function FeatureFlipCarousel({ features, cardsPerSlide = 3, autoSlideInterval = 3000 }) {
  const [slide, setSlide] = useState(0);
  const [flipped, setFlipped] = useState(Array(features.length).fill(false));
  const timeoutRef = useRef();

  const totalSlides = Math.ceil(features.length / cardsPerSlide);

  useEffect(() => {
    function nextSlide() {
      setSlide((s) => (s + 1) % totalSlides);
      setFlipped(Array(features.length).fill(false));
      timeoutRef.current = setTimeout(nextSlide, autoSlideInterval);
    }
    timeoutRef.current = setTimeout(nextSlide, autoSlideInterval);
    return () => clearTimeout(timeoutRef.current);
  }, [features.length, totalSlides, autoSlideInterval]);

  const handleFlip = (idx) => {
    setFlipped((prev) => {
      const copy = [...prev];
      copy[idx] = !copy[idx];
      return copy;
    });
  };

  const startIdx = slide * cardsPerSlide;
  const visible = features.slice(startIdx, startIdx + cardsPerSlide);

  return (
    <div className="w-full flex flex-col items-center">
      <div className="flex justify-center gap-8 flex-wrap">
        {visible.map((feature, i) => {
          const idx = startIdx + i;
          return (
            <div
              key={feature.title}
              className="group [perspective:1000px] w-72 h-72 cursor-pointer"
              onMouseEnter={() => handleFlip(idx)}
              onMouseLeave={() => handleFlip(idx)}
            >
              <div
                className={`relative w-full h-full duration-700 [transform-style:preserve-3d] ${flipped[idx] ? '[transform:rotateY(180deg)]' : ''}`}
              >
                {/* Front */}
                <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-violet-700/30 bg-[#1a1c2e] shadow-xl text-7xl text-white transition-all duration-500 [backface-visibility:hidden]">
                  {feature.icon}
                </div>
                {/* Back */}
                <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-violet-700/30 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-xl text-center px-6 text-white [transform:rotateY(180deg)] [backface-visibility:hidden]">
                  <div className="mb-2 text-3xl font-bold">{feature.title}</div>
                  <div className="text-base text-gray-100">{feature.body}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
