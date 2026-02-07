"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { hasAccessToken } from "./token-store";

export function useRequireAuth() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!hasAccessToken()) {
      const next = encodeURIComponent(pathname || "/");
      router.replace(`/login?next=${next}`);
    }
  }, [pathname, router]);
}

export function useRedirectIfAuthed() {
  const router = useRouter();

  useEffect(() => {
    if (hasAccessToken()) {
      router.replace("/");
    }
  }, [router]);
}
