export const departments = [
  "Engineering", "Sales", "Marketing", "Human Resources",
  "Finance", "Operations", "Research & Development", "Customer Support",
];

export const jobRoles = [
  "Software Engineer", "Sales Executive", "HR Manager", "Data Scientist",
  "Product Manager", "Marketing Specialist", "Financial Analyst", "Support Lead",
];

export const topCards = {
  totalEmployees: 4820,
  atRisk: 312,
  retentionRate: 87.4,
  accuracy: 94.2,
};

export const landingStats = [
  { label: "Total Employees", value: "4,820" },
  { label: "Attrition Rate", value: "12.6%" },
  { label: "Prediction Accuracy", value: "94.2%" },
  { label: "Active Departments", value: "8" },
];

export const departmentAttrition = [
  { name: "Engineering", attrition: 42, retained: 620 },
  { name: "Sales", attrition: 68, retained: 412 },
  { name: "Marketing", attrition: 24, retained: 198 },
  { name: "HR", attrition: 11, retained: 89 },
  { name: "Finance", attrition: 19, retained: 234 },
  { name: "Operations", attrition: 37, retained: 501 },
  { name: "R&D", attrition: 28, retained: 340 },
  { name: "Support", attrition: 51, retained: 388 },
];

export const monthlyTrend = [
  { month: "Jan", attrition: 22, hires: 45 },
  { month: "Feb", attrition: 28, hires: 38 },
  { month: "Mar", attrition: 31, hires: 52 },
  { month: "Apr", attrition: 26, hires: 41 },
  { month: "May", attrition: 34, hires: 48 },
  { month: "Jun", attrition: 39, hires: 55 },
  { month: "Jul", attrition: 44, hires: 61 },
  { month: "Aug", attrition: 37, hires: 49 },
  { month: "Sep", attrition: 29, hires: 42 },
  { month: "Oct", attrition: 33, hires: 47 },
  { month: "Nov", attrition: 25, hires: 39 },
  { month: "Dec", attrition: 21, hires: 44 },
];

export const salaryDistribution = [
  { range: "0-30k", count: 340 },
  { range: "30-50k", count: 890 },
  { range: "50-80k", count: 1420 },
  { range: "80-120k", count: 1180 },
  { range: "120-180k", count: 720 },
  { range: "180k+", count: 270 },
];

export const ageDistribution = [
  { age: "20-25", count: 380 },
  { age: "26-30", count: 920 },
  { age: "31-35", count: 1180 },
  { age: "36-40", count: 940 },
  { age: "41-45", count: 680 },
  { age: "46-50", count: 420 },
  { age: "50+", count: 300 },
];

export const employeeDistribution = [
  { name: "Engineering", value: 662 },
  { name: "Sales", value: 480 },
  { name: "Operations", value: 538 },
  { name: "R&D", value: 368 },
  { name: "Support", value: 439 },
  { name: "Other", value: 620 },
];

export const satisfactionData = [
  { level: "Very Low", count: 210, attritionRate: 42 },
  { level: "Low", count: 640, attritionRate: 28 },
  { level: "Medium", count: 1820, attritionRate: 14 },
  { level: "High", count: 2150, attritionRate: 6 },
];

export const overtimeData = [
  { name: "No Overtime", retained: 3120, attrition: 180 },
  { name: "Overtime", retained: 1250, attrition: 270 },
];

export const performanceData = [
  { rating: "1", count: 45 },
  { rating: "2", count: 380 },
  { rating: "3", count: 2840 },
  { rating: "4", count: 1240 },
  { rating: "5", count: 315 },
];

export const workLifeBalance = [
  { level: "Poor", value: 320 },
  { level: "Fair", value: 980 },
  { level: "Good", value: 2450 },
  { level: "Excellent", value: 1070 },
];

export const salaryVsAttrition = Array.from({ length: 40 }, (_, i) => ({
  salary: 30 + i * 4,
  tenure: Math.round(1 + Math.random() * 15),
  attrition: Math.random() > 0.7 ? 1 : 0,
}));

export const recentPredictions = [
  { name: "Sarah Chen", dept: "Engineering", risk: "Low", pred: "Will Stay", score: 12, date: "2h ago" },
  { name: "Marcus Johnson", dept: "Sales", risk: "High", pred: "May Leave", score: 87, date: "3h ago" },
  { name: "Priya Patel", dept: "Marketing", risk: "Medium", pred: "Watch", score: 54, date: "5h ago" },
  { name: "David Kim", dept: "Operations", risk: "Low", pred: "Will Stay", score: 18, date: "6h ago" },
  { name: "Elena Rodriguez", dept: "R&D", risk: "High", pred: "May Leave", score: 82, date: "8h ago" },
  { name: "Ahmed Hassan", dept: "Finance", risk: "Low", pred: "Will Stay", score: 22, date: "1d ago" },
  { name: "Lisa Wang", dept: "Engineering", risk: "Medium", pred: "Watch", score: 48, date: "1d ago" },
  { name: "Tom Wilson", dept: "Support", risk: "High", pred: "May Leave", score: 79, date: "2d ago" },
];

export const featureImportance = [
  { feature: "Overtime", importance: 0.22 },
  { feature: "Monthly Income", importance: 0.18 },
  { feature: "Age", importance: 0.14 },
  { feature: "Years at Company", importance: 0.12 },
  { feature: "Job Satisfaction", importance: 0.10 },
  { feature: "Distance from Home", importance: 0.08 },
  { feature: "Work-Life Balance", importance: 0.07 },
  { feature: "Environment Satisfaction", importance: 0.05 },
  { feature: "Training Hours", importance: 0.04 },
];

export const confusionMatrix = {
  tn: 812, fp: 42,
  fn: 38, tp: 208,
};

export const rocCurve = Array.from({ length: 20 }, (_, i) => {
  const fpr = i / 19;
  const tpr = Math.min(1, Math.sqrt(fpr) * 1.05);
  return { fpr: +fpr.toFixed(2), tpr: +tpr.toFixed(2) };
});

export const shapFactors = {
  positive: [
    { feature: "Working Overtime", impact: 0.34 },
    { feature: "Long Commute (25km)", impact: 0.21 },
    { feature: "Low Job Satisfaction", impact: 0.18 },
    { feature: "No Recent Promotion", impact: 0.12 },
  ],
  negative: [
    { feature: "High Monthly Income", impact: -0.28 },
    { feature: "8 Years Tenure", impact: -0.19 },
    { feature: "Strong Work-Life Balance", impact: -0.15 },
    { feature: "Recent Training", impact: -0.08 },
  ],
};

export const deployHistory = [
  { version: "v2.4.1", date: "Jun 28, 2026", status: "Production", note: "Precision tuning, feature engineering v3" },
  { version: "v2.3.0", date: "May 15, 2026", status: "Archived", note: "Random Forest upgrade, +2.1% accuracy" },
  { version: "v2.2.0", date: "Mar 04, 2026", status: "Archived", note: "SHAP integration, explainability layer" },
  { version: "v2.1.0", date: "Jan 22, 2026", status: "Archived", note: "Rebalanced dataset, SMOTE applied" },
  { version: "v2.0.0", date: "Nov 10, 2025", status: "Archived", note: "Migrated to MLflow tracking" },
];
