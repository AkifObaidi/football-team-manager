"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function useAuthRedirect() {
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/login"); // redirect to login if not logged in
        }
    }, [router]);
}
