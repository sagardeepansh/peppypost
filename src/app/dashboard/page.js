"use client";

import LexicalEditor from "@/components/LexicalEditor";
import TipTapEditor from "@/components/TipTapEditor";
import { useEffect, useState } from "react";

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

    // if (!email || !message) {
    //     alert("Email and message are required");
    //     return;
    // }

    try {
      setLoading(true);
      setSuccess("");

      // Simulated API call
      const result = await fetch("/api/email/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ emails, message, templateId: selectedTemplate }),
      });

      setSuccess("Message submitted successfully");
      setEmails([]);
      setMessage("");
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950  p-4">
      <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-semibold text-gray-100 mb-6 text-center"></h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Emails
            </label>

            {/* Email Tags */}
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
                placeholder="Enter email and click Add"
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

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Template
            </label>

            <select
              value={selectedTemplate}
              onChange={handleTemplateChange}
              className="w-full rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-sm text-gray-100
               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select a template</option>

              {templates.map((template) => (
                <option
                  key={template._id}
                  value={template._id}
                  className="bg-gray-900"
                >
                  {template.name}
                </option>
              ))}
            </select>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Message
            </label>
            {/* <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Enter message"
                            rows={4}
                            // disabled={selectedTemplate}
                            className="w-full rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-sm text-gray-100
                         placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        /> */}
            {/* <TipTapEditor message={message} onChange={setMessage} />{" "} */}
            <LexicalEditor
              value={message}
              onChange={(html) => setMessage(html)}
              placeholder="Write your email here..."
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-blue-600 py-2 text-white font-medium
                       hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Submitting..." : "Submit"}
          </button>

          {/* Success Message */}
          {success && (
            <p className="text-center text-sm text-green-400 mt-2">{success}</p>
          )}
        </form>
      </div>
    </div>
  );
}
