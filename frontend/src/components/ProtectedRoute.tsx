"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const ok = isAuthenticated();
    if (!ok) {
      router.replace("/login");
    } else {
      setAuthed(true);
    }
    setMounted(true);
  }, [router]);

  // Don't render anything until mounted — prevents SSR/client mismatch
  if (!mounted) return null;
  if (!authed) return null;

  return <>{children}</>;
}
