import React, { useState, useEffect } from "react";
import { Button } from "@nextui-org/button";
import { motion, AnimatePresence } from "framer-motion";
import BannerAd from "./BannerAd";

const VerificationPage = ({ children, title }) => {
  const [step, setStep] = useState(1);
  const [timeLeft, setTimeLeft] = useState(8);

  useEffect(() => {
    if (step === 2) {
      if (timeLeft > 0) {
        const timer = setInterval(() => {
          setTimeLeft((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(timer);
      } else {
        setStep(3);
      }
    }
  }, [step, timeLeft]);

  return (
    <div className={`flex flex-col items-center w-full pb-8 px-4 ${step !== 4 ? "pt-20 md:pt-24 text-[#0a0b1e]" : ""}`}>
      <div className={`flex flex-col items-center w-full ${step !== 4 ? "max-w-lg" : "max-w-7xl"}`}>
        {/* Top Banner Ad */}
        <BannerAd />

        {/* Main Verification Card */}
        <div className="w-full mt-8">
          <AnimatePresence mode="wait">
            {step !== 4 ? (
              <motion.div
                key="verification-card"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full bg-white border border-slate-100 rounded-[2rem] p-10 flex flex-col items-center shadow-sm relative overflow-hidden text-center"
              >
                {step === 1 && (
                  <div className="animate-appearance-in w-full">
                    <h2 className="text-xl md:text-2xl font-normal mb-16 text-slate-700 leading-relaxed font-sans">
                      Please Click On Continue Button to Verify Yourself !
                    </h2>
                    <Button
                      onClick={() => setStep(2)}
                      className="w-full py-7 rounded-full bg-[#1d4ed8] text-white font-bold text-[14px] shadow-md hover:bg-[#1e40af] transition-all uppercase tracking-tighter"
                    >
                      Click to Continue
                    </Button>
                  </div>
                )}

                {step === 2 && (
                  <div className="animate-appearance-in w-full flex flex-col items-center">
                    <div className="flex items-center justify-center gap-2 mb-12">
                      <h2 className="text-xl md:text-2xl font-normal text-slate-800 font-sans">
                        Links Page is Almost Ready 🚀
                      </h2>
                    </div>
                    
                    {/* Concentrical circles SVG */}
                    <div className="relative w-44 h-44 flex items-center justify-center mb-16">
                      <svg className="w-full h-full">
                        {/* Concentrical Circles representing the design */}
                        <circle cx="88" cy="88" r="45" fill="none" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="5,5" className="animate-[oscillate_20s_ease-in-out_infinite]" />
                        <circle cx="88" cy="88" r="55" fill="none" stroke="#4f46e5" strokeWidth="2" strokeDasharray="20,10" className="opacity-80 animate-[oscillate-reverse_10s_ease-in-out_infinite]" />
                        <circle cx="88" cy="88" r="65" fill="none" stroke="#3730a3" strokeWidth="1" strokeDasharray="10,5" className="opacity-60 animate-[oscillate_15s_ease-in-out_infinite]" />
                        <circle cx="88" cy="88" r="75" fill="none" stroke="#4f46e5" strokeWidth="1" strokeDasharray="30,10" className="opacity-40 animate-[oscillate-reverse_25s_ease-in-out_infinite]" />
                      </svg>
                      <span className="absolute text-7xl font-light text-slate-800">{timeLeft}</span>
                    </div>

                    <Button
                      disabled
                      className="w-full py-7 rounded-full bg-[#5eead4] text-white font-bold text-[14px] cursor-not-allowed opacity-90 uppercase tracking-tighter"
                    >
                      Please Wait...
                    </Button>
                  </div>
                )}

                {step === 3 && (
                  <div className="animate-appearance-in w-full flex flex-col items-center">
                    <div className="flex items-center justify-center gap-2 mb-12">
                      <h2 className="text-xl md:text-2xl font-normal text-slate-800 font-sans">
                        Links Page is Almost Ready 🚀
                      </h2>
                    </div>
                    
                    <div className="relative w-44 h-44 flex items-center justify-center mb-16">
                      <svg className="w-full h-full opacity-30">
                        <circle cx="88" cy="88" r="45" fill="none" stroke="#e2e8f0" strokeWidth="1" />
                        <circle cx="88" cy="88" r="55" fill="none" stroke="#4f46e5" strokeWidth="2" />
                        <circle cx="88" cy="88" r="65" fill="none" stroke="#3730a3" strokeWidth="1" />
                        <circle cx="88" cy="88" r="75" fill="none" stroke="#4f46e5" strokeWidth="1" />
                      </svg>
                      <span className="absolute text-7xl font-light text-slate-800">0</span>
                    </div>

                    <Button
                      onClick={() => setStep(4)}
                      className="w-full py-7 rounded-full bg-[#10b981] text-white font-bold text-[14px] shadow-md hover:bg-[#059669] transition-all uppercase tracking-tighter"
                    >
                      Get Links
                    </Button>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full max-w-4xl"
              >
                {children}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Banner Ad */}
        <div className="w-full mt-8">
          <BannerAd />
        </div>
      </div>
    </div>
  );
};

export default VerificationPage;
