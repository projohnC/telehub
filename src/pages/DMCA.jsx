import React, { useEffect } from "react";
import SEO from "../components/SEO";

export default function DMCA() {
    const SITENAME = import.meta.env.VITE_SITENAME;

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen pt-24 pb-12 px-6 lg:px-20 text-primaryTextColor">
            <SEO
                title={`DMCA - ${SITENAME}`}
                description={`DMCA Disclaimer for ${SITENAME}. We do not host any files on our servers.`}
                name={SITENAME}
                type="text/html"
            />
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-extrabold mb-10 border-b-4 border-otherColor pb-4 inline-block">
                    DMCA Disclaimer
                </h1>

                <div className="bg-bgColorSecondary/30 p-8 rounded-3xl border border-secondaryTextColor/10 shadow-xl">
                    <p className="text-lg lg:text-xl leading-relaxed mb-8">
                        <strong className="text-white">
                            (HubStream does not host, upload, or store any media content on its servers.)
                        </strong>
                    </p>

                    <p className="text-md lg:text-lg text-secondaryTextColor leading-relaxed">
                        All content available on this platform is sourced from publicly accessible third-party services.
                        HubStream simply indexes and provides links to media files that are hosted externally,
                        including Telegram and other platforms.
                    </p>
                </div>

                <div className="mt-12 text-secondaryTextColor space-y-6">
                    <p>
                        If you are a copyright owner or an agent thereof and believe that any content indexed on this site
                        infringes upon your copyrights, you may submit a notification pursuant to the Digital Millennium
                        Copyright Act ("DMCA") by providing our Copyright Agent with the necessary information in writing.
                    </p>
                    <p>
                        Please note that HubStream operates as a search engine/index and does not have control over the
                        files hosted on third-party platforms. Removing a link from our site does not remove the
                        actual content from the source server.
                    </p>
                </div>
            </div>
        </div>
    );
}
