import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Header from "../components/Header";
import axios from 'axios';
import { auth } from "../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';


// ===== AXIOS API CALLS =====
const BASE_URL = import.meta.env.VITE_API_URL;

const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
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

const getClickLogs = (slug: string, cursor?: string | null) =>
  client.get(`/api/analytics/${slug}/clicks`, {
    params: cursor ? { cursor } : {}
  });

const getDevices = (slug: string) =>
  client.get(`/api/analytics/${slug}/clicksbydevice`);

// Top referrers endpoint (same response format as country/device)
const getReferrers = (slug: string) =>
  client.get(`/api/analytics/${slug}/clicksbyreferrer`);

export default function Analytics() {
  // Get slug from URL params (e.g., /analytics/:slug)
  const { slug } = useParams<{ slug: string }>();

  // State for API data
  const [metrics, setMetrics] = useState({
    name: "",
    target: "",
    slug: "",
    totalClicks: 0,
    uniqueClicks: 0
  });
  const [timeseries, setTimeseries] = useState<Array<{ date: string; clicks: number }>>([]);
  const [geographics, setGeographics] = useState<Array<{ country: string; clicks: number }>>([]);
  const [devices, setDevices] = useState<Array<{ device: string; clicks: number }>>([]);
  const [referrers, setReferrers] = useState<Array<{ referrer: string; clicks: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [authReady, setAuthReady] = useState(false);
  const [clickLogs, setClickLogs] = useState<Array<any>>([]);
  const [clickLogsCursor, setClickLogsCursor] = useState<string | null>(null);
  const [loadingMoreClicks, setLoadingMoreClicks] = useState(false);

  // Wait for Firebase auth to initialize
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthReady(true);
      } else {
        console.error('User not authenticated');
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
        const geoArray = Object.entries(geoRes.data).map(([country, clicks]) => ({
          country,
          clicks: clicks as number
        }));
        setGeographics(geoArray);

        // Fetch devices
        const devRes = await getDevices(slug);
        const devArray = Object.entries(devRes.data).map(([device, clicks]) => ({
          device,
          clicks: clicks as number
        }));
        setDevices(devArray);

        // Fetch referrers
        const refRes = await getReferrers(slug);
        const refArray = Object.entries(refRes.data).map(([referrer, clicks]) => ({
          referrer: referrer || "Direct",
          clicks: clicks as number
        }));
        setReferrers(refArray);

        // Fetch initial click logs (cursor-based)
        const clickLogsRes = await getClickLogs(slug);
        setClickLogs(clickLogsRes.data.data || []);
        setClickLogsCursor(clickLogsRes.data.nextCursor || null);

      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [slug, authReady]);

  const loadMoreClickLogs = async () => {
    if (!slug || !clickLogsCursor) return;
    try {
      setLoadingMoreClicks(true);
      const res = await getClickLogs(slug, clickLogsCursor);
      const newLogs = res.data.data || [];
      setClickLogs((prev) => [...prev, ...newLogs]);
      setClickLogsCursor(res.data.nextCursor || null);
    } catch (error) {
      console.error('Failed to load more click logs:', error);
    } finally {
      setLoadingMoreClicks(false);
    }
  };

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
        {/* ===== LINK INFO HEADER ===== */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">

          {/* Left: Title */}
          <h2 className="text-5xl font-semibold mb-4 md:mb-0">
            {metrics.name}
          </h2>

          {/* Right: Redirect + Alias */}
          <div className="space-y-1 text-right">
            <p className="text-cream/80">
              <span className="font-semibold">redirects to:</span> {metrics.target}
            </p>

            <p className="text-cream/80">
              <span className="font-semibold">alias:</span>{" "}
              {`${window.location.origin}/r/${slug}`}
            </p>
          </div>

        </div>


        {/* ===== INDIVIDUAL ANALYTIC CARDS ===== */}
        <div className="space-y-6 mb-10">

          {/* Row 1: Total / Unique */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Total Clicks */}
            <div className="bg-black/40 p-6 rounded-2xl border border-rose-600 shadow-lg shadow-black/50">
              <h4 className="font-semibold mb-4">Total Clicks</h4>
              <p className="text-5xl font-semibold">{metrics.totalClicks}</p>
            </div>

            {/* Unique Clicks */}
            <div className="bg-black/40 p-6 rounded-2xl border border-rose-600 shadow-lg shadow-black/50">
              <h4 className="font-semibold mb-4">Unique Clicks</h4>
              <p className="text-5xl font-semibold">{metrics.uniqueClicks}</p>
            </div>
          </div>

          {/* Row 2: Countries / Devices / Referrers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Top Countries */}
            <div className="bg-black/40 p-6 rounded-2xl border border-rose-600 shadow-lg shadow-black/50">
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

            {/* Top Devices */}
            <div className="bg-black/40 p-6 rounded-2xl border border-rose-600 shadow-lg shadow-black/50">
              <h4 className="font-semibold mb-2">Top Devices</h4>
              <ul className="space-y-1 text-sm">
                {devices.length > 0 ? (
                  devices.map((dev, idx) => (
                    <li key={idx} className="flex justify-between">
                      <span>{dev.device}</span>
                      <span className="text-rose-300">{dev.clicks} clicks</span>
                    </li>
                  ))
                ) : (
                  <li className="text-cream/50">No data available</li>
                )}
              </ul>
            </div>

            {/* Top Referrers */}
            <div className="bg-black/40 p-6 rounded-2xl border border-rose-600 shadow-lg shadow-black/50">
              <h4 className="font-semibold mb-2">Top Referrers</h4>
              <ul className="space-y-1 text-sm">
                {referrers.length > 0 ? (
                  referrers.map((ref, idx) => (
                    <li key={idx} className="flex justify-between">
                      <span className="truncate max-w-[10rem]">
                        {ref.referrer}
                      </span>
                      <span className="text-rose-300">{ref.clicks} clicks</span>
                    </li>
                  ))
                ) : (
                  <li className="text-cream/50">No data available</li>
                )}
              </ul>
            </div>
          </div>

          {/* Clicks Over Time */}
          <div className="bg-black/40 p-6 rounded-2xl border border-rose-600 shadow-lg shadow-black/50">
            <h4 className="font-semibold mb-2">Clicks Over Time</h4>
            {timeseries.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timeseries}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(244, 63, 94, 0.2)" />
                    <XAxis
                      dataKey="date"
                      stroke="#fdf4dc"
                      tickFormatter={(date) =>
                        new Date(date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          timeZone: 'UTC'
                        })
                      }
                    />
                    <YAxis stroke="#fdf4dc" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        border: '1px solid rgba(244, 63, 94, 0.3)',
                        borderRadius: '8px',
                      }}
                      labelStyle={{ color: '#fdf4dc' }}
                      itemStyle={{ color: '#fb7185' }}
                      labelFormatter={(date) =>
                        new Date(date).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                          timeZone: 'UTC'
                        })
                      }
                    />
                    <Line
                      type="monotone"
                      dataKey="clicks"
                      stroke="#fb7185"
                      strokeWidth={2}
                      dot={{ fill: '#fb7185', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-cream/50 text-center py-8">No data available</div>
            )}
          </div>

        </div>


        {/* ===== RECENT CLICKS ===== */}
        <section className="">
          <h3 className="text-xl font-semibold mb-4">Recent Clicks</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-black/40 backdrop-blur-sm shadow-lg">
              <thead className="bg-rose-500/80 border-b border-rose-500/30">
                <tr>
                  <th className="text-left py-3 px-4 text-cream">IP Address</th>
                  <th className="text-left py-3 px-4 text-cream">Referrer</th>
                  <th className="text-left py-3 px-4 text-cream">Country</th>
                  <th className="text-left py-3 px-4 text-cream">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {clickLogs.map((log, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-rose-500/10 hover:bg-rose-500/10"
                  >
                    <td className="py-3 px-4 text-cream">
                      {log.ip?.replace("::ffff:", "") ?? "Unknown"}
                    </td>
                    <td className="py-3 px-4 text-cream truncate max-w-xs">
                      {log.referrer || "Direct"}
                    </td>
                    <td className="py-3 px-4 text-cream">
                      {log.country || "Unknown"}
                    </td>
                    <td className="py-3 px-4 text-cream">
                      {new Date(log.timeStamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
                {clickLogs.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-4 px-4 text-center text-cream/50"
                    >
                      No clicks recorded yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {clickLogsCursor && (
            <div className="mt-4">
              <button
                onClick={loadMoreClickLogs}
                disabled={loadingMoreClicks}
                className="px-4 py-2 rounded-xl border border-rose-500 bg-black/40 hover:bg-rose-500/20 disabled:opacity-50"
              >
                {loadingMoreClicks ? "Loading..." : "Load more"}
              </button>
            </div>
          )}
        </section>

      </main>
    </>
  );
}
