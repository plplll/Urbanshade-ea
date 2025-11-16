import { useState } from "react";
import { Lock, Terminal as TerminalIcon } from "lucide-react";

interface LoginScreenProps {
  onLogin: () => void;
}

export const LoginScreen = ({ onLogin }: LoginScreenProps) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!username || !password) {
      setError("Please enter username and password");
      return;
    }

    setLoading(true);

    // Check against stored admin credentials
    setTimeout(() => {
      const adminData = localStorage.getItem("urbanshade_admin");
      
      if (adminData) {
        const admin = JSON.parse(adminData);
        if (username === admin.username && password === admin.password) {
          onLogin();
        } else {
          setError("Invalid credentials");
          setLoading(false);
        }
      } else {
        setError("System error: No administrator account found");
        setLoading(false);
      }
    }, 1500);
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-background relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse"></div>
      </div>

      <div className="relative z-10 w-full max-w-md p-8 animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4 animate-scale-in">
            <TerminalIcon className="w-16 h-16 text-primary urbanshade-glow" />
          </div>
          <h1 className="text-4xl font-bold mb-2 text-primary animate-fade-in" style={{ animationDelay: '100ms' }}>URBANSHADE</h1>
          <p className="text-sm text-muted-foreground font-mono animate-fade-in" style={{ animationDelay: '200ms' }}>
            SECURE OPERATING SYSTEM v3.2.1
          </p>
          <div className="mt-4 text-xs text-muted-foreground font-mono animate-fade-in" style={{ animationDelay: '300ms' }}>
            [CLASSIFIED FACILITY] • DEPTH: 8,247m • PRESSURE: EXTREME
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4 animate-fade-in" style={{ animationDelay: '400ms' }}>
          <div className="glass-panel p-6 space-y-4">
            <div className="flex items-center gap-2 mb-4 text-primary">
              <Lock className="w-5 h-5" />
              <span className="font-bold text-sm">AUTHENTICATION REQUIRED</span>
            </div>

            <div>
              <label className="block text-xs text-muted-foreground mb-2 font-mono">
                USERNAME
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-lg text-foreground font-mono text-sm focus:border-primary/50 focus:outline-none transition-all duration-200 focus:scale-[1.02]"
                placeholder="Enter username"
                disabled={loading}
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs text-muted-foreground mb-2 font-mono">
                PASSWORD
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-lg text-foreground font-mono text-sm focus:border-primary/50 focus:outline-none transition-all duration-200 focus:scale-[1.02]"
                placeholder="Enter password"
                disabled={loading}
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs font-mono animate-fade-in">
                ⚠ ERROR: {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 rounded-lg bg-primary/20 border border-primary/30 text-primary font-bold hover:bg-primary/30 transition-all duration-200 hover-scale disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "AUTHENTICATING..." : "LOGIN"}
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-muted-foreground font-mono space-y-1 animate-fade-in" style={{ animationDelay: '500ms' }}>
          <div>© 2024 Urbanshade Corporation</div>
          <div className="text-destructive">⚠ UNAUTHORIZED ACCESS IS PROHIBITED</div>
        </div>
      </div>
    </div>
  );
};
