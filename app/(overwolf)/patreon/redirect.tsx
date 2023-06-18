"use client";
import { API_BASE_URI, PATREON_CLIENT_ID_V2 } from "@/app/lib/env";
import { useEffect } from "react";

export default function Redirect() {
  useEffect(() => {
    window.location.replace(
      `https://www.patreon.com/oauth2/authorize?response_type=code&client_id=${PATREON_CLIENT_ID_V2}&redirect_uri=${API_BASE_URI}/patreon/exit`
    );
  }, []);

  return (
    <div className="h-screen text-center pt-4 bg-black">
      Waiting for Patreon...
    </div>
  );
}
