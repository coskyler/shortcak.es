import React, { useState, useMemo } from "react";
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

// Get list of links with pagination
// const getLinks = (limit = 25, cursor = null) =>
//   client.get('/api/links', { params: { limit, ...(cursor && { cursor }) } });

// Create a new short link
const createLink = (redirect: string, name: string, slug: string | null = null) =>
  client.post('/api/links', { redirect, name, ...(slug && { slug }) });

// Update link name
// const updateLink = (slug: string, name: string) =>
//   client.patch('/api/links', { slug, name });

// Delete a link
// const deleteLink = (slug: string) =>
//   client.delete('/api/links', { data: { slug } });

// ===== HOW TO USE (Example implementation) =====
/*
// Fetch links on component mount
useEffect(() => {
  const fetchLinks = async () => {
    try {
      const response = await getLinks(25);
      setLinks(response.data.items);
      setNextCursor(response.data.nextCursor);
    } catch (error) {
      console.error('Failed to fetch links:', error);
    }
  };
  fetchLinks();
}, []);

// Handle form submission
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    const response = await createLink(url, "New Link", alias || null);
    alert(`Link created: ${window.location.origin}/r/${response.data.slug}`);
    setUrl('');
    setAlias('');
    // Refresh links list
    const linksRes = await getLinks(25);
    setLinks(linksRes.data.items);
  } catch (error) {
    console.error('Failed to create link:', error);
    alert('Failed to create link');
  }
};

// Load more links (pagination)
const loadMore = async () => {
  if (nextCursor) {
    try {
      const response = await getLinks(25, nextCursor);
      setLinks([...links, ...response.data.items]);
      setNextCursor(response.data.nextCursor);
    } catch (error) {
      console.error('Failed to load more links:', error);
    }
  }
};

// Delete a link
const handleDelete = async (slug: string) => {
  if (!window.confirm('Delete this link?')) return;
  try {
    await deleteLink(slug);
    setLinks(links.filter(link => link.slug !== slug));
  } catch (error) {
    console.error('Failed to delete link:', error);
  }
};

// Update link name
const handleRename = async (slug: string, currentName: string) => {
  const newName = prompt('Enter new name:', currentName);
  if (!newName || newName === currentName) return;
  try {
    await updateLink(slug, newName);
    setLinks(links.map(link => 
      link.slug === slug ? { ...link, name: newName } : link
    ));
  } catch (error) {
    console.error('Failed to update link:', error);
  }
};
*/

type SortKey = "name" | "clicks" | "short" | "date";
type SortOrder = "asc" | "desc";

export default function Dashboard() {
  const [name, setName] = useState<string>("");
  const [url, setUrl] = useState<string>("");
  const [alias, setAlias] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [sortBy, setSortBy] = useState<SortKey>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // ===== DUMMY DATA (Replace with real API call: GET /api/links) =====
  const links = [
    { 
      name: "Homepage", 
      clicks: 1234, 
      short: "bit.ly/home123", 
      target: "https://example.com", 
      date: "2024-11-01" 
    },
    { 
      name: "Product Page", 
      clicks: 856, 
      short: "bit.ly/prod456", 
      target: "https://example.com/products", 
      date: "2024-11-03" 
    },
    { 
      name: "Contact Us", 
      clicks: 432, 
      short: "bit.ly/contact", 
      target: "https://example.com/contact", 
      date: "2024-11-05" 
    },
    { 
      name: "Blog Post - AI Trends", 
      clicks: 2103, 
      short: "bit.ly/ai2024", 
      target: "https://example.com/blog/ai-trends-2024", 
      date: "2024-10-28" 
    },
    { 
      name: "Sign Up", 
      clicks: 567, 
      short: "bit.ly/signup", 
      target: "https://example.com/register", 
      date: "2024-11-08" 
    },
  ];

  // Filter + Sort
  const filteredLinks = useMemo(() => {
    const result = links.filter((link) =>
      link.name.toLowerCase().includes(search.toLowerCase()) ||
      link.short.toLowerCase().includes(search.toLowerCase())
    );
    return [...result].sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];
      if (sortBy === "date") {
        valA = new Date(a.date).getTime();
        valB = new Date(b.date).getTime();
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
  // Step 1: Prevent the default form submission behavior
  // (which would reload the page)
  e.preventDefault();
  
  try {
    console.log(url, alias)

    // Step 2: Call the createLink API function
    // - First parameter: the URL to shorten (from the url state)
    // - Second parameter: a name for the link (we have to add another input field in the dashboard.)
    // - Third parameter: custom alias if provided, or null for auto-generated
    const response = await createLink(url, name, alias || null);
    
    // Step 3: Show success message to the user

    alert(`Link created successfully! Your short link: ${window.location.origin}/r/${response.data._id}`);
    
    // Step 4: Clear the form inputs after successful creation
    setUrl('');
    setAlias('');
    setName('');
    
  } catch (error: any) {
    // Step 5: Handle any errors that occur
    console.error('Failed to create link:', error);
    
    // Show user-friendly error message from backend
    const errorMessage = error.response?.data?.error || 'Failed to create link';
    alert(errorMessage);
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
              </tr>
            </thead>
            <tbody>
              {filteredLinks.map((link, idx) => (
                <tr key={idx} className="border-b border-rose-500/10 hover:bg-rose-500/10">
                  <td className="py-3 px-4 text-cream">{link.name}</td>
                  <td className="py-3 px-4 text-cream">{link.clicks}</td>
                  <td className="py-3 px-4 text-rose-400 cursor-pointer hover:text-rose-300">
                    {link.short}
                  </td>
                  <td className="py-3 px-4 text-cream truncate max-w-xs">{link.target}</td>
                  <td className="py-3 px-4 text-cream">{link.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ===== PAGINATION (Use nextCursor from GET /api/links response) ===== */}
        {/* 
        {nextCursor && (
          <div className="mt-6 text-center">
            <button 
              onClick={loadMore}
              className="bg-rose-500 text-cream px-6 py-2 rounded-lg hover:bg-rose-600 transition"
            >
              Load More
            </button>
          </div>
        )}
        */}
      </div>
    </>
  );
}
