"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
// import TiptapEditor from "@/components/TiptapEditor";
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";

export default function EditTemplatePage() {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState([])
  const [files, setFiles] = useState([])
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
        setForm(res);         // set the full form data
        setFiles(res?.files || []); // set the files array safely
      })
      .catch((err) => {
        console.error("Failed to fetch template:", err);
      });
  }, [id]);

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

          if (!uploadResult?.success) {
            throw new Error(uploadResult?.message);
          }

          // if (!uploadRes.ok) {
          //   throw new Error("File upload failed");
          // }


          // Vercel Blob returns a public URL
          uploadedPaths.push(uploadResult.url);
        }
      }


      // 2️⃣ Create template with uploaded file paths
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

  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   await fetch(`/api/templates/${id}`, {
  //     method: "PUT",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify(form),
  //   });

  //   router.push("/dashboard/templates");
  // };

  return (
    <div className="">
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

        {/* <textarea
          name="body"
          rows={6}
          value={form.body}
          onChange={handleChange}
          className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2"
        /> */}
        <div className="border border-gray-700 rounded-md overflow-hidden">
          <SimpleEditor value={form.body} onChange={handleMessgae} />
          {/* <TiptapEditor value={form.body} onChange={handleMessgae} /> */}
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
                <li key={index}>• {file}</li>
              ))}
            </ul>
          )}
        </div>

        <button className="bg-blue-600 px-4 py-2 rounded">
          Update Template
        </button>
      </form>
    </div>
  );
}
