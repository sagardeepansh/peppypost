"use client";

import { useEffect, useState } from "react";

export default function SettingsPage() {
    const [form, setForm] = useState({
        host: "",
        port: "",
        secure: false,
        username: "",
        password: "",
        fromEmail: "",
    });
    
    useEffect(() => {
        fetch("/api/settings/smtp", {
            method: "GET",
            credentials: "include", // REQUIRED for HttpOnly JWT cookies
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error("Unauthorized or failed request");
                }
                return res.json();
            })
            .then(data => {
                if (data) setForm(prev => ({ ...prev, ...data?.data }));
            })
            .catch((err) => {
                console.error(err);
            });
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({
            ...form,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const res = await fetch("/api/settings/smtp", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(form),
        });

        if (res.ok) {
            alert("SMTP settings saved");
        } else {
            alert("Failed to save SMTP settings");
        }
    };

    return (
        <div className="max-w-xl rounded-xl bg-gray-900 p-6 shadow-lg border border-gray-800">
            <h1 className="text-xl font-semibold text-white mb-6">
                SMTP Settings
            </h1>

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* SMTP Host */}
                <div>
                    <label className="block text-sm text-gray-400 mb-1">
                        SMTP Host
                    </label>
                    <input
                        name="host"
                        value={form.host}
                        onChange={handleChange}
                        placeholder="smtp.gmail.com"
                        className="w-full rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Port */}
                <div>
                    <label className="block text-sm text-gray-400 mb-1">
                        Port
                    </label>
                    <input
                        name="port"
                        value={form.port}
                        onChange={handleChange}
                        placeholder="587"
                        className="w-full rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Secure */}
                <div className="flex items-center gap-3">
                    <input
                        type="checkbox"
                        name="secure"
                        checked={form.secure}
                        onChange={handleChange}
                        className="h-4 w-4 rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-300">
                        Use SSL / TLS
                    </span>
                </div>

                {/* Username */}
                <div>
                    <label className="block text-sm text-gray-400 mb-1">
                        Username
                    </label>
                    <input
                        name="username"
                        value={form.username}
                        onChange={handleChange}
                        placeholder="your-email@example.com"
                        className="w-full rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Password */}
                <div>
                    <label className="block text-sm text-gray-400 mb-1">
                        Password
                    </label>
                    <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className="w-full rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* From Email */}
                <div>
                    <label className="block text-sm text-gray-400 mb-1">
                        From Email
                    </label>
                    <input
                        name="fromEmail"
                        value={form.fromEmail}
                        onChange={handleChange}
                        placeholder="noreply@example.com"
                        className="w-full rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Submit */}
                <div className="pt-4">
                    <button
                        type="submit"
                        className="w-full rounded-md bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
                    >
                        Save Settings
                    </button>
                </div>
            </form>
        </div>

    );
}
