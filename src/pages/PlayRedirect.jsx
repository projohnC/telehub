import React, { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Spinner from "../components/svg/Spinner";

const PlayRedirect = () => {
  const [searchParams] = useSearchParams();
  const url = searchParams.get("url");
  const player = searchParams.get("player");

  useEffect(() => {
    if (url) {
      let intentUrl = url;
      if (player === "vlc") {
        intentUrl = `intent:${url}#Intent;package=org.videolan.vlc;action=android.intent.action.VIEW;type=video/*;end;`;
      } else if (player === "mx") {
        intentUrl = `intent:${url}#Intent;package=com.mxtech.videoplayer.ad;action=android.intent.action.VIEW;type=video/*;end;`;
      } else {
        intentUrl = `intent:${url}#Intent;type=video/x-matroska;action=android.intent.action.VIEW;end;`;
      }
      window.location.replace(intentUrl);
    }
  }, [url, player]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-white">
      <div className="flex flex-col items-center gap-4 bg-black/40 border border-white/10 p-10 rounded-[2rem] shadow-2xl backdrop-blur-md">
        <Spinner />
        <p className="text-lg font-medium opacity-80 mt-2">Opening External Player...</p>
        <p className="text-xs text-white/40 text-center max-w-xs">
          If your player does not launch, please make sure you have VLC or MX Player installed.
        </p>
      </div>
    </div>
  );
};

export default PlayRedirect;
