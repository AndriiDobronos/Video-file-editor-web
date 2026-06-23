export type EditorView =
  | "workspace"
  | "trim"
  | "merge"
  | "normalize"
  | "convert"
  | "jobs";

export type FunctionView = Exclude<EditorView, "workspace" | "jobs">;

export const functionRouteOptions: Array<{
  view: FunctionView;
  href: string;
  label: string;
  shortLabel: string;
  description: string;
}> = [
  {
    view: "trim",
    href: "/functions/trim",
    label: "Trim clip",
    shortLabel: "Trim",
    description: "Cut one source clip to the exact moment range you need.",
  },
  {
    view: "merge",
    href: "/functions/merge",
    label: "Merge clips",
    shortLabel: "Merge",
    description: "Combine prepared clips into one final export.",
  },
  {
    view: "normalize",
    href: "/functions/normalize",
    label: "Normalize for merge",
    shortLabel: "Normalize",
    description: "Align mismatched clips to one merge-ready format.",
  },
  {
    view: "convert",
    href: "/functions/convert",
    label: "Convert image",
    shortLabel: "Convert",
    description: "Convert PNG, JPEG, and WebP files into another image format.",
  },
];

export const editorViewMeta: Record<
  EditorView,
  {
    label: string;
    eyebrow: string;
    description: string;
  }
> = {
  workspace: {
    label: "Workspace",
    eyebrow: "Overview",
    description:
      "Choose the next file action, upload new assets, and keep the shared library ready for every page.",
  },
  trim: {
    label: "Trim",
    eyebrow: "Function",
    description:
      "Open one clip, set the exact start and end moment, and queue a clean trimmed export.",
  },
  merge: {
    label: "Merge",
    eyebrow: "Function",
    description:
      "Pick multiple prepared clips, verify compatibility, and combine them into one final video.",
  },
  normalize: {
    label: "Normalize",
    eyebrow: "Function",
    description:
      "Bring selected clips to one shared format before merge so the export stays stable.",
  },
  convert: {
    label: "Convert",
    eyebrow: "Function",
    description:
      "Switch still images between PNG, JPEG, and WebP with optional resize and fit rules.",
  },
  jobs: {
    label: "Jobs",
    eyebrow: "Queue",
    description:
      "Watch processing status, review job history, and download finished outputs from one place.",
  },
};

export function getFunctionViewFromSlug(value: string): FunctionView | null {
  const match = functionRouteOptions.find((item) => item.view === value);
  return match?.view ?? null;
}
