import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Eye, FileUp } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import { Card, Badge, EmptyState } from "../../components/common/Card";
import { Drawer } from "../../components/common/Drawer";
import TimetableGrid from "../../components/timetable/TimetableGrid";
import { useAppStore } from "../../store/useAppStore";
import { apiRequest } from "../../services/apiClient";

const STATUS_TONE = { Draft: "default", Generated: "blue", "Under Review": "amber", Approved: "green", Published: "mint" };
const STATUS_FLOW = ["Draft", "Generated", "Under Review", "Approved", "Published"];
const DAY_LABELS = { monday: "Monday", tuesday: "Tuesday", wednesday: "Wednesday", thursday: "Thursday", friday: "Friday", saturday: "Saturday", sunday: "Sunday" };

function buildSlotsAndGrid(entries, periods) {
  const orderedPeriods = [...periods].sort((a, b) => a.period_number - b.period_number);
  const slots = orderedPeriods.map((period) => ({
    id: period.id,
    type: period.is_break ? "break" : "period",
    label: period.name,
    time: `${period.start_time?.slice(0, 5) || ""} - ${period.end_time?.slice(0, 5) || ""}`,
  }));
  const grid = {};
  entries.forEach((entry) => {
    const day = DAY_LABELS[entry.day_of_week] || entry.day_of_week;
    if (!grid[day]) grid[day] = {};
    grid[day][entry.period_id] = {
      subject: entry.subject?.name || "—",
      teacherName: entry.teacher?.name || "—",
      room: entry.room?.name || "No room",
      classId: entry.school_class ? `${entry.school_class.grade}${entry.school_class.section}` : entry.class_id,
      conflict: false,
    };
  });
  return { slots, grid };
}

export default function ApprovalPage() {
  const [timetables, setTimetables] = useState([]);
  const conflicts = useAppStore((s) => s.conflicts);
  const pushNotification = useAppStore((s) => s.pushNotification);
  const [reviewing, setReviewing] = useState(null);
  const [reviewData, setReviewData] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [filter, setFilter] = useState("Under Review");
  const [error, setError] = useState("");
  const [acting, setActing] = useState(false);

  const load = async () => setTimetables((await apiRequest("/timetables")).data || []);
  useEffect(() => { load().catch(() => setTimetables([])); }, []);
  const filtered = filter === "all" ? timetables : timetables.filter((item) => item.status === filter.toLowerCase().replaceAll(" ", "_"));

  const openConflictsFor = (timetableId) => conflicts.filter((c) => c.timetable_id === timetableId && c.status === "open").length;

  useEffect(() => {
    if (!reviewing) { setReviewData(null); return; }
    let cancelled = false;
    setReviewLoading(true);
    apiRequest(`/timetables/${reviewing.timetableId}`)
      .then((response) => {
        if (cancelled) return;
        const entries = response.data?.entries || [];
        setReviewData(buildSlotsAndGrid(entries, dedupePeriods(entries)));
      })
      .catch(() => { if (!cancelled) setReviewData({ slots: [], grid: {} }); })
      .finally(() => { if (!cancelled) setReviewLoading(false); });
    return () => { cancelled = true; };
  }, [reviewing]);

  function dedupePeriods(entries) {
    const seen = new Map();
    entries.forEach((e) => { if (e.period && !seen.has(e.period.id)) seen.set(e.period.id, e.period); });
    return [...seen.values()];
  }

  const act = async (timetableId, action) => {
    setActing(true);
    setError("");
    try {
      if (action === "approve") {
        await apiRequest(`/timetables/${timetableId}/approve`, { method: "POST" });
      } else if (action === "publish") {
        await apiRequest(`/timetables/${timetableId}/publish`, { method: "POST" });
      } else if (action === "reject") {
        await apiRequest(`/timetables/${timetableId}/request-changes`, { method: "POST" });
      }
      await load();
      setReviewing(null);
    } catch (requestError) {
      setError(requestError.message || "The timetable action could not be completed.");
    } finally {
      setActing(false);
    }
  };

  return (
    <div>
      <PageHeader title="Approval" subtitle="Review generated timetables before they go live" />
      {error && <p className="mb-4 text-sm text-clash-red bg-clash-red/5 border border-clash-red/20 rounded-lg px-3 py-2">{error}</p>}

      <div className="flex bg-cream-dark rounded-lg p-1 gap-1 mb-5 w-fit flex-wrap">
        {["all", ...STATUS_FLOW].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
              filter === f ? "bg-white shadow-card text-ink-900 font-medium" : "text-ink-900/50 hover:text-ink-900"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card><EmptyState icon={CheckCircle2} title="Nothing here" description="No timetables match this status." /></Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((timetable) => {
            const status = timetable.status.replace("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
            const timetableId = timetable.id;
            const conflictCount = openConflictsFor(timetableId);
            return <Card key={timetableId}>
                <div className="flex items-center justify-between mb-2">
                  <div className="font-serif text-lg text-ink-950">{timetable.name}</div>
                  <Badge tone={STATUS_TONE[status]}>{status}</Badge>
                </div>
                <div className="text-xs text-ink-900/45 mb-3">
                  {conflictCount > 0 ? `${conflictCount} open conflict${conflictCount > 1 ? "s" : ""}` : "No open conflicts"} · Quality score {timetable.quality_score ?? "—"}%
                </div>
                <Button variant="secondary" size="sm" icon={Eye} className="w-full" onClick={() => setReviewing({ timetableId, status, name: timetable.name })}>
                  Review
                </Button>
              </Card>;
          })}
        </div>
      )}

      <Drawer
        open={!!reviewing}
        onClose={() => setReviewing(null)}
        title={reviewing && reviewing.name}
        subtitle="Full timetable review"
        width="max-w-3xl"
      >
        {reviewing && (
          <div className="space-y-5">
            <div className="grid grid-cols-3 gap-3">
              <div className="border border-black/[0.06] rounded-lg p-3 text-center">
                <div className="text-2xl font-serif text-ink-950">{timetables.find((t) => t.id === reviewing.timetableId)?.quality_score ?? "—"}%</div>
                <div className="text-xs text-ink-900/45">Quality Score</div>
              </div>
              <div className="border border-black/[0.06] rounded-lg p-3 text-center">
                <div className="text-2xl font-serif text-ink-950">{openConflictsFor(reviewing.timetableId)}</div>
                <div className="text-xs text-ink-900/45">Open Conflicts</div>
              </div>
              <div className="border border-black/[0.06] rounded-lg p-3 text-center">
                <div className="text-2xl font-serif text-ink-950"><Badge tone={STATUS_TONE[reviewing.status]}>{reviewing.status}</Badge></div>
                <div className="text-xs text-ink-900/45 mt-1">Current Status</div>
              </div>
            </div>

            {reviewLoading ? (
              <div className="py-10 text-center text-sm text-ink-900/40">Loading timetable…</div>
            ) : reviewData && reviewData.slots.length === 0 ? (
              <div className="py-10 text-center text-sm text-ink-900/40">No periods or entries found for this timetable.</div>
            ) : (
              <TimetableGrid
                grid={reviewData?.grid || {}}
                slots={reviewData?.slots}
                activeDays={reviewData ? Object.keys(DAY_LABELS).map((k) => DAY_LABELS[k]).filter((d) => reviewData.grid[d]) : []}
                showClass
                editable={false}
              />
            )}

            <div className="flex flex-wrap gap-2 pt-2">
              <Button variant="outlineDanger" icon={XCircle} disabled={acting || reviewing.status !== "Under Review"} onClick={() => act(reviewing.timetableId, "reject")}>Request Changes</Button>
              <Button variant="secondary" icon={CheckCircle2} disabled={acting || reviewing.status !== "Under Review"} onClick={() => act(reviewing.timetableId, "approve")}>{acting ? "Saving..." : "Approve"}</Button>
              <Button icon={FileUp} disabled={acting || reviewing.status !== "Approved"} onClick={() => act(reviewing.timetableId, "publish")}>Publish</Button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
