"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function TemplatesPage() {
    const [templates, setTemplates] = useState([]);

    useEffect(() => {
        fetch("/api/templates", {
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
            .then(setTemplates)
            .catch((err) => {
                console.error(err);
            });
    }, []);


    return (
        <div className="">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-xl font-semibold">Templates</h1>

                <Link
                    href="/dashboard/templates/new"
                    className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm"
                >
                    Add Template
                </Link>
            </div>

            {templates.map((tpl) => (
                <div
                    key={tpl._id}
                    className="flex justify-between items-start border border-gray-800 bg-gray-900 rounded p-4"
                >
                    <div>
                        <h2 className="font-medium">{tpl.name}</h2>
                        <p className="text-sm text-gray-400">{tpl.subject}</p>
                    </div>

                    <div className="flex gap-2">
                        <Link
                            href={`/dashboard/templates/${tpl._id}/edit`}
                            className="text-sm px-3 py-1 rounded bg-gray-800 hover:bg-gray-700"
                        >
                            Edit
                        </Link>

                        <button
                            onClick={async () => {
                                if (!confirm("Delete this template?")) return;

                                await fetch(`/api/templates/${tpl._id}`, {
                                    method: "DELETE",
                                });

                                setTemplates((prev) =>
                                    prev.filter((t) => t._id !== tpl._id)
                                );
                            }}
                            className="text-sm px-3 py-1 rounded bg-red-600 hover:bg-red-700"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
