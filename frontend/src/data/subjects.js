export const SUBJECTS = [];
/*
  { id: "s01", name: "Mathematics", code: "MATH", classes: 13, weeklyPeriods: 6, requiresLab: false, doublePeriod: false, morningPreferred: true, priority: "High" },
  { id: "s02", name: "English", code: "ENG", classes: 13, weeklyPeriods: 5, requiresLab: false, doublePeriod: false, morningPreferred: true, priority: "High" },
  { id: "s03", name: "Physics", code: "PHY", classes: 8, weeklyPeriods: 4, requiresLab: true, doublePeriod: true, morningPreferred: true, priority: "High" },
  { id: "s04", name: "Chemistry", code: "CHEM", classes: 8, weeklyPeriods: 4, requiresLab: true, doublePeriod: true, morningPreferred: true, priority: "High" },
  { id: "s05", name: "Biology", code: "BIO", classes: 8, weeklyPeriods: 4, requiresLab: true, doublePeriod: false, morningPreferred: false, priority: "Medium" },
  { id: "s06", name: "Urdu", code: "URD", classes: 13, weeklyPeriods: 4, requiresLab: false, doublePeriod: false, morningPreferred: false, priority: "Medium" },
  { id: "s07", name: "Islamiat", code: "ISL", classes: 13, weeklyPeriods: 3, requiresLab: false, doublePeriod: false, morningPreferred: false, priority: "Medium" },
  { id: "s08", name: "Computer Science", code: "CS", classes: 7, weeklyPeriods: 3, requiresLab: true, doublePeriod: false, morningPreferred: false, priority: "Medium" },
  { id: "s09", name: "Pakistan Studies", code: "PST", classes: 9, weeklyPeriods: 3, requiresLab: false, doublePeriod: false, morningPreferred: false, priority: "Low" },
  { id: "s10", name: "Physical Education", code: "PE", classes: 6, weeklyPeriods: 2, requiresLab: false, doublePeriod: false, morningPreferred: false, priority: "Low" },
  { id: "s11", name: "Art", code: "ART", classes: 3, weeklyPeriods: 2, requiresLab: false, doublePeriod: false, morningPreferred: false, priority: "Low" },
  { id: "s12", name: "Geography", code: "GEO", classes: 2, weeklyPeriods: 3, requiresLab: false, doublePeriod: false, morningPreferred: false, priority: "Low" },
  { id: "s13", name: "History", code: "HIST", classes: 2, weeklyPeriods: 3, requiresLab: false, doublePeriod: false, morningPreferred: false, priority: "Low" },
  { id: "s14", name: "Economics", code: "ECO", classes: 3, weeklyPeriods: 3, requiresLab: false, doublePeriod: false, morningPreferred: false, priority: "Medium" },
  { id: "s15", name: "Computer Lab", code: "CSL", classes: 7, weeklyPeriods: 2, requiresLab: true, doublePeriod: true, morningPreferred: false, priority: "Medium" },
]; */

export const getSubjectByName = (name) => SUBJECTS.find((s) => s.name === name);
