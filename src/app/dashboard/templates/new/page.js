"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import TiptapEditor from "@/components/TiptapEditor";
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";

export default function NewTemplatePage() {
    const router = useRouter();
    const [form, setForm] = useState({
        name: "",
        subject: "",
        body: "",
    });
    const [loading, setLoading] = useState(false);
    const [files, setFiles] = useState([])

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };
    const handleMessgae = (e) => {
        setForm({ ...form, ['body']: e });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1️⃣ Upload files first (if any)
            const uploadedPaths = [];

            if (files && files.length > 0) {
                for (const file of files) {
                    const data = new FormData();
                    data.append("file", file);

                    const uploadRes = await fetch("/api/upload", {
                        method: "POST",
                        body: data,
                    });

                    const uploadResult = await uploadRes.json();

                    if (!uploadRes.ok) {
                        throw new Error("File upload failed");
                    }

                    uploadedPaths.push(uploadResult.path);
                }
            }

            // 2️⃣ Create template with uploaded file paths
            const res = await fetch("/api/templates", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...form,
                    files: uploadedPaths,
                }),
            });

            if (!res.ok) {
                throw new Error("Template creation failed");
            }

            router.push("/dashboard/templates");
        } catch (error) {
            console.error(error);
            alert(error.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="max-w-xl min-h-screen">
            <h1 className="text-xl font-semibold mb-6">Add New Template</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Template Name */}
                <div>
                    <label className="block text-sm text-gray-400 mb-1">
                        Template Name
                    </label>
                    <input
                        name="name"
                        placeholder="Template Name"
                        value={form.name}
                        onChange={handleChange}
                        className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-sm
                 focus:outline-none focus:ring-2 focus:ring-blue-600"
                        required
                    />
                </div>

                {/* Subject */}
                <div>
                    <label className="block text-sm text-gray-400 mb-1">
                        Email Subject
                    </label>
                    <input
                        name="subject"
                        placeholder="Email Subject"
                        value={form.subject}
                        onChange={handleChange}
                        className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-sm
                 focus:outline-none focus:ring-2 focus:ring-blue-600"
                        required
                    />
                </div>

                {/* Body */}
                <div>
                    <label className="block text-sm text-gray-400 mb-1">
                        Email Body
                    </label>
                    {/* <textarea
                        name="body"
                        placeholder="Email Body"
                        rows={6}
                        value={form.body}
                        onChange={handleChange}
                        className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-sm
                 focus:outline-none focus:ring-2 focus:ring-blue-600"
                        required
                    /> */}
                    <div className="border border-gray-700 rounded-md overflow-hidden">
                        <SimpleEditor value={form.body} onChange={handleMessgae} />
                        {/* <TiptapEditor value={form.body} onChange={handleMessgae} /> */}
                    </div>
                </div>

                {/* File Upload */}
                <div>
                    <label className="block text-sm text-gray-400 mb-1">
                        Attach Files
                    </label>
                    <input
                        type="file"
                        multiple
                        onChange={(e) => setFiles(Array.from(e.target.files))}
                        className="block w-full text-sm text-gray-300
                 file:bg-gray-800 file:border file:border-gray-700
                 file:px-3 file:py-1 file:rounded
                 file:text-gray-200 file:cursor-pointer
                 hover:file:bg-gray-700"
                    />

                    {/* Selected Files Preview */}
                    {files.length > 0 && (
                        <ul className="mt-2 text-xs text-gray-400 space-y-1">
                            {files.map((file, index) => (
                                <li key={index}>• {file.name}</li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm
               font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? "Saving..." : "Save Template"}
                </button>
            </form>

        </div>
    );
}
