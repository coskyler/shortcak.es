import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import axios from 'axios';
import { auth } from "../lib/firebase";

const BASE_URL = import.meta.env.VITE_API_URL;

const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor: Automatically adds Firebase auth token to API requests
// BUT excludes the /r/ redirect endpoint (which should be public)
client.interceptors.request.use(async (config) => {
  // Only add auth token for /api/ routes, not for /r/ redirect routes
  if (config.url?.startsWith('/api/')) {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Get list of links
const getLinks = () =>
  client.get('/api/links');

// Create a new short link
const createLink = (redirect: string, name: string, slug: string | null = null) =>
  client.post('/api/links', { redirect, name, ...(slug && { slug }) });

// Update link name
const updateLink = (slug: string, name: string) =>
  client.patch('/api/links', { slug, name });

// Delete a link
const deleteLink = (slug: string) =>
  client.delete('/api/links', { data: { slug } });

// Get aggregate analytics
const getAggregates = () =>
  client.get('/api/aggregates');

type SortKey = "name" | "clicks" | "short" | "date";
type SortOrder = "asc" | "desc";

interface Link {
  _id: string;
  name: string;
  target: string;
  createDate: string;
  totalClicks?: number;
}

interface Aggregates {
  _id: string;
  totalLinks: number;
  totalClicks: number;
  clicksByRegion: Record<string, number>;
  clicksByDevice: Record<string, number>;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [name, setName] = useState<string>("");
  const [url, setUrl] = useState<string>("");
  const [alias, setAlias] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [sortBy, setSortBy] = useState<SortKey>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [authReady, setAuthReady] = useState<boolean>(false);
  const [aggregates, setAggregates] = useState<Aggregates | null>(null);

  // Wait for Firebase auth to be ready
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setAuthReady(true);
      } else {
        setAuthReady(false);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch links and aggregates only after auth is ready
  useEffect(() => {
    if (authReady) {
      fetchLinks();
      fetchAggregates();
    }
  }, [authReady]);

  const fetchLinks = async () => {
    try {
      setLoading(true);
      const response = await getLinks();
      setLinks(response.data);
    } catch (error) {
      console.error('Failed to fetch links:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAggregates = async () => {
    try {
      const response = await getAggregates();
      setAggregates(response.data);
    } catch (error) {
      console.error('Failed to fetch aggregates:', error);
    }
  };

  // Filter + Sort
  const filteredLinks = useMemo(() => {
    const result = links.filter((link) =>
      link.name.toLowerCase().includes(search.toLowerCase()) ||
      link._id.toLowerCase().includes(search.toLowerCase())
    );
    return [...result].sort((a, b) => {
      let valA: any = a[sortBy as keyof Link];
      let valB: any = b[sortBy as keyof Link];

      if (sortBy === "date") {
        valA = new Date(a.createDate).getTime();
        valB = new Date(b.createDate).getTime();
      } else if (sortBy === "short") {
        valA = a._id;
        valB = b._id;
      } else if (sortBy === "clicks") {
        valA = a.totalClicks || 0;
        valB = b.totalClicks || 0;
      }

      if (typeof valA === "string" && typeof valB === "string") {
        return sortOrder === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
      } else if (typeof valA === "number" && typeof valB === "number") {
        return sortOrder === "asc" ? valA - valB : valB - valA;
      }
      return 0;
    });
  }, [search, sortBy, sortOrder, links]);

  const topRegions = useMemo(() => {
    if (!aggregates) return [];
    return Object.entries(aggregates.clicksByRegion || {})
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
  }, [aggregates]);

  const topDevices = useMemo(() => {
    if (!aggregates) return [];
    return Object.entries(aggregates.clicksByDevice || {})
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
  }, [aggregates]);

  const handleSort = (key: SortKey) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(key);
      setSortOrder("asc");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await createLink(url, name, alias || null);
      alert(`Link created successfully! Your short link: ${window.location.origin}/r/${response.data._id}`);

      setUrl('');
      setAlias('');
      setName('');

      // Refresh the links list
      await fetchLinks();
      await fetchAggregates();

    } catch (error: any) {
      console.error('Failed to create link:', error);
      const errorMessage = error.response?.data?.error || 'Failed to create link';
      alert(errorMessage);
    }
  };

  const handleDelete = async (slug: string) => {
    if (!window.confirm('Are you sure you want to delete this link?')) return;

    try {
      await deleteLink(slug);
      // Refresh the links list
      await fetchLinks();
      await fetchAggregates();
    } catch (error) {
      console.error('Failed to delete link:', error);
      alert('Failed to delete link');
    }
  };

  const handleUpdate = async (slug: string, currentName: string) => {
    const newName = prompt('Enter new name:', currentName);
    if (!newName || newName === currentName) return;

    try {
      await updateLink(slug, newName);
      // Refresh the links list
      await fetchLinks();
      await fetchAggregates();
    } catch (error) {
      console.error('Failed to update link:', error);
      alert('Failed to update link');
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-linear-to-br from-amber-950/25 via-rose-500/25 to-amber-950/25 p-8">
        {/* ===== TOP SUMMARY CARDS ===== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Total Link Clicks */}
          <div className="bg-black/40 backdrop-blur-sm border border-rose-600 rounded-2xl p-4 shadow-lg shadow-black/50">
            <p className="text-sm font-medium text-cream/80 mb-4">All Time Link Clicks</p>
            <p className="text-5xl font-semibold text-cream">
              {aggregates?.totalClicks ?? 0}
            </p>
          </div>

          {/* Top Regions */}
          <div className="bg-black/40 backdrop-blur-sm border border-rose-600 rounded-2xl p-4 shadow-lg shadow-black/50">
            <p className="text-sm font-medium text-cream/80 mb-2">Top Regions</p>

            <ul className="space-y-1 text-cream">
              {topRegions.length > 0 ? (
                topRegions.map(([region, count]) => (
                  <li key={region} className="flex justify-between">
                    <span>{region}</span>
                    <span className="text-rose-300">{count}</span>
                  </li>
                ))
              ) : (
                <li className="text-cream/50 text-sm">No data available</li>
              )}
            </ul>
          </div>

          {/* Top Device Types */}
          <div className="bg-black/40 backdrop-blur-sm border border-rose-600 rounded-2xl p-4 shadow-lg shadow-black/50">
            <p className="text-sm font-medium text-cream/80 mb-2">Top Device Types</p>

            <ul className="space-y-1 text-cream">
              {topDevices.length > 0 ? (
                topDevices.map(([device, count]) => (
                  <li key={device} className="flex justify-between">
                    <span>{device}</span>
                    <span className="text-rose-300">{count}</span>
                  </li>
                ))
              ) : (
                <li className="text-cream/50 text-sm">No data available</li>
              )}
            </ul>

          </div>

        </div>

        {/* ===== CREATE LINK FORM (SUBMIT TO: POST /api/links) ===== */}
        <form
          onSubmit={handleSubmit}
          className="bg-black/40 backdrop-blur-sm p-6 rounded-2xl shadow-lg shadow-black/50 mb-8 space-y-4 border border-rose-600"
        >
          <h2 className="text-2xl font-semibold text-cream mb-4">Create a Short Link</h2>

          {/* URL FIELD*/}
          <div>
            <label className="block text-cream font-medium mb-1">Enter a URL to shorten</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="ex. https://example.com/your-long-url"
              className="w-full border border-rose-500/50 bg-black/20 text-cream rounded-lg p-2 focus:border-rose-500 focus:outline-none placeholder-cream/50"
              required
            />
          </div>

          {/* NAME + ALIAS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-cream font-medium mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ex. My Site"
                className="w-full border border-rose-500/50 bg-black/20 text-cream rounded-lg p-2 focus:border-rose-500 focus:outline-none placeholder-cream/50"
                required
              />
            </div>

            <div>
              <label className="block text-cream font-medium mb-1">Custom Alias (optional)</label>
              <input
                type="text"
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
                placeholder="custom alias"
                className="w-full border border-rose-500/50 bg-black/20 text-cream rounded-lg p-2 focus:border-rose-500 focus:outline-none placeholder-cream/50"
              />
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            className="bg-rose-500 text-cream px-5 py-2 rounded-lg hover:bg-rose-600 transition w-full md:w-auto"
          >
            Shorten
          </button>
        </form>

        {/* ===== SEARCH BAR ===== */}
        <div className="flex justify-between items-center mb-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search links..."
            className="border border-rose-500/50 bg-black/20 text-cream rounded-lg p-2 focus:border-rose-500 w-1/3 focus:outline-none placeholder-cream/50"
          />

          <div className="text-cream text-lg font-medium">
            {aggregates?.totalLinks ?? 0} active {aggregates?.totalLinks == 1 ? " link" : " links"}
          </div>
        </div>

        {/* ===== LINKS TABLE (FROM: GET /api/links) ===== */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-black/40 backdrop-blur-sm shadow-lg">
            <thead className="bg-rose-500/80 border-b border-rose-500/30">
              <tr>
                {[
                  { key: "name", label: "Name" },
                  { key: "clicks", label: "Clicks" },
                  { key: "short", label: "Link" },
                  { key: "target", label: "Redirects To" },
                  { key: "date", label: "Date" },
                ].map((col) => (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key as SortKey)}
                    className={`text-left py-3 px-4 text-cream cursor-pointer select-none hover:text-rose-100 ${sortBy === col.key ? "underline decoration-rose-300" : ""
                      }`}
                  >
                    {col.label}{" "}
                    {sortBy === col.key && (sortOrder === "asc" ? "▲" : "▼")}
                  </th>
                ))}
                <th className="text-left py-3 px-4 text-cream">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-cream">Loading...</td>
                </tr>
              ) : filteredLinks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-cream">No links found</td>
                </tr>
              ) : (
                filteredLinks.map((link) => (
                  <tr key={link._id} className="border-b border-rose-500/10 hover:bg-rose-500/10">
                    <td
                      className="py-3 px-4 text-cream cursor-pointer hover:text-rose-300 hover:underline"
                      onClick={() => navigate(`/analytics/${link._id}`)}
                    >
                      {link.name}
                    </td>
                    <td className="py-3 px-4 text-cream">{link.totalClicks || 0}</td>
                    <td className="py-3 px-4 text-rose-400 cursor-pointer hover:text-rose-300">
                      <a
                        href={`${BASE_URL}/r/${link._id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {BASE_URL}/r/{link._id}
                      </a>
                    </td>
                    <td className="py-3 px-4 text-cream truncate max-w-xs">{link.target}</td>
                    <td className="py-3 px-4 text-cream">
                      {new Date(link.createDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleUpdate(link._id, link.name)}
                        className="text-white px-3 py-1 rounded mr-2 hover:bg-yellow-600 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(link._id)}
                        className=" text-white px-3 py-1 rounded hover:bg-red-600 transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </>
  );

}
