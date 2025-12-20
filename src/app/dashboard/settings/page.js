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
      .then((data) => {
        if (data) setForm((prev) => ({ ...prev, ...data?.data }));
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* LEFT: SMTP FORM */}
      <div className="max-w-xl p-6 shadow-lg bg-gray-900 rounded-lg">
        <h1 className="text-xl font-semibold text-white mb-6">SMTP Settings</h1>

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
              className="w-full rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-sm text-white"
            />
          </div>

          {/* Port */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Port</label>
            <input
              name="port"
              value={form.port}
              onChange={handleChange}
              placeholder="587"
              className="w-full rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-sm text-white"
            />
          </div>

          {/* Secure */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="secure"
              checked={form.secure}
              onChange={handleChange}
              className="h-4 w-4"
            />
            <span className="text-sm text-gray-300">Use SSL / TLS</span>
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Username</label>
            <input
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="your-email@gmail.com"
              className="w-full rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-sm text-white"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              App Password
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="xxxx xxxx xxxx xxxx"
              className="w-full rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-sm text-white"
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
              placeholder="noreply@yourdomain.com"
              className="w-full rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-sm text-white"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full rounded-md bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Save Settings
          </button>
        </form>
      </div>

      {/* RIGHT: APP PASSWORD GUIDE */}
      <div className="p-6 bg-gray-900 border border-gray-800 rounded-lg">
        <h2 className="text-lg font-semibold text-white mb-4">
          How to Create App Password (Gmail)
        </h2>

        <ol className="space-y-3 text-sm text-gray-300 list-decimal list-inside">
          <li>
            Go to <span className="text-blue-400">Google Account</span>
          </li>
          <li>
            Open <b>Security</b> section
          </li>
          <li>
            Enable <b>2-Step Verification</b>
          </li>
          <li>
            Search for <b>App Passwords</b>
          </li>
          <li>
            Select app: <b>Mail</b>
          </li>
          <li>
            Select device: <b>Other</b>
          </li>
          <li>Generate password</li>
          <li>Copy and paste it here</li>
        </ol>

        <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded text-yellow-300 text-sm">
          ⚠️ Do NOT use your Gmail login password.
          <br />
          Always use an App Password.
        </div>

        <div className="mt-4 text-sm text-gray-400">
          <b>Recommended Gmail Settings:</b>
          <ul className="mt-2 list-disc list-inside">
            <li>Host: smtp.gmail.com</li>
            <li>Port: 587</li>
            <li>Secure: false (TLS)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
