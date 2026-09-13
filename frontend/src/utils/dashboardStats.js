export function computeCompletion(classes) {
  const complete = classes.filter((c) => c.status === "Complete").length;
  return Math.round((complete / classes.length) * 100);
}

export function computeWorkloadData(teachers) {
  return teachers.slice(0, 10).map((t) => ({
    name: t.name.split(" ").slice(-1)[0],
    assigned: t.weeklyPeriods,
    max: 35,
  }));
}

export function computeSubjectDistribution(subjects) {
  return subjects
    .slice()
    .sort((a, b) => b.classes * b.weeklyPeriods - a.classes * a.weeklyPeriods)
    .slice(0, 7)
    .map((s) => ({ name: s.name, value: s.classes * s.weeklyPeriods }));
}
