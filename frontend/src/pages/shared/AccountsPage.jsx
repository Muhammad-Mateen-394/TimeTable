import { useEffect, useState } from "react";
import { Plus, Users } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import { Card, Badge, EmptyState } from "../../components/common/Card";
import { Field, Input, Select } from "../../components/common/FormControls";
import { Modal } from "../../components/common/Drawer";
import { apiRequest } from "../../services/apiClient";
import { useAuthStore } from "../../store/useAuthStore";

export default function AccountsPage() {
  const user = useAuthStore((state) => state.user);
  const [accounts, setAccounts] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: user?.role === "principal" ? "manager" : "teacher", employee_code: "", specialization: "" });
  const [error, setError] = useState("");

  const load = async () => {
    const response = await apiRequest("/accounts");
    setAccounts(response.data);
  };

  useEffect(() => { load().catch((requestError) => setError(requestError.message)); }, []);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      await apiRequest("/accounts", { method: "POST", body: JSON.stringify(form) });
      setOpen(false);
      setForm({ name: "", email: "", password: "", role: user?.role === "principal" ? "manager" : "teacher", employee_code: "", specialization: "" });
      await load();
    } catch (requestError) {
      setError(requestError.message || "Could not create account.");
    }
  };

  return <div>
    <PageHeader title="Accounts" subtitle="Create and manage school user accounts" actions={<Button icon={Plus} onClick={() => setOpen(true)}>Create Account</Button>} />
    <Card padded={false} className="overflow-x-auto">
      {accounts.length === 0 ? <EmptyState icon={Users} title="No accounts found" description="Create a manager or teacher account." /> : <table className="w-full min-w-[680px]"><thead><tr className="text-left text-xs uppercase text-ink-900/45 border-b border-black/[0.06]"><th className="px-5 py-3">Name</th><th className="px-5 py-3">Email</th><th className="px-5 py-3">Role</th><th className="px-5 py-3">Status</th></tr></thead><tbody>{accounts.map((account) => <tr key={account.id} className="border-b border-black/[0.04]"><td className="px-5 py-3 text-sm">{account.name}</td><td className="px-5 py-3 text-sm text-ink-900/60">{account.email}</td><td className="px-5 py-3"><Badge>{account.role}</Badge></td><td className="px-5 py-3 text-sm">{account.status || "active"}</td></tr>)}</tbody></table>}
    </Card>
    <Modal open={open} onClose={() => setOpen(false)} title="Create account" subtitle="Credentials are shared securely with the new user.">
      <form className="space-y-4" onSubmit={submit}>
        <Field label="Name"><Input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></Field>
        <Field label="Email"><Input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></Field>
        <Field label="Temporary password"><Input required minLength={8} type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /></Field>
        <Field label="Role"><Select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}><option value="teacher">Teacher</option>{user?.role === "principal" && <option value="manager">Manager</option>}</Select></Field>
        {form.role === "teacher" && <><Field label="Employee code"><Input value={form.employee_code} onChange={(event) => setForm({ ...form, employee_code: event.target.value })} placeholder="T001" /></Field><Field label="Specialization"><Input value={form.specialization} onChange={(event) => setForm({ ...form, specialization: event.target.value })} /></Field></>}
        {error && <p className="text-sm text-clash-red">{error}</p>}
        <div className="flex justify-end"><Button type="submit">Create account</Button></div>
      </form>
    </Modal>
  </div>;
}
