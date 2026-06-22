import React from "react";
import BannerAd from "./BannerAd";

const VerificationPage = ({ children, title }) => {
  return (
    <div className="flex flex-col items-center w-full pt-10 pb-8 px-4 text-white">
      <div className="flex flex-col items-center max-w-4xl w-full">
        {/* Top Banner Ad */}
        <BannerAd />

        {/* Main Content Area */}
        <div className="w-full mt-6 flex justify-center">
          {children}
        </div>

        {/* Bottom Banner Ad */}
        <div className="w-full mt-6">
          <BannerAd />
        </div>
      </div>
    </div>
  );
};

export default VerificationPage;
