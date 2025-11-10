import React, { useState } from "react";
import Header from "../components/Header"

type SortKey = "date" | "name";

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
    <>
    <Header/>
    <div className="min-h-screen bg-linear-to-br from-amber-950/25 via-rose-500/25 to-amber-950/25 p-8">

      <form className="bg-black/40 backdrop-blur-sm p-6 rounded-2xl shadow mb-8 space-y-4 border border-rose-500/20">
        <div>
          <label className="block text-cream font-medium mb-1">
            Enter a URL to shorten
          </label>
          <input
            type="url"
            value={url}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setUrl(e.target.value)
            }
            className="w-full border border-red-500 text-cream rounded-lg p-2 focus:border-red-900 focus:outline-none placeholder-cream/50"
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
            className="flex-1 border border-red-500 bg-black/20 text-cream rounded-lg p-2 focus:border-red-900 focus:outline-none placeholder-cream/50"
          />
          <button
            type="submit"
            className="bg-rose-500 text-cream px-5 py-2 rounded-lg hover:bg-rose-600 transition"
          >
            Shorten
          </button>
        </div>
      </form>

      <label className="block text-cream font-medium mb-1 pt-5">
            Enter a URL to shorten
      </label>
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSearch(e.target.value)
          }
          className="border border-red-500 text-cream rounded-lg p-2 focus:border-red-900 w-1/3 focus:outline-none placeholder-cream/50"
        />
        <select
          value={sortBy}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            setSortBy(e.target.value as SortKey)
          }
          className="border border-rose-500/30 bg-black/20 text-cream rounded-lg p-2 focus:border-rose-500 focus:outline-none"
        >
          <option value="date">Sort by Date</option>
          <option value="name">Sort by Name</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-black/40 backdrop-blur-sm rounded-2xl shadow border border-rose-500/20">
          <thead className="bg-rose-500/80 border-b border-rose-500/30">
            <tr>
              <th className="text-left py-3 px-4 text-cream">Name</th>
              <th className="text-left py-3 px-4 text-cream">Clicks</th>
              <th className="text-left py-3 px-4 text-cream">Link</th>
              <th className="text-left py-3 px-4 text-cream">Redirects To</th>
              <th className="text-left py-3 px-4 text-cream">Date</th>
            </tr>
          </thead>
          <tbody>
            {links.map((link, idx) => (
              <tr key={idx} className="border-b border-rose-500/10 hover:bg-rose-500/10">
                <td className="py-3 px-4 text-cream">{link.name}</td>
                <td className="py-3 px-4 text-cream">{link.clicks}</td>
                <td className="py-3 px-4 text-rose-400 cursor-pointer hover:text-rose-300">
                  {link.short}
                </td>
                <td className="py-3 px-4 text-cream">{link.target}</td>
                <td className="py-3 px-4 text-cream">{link.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </>
  );
}