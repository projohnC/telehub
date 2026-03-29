import React, { useState, useEffect } from "react";
import { Button } from "@nextui-org/button";
import { motion, AnimatePresence } from "framer-motion";
import { FaRobot, FaLock, FaBolt, FaShieldHalved } from "react-icons/fa6";
import { HiInformationCircle, HiCheckCircle } from "react-icons/hi2";
import BannerAd from "./BannerAd";

const VerificationPage = ({ children, title }) => {
  const [step, setStep] = useState(1);
  const [timeLeft, setTimeLeft] = useState(3);
  const [progress, setProgress] = useState(0);

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

  useEffect(() => {
    if (step === 2) {
      const totalTime = 3000; // 3 seconds
      const startTime = Date.now();
      const progressTimer = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const newProgress = Math.min((elapsed / totalTime) * 100, 100);
        setProgress(newProgress);
        if (newProgress === 100) clearInterval(progressTimer);
      }, 50);
      return () => clearInterval(progressTimer);
    }
  }, [step]);

  return (
    <div className="flex flex-col items-center min-h-screen w-full py-8 px-4 bg-[#0a0b1e] text-white">
      {/* Top Banner Ad */}
      <BannerAd />

      <div className="flex flex-col items-center max-w-lg w-full">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center mb-8"
        >
          <div className="text-4xl mb-2">🔐</div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 text-center leading-tight">
            Secure File
          </h1>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white text-center mt-[-5px]">
            Access
          </h1>
          
          <div className="flex gap-2 mt-6">
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs font-medium text-white/70">
              <FaLock className="text-[10px]" /> Private
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs font-medium text-white/70">
              <FaBolt className="text-[10px]" /> Fast
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs font-medium text-white/70">
              <FaShieldHalved className="text-[10px]" /> Encrypted
            </span>
          </div>
        </motion.div>

        {/* Main Verification Card */}
        <AnimatePresence mode="wait">
          {step !== 4 ? (
            <motion.div
              key="verification-card"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full bg-[#161b33] border border-white/10 rounded-[2.5rem] p-10 flex flex-col items-center shadow-2xl relative overflow-hidden"
            >
              {/* Robot Icon Container */}
              <div className="w-28 h-28 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center mb-8 shadow-lg shadow-purple-500/20">
                {step === 3 ? (
                  <HiCheckCircle className="text-6xl text-white" />
                ) : (
                  <FaRobot className="text-5xl text-white" />
                )}
              </div>

              {step === 1 && (
                <div className="flex flex-col items-center text-center animate-appearance-in">
                  <h2 className="text-2xl md:text-3xl font-bold mb-3">Human Verification Required</h2>
                  <p className="text-white/60 mb-8 max-w-[250px]">Please verify that you're human to continue</p>
                  
                  <Button
                    onClick={() => setStep(2)}
                    className="w-full py-7 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold text-lg shadow-xl shadow-purple-600/30 hover:opacity-90 transition-all flex gap-3"
                  >
                    <FaShieldHalved /> Verify I'm Human
                  </Button>
                </div>
              )}

              {step === 2 && (
                <div className="flex flex-col items-center text-center animate-appearance-in w-full">
                  <h2 className="text-2xl md:text-3xl font-bold mb-3">Human Verification Required</h2>
                  <p className="text-white/60 mb-10 max-w-[250px]">Please verify that you're human to continue</p>
                  
                  {/* Circular Progress */}
                  <div className="relative w-32 h-32 flex items-center justify-center mb-8">
                    <svg className="w-full h-full -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="60"
                        fill="transparent"
                        stroke="rgba(255,255,255,0.05)"
                        strokeWidth="8"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="60"
                        fill="transparent"
                        stroke="url(#progress-gradient)"
                        strokeWidth="8"
                        strokeDasharray="377"
                        strokeDashoffset={377 - (377 * progress) / 100}
                        strokeLinecap="round"
                        className="transition-all duration-75"
                      />
                      <defs>
                        <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#9333ea" />
                          <stop offset="100%" stopColor="#3b82f6" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <span className="absolute text-5xl font-bold text-blue-400">{timeLeft}</span>
                  </div>

                  <div className="mt-4">
                    <p className="text-xl font-medium text-white/90">Verifying your request...</p>
                    <p className="text-sm text-white/40 mt-1">Please wait {timeLeft} seconds</p>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="flex flex-col items-center text-center animate-appearance-in w-full">
                  <h2 className="text-3xl font-extrabold text-green-400 mb-2">Verification Completed!</h2>
                  <p className="text-white/60 mb-8">You can now access the link</p>
                  
                  <Button
                    onClick={() => setStep(4)}
                    className="w-full py-7 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold text-lg shadow-xl shadow-purple-600/30 hover:opacity-90 transition-all flex gap-3"
                  >
                    ➔ Continue
                  </Button>
                </div>
              )}

              {/* Info Box */}
              <div className="mt-8 bg-black/20 border border-white/5 rounded-2xl p-4 flex gap-3 text-left w-full">
                <HiInformationCircle className="text-blue-400 text-xl shrink-0 mt-0.5" />
                <p className="text-white/40 text-[11px] leading-relaxed">
                  This verification helps us prevent automated downloads and keep the service secure for everyone.
                </p>
              </div>
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

        {/* Bottom Banner Ad */}
        <div className="mt-12 w-full">
          <BannerAd />
        </div>
        
        {/* Footer Text */}
        <footer className="mt-12 flex flex-col items-center text-center text-white/30 text-xs">
          <p>© 2026 Secure File Access • All Rights Reserved</p>
          <div className="flex gap-4 mt-2">
            <a href="#" className="hover:text-white/50">Privacy Policy</a>
            <a href="#" className="hover:text-white/50">Terms of Service</a>
            <a href="#" className="hover:text-white/50">Contact</a>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default VerificationPage;
