const paths = {
  home: "M3 10 12 3l9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z",
  users:
    "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m20 0v-2a4 4 0 0 0-3-3.87M16 3a4 4 0 0 1 0 8M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z",
  bell: "M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9m-9 12a3 3 0 0 0 6 0",
  bookmark: "M5 3h14v19l-7-4-7 4Z",
  search: "M21 21l-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z",
  heart:
    "M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z",
  comment:
    "M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8Z",
  share:
    "M18 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm0 14a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM6 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm2.6-4.5 6.8-4m-6.8 7 6.8 4",
  image: "M3 3h18v18H3ZM3 17l6-6 4 4 3-3 5 5M9 7h.01",
  send: "m22 2-7 20-4-9-9-4 20-7ZM22 2 11 13",
  close: "m6 6 12 12M6 18 18 6",
  settings:
    "m12 8 0 0a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm-2-6h4l1 3 3 1 3 1v4l-2 1v2l2 1v4l-3 1-3 1-1 3h-4l-1-3-3-1-3-1v-4l2-1v-2l-2-1V7l3-1 3-1Z",
  logout: "M9 21H3V3h6m7 14 5-5-5-5m5 5H9",
  arrow: "M19 12H5m7-7-7 7 7 7",
  plus: "M12 5v14M5 12h14",
  check: "m5 12 4 4L19 6",
  globe:
    "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM3 12h18M12 3a16 16 0 0 1 0 18 16 16 0 0 1 0-18Z",
  edit: "m16 3 5 5-12 12-6 1 1-6ZM14 5l5 5",
  trash: "M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7",
  more: "M5 12h.01M12 12h.01M19 12h.01",
  lock: "M5 10h14v12H5ZM8 10V6a4 4 0 0 1 8 0v4",
  eye: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7ZM15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z",
  mail: "M3 4h18v16H3Zm0 0 9 9 9-9",
  spark:
    "m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5ZM21 2v4m-2-2h4",
};
export type IconName = keyof typeof paths;
function Icon({
  name,
  className = "",
  filled = false,
}: {
  name: IconName;
  className?: string;
  filled?: boolean;
}) {
  return (
  <svg
    className={`size-5 shrink-0 ${className}`}
    viewBox="0 0 24 24"
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d={paths[name]} />
  </svg>
);
}
export default Icon;
