import React, { useState } from "react";
import { Input } from "@mui/material";

type SortKey = "date" | "name";

interface LinkRow {
  name: string;
  clicks: number;
  short: string;
  target: string;
  date: string; // ISO yyyy-mm-dd
}

export default function Dashboard() {
  const [url, setUrl] = useState<string>("");
  const [alias, setAlias] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [sortBy, setSortBy] = useState<SortKey>("date");

  const links = [
    {
      name: "Homepage",
      clicks: 1234,
      short: "bit.ly/home123",
      target: "https://example.com",
      date: "2024-11-01",
    },
    {
      name: "Product Page",
      clicks: 856,
      short: "bit.ly/prod456",
      target: "https://example.com/products",
      date: "2024-11-03",
    },
    {
      name: "Contact Us",
      clicks: 432,
      short: "bit.ly/contact",
      target: "https://example.com/contact",
      date: "2024-11-05",
    },
    {
      name: "Blog Post - AI Trends",
      clicks: 2103,
      short: "bit.ly/ai2024",
      target: "https://example.com/blog/ai-trends-2024",
      date: "2024-10-28",
    },
    {
      name: "Sign Up",
      clicks: 567,
      short: "bit.ly/signup",
      target: "https://example.com/register",
      date: "2024-11-08",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-semibold mb-6">Dashboard</h1>

      <form className="bg-white p-6 rounded-2xl shadow mb-8 space-y-4">
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Enter a URL to shorten
          </label>
          <input
            type="url"
            value={url}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setUrl(e.target.value)
            }
            className="w-full border border-gray-300 rounded-lg p-2"
            required
          />
        </div>
        <div className="flex gap-3 items-center">
          <input
            type="text"
            value={alias}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setAlias(e.target.value)
            }
            className="flex-1 border border-gray-300 rounded-lg p-2"
          />
          <button
            type="submit"
            className="bg-pink-600 text-white px-5 py-2 rounded-lg hover:bg-pink-700 transition"
          >
            Shorten
          </button>
        </div>
      </form>

      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSearch(e.target.value)
          }
          className="border border-gray-300 rounded-lg p-2 w-1/3"
        />
        <select
          value={sortBy}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            setSortBy(e.target.value as SortKey)
          }
          className="border border-gray-300 rounded-lg p-2"
        >
          <option value="date">Sort by Date</option>
          <option value="name">Sort by Name</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-2xl shadow">
          <thead className="bg-red-800 border-b">
            <tr>
              <th className="text-left py-3 px-4">Name</th>
              <th className="text-left py-3 px-4">Clicks</th>
              <th className="text-left py-3 px-4">Link</th>
              <th className="text-left py-3 px-4">Redirects To</th>
              <th className="text-left py-3 px-4">Date</th>
            </tr>
          </thead>
          <tbody>
            {links.map((link, idx) => (
              <tr key={idx} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4 text-black">{link.name}</td>
                <td className="py-3 px-4 text-black">{link.clicks}</td>
                <td className="py-3 px-4 text-pink-600 cursor-pointer">
                  {link.short}
                </td>
                <td className="py-3 px-4 text-black">{link.target}</td>
                <td className="py-3 px-4 text-black">{link.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
