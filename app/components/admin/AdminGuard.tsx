"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../lib/api";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    const verifyAdmin = async () => {
      try {
        const { data } = await api.get("/auth/me");
        if (isMounted) {
          if (data.role === "admin") {
            setIsAuthorized(true);
          } else {
            router.push("/");
          }
        }
      } catch (error) {
        if (isMounted) {
          router.push("/login");
        }
      }
    };

    verifyAdmin();

    return () => {
      isMounted = false;
    };
  }, [router]);

  if (!isAuthorized) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-parchment/60 flex-col gap-4">
        <span className="w-12 h-12 rounded-full bg-dark-brown animate-pulse opacity-50" />
        <span className="text-dark-brown font-semibold tracking-widest uppercase text-sm animate-pulse shadow-sm">Verifying Access...</span>
      </div>
    );
  }

  return <>{children}</>;
}
