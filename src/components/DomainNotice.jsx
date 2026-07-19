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
        setIsOpen(false);
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
            size="md"
            hideCloseButton={true}
            className="text-white mx-4 md:mx-0 font-sans"
            classNames={{
                base: "bg-[#0f1015] border border-amber-500/30 shadow-[0_0_50px_rgba(245,158,11,0.15)] rounded-[2rem] overflow-hidden max-w-[400px] relative",
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
                            <div className="w-14 h-14 border border-amber-500/30 rounded-2xl flex items-center justify-center bg-amber-500/5">
                                <FaBookmark className="text-amber-500 text-xl" />
                            </div>

                            {/* Notice Label */}
                            <div className="flex items-center gap-2 mt-2">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                                </span>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500">
                                    {SITENAME} OFFICIAL NOTICE
                                </span>
                            </div>

                            {/* Title */}
                            <h2 className="text-2xl font-bold tracking-tight text-white leading-snug">
                                Always Remember our <br />
                                <span className="text-amber-500 italic font-extrabold">Official</span> Domains
                            </h2>

                            {/* Domains Containers */}
                            <div className="w-full flex flex-col gap-3 mt-2">
                                {/* Main Domain */}
                                <div 
                                    onClick={() => handleDomainClick(MAIN_DOMAIN)}
                                    className="group w-full flex items-center justify-between p-4 bg-[#16171f] hover:bg-[#1c1d27] border border-amber-500/10 rounded-2xl cursor-pointer transition-all duration-300 active:scale-[0.98]"
                                >
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-[9px] font-extrabold uppercase tracking-widest text-cyan-400">
                                            MAIN DOMAIN
                                        </span>
                                        <span className="text-lg font-bold text-amber-400/90 tracking-wide font-mono">
                                            {MAIN_DOMAIN}
                                        </span>
                                    </div>
                                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 group-hover:bg-amber-500 text-amber-500 group-hover:text-black flex items-center justify-center transition-all duration-300">
                                        <FaArrowRight className="text-xs" />
                                    </div>
                                </div>

                                {/* Telegram Notification */}
                                <div 
                                    onClick={handleTelegramClick}
                                    className="group w-full flex items-center justify-between p-4 bg-[#16171f] hover:bg-[#1c1d27] border border-amber-500/10 rounded-2xl cursor-pointer transition-all duration-300 active:scale-[0.98]"
                                >
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-[9px] font-extrabold uppercase tracking-widest text-amber-500">
                                            TELEGRAM NOTIFICATION
                                        </span>
                                        <span className="text-lg font-bold text-white tracking-wide font-mono">
                                            Join Telegram channel
                                        </span>
                                    </div>
                                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 group-hover:bg-amber-500 text-amber-500 group-hover:text-black flex items-center justify-center transition-all duration-300">
                                        <FaArrowRight className="text-xs" />
                                    </div>
                                </div>
                            </div>

                            {/* Dismiss pill */}
                            <button
                                onClick={handleDismiss}
                                className="w-full flex items-center justify-between px-5 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl mt-4 transition-all duration-300 active:scale-[0.98] group cursor-pointer"
                            >
                                <span className="text-sm font-bold text-gray-200 group-hover:text-white">
                                    Dismiss Notice
                                </span>
                                <span className="text-[10px] font-bold text-gray-500 group-hover:text-gray-400 uppercase tracking-wider">
                                    Hide For 24hr
                                </span>
                            </button>
                        </div>
                    </div>
                )}
            </ModalContent>
        </Modal>
    );
};

export default DomainNotice;
