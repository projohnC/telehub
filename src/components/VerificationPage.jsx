import React, { useState, useEffect } from "react";
import { Button } from "@nextui-org/button";
import { motion, AnimatePresence } from "framer-motion";
import BannerAd from "./BannerAd";
import { FaShieldAlt } from "react-icons/fa";

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

  if (step === 4) {
    return (
      <div className="w-full pb-8 px-4 flex flex-col items-center">
        <div className="w-full max-w-7xl flex flex-col items-center">
          <BannerAd />
          <div className="w-full mt-0">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {children}
            </motion.div>
          </div>
          <div className="w-full mt-8">
            <BannerAd />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-[85vh] py-10 px-4 text-white">
      <div className="flex flex-col items-center max-w-lg w-full">
        {/* Top Banner Ad */}
        <BannerAd />

        {/* Main Verification Card */}
        <div className="w-full mt-8">
          <AnimatePresence mode="wait">
            <motion.div
              key="verification-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full bg-[#111827]/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-10 flex flex-col items-center shadow-2xl relative overflow-hidden text-center"
            >
              {/* Header Icon */}
              <div className="w-16 h-16 bg-[#1f2937] rounded-2xl flex items-center justify-center mb-8 shadow-xl border border-white/10">
                <FaShieldAlt className="text-3xl text-blue-500" />
              </div>

              {step === 1 && (
                <div className="animate-appearance-in w-full">
                  <h2 className="text-2xl md:text-3xl font-bold mb-4 text-white tracking-tight">
                    Verification Required
                  </h2>
                  <p className="text-slate-400 mb-12 text-sm md:text-base leading-relaxed">
                    Please click the button below to continue link generation.
                  </p>
                  <Button
                    onClick={() => setStep(2)}
                    className="w-full py-7 rounded-2xl bg-blue-600 text-white font-bold text-base shadow-lg hover:bg-blue-700 transition-all uppercase tracking-wider"
                  >
                    Click to Continue
                  </Button>
                </div>
              )}

              {step === 2 && (
                <div className="animate-appearance-in w-full flex flex-col items-center">
                  <h2 className="text-2xl md:text-3xl font-bold mb-2 text-white tracking-tight">
                    Links is Almost Ready
                  </h2>
                  <p className="text-slate-400 mb-12 text-sm">
                    Your link is being secured...
                  </p>
                  
                  {/* Glowing Blue Spinner */}
                  <div className="relative w-48 h-48 flex items-center justify-center mb-12">
                    <svg className="w-full h-full transform -rotate-90">
                      {/* Background Ring */}
                      <circle
                        cx="96"
                        cy="96"
                        r="80"
                        fill="none"
                        stroke="rgba(255,255,255,0.05)"
                        strokeWidth="4"
                      />
                      {/* Progress Ring with Glow */}
                      <motion.circle
                        cx="96"
                        cy="96"
                        r="80"
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="4"
                        strokeDasharray="502"
                        initial={{ strokeDashoffset: 502 }}
                        animate={{ strokeDashoffset: 502 - (502 * (8 - timeLeft)) / 8 }}
                        strokeLinecap="round"
                        style={{ filter: "drop-shadow(0 0 8px #3b82f6)" }}
                      />
                    </svg>
                    <span className="absolute text-7xl font-light text-white drop-shadow-lg">{timeLeft}</span>
                  </div>

                  <Button
                    disabled
                    className="w-full py-7 rounded-2xl bg-[#1f2937] text-slate-400 font-bold text-base cursor-not-allowed opacity-80 uppercase tracking-wider"
                  >
                    Please Wait...
                  </Button>
                </div>
              )}

              {step === 3 && (
                <div className="animate-appearance-in w-full flex flex-col items-center">
                  <h2 className="text-2xl md:text-3xl font-bold mb-2 text-white tracking-tight">
                    Link is Secured
                  </h2>
                  <p className="text-slate-400 mb-12 text-sm">
                    Ready to generate your destination link.
                  </p>
                  
                  <div className="relative w-48 h-48 flex items-center justify-center mb-12 text-green-500 opacity-20">
                     <svg className="w-full h-full transform -rotate-90">
                      <circle cx="96" cy="96" r="80" fill="none" stroke="currentColor" strokeWidth="4" />
                    </svg>
                    <span className="absolute text-7xl font-light text-white">0</span>
                  </div>

                  <Button
                    onClick={() => setStep(4)}
                    className="w-full py-7 rounded-2xl bg-green-600 text-white font-bold text-base shadow-lg hover:bg-green-700 transition-all uppercase tracking-wider"
                  >
                    Get Links
                  </Button>
                </div>
              )}
            </motion.div>
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
