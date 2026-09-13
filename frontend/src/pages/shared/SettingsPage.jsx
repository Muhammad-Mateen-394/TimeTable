import { useEffect, useState } from "react";
import PageHeader from "../../components/common/PageHeader";
import { Card } from "../../components/common/Card";
import { Field, Input, Select } from "../../components/common/FormControls";
import Button from "../../components/common/Button";
import { useAuthStore } from "../../store/useAuthStore";
import { useAppStore } from "../../store/useAppStore";
import { apiRequest } from "../../services/apiClient";

export default function SettingsPage() {
  const school = useAuthStore((state) => state.user?.school);
  const updateSchool = useAuthStore((state) => state.updateSchool);
  const academicYears = useAppStore((state) => state.academicYears);
  const createAcademicYear = useAppStore((state) => state.createAcademicYear);
  const periods = useAppStore((state) => state.periods);
  const createPeriod = useAppStore((state) => state.createPeriod);
  const [yearForm, setYearForm] = useState({ name: "", start_date: "", end_date: "" });
  const [schoolForm, setSchoolForm] = useState({ name: school?.name || "", campus: school?.campus || "" });
  const [message, setMessage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [addingYear, setAddingYear] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current_password: "", password: "", password_confirmation: "" });
  const [periodForm, setPeriodForm] = useState({ name: "Period 1", period_number: 1, start_time: "08:00", end_time: "08:45" });
  const [addingPeriod, setAddingPeriod] = useState(false);

  const nextPeriodNumber = periods.length ? Math.max(...periods.map((period) => Number(period.period_number))) + 1 : 1;

  useEffect(() => {
    if (!addingPeriod && periods.length && !periods.some((period) => Number(period.period_number) === Number(periodForm.period_number))) {
      return;
    }
    if (!addingPeriod && periods.some((period) => Number(period.period_number) === Number(periodForm.period_number))) {
      setPeriodForm((current) => ({ ...current, name: `Period ${nextPeriodNumber}`, period_number: nextPeriodNumber }));
    }
  }, [periods, addingPeriod, periodForm.period_number, nextPeriodNumber]);

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await updateSchool(schoolForm);
      setMessage({ type: "success", text: "Settings saved." });
    } catch (error) {
      setMessage({ type: "error", text: error.message || "Could not save settings." });
    } finally {
      setSaving(false);
    }
  };

  const handleAddYear = async (event) => {
    event.preventDefault();
    setAddingYear(true);
    setMessage(null);
    try {
      await createAcademicYear({ ...yearForm, is_current: academicYears.length === 0 });
      setYearForm({ name: "", start_date: "", end_date: "" });
      setMessage({ type: "success", text: "Academic year added." });
    } catch (error) {
      setMessage({ type: "error", text: error.message || "Could not add academic year." });
    } finally {
      setAddingYear(false);
    }
  };

  const handlePassword = async (event) => {
    event.preventDefault();
    setMessage(null);
    try {
      await apiRequest("/auth/password", { method: "PUT", body: JSON.stringify(passwordForm) });
      setPasswordForm({ current_password: "", password: "", password_confirmation: "" });
      setMessage({ type: "success", text: "Password changed successfully." });
    } catch (error) {
      setMessage({ type: "error", text: error.message || "Could not change password." });
    }
  };

  const handleAddPeriod = async (event) => {
    event.preventDefault();
    setAddingPeriod(true);
    setMessage(null);
    try {
      await createPeriod({ ...periodForm, period_number: Number(periodForm.period_number), is_break: false, is_active: true });
      const next = Number(periodForm.period_number) + 1;
      setPeriodForm({ name: `Period ${next}`, period_number: next, start_time: "08:45", end_time: "09:30" });
      setMessage({ type: "success", text: "Period added." });
    } catch (error) {
      const validationMessage = error.errors?.period_number?.[0];
      setMessage({ type: "error", text: validationMessage || error.message || "Could not add period." });
    } finally {
      setAddingPeriod(false);
    }
  };

  return (
    <div>
      <PageHeader title="Settings" subtitle="School profile and academic year configuration" />
      <div className="grid lg:grid-cols-2 gap-4 max-w-3xl">
        <Card>
          <h3 className="font-serif text-lg text-ink-950 mb-4">School Profile</h3>
          <div className="space-y-4">
            <Field label="School name"><Input value={schoolForm.name} onChange={(event) => setSchoolForm({ ...schoolForm, name: event.target.value })} /></Field>
            <Field label="Campus"><Input value={schoolForm.campus} onChange={(event) => setSchoolForm({ ...schoolForm, campus: event.target.value })} /></Field>
            <Field label="Academic year">
              <Select defaultValue={academicYears[0]?.name || ""}>
                <option value="">Select an academic year</option>
                {academicYears.map((year) => <option key={year.id} value={year.name}>{year.name}</option>)}
              </Select>
            </Field>
          </div>
        </Card>
        <Card>
          <h3 className="font-serif text-lg text-ink-950 mb-4">Working Week</h3>
          <div className="space-y-4">
            <Field label="Working days"><Select defaultValue="6"><option value="5">Monday - Friday</option><option value="6">Monday - Saturday</option></Select></Field>
            <Field label="Periods per day"><Input type="number" defaultValue={8} /></Field>
            <Field label="Period duration (minutes)"><Input type="number" defaultValue={45} /></Field>
          </div>
        </Card>
      </div>
      <Card className="mt-4 max-w-3xl">
        <h3 className="font-serif text-lg text-ink-950 mb-4">Create Academic Year</h3>
        <form className="grid md:grid-cols-4 gap-3 items-end" onSubmit={handleAddYear}>
          <Field label="Name"><Input required value={yearForm.name} onChange={(event) => setYearForm({ ...yearForm, name: event.target.value })} placeholder="2026-27" /></Field>
          <Field label="Start date"><Input required type="date" value={yearForm.start_date} onChange={(event) => setYearForm({ ...yearForm, start_date: event.target.value })} /></Field>
          <Field label="End date"><Input required type="date" value={yearForm.end_date} onChange={(event) => setYearForm({ ...yearForm, end_date: event.target.value })} /></Field>
          <Button type="submit" disabled={addingYear}>{addingYear ? "Adding..." : "Add Academic Year"}</Button>
        </form>
      </Card>
      <Card className="mt-4 max-w-3xl">
        <h3 className="font-serif text-lg text-ink-950 mb-1">Create Periods</h3>
        <p className="text-sm text-ink-900/50 mb-4">{periods.length} periods configured. Add the periods used in your school day before editing a timetable.</p>
        <form className="grid md:grid-cols-4 gap-3 items-end" onSubmit={handleAddPeriod}>
          <Field label="Name"><Input required value={periodForm.name} onChange={(event) => setPeriodForm({ ...periodForm, name: event.target.value })} /></Field>
          <Field label="Number"><Input required type="number" min="1" value={periodForm.period_number} onChange={(event) => setPeriodForm({ ...periodForm, period_number: event.target.value })} /></Field>
          <Field label="Start"><Input required type="time" value={periodForm.start_time} onChange={(event) => setPeriodForm({ ...periodForm, start_time: event.target.value })} /></Field>
          <Field label="End"><Input required type="time" value={periodForm.end_time} onChange={(event) => setPeriodForm({ ...periodForm, end_time: event.target.value })} /></Field>
          <Button type="submit" className="md:col-span-4" disabled={addingPeriod || periods.some((period) => Number(period.period_number) === Number(periodForm.period_number))}>{addingPeriod ? "Adding..." : "Add Period"}</Button>
        </form>
      </Card>
      <Card className="mt-4 max-w-3xl">
        <h3 className="font-serif text-lg text-ink-950 mb-4">Change Password</h3>
        <form className="grid md:grid-cols-3 gap-3 items-end" onSubmit={handlePassword}>
          <Field label="Current password"><Input required type="password" value={passwordForm.current_password} onChange={(event) => setPasswordForm({ ...passwordForm, current_password: event.target.value })} /></Field>
          <Field label="New password"><Input required minLength={8} type="password" value={passwordForm.password} onChange={(event) => setPasswordForm({ ...passwordForm, password: event.target.value })} /></Field>
          <Field label="Confirm password"><Input required minLength={8} type="password" value={passwordForm.password_confirmation} onChange={(event) => setPasswordForm({ ...passwordForm, password_confirmation: event.target.value })} /></Field>
          <Button type="submit" className="md:col-span-3">Change password</Button>
        </form>
      </Card>
      {message && <p className={`mt-4 text-sm ${message.type === "error" ? "text-clash-red" : "text-clash-green"}`}>{message.text}</p>}
      <form onSubmit={handleSave}>
        <Button type="submit" className="mt-5" disabled={saving}>{saving ? "Saving..." : "Save changes"}</Button>
      </form>
    </div>
  );
}
