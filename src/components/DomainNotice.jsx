import React, { useState, useEffect } from "react";
import {
    Modal,
    ModalContent,
} from "@nextui-org/modal";
import { FaBookmark } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { FaArrowRight } from "react-icons/fa6";

const DomainNotice = () => {
    const [isOpen, setIsOpen] = useState(false);
    const SITENAME = import.meta.env.VITE_SITENAME || "HubStream";
    const MAIN_DOMAIN = import.meta.env.VITE_MAIN_DOMAIN || "MoviesDrives.cv";
    const TG_CHANNEL = import.meta.env.VITE_JOIN_TELEGRAM_CHANNEL || "https://t.me/hubstream";

    useEffect(() => {
        // Check local storage for 24h hide flag
        const hideUntil = localStorage.getItem("domain_notice_hide_until");
        if (!hideUntil || new Date().getTime() > parseInt(hideUntil, 10)) {
            setIsOpen(true);
        }
    }, []);

    const handleDismiss = () => {
        // Set hide flag for 24 hours
        const twentyFourHours = 24 * 60 * 60 * 1000;
        const hideTime = new Date().getTime() + twentyFourHours;
        localStorage.setItem("domain_notice_hide_until", hideTime.toString());
        setIsOpen(false);
    };

    const handleClose = () => {
        handleDismiss();
    };

    const handleDomainClick = (domain) => {
        window.open(`https://${domain}`, "_blank", "noopener noreferrer");
    };

    const handleTelegramClick = () => {
        window.open(TG_CHANNEL, "_blank", "noopener noreferrer");
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            backdrop="blur"
            placement="center"
            size="sm"
            hideCloseButton={true}
            className="text-white mx-4 md:mx-0 font-sans domain-notice-modal"
            classNames={{
                base: "bg-[#181922] border border-amber-500/30 shadow-[0_0_50px_rgba(245,158,11,0.15)] rounded-[1.5rem] overflow-hidden max-w-[340px] md:max-w-[360px] relative",
                backdrop: "bg-[#000000]/80 backdrop-blur-md",
            }}
        >
            <ModalContent>
                {() => (
                    <div className="relative p-6">
                        {/* Custom Close Button */}
                        <button 
                            onClick={handleClose}
                            className="absolute top-5 right-5 text-gray-400 hover:text-white transition-colors duration-200"
                        >
                            <IoClose className="text-2xl" />
                        </button>

                        <div className="flex flex-col items-start gap-4">
                            {/* Bookmark Icon Container */}
                            <div className="w-12 h-12 border border-amber-500/30 rounded-xl flex items-center justify-center bg-amber-500/5">
                                <FaBookmark className="text-amber-500 text-lg" />
                            </div>

                            {/* Notice Label */}
                            <div className="flex items-center gap-2 mt-1">
                                <span className="w-2 h-2 bg-amber-500 rounded-full inline-block"></span>
                                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400">
                                    OFFICIAL NOTICE
                                </span>
                            </div>

                            {/* Title */}
                            <h2 className="text-xl font-bold tracking-tight text-white leading-snug">
                                Always Remember our <br />
                                <span className="text-amber-500 italic font-extrabold">Official</span> Domains
                            </h2>

                            {/* Domains Containers */}
                            <div className="w-full flex flex-col gap-3 mt-2">
                                {/* Main Domain */}
                                <div 
                                    onClick={() => handleDomainClick(MAIN_DOMAIN)}
                                    className="group w-full flex items-center justify-between p-3.5 bg-[#20212b] hover:bg-[#252735] border border-amber-500/10 rounded-xl cursor-pointer transition-all duration-300 active:scale-[0.98]"
                                >
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-[9px] font-extrabold uppercase tracking-widest text-amber-500">
                                            MAIN DOMAIN
                                        </span>
                                        <span 
                                            className="text-base text-gray-200 tracking-wide"
                                            style={{ fontFamily: "'Courier New', Courier, monospace" }}
                                        >
                                            {MAIN_DOMAIN}
                                        </span>
                                    </div>
                                    <div className="w-7 h-7 rounded-full bg-amber-500 text-black flex items-center justify-center transition-all duration-300">
                                        <FaArrowRight className="text-xs" />
                                    </div>
                                </div>

                                {/* Telegram Notification */}
                                <div 
                                    onClick={handleTelegramClick}
                                    className="group w-full flex items-center justify-between p-3.5 bg-[#20212b] hover:bg-[#252735] border border-amber-500/10 rounded-xl cursor-pointer transition-all duration-300 active:scale-[0.98]"
                                >
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-[9px] font-extrabold uppercase tracking-widest text-amber-500">
                                            TELEGRAM NOTIFICATION
                                        </span>
                                        <span 
                                            className="text-base text-gray-200 tracking-wide"
                                            style={{ fontFamily: "'Courier New', Courier, monospace" }}
                                        >
                                            Join Telegram channel
                                        </span>
                                    </div>
                                    <div className="w-7 h-7 rounded-full bg-amber-500 text-black flex items-center justify-center transition-all duration-300">
                                        <FaArrowRight className="text-xs" />
                                    </div>
                                </div>
                            </div>

                            {/* Dismiss option */}
                            <div className="w-full border-t border-white/5 pt-4 flex items-center justify-between mt-3">
                                <button
                                    onClick={handleDismiss}
                                    className="text-sm font-bold text-gray-400 hover:text-white transition-colors duration-200 cursor-pointer"
                                >
                                    Dismiss Notice
                                </button>
                                <span className="text-xs text-gray-600">
                                    Hide For 24hr
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </ModalContent>
        </Modal>
    );
};

export default DomainNotice;
