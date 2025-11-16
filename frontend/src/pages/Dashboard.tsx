import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import axios from 'axios';
import { auth } from "../lib/firebase";

const BASE_URL = 'http://localhost:8084';

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


type SortKey = "name" | "clicks" | "short" | "date";
type SortOrder = "asc" | "desc";

interface Link {
  _id: string;
  name: string;
  target: string;
  createDate: string;
  totalClicks?: number;
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

  // Fetch links only after auth is ready
  useEffect(() => {
    if (authReady) {
      fetchLinks();
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
    } catch (error) {
      console.error('Failed to update link:', error);
      alert('Failed to update link');
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-linear-to-br from-amber-950/25 via-rose-500/25 to-amber-950/25 p-8">
        {/* ===== CREATE LINK FORM (SUBMIT TO: POST /api/links) ===== */}
        <form 
          onSubmit={handleSubmit}
          className="bg-black/40 backdrop-blur-sm p-6 rounded-2xl shadow mb-8 space-y-4 border border-rose-500/20"
        >
          <div>
            <label className="block text-cream font-medium mb-1">Enter a Name for this URL</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ex. Dashboard"
              className="w-full border border-red-500 bg-black/20 text-cream rounded-lg p-2 focus:border-red-900 focus:outline-none placeholder-cream/50"
              required
            />
          </div>
          <div>
            <label className="block text-cream font-medium mb-1">Enter a URL to shorten</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="ex. https://example.com/your-long-url"
              className="w-full border border-red-500 bg-black/20 text-cream rounded-lg p-2 focus:border-red-900 focus:outline-none placeholder-cream/50"
              required
            />
          </div>

          <label className="block text-cream font-medium mb-1">Enter Custom Alias</label>
          <div className="flex gap-3 items-center">
            <input
              type="text"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              placeholder="custom alias"
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

        {/* ===== SEARCH BAR ===== */}
        <div className="flex justify-between items-center mb-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search links..."
            className="border border-red-500 bg-black/20 text-cream rounded-lg p-2 focus:border-red-900 w-1/3 focus:outline-none placeholder-cream/50"
          />
        </div>

        {/* ===== LINKS TABLE (FROM: GET /api/links) ===== */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-black/40 backdrop-blur-sm rounded-2xl shadow border border-rose-500/20">
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
                    className={`text-left py-3 px-4 text-cream cursor-pointer select-none hover:text-rose-100 ${
                      sortBy === col.key ? "underline decoration-rose-300" : ""
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
                        href={`http://localhost:8084/r/${link._id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {/*window.location.origin*/}localhost:8084/r/{link._id}
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