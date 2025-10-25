"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loginOrSignup } from "../../api/api";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        document.title = "Fantasy Soccer - Log in/Sign up";
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const data = await loginOrSignup(email, password);
            if (data.status === "success") {
                localStorage.setItem("token", data.token);
                router.push("/"); // redirect to home
            } else {
                setError(data.message || "Login failed");
            }
        } catch (err) {
            setError("Server error");
            console.error(err);
        }
    };

    return (
        <div className="flex items-center justify-center h-screen bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-900 text-white">
            <form
                onSubmit={handleSubmit}
                className="bg-black/70 p-10 rounded-3xl shadow-2xl w-96 backdrop-blur-md"
            >
                <h1 className="text-3xl font-bold mb-6 text-center">Fantasy Manager</h1>

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3 rounded-lg mb-4 bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-3 rounded-lg mb-4 bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                />

                {error && <p className="text-red-400 mb-4 text-center">{error}</p>}

                <button
                    type="submit"
                    className="w-full py-3 bg-purple-600 hover:bg-purple-500 rounded-lg font-bold transition-colors"
                >
                    Enter
                </button>
            </form>
        </div>
    );
}
