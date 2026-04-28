import { useState } from "react";
import { useAuth, getRoleDashboardPath } from "../context/AuthContext";
import type { Route } from "./+types/login";

export function meta({}: Route.MetaArgs) {
  return [{ title: "ERUDITE - Secure Login" }];
}

export default function Login() {
  const { login, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const user = await login(email, password);
    if (user) {
      window.location.href = getRoleDashboardPath(user.role);
    } else {
      setError("Invalid credentials. Please try again.");
    }
  }

  return (
    <div className="min-h-screen flex w-full font-sans bg-surface-container-lowest">
      {/* Left Side: Branding */}
      <div className="hidden lg:flex flex-1 relative bg-primary text-white overflow-hidden flex-col justify-between p-12">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-secondary opacity-30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-tertiary-fixed-dim opacity-20 rounded-full blur-3xl"></div>
          <div className="absolute top-[40%] left-[20%] w-[300px] h-[300px] bg-white opacity-5 rounded-full blur-2xl"></div>
        </div>
        <div className="relative z-10">
          <div className="font-manrope text-xl font-black tracking-[0.2em] uppercase opacity-80 mb-2">Intelligent Atelier</div>
          <div className="text-display-lg text-6xl font-extrabold tracking-tight">ERUDITE.</div>
        </div>
        <div className="relative z-10 max-w-lg">
          <h2 className="text-3xl font-bold mb-4 leading-tight">Master your academic ecosystem.</h2>
          <p className="text-blue-100 text-lg opacity-80 leading-relaxed font-body">
            Access intelligent monitoring, curriculum catalogs, and institutional analytics through a unified, secure dashboard.
          </p>
        </div>
        <div className="relative z-10 text-sm font-semibold opacity-60">
          &copy; {new Date().getFullYear()} ERUDITE Systems Inc.
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 sm:p-12 md:p-16 bg-surface-container-lowest relative overflow-y-auto">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-10">
            <div className="font-manrope text-xs font-black tracking-[0.2em] text-slate-500 uppercase mb-2">Intelligent Atelier</div>
            <div className="text-4xl font-extrabold text-primary tracking-tight">ERUDITE.</div>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-primary tracking-tight mb-3">Welcome Back</h1>
            <p className="text-slate-500 font-medium">Sign in to your portal.</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-bold text-primary block" htmlFor="email">Email Address</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">mail</span>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-surface-container-low border border-transparent rounded-xl text-sm focus:border-secondary focus:ring-4 focus:ring-secondary/10 outline-none transition-all font-medium text-slate-700"
                  placeholder="admin@admin.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-primary block" htmlFor="password">Password</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">lock</span>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-4 bg-surface-container-low border border-transparent rounded-xl text-sm focus:border-secondary focus:ring-4 focus:ring-secondary/10 outline-none transition-all font-medium text-slate-700"
                  required
                />
              </div>
            </div>

            {error && (
              <p className="text-error text-sm font-bold">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 disabled:bg-slate-400 text-white font-bold py-4 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined text-[20px] animate-spin">hourglass_bottom</span>
                  Signing In...
                </>
              ) : (
                <>
                  Secure Sign In
                  <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm font-medium text-slate-500">
              Don't have an account? <a href="mailto:admin@erudite.edu" className="font-bold text-secondary hover:text-primary transition-colors">Contact Administrator</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
