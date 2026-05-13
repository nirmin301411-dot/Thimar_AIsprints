import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { register as registerApi } from "../api/auth";

export default function Login() {
  const { login } = useAuth();
  const [isRegister, setIsRegister] = useState(false);

  // Login state
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Register state
  const [regName, setRegName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regNationalId, setRegNationalId] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regRole, setRegRole] = useState<"investor" | "farmer">("investor");
  const [regGov, setRegGov] = useState("");
  const [regSuccess, setRegSuccess] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(phone, password);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setRegSuccess("");
    setLoading(true);
    try {
      await registerApi({
        name: regName,
        phone: regPhone,
        national_id: regNationalId,
        password: regPassword,
        role: regRole,
        governorate: regGov || undefined,
      });
      // Auto-login after successful registration
      await login(regPhone, regPassword);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = "w-full px-4 py-3 bg-background border border-white/10 rounded-xl text-sm text-textMain focus:outline-none focus:border-primary transition-colors placeholder:text-textMuted";

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 animate-fade-in font-sans">
      <div className="w-full max-w-[420px] bg-surface/40 backdrop-blur-md border border-white/5 rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(ellipse_at_center,rgba(0,255,102,0.05)_0%,rgba(0,0,0,0)_60%)] pointer-events-none" />
        
        {/* Logo */}
        <div className="text-center mb-8 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-[#059669] flex items-center justify-center text-3xl font-extrabold text-background mx-auto mb-4 shadow-[0_0_20px_rgba(0,255,102,0.3)]">
            ث
          </div>
          <h1 className="text-2xl font-bold text-textMain tracking-tight">
            Thimar
          </h1>
          <p className="text-sm text-textSecondary mt-1">
            Agricultural Investment Platform
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex mb-8 bg-surfaceHighlight/30 rounded-xl p-1 relative z-10">
          <button
            onClick={() => { setIsRegister(false); setError(""); setRegSuccess(""); }}
            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${
              !isRegister 
                ? "bg-surface shadow-md text-primary" 
                : "text-textMuted hover:text-textSecondary"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setIsRegister(true); setError(""); setRegSuccess(""); }}
            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${
              isRegister 
                ? "bg-surface shadow-md text-accent-amber" 
                : "text-textMuted hover:text-textSecondary"
            }`}
          >
            Register
          </button>
        </div>

        {/* ─── Login Form ─── */}
        {!isRegister && (
          <form onSubmit={handleLogin} className="relative z-10">
            <div className="mb-4">
              <label className="block text-xs font-bold text-textSecondary uppercase tracking-wider mb-2">
                Phone Number
              </label>
              <input id="login-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                placeholder="01xxxxxxxxx" required className={inputStyle} />
            </div>
            <div className="mb-6">
              <label className="block text-xs font-bold text-textSecondary uppercase tracking-wider mb-2">
                Password
              </label>
              <input id="login-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" required className={inputStyle} />
            </div>

            {error && (
              <div className="p-3 mb-6 bg-danger/10 border border-danger/20 rounded-xl text-danger text-sm font-medium">
                {error}
              </div>
            )}

            <button type="submit" id="login-submit" disabled={loading} className="w-full flex items-center justify-center bg-primary hover:bg-primary/90 text-background px-4 py-3.5 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(0,255,102,0.3)] disabled:opacity-50">
              {loading ? "Signing in..." : "Sign In"}
            </button>

            <p className="text-xs text-textMuted text-center mt-6">
              Demo → phone: <strong className="text-textSecondary">01222222221</strong> / password: <strong className="text-textSecondary">invest123</strong>
            </p>
          </form>
        )}

        {/* ─── Register Form ─── */}
        {isRegister && (
          <form onSubmit={handleRegister} className="relative z-10">
            <div className="mb-4">
              <label className="block text-xs font-bold text-textSecondary uppercase tracking-wider mb-2">Full Name</label>
              <input id="register-name" type="text" value={regName} onChange={(e) => setRegName(e.target.value)}
                placeholder="Ahmed Hassan" required className={inputStyle} />
            </div>
            <div className="mb-4">
              <label className="block text-xs font-bold text-textSecondary uppercase tracking-wider mb-2">Phone Number</label>
              <input id="register-phone" type="tel" value={regPhone} onChange={(e) => setRegPhone(e.target.value)}
                placeholder="01xxxxxxxxx" required className={inputStyle} />
            </div>
            <div className="mb-4">
              <label className="block text-xs font-bold text-textSecondary uppercase tracking-wider mb-2">National ID</label>
              <input id="register-national-id" type="text" value={regNationalId} onChange={(e) => setRegNationalId(e.target.value)}
                placeholder="29901010000099" required className={inputStyle} />
            </div>
            <div className="mb-4">
              <label className="block text-xs font-bold text-textSecondary uppercase tracking-wider mb-2">Password</label>
              <input id="register-password" type="password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)}
                placeholder="••••••••" required className={inputStyle} />
            </div>
            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <label className="block text-xs font-bold text-textSecondary uppercase tracking-wider mb-2">Role</label>
                <select id="register-role" value={regRole} onChange={(e) => setRegRole(e.target.value as "investor" | "farmer")}
                  className={inputStyle}>
                  <option value="investor">Investor</option>
                  <option value="farmer">Farmer</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-xs font-bold text-textSecondary uppercase tracking-wider mb-2">Governorate</label>
                <input id="register-governorate" type="text" value={regGov} onChange={(e) => setRegGov(e.target.value)}
                  placeholder="Cairo" className={inputStyle} />
              </div>
            </div>

            {error && (
              <div className="p-3 mb-6 bg-danger/10 border border-danger/20 rounded-xl text-danger text-sm font-medium">
                {error}
              </div>
            )}
            {regSuccess && (
              <div className="p-3 mb-6 bg-success/10 border border-success/20 rounded-xl text-success text-sm font-medium">
                {regSuccess}
              </div>
            )}

            <button type="submit" id="register-submit" disabled={loading} className="w-full flex items-center justify-center bg-accent-amber hover:bg-accent-amber/90 text-background px-4 py-3.5 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)] disabled:opacity-50">
              {loading ? "Registering..." : "Create Account"}
            </button>

            <p className="text-xs text-textMuted text-center mt-6">
              Registration triggers KYC verification
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
