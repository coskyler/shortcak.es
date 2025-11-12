import React, { useState } from "react";
import Header from "../components/Header";
// import axios from 'axios';

// ===== AXIOS API CALLS (Uncomment when backend is ready) =====
/*
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to every request
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Get overall aggregates (top 3 cards)
const getAggregates = () =>
  client.get('/api/aggregates');

// Get metrics for specific link (total/unique clicks)
const getMetrics = (slug: string) =>
  client.get(`/api/analytics/${slug}/metrics`);

// Get daily timeseries data
const getTimeseries = (slug: string) =>
  client.get(`/api/analytics/${slug}/timeseries`);

// Get clicks by country
const getGeographics = (slug: string) =>
  client.get(`/api/analytics/${slug}/geographics`);

// Get individual click logs
const getClicks = (slug: string, limit = 50, cursor = null) =>
  client.get(`/api/analytics/${slug}/clicks`, { params: { limit, ...(cursor && { cursor }) } });
*/

//implementation
/*
useEffect(() => {
  const fetchAnalytics = async () => {
    try {
      // Fetch aggregates
      const aggregatesRes = await getAggregates();
      setAggregates(aggregatesRes.data);

      // Fetch data for selected link
      const [metricsRes, timeseriesRes, geoRes, clicksRes] = await Promise.all([
        getMetrics(selectedLink),
        getTimeseries(selectedLink),
        getGeographics(selectedLink),
        getClicks(selectedLink, 50)
      ]);

      setMetrics(metricsRes.data);
      setTimeseries(timeseriesRes.data);
      setGeographics(geoRes.data);
      setClickLogs(clicksRes.data.items);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    }
  };

  fetchAnalytics();
}, [selectedLink]); // Re-fetch when user changes selected link
*/

export default function Analytics() {
  const [selectedLink, setSelectedLink] = useState<string>("promo");

  // ===== DUMMY DATA (Replace with real API calls above) =====
  // FROM: GET /api/aggregates
  const aggregates = { 
    totalLinks: 12, 
    totalClicks: 18234, 
    uniqueVisitors: 9670 
  };

  // FROM: GET /api/analytics/:slug/metrics
  const metrics = { 
    totalClicks: 2456, 
    uniqueClicks: 1893 
  };

  // FROM: GET /api/analytics/:slug/timeseries
  const timeseries = [
    { date: "2025-10-01", clicks: 42 },
    { date: "2025-10-02", clicks: 55 },
    { date: "2025-10-03", clicks: 61 },
  ];

  // FROM: GET /api/analytics/:slug/geographics
  const geographics = [
    { country: "US", clicks: 180 },
    { country: "CA", clicks: 40 },
    { country: "GB", clicks: 35 },
  ];

  // FROM: GET /api/analytics/:slug/clicks?limit=50
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
        {/* ===== Aggregates Summary (FROM: GET /api/aggregates) ===== */}
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
            {/* Total and Unique Clicks (FROM: GET /api/analytics/:slug/metrics) */}
            <div className="bg-black/30 p-4 rounded-xl border border-rose-500/10">
              <h4 className="font-semibold mb-1">Total Clicks</h4>
              <p className="text-2xl">{metrics.totalClicks}</p>
            </div>
            <div className="bg-black/30 p-4 rounded-xl border border-rose-500/10">
              <h4 className="font-semibold mb-1">Unique Clicks</h4>
              <p className="text-2xl">{metrics.uniqueClicks}</p>
            </div>

            {/* Clicks by Country (FROM: GET /api/analytics/:slug/geographics) */}
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

            {/* Clicks Over Time (FROM: GET /api/analytics/:slug/timeseries) */}
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

        {/* ===== Click Logs Table (FROM: GET /api/analytics/:slug/clicks?limit=50) ===== */}
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