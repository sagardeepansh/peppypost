"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";

export default function EditTemplatePage() {
  const router = useRouter();
  const { id } = useParams();

  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState([]); // (string | File)[]

  // console.log('files', files)

  const [form, setForm] = useState({
    name: "",
    subject: "",
    body: "",
  });

  useEffect(() => {
    if (!id) return;

    fetch(`/api/templates/${id}`)
      .then((res) => res.json())
      .then((res) => {
        setForm({
          name: res.name || "",
          subject: res.subject || "",
          body: res.body || "",
        });

        // existing file URLs
        setFiles(res?.files || []);
      })
      .catch((err) => {
        console.error("Failed to fetch template:", err);
      });
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleMessage = (value) => {
    setForm({ ...form, body: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const uploadedPaths = [];

      // 1️⃣ Keep existing URLs
      files.forEach((file) => {
        if (typeof file === "string") {
          uploadedPaths.push(file);
        }
      });

      // 2️⃣ Upload only NEW files
      const newFiles = files.filter((f) => f instanceof File);

      for (const file of newFiles) {
        const data = new FormData();
        data.append("file", file);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: data,
        });

        const uploadResult = await uploadRes.json();

        if (!uploadResult?.success) {
          throw new Error(uploadResult?.message || "Upload failed");
        }

        uploadedPaths.push(uploadResult.url);
      }

      // 3️⃣ Update template
      const res = await fetch(`/api/templates/${id}`, {
        method: "PUT",
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
        throw new Error("Template update failed");
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
    <div>
      <h1 className="text-xl font-semibold mb-6">Edit Template</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2"
        />

        <input
          name="subject"
          value={form.subject}
          onChange={handleChange}
          className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2"
        />

        <div className="border border-gray-700 rounded-md overflow-hidden">
          <SimpleEditor value={form.body} onChange={handleMessage} />
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm text-gray-400 mb-1">
            Attach Files
          </label>

          <input
            type="file"
            multiple
            onChange={(e) => {
              const selected = Array.from(e.target.files || []);
              setFiles((prev) => [...selected]);
              e.target.value = "";
            }}
            className="block w-full text-sm text-gray-300
              file:bg-gray-800 file:border file:border-gray-700
              file:px-3 file:py-1 file:rounded
              file:text-gray-200 file:cursor-pointer
              hover:file:bg-gray-700"
          />

          {files.length > 0 && (
            <ul className="mt-2 text-xs text-gray-400 space-y-1">
              {files.map((file, index) => (
                <li key={index}>
                  • {typeof file === "string"
                    ? file.split("/").pop()
                    : file.name}
                </li>
              ))}
            </ul>
          )}
        </div>

        <button
          disabled={loading}
          className="bg-blue-600 px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? "Updating..." : "Update Template"}
        </button>
      </form>
    </div>
  );
}
