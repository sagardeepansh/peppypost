"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import TiptapEditor from "@/components/TiptapEditor";
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";

export default function EditTemplatePage() {
  const router = useRouter();
  const { id } = useParams();
  const [form, setForm] = useState({
    name: "",
    subject: "",
    body: "",
  });

  useEffect(() => {
    fetch(`/api/templates/${id}`)
      .then((res) => res.json())
      .then(setForm);
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleMessgae = (e) => {
    setForm({ ...form, ['body']: e });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    await fetch(`/api/templates/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    router.push("/dashboard/templates");
  };

  return (
    <div className="max-w-xl">
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

        <button className="bg-blue-600 px-4 py-2 rounded">
          Update Template
        </button>
      </form>
    </div>
  );
}
