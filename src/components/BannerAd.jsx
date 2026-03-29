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
    <div className="w-full flex justify-center my-6 px-2 overflow-hidden">
      <div className="w-full max-w-[728px] flex justify-center">
        <iframe
          title="Banner Ad"
          srcDoc={srcDocHtml}
          width="728"
          height="90"
          scrolling="no"
          frameBorder="0"
          className="max-w-full border-none bg-transparent h-[50px] md:h-[90px]"
          style={{ width: "100%", maxWidth: "728px" }}
        />
      </div>
    </div>
  );
};

export default BannerAd;
