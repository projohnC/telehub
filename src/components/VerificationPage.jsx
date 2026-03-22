import React, { useState, useEffect } from "react";
import { Button } from "@nextui-org/button";
import Spinner from "./svg/Spinner";

const VerificationPage = ({ children, title }) => {
  const [timeLeft, setTimeLeft] = useState(8);
  const [isReady, setIsReady] = useState(false);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setIsReady(true);
    }
  }, [timeLeft]);

  const handleVerify = () => {
    setVerified(true);
  };

  return (
    <div className="flex flex-col items-center min-h-[70vh] w-full py-6 px-4">
      {/* Banner Ad Placement Header */}
      <div className="w-full max-w-4xl h-[90px] bg-secondary/20 border border-white/10 flex items-center justify-center rounded-xl mb-8 overflow-hidden shadow-lg relative">
        <span className="text-white/40 text-sm font-bold tracking-widest uppercase">
          Advertisement
        </span>
      </div>

      {!verified ? (
        <div className="flex flex-col items-center justify-center p-10 bg-secondary/10 rounded-[2rem] shadow-2xl border border-secondary/20 backdrop-blur-md max-w-lg w-full text-center">
          <h1 className="text-3xl font-bold text-white mb-6 uppercase tracking-wider drop-shadow-md">
            Human Verification
          </h1>

          {!isReady ? (
            <div className="flex flex-col items-center gap-4">
              <Spinner className="w-12 h-12 text-primaryBtn" />
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
          ) : (
            <div className="flex flex-col items-center gap-4 animate-appearance-in">
              <Button
                color="success"
                size="lg"
                className="font-bold text-white px-10 py-6 uppercase tracking-wider shadow-lg hover:scale-105 transition-transform bg-green-600"
                onClick={handleVerify}
              >
                Verify to Continue
              </Button>
              <p className="text-white/50 text-sm mt-2">
                Click the button above to access {title}.
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
