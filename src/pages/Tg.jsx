import React, { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { Spinner } from "@nextui-org/spinner";

const Tg = () => {
  const [searchParams] = useSearchParams();
  const url = searchParams.get("url");

  const API_URL = import.meta.env.VITE_API_URL;
  const API_KEY = import.meta.env.VITE_API_KEY;

  useEffect(() => {
    const processUrl = async () => {
      if (!url) return;

      let finalUrl = url;
      try {
        if (API_URL && API_KEY) {
          const response = await axios.get(API_URL, {
            params: {
              key: API_KEY,
              link: url,
            },
          });

          const data = response.data;
          finalUrl = data?.shortenedUrl || data?.short || data?.url || url;
        }
      } catch (error) {
        console.error("Error shortening URL:", error);
      } finally {
        window.location.href = finalUrl;
      }
    };

    processUrl();
  }, [url, API_URL, API_KEY]);

  return (
    <div className="flex items-center justify-center h-screen">
      <Spinner size="lg" color="warning" label="Redirecting..." />
    </div>
  );
};

export default Tg;
