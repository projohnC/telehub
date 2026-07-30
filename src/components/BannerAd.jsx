import React from "react";

const BannerAd = () => {
  const adCode = import.meta.env.VITE_BANNER_AD;

  if (!adCode) {
    return (
      <div className="w-full max-w-[728px] h-[50px] md:h-[90px] mx-auto bg-white/5 border border-white/10 flex flex-col items-center justify-center rounded-2xl my-6 shadow-inner relative overflow-hidden backdrop-blur-sm">
        <span className="text-white/30 text-xs font-bold tracking-widest uppercase">
          Advertisement
        </span>
        <div className="flex gap-2 items-baseline mt-1">
          <span className="text-white/20 text-[10px]">PC: 728 x 90</span>
          <span className="text-white/10 text-[8px]">|</span>
          <span className="text-white/20 text-[10px]">MB: 320 x 50</span>
        </div>
      </div>
    );
  }

  // Utilizing srcDoc prevents React DOM conflicts while supporting
  // document.write(), which is heavily used by ad network invoke.js scripts.
  const srcDocHtml = `<!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { 
            margin: 0; 
            padding: 0; 
            overflow: hidden; 
            background: transparent; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
          }
        </style>
      </head>
      <body>
        ${adCode}
      </body>
    </html>`;

  return (
    <div className="w-full flex justify-center my-2 h-[45px] md:h-[90px] items-center overflow-visible">
      {/* 
          We use a container that is 728px wide. 
          On mobile, we scale it down to fit the screen width (~320px-400px).
      */}
      <div className="flex justify-center items-center w-[728px] h-[90px] origin-center scale-[0.45] sm:scale-[0.6] md:scale-90 lg:scale-100">
        <iframe
          title="Banner Ad"
          srcDoc={srcDocHtml}
          width="728"
          height="90"
          scrolling="no"
          frameBorder="0"
          className="border-none bg-transparent"
          style={{ width: "728px", height: "90px" }}
        />
      </div>
    </div>
  );
};

export default BannerAd;
