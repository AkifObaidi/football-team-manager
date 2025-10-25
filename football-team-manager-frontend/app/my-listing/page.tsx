"use client";

import { useState, useEffect } from "react";
import { removeListing, getCurrentUser, listPlayerForSale, getMarketPlayers } from "../../api/api";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";

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

export default function MyListing() {
    const router = useRouter();
    const [players, setPlayers] = useState<Player[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [selectedPlayerId, setSelectedPlayerId] = useState<number | "">("");
    const [askingPrice, setAskingPrice] = useState<number | "">("");

    useEffect(() => {
        document.title = "Fantasy Soccer - My Listings";
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
        const fetchData = async () => {
            try {
                const res = await getMarketPlayers({}, true);
                setPlayers(res["players"] || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleRemove = async (id: number) => {
        try {
            await removeListing(id);
            setPlayers(players.filter((p) => p.id !== id));
        } catch (err) {
            console.error(err);
            alert("Failed to remove listing");
        }
    };

    const handleAdd = async () => {
        if (!selectedPlayerId || !askingPrice || isNaN(Number(askingPrice))) {
            alert("Please select a player and enter a valid price.");
            return;
        }
        try {
            const res = await listPlayerForSale(Number(selectedPlayerId), Number(askingPrice));
            if (res.message == "Player listed for sale") {
                const players = await getMarketPlayers({}, true);
                const user = await getCurrentUser();
                setPlayers(players["players"]);
                setUser(user);
                setShowModal(false);
                setSelectedPlayerId("");
                setAskingPrice("");
            } else {
                alert(res.message)
            }
        } catch (err) {
            console.error(err);
            alert("Failed to add listing");
        }
    };

    const filtered = players.filter((p) =>
        //For now we handle filtering in frontend
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.team_name.toLowerCase().includes(search.toLowerCase())
    );

    if (loading)
        return (
            <div className="text-white flex justify-center items-center h-screen text-xl font-semibold">
                Loading My Listings...
            </div>
        );

    const unlistedPlayers = user?.players?.filter((p) => p.is_listed === 0) || [];

    return (
        <div className="min-h-screen bg-gradient-to-b from-purple-900 via-indigo-900 to-blue-800 text-white p-6 font-sans">
            <Navbar balance={user?.team?.balance?.toLocaleString()} activePage="mylisting" />

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

                <button
                    onClick={() => setShowModal(true)}
                    className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-full font-semibold transition-colors"
                >
                    Add Player Listing
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filtered.map((player) => (
                    <div
                        key={player.id}
                        className="bg-black/50 backdrop-blur-md p-5 rounded-2xl shadow-2xl hover:scale-105 transition-transform hover:shadow-yellow-500/50 cursor-pointer relative overflow-hidden"
                    >
                        <h3 className="text-xl font-bold mb-1">{player.name}</h3>
                        <p className="text-gray-300 mb-1">Team: {player.team_name}</p>
                        <p className="text-yellow-400 font-semibold mb-2">
                            {player.asking_price?.toLocaleString()}
                        </p>

                        <button
                            onClick={() => handleRemove(player.id)}
                            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-full w-full font-semibold transition-colors"
                        >
                            Remove Listing
                        </button>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
                    <div className="bg-[#1f0e3b] p-6 rounded-2xl w-80 text-white shadow-2xl">
                        <h2 className="text-2xl font-bold mb-4">Add Player Listing</h2>
                        <select
                            className="w-full p-3 mb-4 rounded-xl bg-[#5a3ba0] text-white font-semibold focus:outline-none focus:ring-2 focus:ring-[#9c7bcf]"
                            value={selectedPlayerId}
                            onChange={(e) => setSelectedPlayerId(Number(e.target.value))}
                        >
                            <option value="">Select Player</option>
                            {unlistedPlayers.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.name} ({p.team_name})
                                </option>
                            ))}
                        </select>
                        <input
                            type="number"
                            placeholder="Asking Price ($)"
                            className="w-full p-3 mb-4 rounded-xl bg-[#5a3ba0] text-white font-semibold focus:outline-none focus:ring-2 focus:ring-[#9c7bcf]"
                            value={askingPrice}
                            onChange={(e) => setAskingPrice(Number(e.target.value))}
                        />
                        <div className="flex justify-between">
                            <button
                                onClick={handleAdd}
                                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-full font-semibold transition-colors"
                            >
                                Add
                            </button>
                            <button
                                onClick={() => setShowModal(false)}
                                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-full font-semibold transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
1