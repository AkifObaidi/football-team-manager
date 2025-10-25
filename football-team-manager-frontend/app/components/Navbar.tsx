"use client";

import { useRouter } from "next/navigation";
import { GiSoccerBall } from "react-icons/gi";
import { FaDollarSign, FaHome, FaSignOutAlt, FaStore } from "react-icons/fa";
import { useAuthRedirect } from "../hooks/useAuthRedirect";

interface NavbarProps {
    balance: number;
    activePage?: "home" | "market" | "mylisting";
}

export default function Navbar({ balance, activePage }: NavbarProps) {
    useAuthRedirect(); // redirect if not logged in
    const router = useRouter();

    const handleLogout = () => {
        localStorage.removeItem("token");
        router.push("/login");
    };

    return (
        <div className="flex justify-between items-center p-6 bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-800 text-white shadow-lg">
            <div className="flex items-center gap-4">
                <GiSoccerBall className="text-yellow-400 text-4xl animate-bounce cursor-pointer" onClick={() => router.push("/")} />
                <button
                    onClick={() => router.push("/")}
                    className={`px-4 py-2 rounded-full transition-colors font-semibold ${activePage === "home" ? "bg-yellow-400 text-black" : "hover:bg-yellow-400 hover:text-black"
                        }`}
                >
                    Home
                </button>
                <button
                    onClick={() => router.push("/market")}
                    className={`px-4 py-2 rounded-full transition-colors font-semibold ${activePage === "market" ? "bg-yellow-400 text-black" : "hover:bg-yellow-400 hover:text-black"
                        }`}
                >
                    Market
                </button>
                <button
                    onClick={() => router.push("/my-listing")}
                    className={`px-4 py-2 rounded-full transition-colors font-semibold ${activePage === "mylisting" ? "bg-yellow-400 text-black" : "hover:bg-yellow-400 hover:text-black"
                        }`}
                >
                    My Listing
                </button>
            </div>
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-1 text-lg font-bold">
                    <FaDollarSign /> {balance?.toLocaleString()}
                </div>
                <button
                    onClick={handleLogout}
                    className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-full font-semibold flex items-center gap-2 transition-colors"
                >
                    <FaSignOutAlt /> Logout
                </button>
            </div>
        </div>
    );
}
