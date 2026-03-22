import React, { useEffect, useRef } from "react";

const BannerAd = () => {
  const containerRef = useRef(null);
  const adCode = import.meta.env.VITE_BANNER_AD;

  useEffect(() => {
    if (!adCode || !containerRef.current) return;
    
    // Clear previous ad content securely to prevent duplicate mounting
    containerRef.current.innerHTML = "";

    try {
      // createRange().createContextualFragment securely executes script tags safely in React 
      const fragment = document.createRange().createContextualFragment(adCode);
      containerRef.current.appendChild(fragment);
    } catch (err) {
      console.error("Failed to inject Banner Ad", err);
    }
  }, [adCode]);

  if (!adCode) {
    return (
      <div className="w-full max-w-[728px] h-[50px] md:h-[90px] mx-auto bg-secondary/10 border border-secondary/20 flex flex-col items-center justify-center rounded-xl mb-8 shadow-inner relative overflow-hidden">
        <span className="text-white/30 text-xs font-bold tracking-widest uppercase">
          Advertisement
        </span>
        <span className="text-white/20 text-[10px] mt-1">728 x 90</span>
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center mb-8 px-2">
      <div 
        ref={containerRef}
        className="w-full max-w-[728px] min-h-[50px] md:min-h-[90px] flex items-center justify-center overflow-hidden [&>*]:max-w-full"
      >
        {/* Ad will be dynamically injected here */}
      </div>
    </div>
  );
};

export default BannerAd;
