import React from "react";

const BannerAd = () => {
  const adCode = import.meta.env.VITE_BANNER_AD;

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

  // Utilizing srcDoc prevents React DOM conflicts while supporting
  // document.write(), which is heavily used by ad network invoke.js scripts.
  const srcDocHtml = `<!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
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
    <div className="w-full flex justify-center mb-8 px-2 overflow-hidden">
      <iframe
        title="Banner Ad"
        srcDoc={srcDocHtml}
        width="728"
        height="90"
        scrolling="no"
        frameBorder="0"
        className="max-w-full border-none bg-transparent"
        style={{ width: "100%", maxWidth: "728px", height: "90px" }}
      />
    </div>
  );
};

export default BannerAd;
