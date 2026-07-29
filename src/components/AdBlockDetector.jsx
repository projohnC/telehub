import React, { useState, useEffect } from "react";
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
} from "@nextui-org/modal";
import { Button } from "@nextui-org/button";
import { IoShieldHalfOutline } from "react-icons/io5";

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
            className="text-black mx-4 md:mx-0 font-sans adblock-detector-modal"
            classNames={{
                base: "bg-white shadow-2xl rounded-[2rem]",
                backdrop: "bg-[#000000]/80 backdrop-blur-md",
            }}
        >
            <ModalContent>
                {() => (
                    <>
                        <ModalHeader className="flex flex-col gap-1 items-center pt-8 px-6 pb-2">
                            {/* Red octagon stop sign SVG */}
                            <div className="w-24 h-24 flex items-center justify-center">
                                <svg viewBox="0 0 100 100" className="w-24 h-24">
                                    {/* Outer Red Octagon */}
                                    <polygon points="30,5 70,5 95,30 95,70 70,95 30,95 5,70 5,30" fill="#E50914" />
                                    {/* Inner white octagon line */}
                                    <polygon points="31.5,8 68.5,8 92,31.5 92,68.5 68.5,92 31.5,92 8,68.5 8,31.5" fill="none" stroke="#ffffff" strokeWidth="3" />
                                    {/* White Hand */}
                                    <g fill="#ffffff">
                                        <path d="M 50,22 C 48.5,22 47.3,23.2 47.3,24.7 L 47.3,42.5 L 45.3,42.5 L 45.3,25.5 C 45.3,24 44.1,22.8 42.6,22.8 C 41.1,22.8 39.9,24 39.9,25.5 L 39.9,42.5 L 37.9,42.5 L 37.9,27.5 C 37.9,26 36.7,24.8 35.2,24.8 C 33.7,24.8 32.5,26 32.5,27.5 L 32.5,42.5 L 30.5,42.5 L 30.5,31 C 30.5,29.5 29.3,28.3 27.8,28.3 C 26.3,28.3 25.1,29.5 25.1,31 L 25.1,56 C 25.1,68.7 35.4,79 48.1,79 C 60.8,79 71.1,68.7 71.1,56 L 71.1,37 C 71.1,35.5 69.9,34.3 68.4,34.3 C 66.9,34.3 65.7,35.5 65.7,37 L 65.7,42.5 L 63.7,42.5 L 63.7,24.7 C 63.7,23.2 62.5,22 61,22 C 59.5,22 58.3,23.2 58.3,24.7 L 58.3,42.5 L 56.3,42.5 L 56.3,22.5 C 56.3,21 55.1,19.8 53.6,19.8 C 52.1,19.8 50.9,21 50.9,22.5 L 50.9,42.5 L 49,42.5 L 49,24.7 C 49,23.2 50,22 50,22 Z" />
                                    </g>
                                    {/* Blue Circle with Globe magnifier */}
                                    <circle cx="50" cy="56" r="14" fill="#0066cc" stroke="#ffffff" strokeWidth="2.5" />
                                    {/* Globe Grid lines inside blue circle */}
                                    <circle cx="50" cy="56" r="9" fill="none" stroke="#ffffff" strokeWidth="1" />
                                    <line x1="50" y1="47" x2="50" y2="65" stroke="#ffffff" strokeWidth="1" />
                                    <line x1="41" y1="56" x2="59" y2="56" stroke="#ffffff" strokeWidth="1" />
                                    <path d="M 43.5,50 A 9,9 0 0,0 43.5,62" fill="none" stroke="#ffffff" strokeWidth="1" />
                                    <path d="M 56.5,50 A 9,9 0 0,1 56.5,62" fill="none" stroke="#ffffff" strokeWidth="1" />
                                    {/* Magnifier Handle */}
                                    <line x1="38" y1="68" x2="45" y2="61" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
                                    <line x1="38" y1="68" x2="45" y2="61" stroke="#000000" strokeWidth="1" strokeLinecap="round" />
                                </svg>
                            </div>
                            <h2 className="text-2xl md:text-3xl font-black text-center tracking-tight text-gray-900 mt-4 leading-tight">
                                Ads Blocker Detected!!!
                            </h2>
                        </ModalHeader>
                        <ModalBody className="text-center px-6 md:px-10 py-4 flex flex-col gap-3">
                            <p className="text-gray-700 text-sm md:text-base font-medium leading-relaxed">
                                We have Detected that you are using adblocking plugin in your browser.
                            </p>
                            <p className="text-gray-700 text-sm md:text-base font-medium leading-relaxed">
                                The revenue we earn by the advertisements is used to manage this website, we request you to whitelist our website in your adblocking plugin.-
                            </p>
                            <p className="text-gray-900 font-extrabold text-base md:text-lg">
                                Hubstream
                            </p>
                        </ModalBody>
                        <ModalFooter className="flex flex-col items-center pb-8 pt-4 px-6 gap-6">
                            <div className="w-full border-t border-gray-200"></div>
                            <button
                                onClick={() => {
                                    setIsOpen(false);
                                    setTimeout(() => {
                                        window.location.reload();
                                    }, 100);
                                }}
                                className="w-full text-center text-blue-600 hover:text-blue-800 font-extrabold text-lg transition-all active:scale-95 cursor-pointer"
                            >
                                Refresh
                            </button>
                            
                            {/* Powered By Badge */}
                            <div className="flex items-center gap-1.5 bg-white border border-gray-200 shadow-sm rounded-full px-4 py-1.5 text-[9px] font-bold text-gray-500 tracking-wide uppercase">
                                <span>POWERED BY</span>
                                <span className="text-[#E50914] flex items-center gap-1 font-extrabold">
                                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current text-[#E50914]" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15l-5-5 1.41-1.41L11 14.17l7.59-7.59L20 8l-9 9z"/>
                                    </svg>
                                    CHP ADBLOCK
                                </span>
                            </div>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
};

export default AdBlockDetector;
