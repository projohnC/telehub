import { useEffect } from "react";

const AdManager = () => {
    useEffect(() => {
        const handleGlobalClick = (e) => {
            // Check if the clicked element is a button, link, or part of one
            const target = e.target.closest("button, a, [role='button']");

            // If the click is not on a relevant element, don't trigger ad
            if (!target) return;

            const directAdLink = import.meta.env.VITE_DIRECT_LINK_ADS;
            const popunderAdLink = import.meta.env.VITE_POPUNDER_ADS;
            const currentTime = Date.now();

            // Handle Direct Link Ads (3-minute cooldown)
            if (directAdLink) {
                const lastDirectAdTime = localStorage.getItem("last_direct_ad_popup");
                const directCooldown = 10 * 60 * 1000; // 10 minutes

                if (!lastDirectAdTime || currentTime - parseInt(lastDirectAdTime) >= directCooldown) {
                    window.open(directAdLink, "_blank");
                    localStorage.setItem("last_direct_ad_popup", currentTime.toString());
                    return; // Avoid triggering both at the same time if both are configured
                }
            }

            // Handle Popunder Ads (3-minute cooldown)
            if (popunderAdLink) {
                const lastPopunderTime = localStorage.getItem("last_popunder_ad_popup");
                const popunderCooldown = 3 * 60 * 1000; // 3 minutes

                if (!lastPopunderTime || currentTime - parseInt(lastPopunderTime) >= popunderCooldown) {
                    if (popunderAdLink.endsWith(".js")) {
                        // Inject script instead of window.open for script-based ads
                        const script = document.createElement("script");
                        script.src = popunderAdLink;
                        script.async = true;
                        document.body.appendChild(script);

                        // Optional: remove the script after a delay to keep DOM clean
                        // since these scripts usually execute once and trigger the popunder
                        setTimeout(() => {
                            if (script.parentNode) {
                                script.parentNode.removeChild(script);
                            }
                        }, 5000);
                    } else {
                        window.open(popunderAdLink, "_blank");
                    }
                    localStorage.setItem("last_popunder_ad_popup", currentTime.toString());
                }
            }
        };

        // Use capture: true to ensure the listener triggers even if propagation is stopped
        window.addEventListener("click", handleGlobalClick, true);

        // Cleanup listener on unmount
        return () => {
            window.removeEventListener("click", handleGlobalClick, true);
        };
    }, []);

    return null; // This component doesn't render anything
};

export default AdManager;

