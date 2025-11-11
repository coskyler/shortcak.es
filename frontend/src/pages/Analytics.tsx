import React, { useState } from "react";
import Header from "../components/Header";

export default function Analytics() {
  const [selectedLink, setSelectedLink] = useState<string>("promo");

  // Dummy data placeholders (these mirror your backend)
  const aggregates = { totalLinks: 12, totalClicks: 18234, uniqueVisitors: 9670 };
  const metrics = { totalClicks: 2456, uniqueClicks: 1893 };
  const timeseries = [
    { date: "2025-10-01", clicks: 42 },
    { date: "2025-10-02", clicks: 55 },
    { date: "2025-10-03", clicks: 61 },
  ];
  const geographics = [
    { country: "US", clicks: 180 },
    { country: "CA", clicks: 40 },
    { country: "GB", clicks: 35 },
  ];
  const clickLogs = [
    {
      ip: "203.0.113.1",
      referrer: "https://news.com/",
      country: "US",
      timestamp: "2025-10-31T22:00:00Z",
    },
    {
      ip: "198.51.100.2",
      referrer: "https://search.com/",
      country: "CA",
      timestamp: "2025-11-01T09:00:00Z",
    },
  ];

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-amber-950/25 via-rose-500/25 to-amber-950/25 p-8 text-cream">
        {/* ===== Aggregates Summary ===== */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-black/40 border border-rose-500/20 rounded-2xl p-6 text-center shadow">
            <h3 className="text-lg font-semibold">Total Links</h3>
            <p className="text-3xl font-bold">{aggregates.totalLinks}</p>
          </div>
          <div className="bg-black/40 border border-rose-500/20 rounded-2xl p-6 text-center shadow">
            <h3 className="text-lg font-semibold">Total Clicks</h3>
            <p className="text-3xl font-bold">{aggregates.totalClicks}</p>
          </div>
          <div className="bg-black/40 border border-rose-500/20 rounded-2xl p-6 text-center shadow">
            <h3 className="text-lg font-semibold">Unique Visitors</h3>
            <p className="text-3xl font-bold">{aggregates.uniqueVisitors}</p>
          </div>
        </section>

        {/* ===== Selected Link Details ===== */}
        <section className="bg-black/40 border border-rose-500/20 rounded-2xl p-6 mb-10 shadow">
          <label className="block font-medium mb-2">Select Link:</label>
          <select
            value={selectedLink}
            onChange={(e) => setSelectedLink(e.target.value)}
            className="w-1/3 border border-rose-500/30 bg-black/20 text-cream rounded-lg p-2 focus:border-rose-500 focus:outline-none mb-6"
          >
            <option value="promo">Promo</option>
            <option value="blog">Blog</option>
            <option value="signup">Sign Up</option>
          </select>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Total and Unique Clicks */}
            <div className="bg-black/30 p-4 rounded-xl border border-rose-500/10">
              <h4 className="font-semibold mb-1">Total Clicks</h4>
              <p className="text-2xl">{metrics.totalClicks}</p>
            </div>
            <div className="bg-black/30 p-4 rounded-xl border border-rose-500/10">
              <h4 className="font-semibold mb-1">Unique Clicks</h4>
              <p className="text-2xl">{metrics.uniqueClicks}</p>
            </div>

            {/* Clicks by Country */}
            <div className="bg-black/30 p-4 rounded-xl border border-rose-500/10 col-span-1 md:col-span-1">
              <h4 className="font-semibold mb-2">Top Countries</h4>
              <ul className="space-y-1 text-sm">
                {geographics.map((geo, idx) => (
                  <li key={idx} className="flex justify-between">
                    <span>{geo.country}</span>
                    <span className="text-rose-300">{geo.clicks} clicks</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Clicks Over Time */}
            <div className="bg-black/30 p-4 rounded-xl border border-rose-500/10 col-span-1 md:col-span-1">
              <h4 className="font-semibold mb-2">Recent Days (Clicks Over Time)</h4>
              <ul className="space-y-1 text-sm">
                {timeseries.map((t, idx) => (
                  <li key={idx} className="flex justify-between">
                    <span>{t.date}</span>
                    <span className="text-rose-300">{t.clicks}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ===== Click Logs Table ===== */}
        <section className="bg-black/40 border border-rose-500/20 rounded-2xl p-6 shadow">
          <h3 className="text-xl font-semibold mb-4">Recent Clicks</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border border-rose-500/10">
              <thead className="bg-rose-500/80 border-b border-rose-500/30">
                <tr>
                  <th className="text-left py-3 px-4">IP Address</th>
                  <th className="text-left py-3 px-4">Referrer</th>
                  <th className="text-left py-3 px-4">Country</th>
                  <th className="text-left py-3 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {clickLogs.map((log, idx) => (
                  <tr key={idx} className="border-b border-rose-500/10 hover:bg-rose-500/10">
                    <td className="py-3 px-4">{log.ip}</td>
                    <td className="py-3 px-4 truncate max-w-xs">{log.referrer}</td>
                    <td className="py-3 px-4">{log.country}</td>
                    <td className="py-3 px-4">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </>
  );
}
