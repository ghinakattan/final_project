"use client";
import { useState, useEffect } from "react";

type Theme = "system" | "light" | "dark";

export default function SettingsPage() {
  const [language, setLanguage] = useState("en");
  const [currency, setCurrency] = useState("USD");
  const [dateFormat, setDateFormat] = useState("YYYY-MM-DD");
  const [numberFormat, setNumberFormat] = useState("1,234.56");
  const [theme, setTheme] = useState<Theme>("system");
  const [accent, setAccent] = useState("cyan");
  const [density, setDensity] = useState("comfortable");

  useEffect(() => {
    // Load persisted preferences
    const stored = typeof window !== 'undefined' ? localStorage.getItem('app_preferences') : null;
    if (stored) {
      try {
        const p = JSON.parse(stored);
        setLanguage(p.language ?? "en");
        setCurrency(p.currency ?? "USD");
        setDateFormat(p.dateFormat ?? "YYYY-MM-DD");
        setNumberFormat(p.numberFormat ?? "1,234.56");
        setTheme(p.theme ?? "system");
        setAccent(p.accent ?? "cyan");
        setDensity(p.density ?? "comfortable");
      } catch {}
    }
  }, []);

  const save = () => {
    const prefs = { language, currency, dateFormat, numberFormat, theme, accent, density };
    if (typeof window !== 'undefined') {
      localStorage.setItem('app_preferences', JSON.stringify(prefs));
      document.documentElement.setAttribute('data-theme', theme);
      document.documentElement.style.setProperty('--accent', accent);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-slate-900 via-blue-900 to-blue-800 p-8 text-white">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4">Localization</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-white/80 mb-2">Language</label>
              <select value={language} onChange={e => setLanguage(e.target.value)} className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2">
                <option value="en">English</option>
                <option value="ar">Arabic</option>
                <option value="fr">French</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-white/80 mb-2">Currency</label>
              <select value={currency} onChange={e => setCurrency(e.target.value)} className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2">
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-white/80 mb-2">Date format</label>
                <input value={dateFormat} onChange={e => setDateFormat(e.target.value)} className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2" />
              </div>
              <div>
                <label className="block text-sm text-white/80 mb-2">Number format</label>
                <input value={numberFormat} onChange={e => setNumberFormat(e.target.value)} className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4">Appearance</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-white/80 mb-2">Theme</label>
              <select value={theme} onChange={e => setTheme(e.target.value as Theme)} className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2">
                <option value="system">System</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-white/80 mb-2">Accent color</label>
              <select value={accent} onChange={e => setAccent(e.target.value)} className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2">
                <option value="cyan">Cyan</option>
                <option value="blue">Blue</option>
                <option value="emerald">Emerald</option>
                <option value="violet">Violet</option>
                <option value="rose">Rose</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-white/80 mb-2">Layout density</label>
              <select value={density} onChange={e => setDensity(e.target.value)} className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2">
                <option value="comfortable">Comfortable</option>
                <option value="compact">Compact</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-white/80 mb-2">Favicon</label>
              <input type="file" accept="image/*" className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2" />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <button onClick={save} className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-6 py-3 rounded-xl font-semibold">
          Save preferences
        </button>
      </div>
    </div>
  );
}