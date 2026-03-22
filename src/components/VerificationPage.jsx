import React, { useState, useEffect } from "react";
import { Button } from "@nextui-org/button";
import Spinner from "./svg/Spinner";
import BannerAd from "./BannerAd";

const VerificationPage = ({ children, title }) => {
  const [step, setStep] = useState(1);
  const [timeLeft, setTimeLeft] = useState(8);

  useEffect(() => {
    if (step === 2) {
      if (timeLeft > 0) {
        const timer = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        setStep(3);
      }
    }
  }, [step, timeLeft]);

  return (
    <div className="flex flex-col items-center min-h-[70vh] w-full py-6 px-4">
      <BannerAd />

      {step !== 4 ? (
        <div className="flex flex-col items-center justify-center p-8 bg-secondary/10 rounded-[2rem] shadow-2xl border border-secondary/20 backdrop-blur-md max-w-lg w-full text-center">
          <h1 className="text-2xl font-bold text-white mb-6 uppercase tracking-wider drop-shadow-md">
            Human Verification
          </h1>

          {step === 1 && (
            <div className="flex flex-col items-center gap-4 animate-appearance-in">
              <Button
                color="primary"
                size="lg"
                className="font-bold text-white px-10 py-6 uppercase tracking-wider shadow-lg hover:scale-105 transition-transform"
                onClick={() => setStep(2)}
              >
                I'm Human
              </Button>
              <p className="text-white/50 text-sm mt-2">
                Click this button to verify you are a human.
              </p>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col items-center gap-4 animate-appearance-in">
              <Spinner className="w-12 h-12 text-white" />
              <p className="text-white/80 font-medium text-lg mt-4">
                Please wait{" "}
                <span className="text-primaryBtn font-bold text-2xl mx-1">
                  {timeLeft}
                </span>{" "}
                seconds...
              </p>
              <p className="text-white/50 text-sm mt-2">
                We are verifying your connection.
              </p>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col items-center gap-4 animate-appearance-in">
              <Button
                color="success"
                size="lg"
                className="font-bold text-white px-10 py-6 uppercase tracking-wider shadow-lg hover:scale-105 transition-transform bg-green-600"
                onClick={() => setStep(4)}
              >
                Continue
              </Button>
              <p className="text-white/50 text-sm mt-2">
                Verification complete! Click the button above to access {title}.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="w-full flex justify-center animate-appearance-in">{children}</div>
      )}
    </div>
  );
};

export default VerificationPage;
