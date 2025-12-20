"use client";

import TiptapEditor from "@/components/TiptapEditor";
import { useEffect, useState } from "react";
import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor'

export default function DashboardPage() {
  const [emails, setEmails] = useState([]);
  const [emailInput, setEmailInput] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");

  const handleTemplateChange = (e) => {
    const templateId = e.target.value;
    setSelectedTemplate(templateId);

    const template = templates.find((t) => t._id === templateId);
    if (template) {
      setMessage(template.body); // auto-fill message
    }
  };

  const addEmail = () => {
    if (!emailInput.trim()) return;

    const inputEmails = emailInput
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    const validEmails = inputEmails.filter(
      (email) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && !emails.includes(email)
    );

    if (!validEmails.length) return;

    setEmails((prev) => [...prev, ...validEmails]);
    setEmailInput("");
  };

  const removeEmail = (email) => {
    setEmails(emails.filter((e) => e !== email));
  };

  useEffect(() => {
    fetch("/api/templates")
      .then((res) => res.json())
      .then(setTemplates);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setSuccess("");

      const result = await fetch("/api/email/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          emails,
          message,
          templateId: selectedTemplate,
        }),
      });

      // Always parse JSON AFTER checking response
      const data = await result.json();

      if (!result.ok) {
        throw new Error(data?.message || "Email submission failed");
      }

      console.log("API response:", data);

      setSuccess("Message submitted successfully");
      setEmails([]);
      setMessage("");
      setSelectedTemplate("");
    } catch (error) {
      console.error("Submit error:", error);
      alert(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-gray-900 border border-gray-800 rounded-xl shadow-xl">

        {/* Header */}
        <div className="px-6 flex justify-between items-center py-4 border-b border-gray-800">
          <h1 className="text-lg font-semibold text-gray-100">Compose Email</h1>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className="rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white
                     hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send"}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col">

          {/* TO */}
          <div className="px-6 py-4 border-b border-gray-800">
            <label className="block text-xs font-medium text-gray-400 mb-2">
              To
            </label>

            {/* Email Chips */}
            <div className="flex flex-wrap gap-2 mb-2">
              {emails?.map((email) => (
                <span
                  key={email}
                  className="flex items-center gap-1 bg-gray-700 text-sm text-gray-100 px-2 py-1 rounded"
                >
                  {email}
                  <button
                    type="button"
                    onClick={() => removeEmail(email)}
                    className="text-red-400 hover:text-red-500"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            {/* Input */}
            <div className="flex gap-2">
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="Enter recipient email"
                className="flex-1 rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-sm text-gray-100
                       placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={addEmail}
                className="rounded-md bg-gray-700 px-4 text-sm text-white hover:bg-gray-600"
              >
                Add
              </button>
            </div>
          </div>

          {/* TEMPLATE */}
          <div className="px-6 py-4 border-b border-gray-800">
            <label className="block text-xs font-medium text-gray-400 mb-1">
              Template
            </label>
            <select
              value={selectedTemplate}
              onChange={handleTemplateChange}
              className="w-full rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-sm text-gray-100
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a template</option>
              {templates.map((template) => (
                <option key={template._id} value={template._id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>

          {/* MESSAGE */}
          <div className="px-6 py-4 flex-1">
            {/* <label className="block text-xs font-medium text-gray-400 mb-2">
              Message
            </label> */}

            <SimpleEditor value={message} onChange={setMessage} />
            <div className="border border-gray-700 rounded-md overflow-hidden">
              {/* <TiptapEditor value={message} onChange={setMessage} /> */}
            </div>
          </div>

          {/* ACTIONS */}
          <div className="px-6 py-4 border-t border-gray-800 flex items-center justify-between">
            {success && (
              <span className="text-sm text-green-400">{success}</span>
            )}
          </div>

        </form>
      </div>
    </div>

  );
}
