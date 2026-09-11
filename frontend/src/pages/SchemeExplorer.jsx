import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { getSchemes, getCategories } from "../services/api";
import { Disclaimer, TagBadge, SAMPLE_DATA_NOTICE } from "../components/UI";

export default function SchemeExplorer() {
  const [schemes, setSchemes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [level, setLevel] = useState("");
  const [loading, setLoading] = useState(true);
  const [errored, setErrored] = useState(false);

  const fetchSchemes = async () => {
    setLoading(true);
    try {
      const res = await getSchemes({ q: query, category, level });
      setSchemes(res.schemes);
      setErrored(false);
    } catch (e) {
      setErrored(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCategories().then((r) => setCategories(r.categories)).catch(() => {});
    fetchSchemes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const t = setTimeout(fetchSchemes, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, category, level]);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-8 sm:px-6">
      <h1 className="text-2xl font-bold text-slate-900">Scheme Explorer</h1>
      <p className="mb-6 text-sm text-slate-500">Browse the prototype scheme knowledge base.</p>

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <div className="relative sm:col-span-1">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="input-field pl-14"
            placeholder="Search schemes..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <select className="input-field" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="input-field" value={level} onChange={(e) => setLevel(e.target.value)}>
          <option value="">All Levels</option>
          <option value="Central">Central</option>
          <option value="State">State</option>
        </select>
      </div>

      {errored && (
        <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-600">
          Could not reach the backend at http://localhost:8000. Make sure the FastAPI server is running.
        </div>
      )}

      {!loading && !errored && (
        <p className="mb-4 text-xs text-slate-400">{schemes.length} scheme(s) found</p>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {schemes.map((s) => (
          <div key={s.id} className="card">
            <div className="mb-2 flex flex-wrap items-center gap-1.5">
              <TagBadge tone="brand">{s.category}</TagBadge>
              <TagBadge>{s.level}</TagBadge>
              <TagBadge>{s.state}</TagBadge>
            </div>
            <h3 className="text-sm font-bold text-slate-900">{s.name}</h3>
            <p className="mt-1.5 text-xs text-slate-500">{s.description}</p>
            <p className="mt-2 text-xs font-semibold text-emerald-700">{s.benefit}</p>
            <p className="mt-2 text-[11px] text-slate-400">Target group: {s.target_group}</p>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <Disclaimer text={SAMPLE_DATA_NOTICE} />
      </div>
    </div>
  );
}
