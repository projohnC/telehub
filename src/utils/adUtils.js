/**
 * Handles ad redirection with a frequency cap (cooldown period).
 * @param {string} adLink - The ad link to open.
 * @param {number} cooldownMinutes - Cooldown period in minutes (default 5).
 */
export const handleAdRedirect = (adLink, cooldownMinutes = 5) => {
    if (!adLink) return;

    const now = Date.now();
    const lastAdTime = localStorage.getItem("lastAdTime");
    const cooldownMs = cooldownMinutes * 60 * 1000;

    if (!lastAdTime || now - parseInt(lastAdTime) > cooldownMs) {
        window.open(adLink, "_blank", "noopener noreferrer");
        localStorage.setItem("lastAdTime", now.toString());
    }
};
