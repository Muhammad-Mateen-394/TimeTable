import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Zap, ShieldCheck, Users2, FileDown } from "lucide-react";
import Button from "../../components/common/Button";
import { Field, Input } from "../../components/common/FormControls";
import { useAuthStore } from "../../store/useAuthStore";

const FEATURES = [
  { icon: Zap, label: "AI auto-generation" },
  { icon: ShieldCheck, label: "Conflict detection" },
  { icon: Users2, label: "Teacher workload balancing" },
  { icon: FileDown, label: "Approval workflows" },
];

export default function Signup() {
  const signup = useAuthStore((state) => state.signup);
  const error = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);
  const navigate = useNavigate();
  const [form, setForm] = useState({ school_name: "", campus: "", name: "", email: "", password: "", password_confirmation: "" });
  const [submitting, setSubmitting] = useState(false);

  const update = (key) => (event) => setForm({ ...form, [key]: event.target.value });
  const submit = async (event) => {
    event.preventDefault();
    clearError();
    setSubmitting(true);
    const result = await signup(form);
    setSubmitting(false);
    if (result.ok) navigate("/principal/dashboard");
  };

  return (
    <div className="min-h-screen flex bg-cream">
      <div className="hidden lg:flex flex-col justify-between w-[420px] bg-forest-dark text-cream p-10">
        <div>
          <div className="font-serif text-2xl mb-4">Table <span className="text-mint">Table</span></div>
          <p className="text-cream/60 text-sm leading-relaxed max-w-xs">Intelligent timetable scheduling for Pakistani schools. Manage classes, teachers, and rooms from one place.</p>
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-wider text-cream/35 mb-3">Features</div>
          <ul className="space-y-2.5">
            {FEATURES.map(({ icon: Icon, label }) => <li key={label} className="flex items-center gap-2.5 text-sm text-cream/75"><Icon size={15} className="text-mint" />{label}</li>)}
          </ul>
        </div>
        <div className="text-xs text-cream/30">Create a new school workspace</div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-lg">
          <div className="lg:hidden font-serif text-2xl mb-8 text-center">Table <span className="text-forest">Table</span></div>
          <h1 className="font-serif text-2xl text-ink-950">Create your school account</h1>
          <p className="text-sm text-ink-900/50 mt-1 mb-6">You will become the principal of the new school workspace.</p>
          <form onSubmit={submit} className="space-y-4">
            <Field label="School name"><Input required value={form.school_name} onChange={update("school_name")} /></Field>
            <Field label="Campus"><Input value={form.campus} onChange={update("campus")} /></Field>
            <Field label="Your name"><Input required value={form.name} onChange={update("name")} /></Field>
            <Field label="Email"><Input required type="email" value={form.email} onChange={update("email")} /></Field>
            <div className="grid sm:grid-cols-2 gap-3"><Field label="Password"><Input required minLength={8} type="password" value={form.password} onChange={update("password")} /></Field><Field label="Confirm password"><Input required minLength={8} type="password" value={form.password_confirmation} onChange={update("password_confirmation")} /></Field></div>
            {error && <p className="text-xs text-clash-red bg-clash-red/5 border border-clash-red/20 rounded-lg px-3 py-2">{error}</p>}
            <Button type="submit" className="w-full" size="lg" disabled={submitting}>{submitting ? "Creating..." : "Create account"}<ArrowRight size={16} /></Button>
          </form>
          <p className="text-sm text-center text-ink-900/50 mt-5">Already registered? <Link className="text-forest hover:underline" to="/login">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
}