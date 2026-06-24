export type EditorView =
  | "workspace"
  | "trim"
  | "compress"
  | "animation-export"
  | "extract-frame"
  | "extract-audio"
  | "audio-track"
  | "change-speed"
  | "audio-volume"
  | "text-overlay"
  | "transition-merge"
  | "merge"
  | "normalize"
  | "crop-pad"
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
    view: "compress",
    href: "/functions/compress",
    label: "Compress video",
    shortLabel: "Compress",
    description: "Reduce file size or transcode one video with simple presets or advanced quality controls.",
  },
  {
    view: "animation-export",
    href: "/functions/animation-export",
    label: "GIF / WebP export",
    shortLabel: "Animate",
    description: "Turn one short video moment into a lightweight GIF or animated WebP clip.",
  },
  {
    view: "extract-frame",
    href: "/functions/extract-frame",
    label: "Extract frame",
    shortLabel: "Frame",
    description: "Capture one still frame from a video and export it as PNG, JPEG, or WebP.",
  },
  {
    view: "extract-audio",
    href: "/functions/extract-audio",
    label: "Extract audio",
    shortLabel: "Audio",
    description: "Pull the audio track out of a video and export it as MP3, M4A, or WAV.",
  },
  {
    view: "audio-track",
    href: "/functions/audio-track",
    label: "Mute / replace audio",
    shortLabel: "Track",
    description: "Mute a video completely or replace its soundtrack with another uploaded audio source.",
  },
  {
    view: "change-speed",
    href: "/functions/change-speed",
    label: "Speed up / slow down",
    shortLabel: "Speed",
    description: "Adjust playback speed for a video or audio file while keeping the workflow export-ready.",
  },
  {
    view: "audio-volume",
    href: "/functions/audio-volume",
    label: "Adjust audio volume",
    shortLabel: "Volume",
    description: "Raise, lower, or mute the soundtrack of a video or audio file with optional range control.",
  },
  {
    view: "text-overlay",
    href: "/functions/text-overlay",
    label: "Add text overlay",
    shortLabel: "Text",
    description: "Burn one title, caption, or short note directly into a video export.",
  },
  {
    view: "transition-merge",
    href: "/functions/transition-merge",
    label: "Transition merge",
    shortLabel: "Transition",
    description: "Overlap two prepared clips and blend them together with a simple visual transition.",
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
    view: "crop-pad",
    href: "/functions/crop-pad",
    label: "Crop / pad frame",
    shortLabel: "Crop/Pad",
    description: "Trim away frame edges or expand the canvas without changing clip order.",
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
  compress: {
    label: "Compress",
    eyebrow: "Function",
    description:
      "Shrink one video or transcode it to a cleaner MP4 export with preset or advanced quality controls.",
  },
  "animation-export": {
    label: "Animation export",
    eyebrow: "Function",
    description:
      "Clip one short moment from a video and export it as a GIF or animated WebP preview.",
  },
  "extract-frame": {
    label: "Extract frame",
    eyebrow: "Function",
    description:
      "Pick one moment in a clip and export that frame as a standalone image file.",
  },
  "extract-audio": {
    label: "Extract audio",
    eyebrow: "Function",
    description:
      "Take the soundtrack out of a video and export it as a standalone audio file.",
  },
  "audio-track": {
    label: "Audio track",
    eyebrow: "Function",
    description:
      "Mute a video or replace its soundtrack with another uploaded audio source.",
  },
  "change-speed": {
    label: "Change speed",
    eyebrow: "Function",
    description:
      "Speed up or slow down a video or audio file while preparing a new export.",
  },
  "audio-volume": {
    label: "Audio volume",
    eyebrow: "Function",
    description:
      "Raise, lower, or mute the soundtrack of one video or audio file with optional clipping protection and custom timing.",
  },
  "text-overlay": {
    label: "Text overlay",
    eyebrow: "Function",
    description:
      "Add a burned-in title, caption, or note directly on top of one video export.",
  },
  "transition-merge": {
    label: "Transition merge",
    eyebrow: "Function",
    description:
      "Overlap two prepared clips, blend the cut with a visual transition, and choose how the audio should behave in the handoff.",
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
  "crop-pad": {
    label: "Crop / pad",
    eyebrow: "Function",
    description:
      "Crop one frame tighter or pad it onto a larger canvas before the next export step.",
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
