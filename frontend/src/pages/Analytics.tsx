import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Header from "../components/Header";
import axios from 'axios';
import { auth } from "../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';


//change to normal fetch
// ===== AXIOS API CALLS =====
const BASE_URL = 'http://localhost:8084';

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

const getClickLogs = (slug: string) =>
  client.get(`/api/analytics/${slug}/clicks`);

const getDevices = (slug: string) =>
  client.get(`/api/analytics/${slug}/clicksbydevice`);

export default function Analytics() {
  // Get slug from URL params (e.g., /analytics/:slug)
  const { slug } = useParams<{ slug: string }>();
  
  // State for API data
  const [metrics, setMetrics] = useState({ 
    name: "",
    totalClicks: 0, 
    uniqueClicks: 0 
  });
  const [timeseries, setTimeseries] = useState<Array<{ date: string; clicks: number }>>([]);
  const [geographics, setGeographics] = useState<Array<{ country: string; clicks: number }>>([]);
  const [devices, setDevices] = useState<Array<{ device: string; clicks: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [authReady, setAuthReady] = useState(false);
  const [clickLogs, setClickLogs] = useState<Array<any>>([]);


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

        // Fetch click logs
        const clickLogsRes = await getClickLogs(slug);
        setClickLogs(clickLogsRes.data);

      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [slug, authReady]);

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

        <section className="bg-black/40 border border-rose-500/20 rounded-2xl p-6 mb-10 shadow">
          <label className="block font-medium mb-2">Link: {metrics.name || slug}</label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-black/30 p-4 rounded-xl border border-rose-500/10">
              <h4 className="font-semibold mb-1">Total Clicks</h4>
              <p className="text-2xl">{metrics.totalClicks}</p>
            </div>
            <div className="bg-black/30 p-4 rounded-xl border border-rose-500/10">
              <h4 className="font-semibold mb-1">Unique Clicks</h4>
              <p className="text-2xl">{metrics.uniqueClicks}</p>
            </div>

            <div className="bg-black/30 p-4 rounded-xl border border-rose-500/10">
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

            <div className="bg-black/30 p-4 rounded-xl border border-rose-500/10">
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

            <div className="bg-black/30 p-4 rounded-xl border border-rose-500/10 col-span-1 md:col-span-2">
              <h4 className="font-semibold mb-2">Clicks Over Time</h4>
              {timeseries.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={timeseries}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(244, 63, 94, 0.2)" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#fdf4dc"
                        tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      />
                      <YAxis stroke="#fdf4dc" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', border: '1px solid rgba(244, 63, 94, 0.3)', borderRadius: '8px' }}
                        labelStyle={{ color: '#fdf4dc' }}
                        itemStyle={{ color: '#fb7185' }}
                        labelFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
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
        </section>

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
                    <td className="py-3 px-4">{log.ip?.replace('::ffff:', '') ?? 'Unknown'}</td>
                    <td className="py-3 px-4 truncate max-w-xs">{log.referrer || 'Direct'}</td>
                    <td className="py-3 px-4">{log.country || 'Unknown'}</td>
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