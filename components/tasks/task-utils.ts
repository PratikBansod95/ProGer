export const statusColors: Record<string, string> = {
  TODO: "bg-slate-100 text-slate-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  REVIEW: "bg-amber-100 text-amber-700",
  DONE: "bg-emerald-100 text-emerald-700",
  REQUEST: "bg-purple-100 text-purple-700",
};

export const priorityColors: Record<string, string> = {
  LOW: "bg-slate-100 text-slate-700",
  MEDIUM: "bg-amber-100 text-amber-700",
  HIGH: "bg-rose-100 text-rose-700",
};

export const categoryColors: Record<string, string> = {
  PM: "bg-purple-100 text-purple-700",
  CONTENT: "bg-cyan-100 text-cyan-700",
  BACKEND: "bg-indigo-100 text-indigo-700",
  FRONTEND_APP: "bg-pink-100 text-pink-700",
  QA: "bg-emerald-100 text-emerald-700",
  SR_DEVS: "bg-amber-100 text-amber-700",
};

export const categories = [
  { value: "ALL", label: "All" },
  { value: "PM", label: "PM" },
  { value: "CONTENT", label: "Content" },
  { value: "BACKEND", label: "Backend" },
  { value: "FRONTEND_APP", label: "Frontend/App" },
  { value: "QA", label: "QA" },
  { value: "SR_DEVS", label: "Sr. Devs" },
];
