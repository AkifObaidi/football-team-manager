"use client";

import { useState, useEffect } from "react";
import { getMarketPlayers, buyPlayer, getCurrentUser } from "../../api/api";
import { useAuthRedirect } from "../hooks/useAuthRedirect";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
interface Player {
    id: number;
    name: string;
    position: "GK" | "DEF" | "MID" | "ATT";
    team_name: string;
    asking_price: number;
    is_listed: number;
    team_id: number;
}

interface User {
    id: number;
    email: string;
    balance: number;
    team: any;
    players: Player[];
}

export default function Market() {
    useAuthRedirect(); // redirect if not logged in
    const [players, setPlayers] = useState<Player[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const router = useRouter();
    const [minPrice, setMinPrice] = useState<number | "">("");
    const [maxPrice, setMaxPrice] = useState<number | "">("");

    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        document.title = "Fantasy Soccer - Market";
    }, []);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await getCurrentUser();
                setUser(res);
            } catch (err) {
                console.error(err);
                router.push("/login");
            }
        };
        fetchUser();
    }, [router]);

    useEffect(() => {
        const fetchMarket = async () => {
            try {
                const res = await getMarketPlayers();
                console.log(res)
                setPlayers(res.players || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchMarket();
    }, []);

    const handleBuy = async (playerId: number) => {
        try {
            await buyPlayer(playerId);
            alert("Player bought successfully!");
            setPlayers(players.filter((p) => p.id !== playerId));
            try {
                const res = await getCurrentUser();
                setUser(res);
            } catch (err) {
                console.error(err);
            }
        } catch (err) {
            console.error(err);
            alert("Failed to buy player");
        }
    };

    const filtered = players.filter((p) => {
        //For now we handle filtering in frontend
        const matchesSearch =
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.team_name.toLowerCase().includes(search.toLowerCase());

        const matchesMin = minPrice === "" || p.asking_price! >= minPrice;
        const matchesMax = maxPrice === "" || p.asking_price! <= maxPrice;

        return matchesSearch && matchesMin && matchesMax;
    })

    if (loading)
        return (
            <div className="text-white flex justify-center items-center h-screen text-xl font-semibold">
                Loading Transfer Market...
            </div>
        );

    return (
        <div className="min-h-screen bg-gradient-to-b from-purple-900 via-indigo-900 to-blue-800 text-white p-6 font-sans">
            <Navbar balance={user?.team?.balance?.toLocaleString()} activePage="market" />

            <div className="mb-6 mt-8 flex flex-col md:flex-row gap-4 items-center">
                <input
                    type="text"
                    placeholder="Search by player or team..."
                    className="w-full md:w-1/3 p-3 rounded-xl text-white font-semibold 
               placeholder-pink-200 bg-[#5a3ba0] border border-[#8b6bb0] 
               focus:outline-none focus:ring-2 focus:ring-[#9c7bcf] focus:border-[#9c7bcf] 
               shadow-md transition-all duration-300 hover:scale-105"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                <input
                    type="number"
                    placeholder="Min price"
                    className="w-full md:w-1/6 p-3 rounded-xl text-white font-semibold 
               placeholder-pink-200 bg-[#5a3ba0] border border-[#8b6bb0] 
               focus:outline-none focus:ring-2 focus:ring-[#9c7bcf] focus:border-[#9c7bcf] 
               shadow-md transition-all duration-300 hover:scale-105"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : "")}
                />

                <input
                    type="number"
                    placeholder="Max price"
                    className="w-full md:w-1/6 p-3 rounded-xl text-white font-semibold 
               placeholder-pink-200 bg-[#5a3ba0] border border-[#8b6bb0] 
               focus:outline-none focus:ring-2 focus:ring-[#9c7bcf] focus:border-[#9c7bcf] 
               shadow-md transition-all duration-300 hover:scale-105"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : "")}
                />
            </div>


            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filtered.map((player) => (
                    <div
                        key={player.id}
                        className="bg-black/50 backdrop-blur-md p-5 rounded-2xl shadow-2xl hover:scale-105 transition-transform hover:shadow-yellow-500/50 cursor-pointer relative overflow-hidden"
                    >
                        <div className="absolute -top-8 -right-8 w-20 h-20 bg-yellow-400/20 rounded-full animate-ping"></div>
                        <h3 className="text-xl font-bold mb-1">{player.name}</h3>
                        <p className="text-gray-300 mb-1">Team: {player.team_name}</p>
                        <p className="text-yellow-400 font-semibold mb-2">${player.asking_price?.toLocaleString()}</p>
                        {user?.team?.id == player.team_id ? <p>Your player</p> :
                            parseInt(user?.team?.balance) > player.asking_price / 0.95 ?
                                <button
                                    onClick={() => handleBuy(player.id)}
                                    className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-full w-full font-semibold transition-colors"
                                >
                                    Buy
                                </button> : null
                        }

                    </div>
                ))}
            </div>
        </div>
    );
}
