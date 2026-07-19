import React, { useState, useEffect } from "react";
import {
    Modal,
    ModalContent,
} from "@nextui-org/modal";

const AdBlockDetector = () => {
    const [isOpen, setIsOpen] = useState(false);

    const checkAdBlocker = async () => {
        let isDetected = false;

        // 1. Enhanced Bait element check
        const bait = document.createElement("div");
        bait.innerHTML = "&nbsp;";
        // Wider range of classes to trigger different blockers
        bait.className = "adsbox ad-placement ad-placeholder pub_300x250 pub_300x250m pub_728x90 text-ad textAd sponsor-ad";
        bait.style.cssText = "position:absolute; left:-9999px; top:-9999px; display:block !important; height:10px !important; width:10px !important;";
        document.body.appendChild(bait);

        // Increase delay for blocker to take effect
        await new Promise((resolve) => setTimeout(resolve, 350));

        // Thorough inspection of the bait element
        const isBaitBlocked =
            bait.offsetParent === null ||
            bait.offsetHeight === 0 ||
            bait.offsetWidth === 0 ||
            bait.clientHeight === 0 ||
            bait.clientWidth === 0;

        const style = window.getComputedStyle ? window.getComputedStyle(bait) : null;
        const isStyleBlocked = style && (style.display === "none" || style.visibility === "hidden");

        document.body.removeChild(bait);

        if (isBaitBlocked || isStyleBlocked) {
            isDetected = true;
        }

        // 2. Fetch Multi-check (multiple common ad domains)
        if (!isDetected) {
            const domains = [
                "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js",
                "https://googleads.g.doubleclick.net/pagead/ads?client=ca-pub-12345"
            ];

            for (const url of domains) {
                try {
                    await fetch(url, { method: "HEAD", mode: "no-cors", cache: 'no-store' });
                } catch (error) {
                    isDetected = true;
                    break;
                }
            }
        }

        setIsOpen(isDetected);
    };

    useEffect(() => {
        checkAdBlocker();

        // Re-check every 15 seconds to ensure compliance
        const interval = setInterval(checkAdBlocker, 15000);
        return () => clearInterval(interval);
    }, []);

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={(open) => !open && setIsOpen(true)} // Prevent closing
            isDismissable={false}
            isKeyboardDismissDisabled={true}
            hideCloseButton={true}
            backdrop="blur"
            placement="center"
            size="md"
            className="light text-black mx-4 md:mx-0"
            classNames={{
                base: "bg-white shadow-2xl rounded-[2.5rem] overflow-visible border-0 max-w-[420px] my-auto",
                backdrop: "bg-[#000000]/70 backdrop-blur-md",
            }}
        >
            <ModalContent>
                {() => (
                    <div className="relative flex flex-col items-center justify-center p-8 pb-10 text-center">
                        {/* Custom Red Octagon Icon with Hand and Magnifying Glass Globe */}
                        <div className="relative mb-6">
                            <svg viewBox="0 0 100 100" className="w-28 h-28 mx-auto drop-shadow-md">
                                {/* Red Octagon */}
                                <polygon
                                    points="30,5 70,5 95,30 95,70 70,95 30,95 5,70 5,30"
                                    fill="#ff0000"
                                    stroke="#ffffff"
                                    strokeWidth="3.5"
                                />
                                
                                {/* White Hand */}
                                <g transform="translate(9, 8)">
                                    <path
                                        d="M48.5 21C47.1 21 46 22.1 46 23.5v20.6c0 .8-.7 1.5-1.5 1.5s-1.5-.7-1.5-1.5V17.5C43 16.1 41.9 15 40.5 15S38 16.1 38 17.5v26.6c0 .8-.7 1.5-1.5 1.5s-1.5-.7-1.5-1.5V15.5C35 14.1 33.9 13 32.5 13S30 14.1 30 15.5v28.6c0 .8-.7 1.5-1.5 1.5s-1.5-.7-1.5-1.5V19.5C27 18.1 25.9 17 24.5 17S22 18.1 22 19.5v28.6c0 10.5 8.5 19 19 19s19-8.5 19-19V30.5C60 29.1 58.9 28 57.5 28S55 29.1 55 30.5v13.6c0 .8-.7 1.5-1.5 1.5s-1.5-.7-1.5-1.5V23.5C52 22.1 50.9 21 49.5 21h-1z"
                                        fill="#ffffff"
                                        stroke="#ff0000"
                                        strokeWidth="0.5"
                                    />
                                </g>

                                {/* Magnifying Glass with Globe */}
                                <line x1="48" y1="71" x2="38" y2="81" stroke="#1e293b" strokeWidth="4.5" strokeLinecap="round" />
                                <circle cx="58" cy="62" r="14" fill="#ffffff" stroke="#1e293b" strokeWidth="2.5" />
                                <circle cx="58" cy="62" r="12" fill="#3b82f6" />
                                <ellipse cx="58" cy="62" rx="12" ry="4" fill="none" stroke="#ffffff" strokeWidth="0.8" opacity="0.7" />
                                <ellipse cx="58" cy="62" rx="4" ry="12" fill="none" stroke="#ffffff" strokeWidth="0.8" opacity="0.7" />
                                <line x1="46" y1="62" x2="70" y2="62" stroke="#ffffff" strokeWidth="0.8" opacity="0.7" />
                                <line x1="58" y1="50" x2="58" y2="74" stroke="#ffffff" strokeWidth="0.8" opacity="0.7" />
                                <circle cx="58" cy="62" r="12" fill="none" stroke="#1e293b" strokeWidth="2" />
                                <path d="M 52 56 A 8 8 0 0 1 64 56" fill="none" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
                            </svg>
                        </div>

                        {/* Title */}
                        <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-6 tracking-tight">
                            Ads Blocker Detected!!!
                        </h2>

                        {/* Description */}
                        <p className="text-neutral-700 text-sm md:text-base leading-relaxed mb-8 px-2 font-medium">
                            We have Detected that you are using adblocking plugin in your browser.<br />
                            The revenue we earn by the advertisements is used to manage this website, we request you to whitelist our website in your adblocking plugin.-<br />
                            <span className="font-semibold text-neutral-900">Hubstream</span>
                        </p>

                        {/* Refresh Button */}
                        <button
                            type="button"
                            onClick={() => window.location.reload()}
                            className="px-8 py-3 bg-neutral-100 hover:bg-neutral-200 active:scale-95 text-neutral-800 font-semibold rounded-xl text-sm md:text-base transition-all duration-200 shadow-sm border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-300"
                        >
                            Refresh
                        </button>

                        {/* Floating Powered By Badge */}
                        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 flex items-center justify-center gap-1.5 px-5 py-2 bg-white rounded-full shadow-lg border border-neutral-100 text-[10px] font-extrabold tracking-wider whitespace-nowrap z-50">
                            <span className="text-neutral-500">POWERED BY</span>
                            <span className="flex items-center justify-center w-4 h-4 bg-[#ff0000] rounded-full text-white text-[9px] font-black leading-none">✋</span>
                            <span className="text-[#ff0000]">CHP ADBLOCK</span>
                        </div>
                    </div>
                )}
            </ModalContent>
        </Modal>
    );
};

export default AdBlockDetector;
