import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Zap, ArrowRight, ArrowLeft, CheckCircle2, Circle, AlertTriangle,
  RefreshCw, Send, Save, Eye, Sparkles,
} from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import { Card } from "../../components/common/Card";
import Toggle from "../../components/common/Toggle";
import StepIndicator from "../../components/timetable/StepIndicator";
import { useAppStore } from "../../store/useAppStore";
import { generateTimetable } from "../../services/mockServices";
import { apiRequest } from "../../services/apiClient";

const STEPS = ["Select Scope", "Constraints", "Priorities", "Review & Generate"];

const PROGRESS_STAGES = [
  "Loading school data",
  "Checking teacher availability",
  "Applying constraints",
  "Scheduling lessons",
  "Balancing workload",
  "Validating timetable",
  "Final optimization",
];

export default function GenerateWizard() {
  const navigate = useNavigate();
  const constraints = useAppStore((s) => s.constraints);
  const toggleConstraint = useAppStore((s) => s.toggleConstraint);
  const setApprovalStatus = useAppStore((s) => s.setApprovalStatus);
  const pushNotification = useAppStore((s) => s.pushNotification);
  const classes = useAppStore((s) => s.classes);
  const academicYears = useAppStore((s) => s.academicYears);
  const hydrateFromApi = useAppStore((s) => s.hydrateFromApi);

  const [phase, setPhase] = useState("wizard"); // wizard | progress | result
  const [step, setStep] = useState(1);
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedSections, setSelectedSections] = useState([]);
  const [priorities, setPriorities] = useState({
    balanceWorkload: 4,
    morningCore: 4,
    minimizeGaps: 3,
    avoidConsecutive: 3,
    avoidRepeats: 3,
  });
  const [stageIndex, setStageIndex] = useState(0);
  const [result, setResult] = useState(null);
  const [generationError, setGenerationError] = useState("");
  const [assignmentCount, setAssignmentCount] = useState(null);

  const grades = [...new Set(classes.map((item) => item.grade))];
  const availableSections = classes.filter((item) => item.grade === selectedGrade).map((item) => item.section);
  const targetClasses = classes.filter((item) => item.grade === selectedGrade && selectedSections.includes(item.section));

  useEffect(() => {
    apiRequest("/assignments").then((response) => setAssignmentCount(response.data?.length || 0)).catch(() => setAssignmentCount(null));
  }, []);

  useEffect(() => {
    if (!selectedGrade && grades.length) setSelectedGrade(grades[0]);
  }, [grades, selectedGrade]);

  useEffect(() => {
    setSelectedSections(availableSections);
  }, [selectedGrade, availableSections.join(",")]);

  const toggleSection = (s) =>
    setSelectedSections((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  const hardConstraints = constraints.filter((c) => c.severity === "hard");
  const softConstraints = constraints.filter((c) => c.severity === "soft");

  const runGeneration = async () => {
    setGenerationError("");
    setPhase("progress");
    setStageIndex(0);
    for (let i = 0; i < PROGRESS_STAGES.length; i++) {
      await new Promise((r) => setTimeout(r, 450));
      setStageIndex(i + 1);
    }
    try {
      const res = await generateTimetable({ selectedGrade, selectedSections, priorities, academicYearId: academicYears[0]?.id });
      await hydrateFromApi();
      setResult(res);
      await new Promise((r) => setTimeout(r, 300));
      setPhase("result");
    } catch (error) {
      setGenerationError(error.message || "Generation failed.");
      setPhase("wizard");
    }
  };

  const handleSubmitForApproval = async () => {
    if (!result?.timetableId) {
      setGenerationError("No generated timetable to submit. Please generate one first.");
      return;
    }
    try {
      await apiRequest(`/timetables/${result.timetableId}/submit`, { method: "POST" });
      targetClasses.forEach((c) => setApprovalStatus(c.id, "Under Review"));
      pushNotification({
        type: "info",
        title: "Timetable Submitted for Approval",
        message: `${selectedGrade} (${selectedSections.join(", ")}) submitted for principal review.`,
      });
      navigate("/manager/dashboard");
    } catch (error) {
      setGenerationError(error.message || "Could not submit the timetable for approval.");
    }
  };

  // ---------------- Progress screen ----------------
  if (phase === "progress") {
    return (
      <div className="max-w-xl mx-auto py-16 text-center">
        <div className="w-14 h-14 rounded-full bg-forest/10 text-forest flex items-center justify-center mx-auto mb-5">
          <RefreshCw size={24} className="animate-spin" style={{ animationDuration: "2.5s" }} />
        </div>
        <h1 className="font-serif text-2xl text-ink-950 mb-1">Generating optimal timetable…</h1>
        <p className="text-sm text-ink-900/50 mb-8">
          Scheduling {targetClasses.length} timetable{targetClasses.length !== 1 ? "s" : ""} for {selectedGrade}
        </p>
        <Card className="text-left">
          <ul className="space-y-3">
            {PROGRESS_STAGES.map((label, i) => {
              const done = i < stageIndex;
              const active = i === stageIndex;
              return (
                <li key={label} className="flex items-center gap-3 text-sm">
                  {done ? (
                    <CheckCircle2 size={17} className="text-clash-green shrink-0" />
                  ) : active ? (
                    <RefreshCw size={17} className="text-forest animate-spin shrink-0" style={{ animationDuration: "1s" }} />
                  ) : (
                    <Circle size={17} className="text-ink-900/20 shrink-0" />
                  )}
                  <span className={done ? "text-ink-900/50 line-through" : active ? "text-ink-900 font-medium" : "text-ink-900/35"}>
                    {label}
                  </span>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>
    );
  }

  // ---------------- Result screen ----------------
  if (phase === "result" && result) {
    return (
      <div className="max-w-2xl mx-auto py-10">
        {generationError && <p className="mb-4 text-sm text-clash-red bg-clash-red/5 border border-clash-red/20 rounded-lg px-3 py-2">{generationError}</p>}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-full bg-clash-green/10 text-clash-green flex items-center justify-center mx-auto mb-4">
            <Sparkles size={24} />
          </div>
          <h1 className="font-serif text-2xl text-ink-950">Timetable Generated Successfully</h1>
          <p className="text-sm text-ink-900/50 mt-1">Quality Score</p>
          <div className="font-serif text-5xl text-forest mt-1">{result.qualityScore}%</div>
        </div>

        <Card className="mb-4">
          <div className="grid grid-cols-2 gap-3">
            <MetricRow ok label="Teacher Clashes" value={result.teacherClashes} />
            <MetricRow ok label="Class Clashes" value={result.classClashes} />
            <MetricRow ok label="Room Clashes" value={result.roomClashes} />
            <MetricRow ok label="Weekly Requirements" value="Satisfied" />
            <MetricRow ok label="Teacher Workload" value="Balanced" />
          </div>
        </Card>

        {result.softWarnings > 0 && (
          <Card className="mb-6 !bg-clash-amber/5 !border-clash-amber/20 flex items-start gap-3">
            <AlertTriangle size={18} className="text-clash-amber shrink-0 mt-0.5" />
            <p className="text-sm text-ink-900/70">
              {result.softWarnings} soft preferences could not be fully optimized (e.g. minor teacher gaps). Hard constraints were all satisfied.
            </p>
          </Card>
        )}

        <div className="flex flex-wrap gap-2 justify-center">
          <Button variant="secondary" icon={Eye} onClick={() => navigate("/manager/timetable")}>Review Timetable</Button>
          <Button variant="secondary" icon={RefreshCw} onClick={runGeneration}>Regenerate</Button>
          <Button variant="secondary" icon={Save} onClick={() => navigate("/manager/dashboard")}>Save Draft</Button>
          <Button icon={Send} onClick={handleSubmitForApproval}>Submit for Approval</Button>
        </div>
      </div>
    );
  }

  // ---------------- Wizard screens ----------------
  return (
    <div className="max-w-3xl">
      <PageHeader title="Auto-Generate" subtitle="AI-powered scheduling in seconds" />
      {generationError && <p className="mb-4 text-sm text-clash-red bg-clash-red/5 border border-clash-red/20 rounded-lg px-3 py-2">{generationError}</p>}
      {assignmentCount === 0 && <p className="mb-4 text-sm text-clash-amber bg-clash-amber/5 border border-clash-amber/20 rounded-lg px-3 py-2">Create at least one active assignment in <strong>Assignments</strong> before generating.</p>}
      <StepIndicator steps={STEPS} current={step} />

      <Card>
        {step === 1 && (
          <div>
            <h3 className="font-medium text-ink-900 mb-4">Select Grades & Sections</h3>
            {classes.length === 0 ? (
              <p className="text-sm text-ink-900/60">No classes are available. Create classes before generating a timetable.</p>
            ) : (
            <>
            <div className="mb-4">
              <div className="text-xs text-ink-900/45 mb-2">Grades</div>
              <div className="flex flex-wrap gap-2">
                {grades.map((g) => (
                  <button
                    key={g}
                    onClick={() => setSelectedGrade(g)}
                    className={`px-3.5 py-1.5 rounded-lg text-sm border transition-colors ${
                      selectedGrade === g ? "bg-forest text-white border-forest" : "border-black/10 text-ink-900/70 hover:border-forest/40"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-5">
              <div className="text-xs text-ink-900/45 mb-2">Sections</div>
              <div className="flex flex-wrap gap-2">
                {availableSections.map((s) => (
                  <button
                    key={s}
                    onClick={() => toggleSection(s)}
                    className={`w-10 h-10 rounded-lg text-sm border font-medium transition-colors ${
                      selectedSections.includes(s) ? "bg-forest text-white border-forest" : "border-black/10 text-ink-900/70 hover:border-forest/40"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-forest/5 border border-forest/15 rounded-lg px-4 py-3 text-sm text-forest-dark">
              Will generate <strong>{targetClasses.length}</strong> timetable{targetClasses.length !== 1 ? "s" : ""} — 1 grade × {selectedSections.length} sections
            </div>
            </>
            )}
          </div>
        )}

        {step === 2 && (
          <div>
            <h3 className="font-medium text-ink-900 mb-1">Hard Constraints</h3>
            <p className="text-xs text-ink-900/45 mb-3">These must never be violated by the generator.</p>
            <div className="space-y-2 mb-6">
              {hardConstraints.map((c) => (
                <div key={c.id} className="flex items-center justify-between border border-black/[0.06] rounded-lg px-4 py-3">
                  <div>
                    <div className="text-sm font-medium text-ink-900">{c.title}</div>
                    <div className="text-xs text-ink-900/45">{c.description}</div>
                  </div>
                  <Toggle checked={c.enabled} onChange={() => toggleConstraint(c.id)} />
                </div>
              ))}
            </div>
            <h3 className="font-medium text-ink-900 mb-1">Soft Constraints</h3>
            <p className="text-xs text-ink-900/45 mb-3">Optimized on a best-effort basis.</p>
            <div className="space-y-2">
              {softConstraints.map((c) => (
                <div key={c.id} className="flex items-center justify-between border border-black/[0.06] rounded-lg px-4 py-3">
                  <div>
                    <div className="text-sm font-medium text-ink-900">{c.title}</div>
                    <div className="text-xs text-ink-900/45">{c.description}</div>
                  </div>
                  <Toggle checked={c.enabled} onChange={() => toggleConstraint(c.id)} tone="amber" />
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h3 className="font-medium text-ink-900 mb-1">Optimization Priorities</h3>
            <p className="text-xs text-ink-900/45 mb-4">Weight how strongly the generator should favor each soft preference.</p>
            <div className="space-y-5">
              {Object.entries({
                balanceWorkload: "Balance teacher workload",
                morningCore: "Prefer difficult subjects in morning",
                minimizeGaps: "Minimize teacher gaps",
                avoidConsecutive: "Avoid too many consecutive periods",
                avoidRepeats: "Avoid repeating same subject too many times per day",
              }).map(([key, label]) => (
                <div key={key}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-ink-900/80">{label}</span>
                    <span className="text-xs text-ink-900/40">{priorities[key]}/5</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={priorities[key]}
                    onChange={(e) => setPriorities((p) => ({ ...p, [key]: Number(e.target.value) }))}
                    className="w-full accent-forest"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h3 className="font-medium text-ink-900 mb-4">Review & Generate</h3>
            <div className="grid sm:grid-cols-2 gap-3 mb-5">
              <SummaryTile label="Scope" value={`${selectedGrade} · ${selectedSections.join(", ")}`} />
              <SummaryTile label="Timetables" value={`${targetClasses.length} classes`} />
              <SummaryTile label="Hard constraints" value={`${hardConstraints.filter((c) => c.enabled).length} active`} />
              <SummaryTile label="Soft constraints" value={`${softConstraints.filter((c) => c.enabled).length} active`} />
            </div>
            <div className="bg-cream border border-black/[0.06] rounded-lg px-4 py-3 text-sm text-ink-900/60">
              Ready to generate. This runs entirely on mock data and simulated timing — no real timetable data is affected until you save or submit.
            </div>
          </div>
        )}
      </Card>

      <div className="flex justify-between mt-5">
        <Button variant="secondary" icon={ArrowLeft} onClick={() => setStep((s) => Math.max(1, s - 1))} disabled={step === 1}>
          Back
        </Button>
        {step < 4 ? (
          <Button icon={ArrowRight} onClick={() => setStep((s) => Math.min(4, s + 1))}>
            Next
          </Button>
        ) : (
          <Button icon={Zap} onClick={runGeneration} disabled={assignmentCount === 0}>
            Generate Timetable
          </Button>
        )}
      </div>
    </div>
  );
}

function MetricRow({ label, value, ok }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <CheckCircle2 size={15} className={ok ? "text-clash-green" : "text-ink-900/20"} />
      <span className="text-ink-900/70">{label}</span>
      <span className="ml-auto font-medium text-ink-900">{value}</span>
    </div>
  );
}

function SummaryTile({ label, value }) {
  return (
    <div className="border border-black/[0.06] rounded-lg px-4 py-3">
      <div className="text-xs text-ink-900/45">{label}</div>
      <div className="text-sm font-medium text-ink-900 mt-0.5">{value}</div>
    </div>
  );
}
