
import { useEffect, useMemo, useState } from "react";
import { Clipboard, ExternalLink, Search, RefreshCcw } from "lucide-react";

export default function App(){
  const [data, setData] = useState([]); // { fane, kategori, prompt }
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem("pv51_tab") || "");
  const [category, setCategory] = useState(() => localStorage.getItem("pv51_cat") || "");
  const [q, setQ] = useState("");
  const [count, setCount] = useState(0);

  useEffect(()=>localStorage.setItem("pv51_tab", activeTab),[activeTab]);
  useEffect(()=>localStorage.setItem("pv51_cat", category),[category]);

  async function loadJson(){
    try{
      const res = await fetch("/prompts.json", { cache:"no-store" });
      const json = await res.json();
      setData(json);
      setCount(json.length);
      if(!activeTab && json.length){
        setActiveTab(json[0].fane);
      }
    }catch(e){
      console.error(e);
      alert("Kunne ikke læse prompts.json");
    }
  }

  useEffect(()=>{ loadJson(); },[]);

  const tabs = useMemo(()=> Array.from(new Set(data.map(x=>x.fane))), [data]);
  const categories = useMemo(()=>{
    return Array.from(new Set(data.filter(x=>!activeTab || x.fane===activeTab).map(x=>x.kategori))).filter(Boolean).sort();
  },[data, activeTab]);

  const visiblePrompts = useMemo(()=>{
    return data
      .filter(x => (!activeTab || x.fane===activeTab) && (!category || x.kategori===category))
      .map(x=>x.prompt)
      .filter(p => p && (!q || p.toLowerCase().includes(q.toLowerCase())));
  },[data, activeTab, category, q]);

  function copy(t){ navigator.clipboard?.writeText(t).catch(()=>{}); }
  function openChatGPT(){ window.open("https://chat.openai.com/", "_blank"); }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Prompt Vault v5.1</h1>
          <p className="text-xs text-slate-500">{count.toLocaleString()} prompts</p>
        </div>
        <div className="flex gap-2">
          <button onClick={openChatGPT} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 text-white">
            <ExternalLink className="w-4 h-4" /> Åbn ChatGPT
          </button>
          <button onClick={loadJson} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100">
            <RefreshCcw className="w-4 h-4" /> Genindlæs
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap mb-3">
        {tabs.map(t => (
          <button key={t} onClick={()=>{setActiveTab(t); setCategory("");}} className={"px-3 py-1.5 rounded-full border " + (activeTab===t ? "bg-slate-900 text-white border-slate-900" : "bg-white border-slate-300")}>
            {t}
          </button>
        ))}
      </div>

      {/* Filter + Search */}
      <div className="flex gap-2 items-center mb-4">
        <select value={category} onChange={e=>setCategory(e.target.value)} className="rounded-xl border border-slate-300 px-3 py-2 bg-white min-w-[220px]">
          <option value="">Alle kategorier</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Søg i prompts…" className="w-full pl-9 rounded-xl border border-slate-300 px-3 py-2" />
        </div>
      </div>

      {/* List */}
      <ul className="space-y-3">
        {visiblePrompts.map((p, idx) => (
          <li key={idx} className="bg-white border border-slate-200 rounded-2xl p-3">
            <pre className="whitespace-pre-wrap text-[15px] leading-relaxed">{p}</pre>
            <div className="mt-2">
              <button onClick={()=>copy(p)} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-300">
                <Clipboard className="w-4 h-4" /> Kopiér
              </button>
            </div>
          </li>
        ))}
        {visiblePrompts.length===0 && <li className="text-slate-500">Ingen prompts matcher.</li>}
      </ul>

      <footer className="mt-8 text-xs text-slate-500">
         <p>Data hentes fra <code>public/prompts.json</code>. Du kan opdatere filen uden rebuild.</p>
      </footer>
    </div>
  );
}
