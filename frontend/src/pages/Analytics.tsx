import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Header from "../components/Header";
import axios from "axios";
import { auth } from "../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

//change to normal fetch
// ===== AXIOS API CALLS =====
const BASE_URL = "http://localhost:8084";

const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

client.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Get metrics for specific link (total/unique clicks + name)
const getMetrics = (slug: string) =>
  client.get(`/api/analytics/${slug}/metrics`);

// Get daily timeseries data (mapped to your clicksbyday endpoint)
const getTimeseries = (slug: string) =>
  client.get(`/api/analytics/${slug}/clicksbyday`);

// Get clicks by country (mapped to your clicksbycountry endpoint)
const getGeographics = (slug: string) =>
  client.get(`/api/analytics/${slug}/clicksbycountry`);

const getClickLogs = (slug: string) =>
  client.get(`/api/analytics/${slug}/clicks`);

export default function Analytics() {
  // Get slug from URL params (e.g., /analytics/:slug)
  const { slug } = useParams<{ slug: string }>();

  // State for API data
  const [metrics, setMetrics] = useState({
    name: "",
    totalClicks: 0,
    uniqueClicks: 0,
  });
  const [timeseries, setTimeseries] = useState<
    Array<{ date: string; clicks: number }>
  >([]);
  const [geographics, setGeographics] = useState<
    Array<{ country: string; clicks: number }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [authReady, setAuthReady] = useState(false);
  const [clickLogs, setClickLogs] = useState<Array<any>>([]);

  // Wait for Firebase auth to initialize
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthReady(true);
      } else {
        console.error("User not authenticated");
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch data when auth is ready and slug is available
  useEffect(() => {
    if (!slug || !authReady) return;

    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        // Fetch metrics (name, totalClicks, uniqueClicks)
        const metricsRes = await getMetrics(slug);
        setMetrics(metricsRes.data);

        // Fetch timeseries (clicks by day)
        const timeseriesRes = await getTimeseries(slug);
        setTimeseries(timeseriesRes.data);

        // Fetch geographics (clicks by country)
        const geoRes = await getGeographics(slug);
        // Convert object { "US": 180, "CA": 40 } to array [{ country: "US", clicks: 180 }]
        const geoArray = Object.entries(geoRes.data).map(
          ([country, clicks]) => ({
            country,
            clicks: clicks as number,
          })
        );
        setGeographics(geoArray);

        // Add to fetchAnalytics function
        const clickLogsRes = await getClickLogs(slug);
        setClickLogs(clickLogsRes.data);

        console.log("geo array", geoArray);
        console.log("time series", timeseriesRes);
        console.log("clicks log", clickLogsRes);
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [slug, authReady]); // Re-fetch when slug changes or auth becomes ready

  // ===== DUMMY DATA (Now replaced by real API data above) =====
  /*const clickLogs = [
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
  ];*/

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gradient-to-br from-amber-950/25 via-rose-500/25 to-amber-950/25 p-8 text-cream flex items-center justify-center">
          <div className="text-2xl">Loading analytics...</div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-amber-950/25 via-rose-500/25 to-amber-950/25 p-8 text-cream">
        {/* ===== Selected Link Details ===== */}
        <section className="bg-black/40 border border-rose-500/20 rounded-2xl p-6 mb-10 shadow">
          <label className="block font-medium mb-2">
            Link: {metrics.name || slug}
          </label>

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
                {geographics.length > 0 ? (
                  geographics.map((geo, idx) => (
                    <li key={idx} className="flex justify-between">
                      <span>{geo.country}</span>
                      <span className="text-rose-300">{geo.clicks} clicks</span>
                    </li>
                  ))
                ) : (
                  <li className="text-cream/50">No data available</li>
                )}
              </ul>
            </div>

            {/* Clicks Over Time (FROM: GET /api/analytics/:slug/timeseries) */}
            <div className="bg-black/30 p-4 rounded-xl border border-rose-500/10 col-span-1 md:col-span-1">
              <h4 className="font-semibold mb-2">
                Recent Days (Clicks Over Time)
              </h4>
              <ul className="space-y-1 text-sm">
                {timeseries.length > 0 ? (
                  timeseries.map((t, idx) => (
                    <li key={idx} className="flex justify-between">
                      <span>{t.date}</span>
                      <span className="text-rose-300">{t.clicks}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-cream/50">No data available</li>
                )}
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
                  <tr
                    key={idx}
                    className="border-b border-rose-500/10 hover:bg-rose-500/10"
                  >
                    <td className="py-3 px-4">
                      {log.ip?.replace("::ffff:", "") ?? "Unknown"}
                    </td>{" "}
                    <td className="py-3 px-4 truncate max-w-xs">
                      {log.referrer}
                    </td>
                    <td className="py-3 px-4">{log.country}</td>
                    <td className="py-3 px-4">
                      {new Date(log.timeStamp).toLocaleString()}
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
