import React, { useEffect, useState } from 'react';
import api from './api/axios';
import { Activity, CheckCircle2, Shield, Database, AlertCircle } from 'lucide-react';

export default function App() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .get('/health')
      .then((res) => {
        setHealth(res.data?.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.message || err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6">
      <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6">
        <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
          <div className="p-3 bg-sky-500/10 rounded-xl text-sky-400">
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">CampusFix</h1>
            <p className="text-sm text-slate-400">System Foundation & Health Monitor</p>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
            <Activity className="w-5 h-5 text-sky-400" /> API Health Status
          </h2>

          {loading ? (
            <div className="p-4 bg-slate-800/50 rounded-xl animate-pulse text-slate-400 text-sm">
              Checking backend connection...
            </div>
          ) : error ? (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 flex items-center gap-3 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>Backend Disconnected: {error}</span>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 flex items-center justify-between">
                <span className="flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-5 h-5" /> Server Operational
                </span>
                <span className="text-xs px-2.5 py-1 bg-emerald-500/20 rounded-full font-mono uppercase">200 OK</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-800/80">
                  <span className="text-slate-400 block text-xs">Database State</span>
                  <span className="font-mono text-sky-300 flex items-center gap-1.5 mt-1">
                    <Database className="w-4 h-4 text-sky-400" /> {health?.dbState || 'unknown'}
                  </span>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-800/80">
                  <span className="text-slate-400 block text-xs">Server Uptime</span>
                  <span className="font-mono text-slate-200 block mt-1">
                    {health?.uptime ? `${Math.floor(health.uptime)}s` : '0s'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="text-xs text-slate-500 text-center border-t border-slate-800 pt-4">
          Phase 1 Foundation — Strictly Layered Modular Monorepo Architecture
        </div>
      </div>
    </div>
  );
}
