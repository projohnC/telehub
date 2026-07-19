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
            className="dark text-foreground mx-4 md:mx-0"
            classNames={{
                base: "bg-black/95 border border-white/10 shadow-2xl rounded-[2.5rem]",
                backdrop: "bg-[#000000]/80 backdrop-blur-md",
            }}
        >
            <ModalContent>
                {() => (
                    <>
                        <ModalHeader className="flex flex-col gap-1 items-center pt-10 px-8">
                            <div className="w-20 h-20 bg-red-600/10 rounded-full flex items-center justify-center mb-4 border border-red-600/20 shadow-[0_0_30px_rgba(220,38,38,0.1)]">
                                <IoShieldHalfOutline className="text-red-600 text-5xl animate-pulse" />
                            </div>
                            <h2 className="text-2xl md:text-3xl font-black text-center tracking-tight uppercase">
                                Ad Blocker Detected
                            </h2>
                        </ModalHeader>
                        <ModalBody className="text-center px-8 md:px-12 py-6">
                            <p className="text-white/60 text-base md:text-lg font-medium leading-relaxed">
                                We notice you're using an ad blocker. HubStream relies on ads to keep our service free and accessible for everyone.
                            </p>
                            <div className="mt-6 p-5 rounded-2xl bg-white/5 border border-white/5 flex flex-col gap-2 shadow-inner">
                                <p className="text-red-500 font-bold uppercase tracking-widest text-[10px] md:text-xs">
                                    How to continue
                                </p>
                                <p className="text-white/90 text-sm md:text-base font-bold italic">
                                    Please disable your ad blocker and refresh the page to start streaming.
                                </p>
                            </div>
                        </ModalBody>
                        <ModalFooter className="flex flex-col items-center pb-12 px-8 md:px-12 gap-4">
                            <Button
                                color="danger"
                                variant="shadow"
                                className="w-full font-black h-14 text-sm md:text-base uppercase tracking-widest rounded-2xl bg-red-600 shadow-[0_8px_24px_-8px_rgba(220,38,38,0.5)] active:scale-95 transition-all duration-300"
                                onPress={() => {
                                    setIsOpen(false); // Briefly close to re-trigger check
                                    setTimeout(checkAdBlocker, 100);
                                }}
                            >
                                I've disabled it
                            </Button>
                            <p className="text-[10px] md:text-xs text-white/30 uppercase tracking-[0.2em] font-bold">
                                Support free streaming
                            </p>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
};

export default AdBlockDetector;
