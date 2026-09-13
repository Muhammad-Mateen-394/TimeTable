import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  ArrowRight,
  Zap,
  ShieldCheck,
  Users2,
  FileDown,
} from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import Button from "../../components/common/Button";
import { Field, Input } from "../../components/common/FormControls";
import { Link } from "react-router-dom";

const FEATURES = [
  { icon: Zap, label: "AI auto-generation" },
  { icon: ShieldCheck, label: "Conflict detection" },
  { icon: Users2, label: "Teacher workload balancing" },
  { icon: FileDown, label: "Approval workflows" },
];

export default function Login() {
  const { login, error, clearError } = useAuthStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    setSubmitting(true);
    const res = await login(email, password);
    setSubmitting(false);
    if (res.ok) navigate(`/${res.user.role}/dashboard`);
  };

  return (
    <div className="min-h-screen flex bg-cream">
      {/* Left brand panel */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] bg-forest-dark text-cream p-10">
        <div>
          <div className="font-serif text-2xl mb-4">
            Table <span className="text-mint">Table</span>
          </div>
          <p className="text-cream/60 text-sm leading-relaxed max-w-xs">
            Intelligent timetable scheduling for Pakistani schools. Manage
            classes, teachers, and rooms from one place.
          </p>
        </div>

        <div>
          <div className="text-[11px] uppercase tracking-wider text-cream/35 mb-3">
            Features
          </div>
          <ul className="space-y-2.5">
            {FEATURES.map(({ label }) => (
              <li
                key={label}
                className="flex items-center gap-2.5 text-sm text-cream/75"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-mint" />
                {label}
              </li>
            ))}
          </ul>
        </div>

        <div className="text-xs text-cream/30">
          Sign in to your school workspace
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="lg:hidden font-serif text-2xl mb-8 text-center">
            Table <span className="text-forest">Table</span>
          </div>

          <h1 className="font-serif text-2xl text-ink-950">Sign in</h1>
          <p className="text-sm text-ink-900/50 mt-1 mb-6">
            Access your school timetable system
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Email">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@school.edu.pk"
                required
              />
            </Field>

            <Field label="Password">
              <div className="relative">
                <Input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-900/40 hover:text-ink-900"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </Field>

            {error && (
              <p className="text-xs text-clash-red bg-clash-red/5 border border-clash-red/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-ink-900/60">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="accent-forest"
                />
                Remember me
              </label>
              <button type="button" className="text-forest hover:underline">
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={submitting}
            >
              {submitting ? "Signing in…" : "Sign In"}
              <ArrowRight size={16} />
            </Button>
          </form>
          <p className="text-sm text-center text-ink-900/50 mt-5">New school? <Link className="text-forest hover:underline" to="/signup">Create an account</Link></p>
        </div>
      </div>
    </div>
  );
}
