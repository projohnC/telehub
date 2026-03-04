import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MdReportGmailerrorred } from "react-icons/md";

const AdBlockDetector = ({ children }) => {
    const [isAdBlockActive, setIsAdBlockActive] = useState(false);

    useEffect(() => {
        const checkAdBlock = () => {
            // 1. Check if the bait script was blocked
            if (window.canRunAds === undefined) {
                setIsAdBlockActive(true);
                return;
            }

            // 2. DOM-based check: Create a bait element
            const bait = document.createElement("div");
            bait.innerHTML = "&nbsp;";
            bait.className = "adsbox ad-placement ad-content doubleclick";
            bait.style.position = "absolute";
            bait.style.left = "-999px";
            bait.style.top = "-999px";
            bait.style.width = "1px";
            bait.style.height = "1px";

            document.body.appendChild(bait);

            // Give it a tiny bit of time to be hidden/removed by blockers
            window.setTimeout(() => {
                if (bait.offsetHeight === 0 || bait.offsetParent === null) {
                    setIsAdBlockActive(true);
                }
                document.body.removeChild(bait);
            }, 100);
        };

        checkAdBlock();
    }, []);

    const handleRefresh = () => {
        window.location.reload();
    };

    return (
        <>
            <AnimatePresence>
                {isAdBlockActive && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="max-w-md w-full bg-dark-premium p-8 rounded-3xl border border-white/10 shadow-2xl text-center flex flex-col items-center gap-6"
                        >
                            <div className="bg-red-500/10 p-4 rounded-full">
                                <MdReportGmailerrorred className="text-6xl text-red-500" />
                            </div>

                            <div className="space-y-2">
                                <h2 className="text-3xl font-extrabold text-white tracking-tight">
                                    AdBlock Detected
                                </h2>
                                <p className="text-secondaryTextColor text-sm leading-relaxed">
                                    We noticed you're using an adblocker. To keep our service free and maintain our servers, please disable it and refresh the page.
                                </p>
                            </div>

                            <div className="flex flex-col gap-3 w-full">
                                <button
                                    onClick={handleRefresh}
                                    className="w-full bg-purple-gradient text-white py-3 rounded-2xl font-bold btn-hover-effect shadow-lg"
                                >
                                    I've disabled it, refresh
                                </button>
                                <p className="text-[10px] text-white/30 uppercase tracking-[0.2em]">
                                    Thank you for supporting us
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            {children}
        </>
    );
};

export default AdBlockDetector;
