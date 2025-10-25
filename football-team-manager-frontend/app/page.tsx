"use client";

import { useEffect, useState } from "react";
import { getCurrentUser } from "../api/api";
import { useRouter } from "next/navigation";
import Navbar from "./components/Navbar";
import { useAuthRedirect } from "./hooks/useAuthRedirect";

interface Player {
    id: number;
    name: string;
    position: "GK" | "DEF" | "MID" | "ATT";
    team_name: string;
    is_listed: number;
    asking_price: number | null;
}

interface User {
    id: number;
    email: string;
    balance: number;
    team: any;
    players: Player[];
}

export default function Home() {
    useAuthRedirect(); // redirect if not logged in
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        document.title = "Fantasy Soccer - Home";
    }, []);


    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await getCurrentUser();
                setUser(res);
            } catch (err) {
                console.error(err);
                router.push("/login");
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [router]);

    if (loading)
        return (
            <div className="text-white flex justify-center items-center h-screen text-xl font-semibold">
                Loading your fantasy team...
            </div>
        );

    const players: Player[] = Array.isArray(user?.players) ? user.players : [];

    const grouped: Record<"GK" | "DEF" | "MID" | "ATT", Player[]> = {
        GK: players.filter((p) => p.position === "GK"),
        DEF: players.filter((p) => p.position === "DEF"),
        MID: players.filter((p) => p.position === "MID"),
        ATT: players.filter((p) => p.position === "ATT"),
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        router.push("/login");
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-purple-900 via-indigo-900 to-blue-800 text-white p-6 font-sans">
            <Navbar balance={user?.team?.balance?.toLocaleString()} activePage="home" />

            {/* Players by position */}
            {(["GK", "DEF", "MID", "ATT"] as const).map((pos) => (
                <div key={pos} className="mb-12 mt-8">
                    <h2 className="text-3xl font-bold mb-6 border-b-2 border-yellow-400 inline-block pb-2">
                        {pos === "GK"
                            ? "Goalkeepers"
                            : pos === "DEF"
                                ? "Defenders"
                                : pos === "MID"
                                    ? "Midfielders"
                                    : "Attackers"}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                        {grouped[pos].map((player) => (
                            <div
                                key={player.id}
                                className="bg-black/50 backdrop-blur-md p-5 rounded-2xl shadow-2xl hover:scale-105 transition-transform hover:shadow-yellow-500/50 cursor-pointer relative overflow-hidden"
                            >
                                <div className="absolute -top-8 -right-8 w-24 h-24 bg-yellow-400/20 rounded-full animate-ping"></div>
                                <h3 className="text-xl font-bold mb-1">{player.name}</h3>
                                <p className="text-sm mb-2 text-gray-300">Team: {player.team_name}</p>
                                <p className="text-yellow-400 font-semibold">
                                    {(player.is_listed == 1 ? "Listed for " + player.asking_price?.toLocaleString() : "active")}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
