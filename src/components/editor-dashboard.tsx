"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { fetchJson, toApiUrl, waitForBackendWake } from "@/lib/api";
import {
  editorViewMeta,
  functionRouteOptions,
  type EditorView,
} from "@/lib/function-routes";
import type {
  ConvertImageFit,
  ConvertImageFormat,
  ConvertImageTarget,
  CropPadAnchorX,
  CropPadAnchorY,
  CropPadMode,
  CropPadTarget,
  HealthResponse,
  MediaAsset,
  NormalizeTargetPreset,
  NormalizeTargetProfile,
  ProcessingJob,
} from "@/types/media";

type AssetsResponse = {
  items: MediaAsset[];
};

type JobsResponse = {
  items: ProcessingJob[];
};

type UploadResponse = {
  items: MediaAsset[];
};

type JobResponse = {
  item: ProcessingJob;
};

const statusHighlights = [
  "Shared uploads stay available on every function page",
  "Each tool now opens on its own route instead of one long scroll",
  "Crop, pad, trim, convert, and merge all reuse the same shared asset library",
];

const normalizeTargetPresetOptions: Array<{
  value: NormalizeTargetPreset;
  label: string;
  description: string;
}> = [
  {
    value: "hd-720p",
    label: "Default 720p (Recommended)",
    description: "Converts every selected clip to a stable 1280x720 export profile.",
  },
  {
    value: "match-largest",
    label: "Match largest clip",
    description: "Keeps the biggest selected canvas and scales smaller clips into it.",
  },
  {
    value: "match-smallest",
    label: "Match smallest clip",
    description: "Downscales larger clips to the smallest selected canvas.",
  },
  {
    value: "match-average",
    label: "Match average size",
    description: "Builds a middle-ground canvas from the selected clip dimensions.",
  },
];

const convertFormatOptions: Array<{
  value: ConvertImageFormat;
  label: string;
  description: string;
}> = [
  {
    value: "png",
    label: "PNG",
    description: "Good for crisp graphics and transparent backgrounds.",
  },
  {
    value: "jpeg",
    label: "JPEG",
    description: "Best when you want a smaller photo-friendly output.",
  },
  {
    value: "webp",
    label: "WebP",
    description: "A modern web format with strong size savings.",
  },
];

const convertFitOptions: Array<{
  value: ConvertImageFit;
  label: string;
  description: string;
}> = [
  {
    value: "contain",
    label: "Contain",
    description: "Keep the full image inside the target area.",
  },
  {
    value: "cover",
    label: "Cover",
    description: "Fill the target area and crop the overflow.",
  },
  {
    value: "stretch",
    label: "Stretch",
    description: "Force the image to the exact size.",
  },
];

const cropPadModeOptions: Array<{
  value: CropPadMode;
  label: string;
  description: string;
}> = [
  {
    value: "crop",
    label: "Crop",
    description: "Remove frame edges and keep only the selected inner area.",
  },
  {
    value: "pad",
    label: "Pad",
    description: "Place the source on a larger canvas without scaling it first.",
  },
];

const cropPadHorizontalAnchorOptions: Array<{
  value: CropPadAnchorX;
  label: string;
}> = [
  { value: "left", label: "Left" },
  { value: "center", label: "Center" },
  { value: "right", label: "Right" },
];

const cropPadVerticalAnchorOptions: Array<{
  value: CropPadAnchorY;
  label: string;
}> = [
  { value: "top", label: "Top" },
  { value: "center", label: "Center" },
  { value: "bottom", label: "Bottom" },
];

type MergeCompatibilityCheck = {
  label: string;
  readValue: (asset: MediaAsset) => string;
};

const mergeCompatibilityChecks: MergeCompatibilityCheck[] = [
  {
    label: "resolution",
    readValue: (asset) => {
      const width = asset.metadata?.width;
      const height = asset.metadata?.height;

      return width && height ? `${width}x${height}` : "unknown";
    },
  },
  {
    label: "video codec",
    readValue: (asset) => asset.metadata?.videoCodec ?? "unknown",
  },
  {
    label: "audio codec",
    readValue: (asset) => asset.metadata?.audioCodec ?? "unknown",
  },
  {
    label: "frame rate",
    readValue: (asset) => asset.metadata?.frameRate ?? "unknown",
  },
  {
    label: "audio sample rate",
    readValue: (asset) =>
      asset.metadata?.audioSampleRate ? `${asset.metadata.audioSampleRate} Hz` : "unknown",
  },
  {
    label: "audio channels",
    readValue: (asset) =>
      asset.metadata?.audioChannels ? String(asset.metadata.audioChannels) : "unknown",
  },
];

const sessionStorageKeys = {
  trimAssetId: "vfe:trim-asset-id",
  mergeAssetIds: "vfe:merge-asset-ids",
  normalizePreset: "vfe:normalize-preset",
  cropPadAssetId: "vfe:crop-pad-asset-id",
  cropPadMode: "vfe:crop-pad-mode",
  cropPadWidth: "vfe:crop-pad-width",
  cropPadHeight: "vfe:crop-pad-height",
  cropPadAnchorX: "vfe:crop-pad-anchor-x",
  cropPadAnchorY: "vfe:crop-pad-anchor-y",
  cropPadBackground: "vfe:crop-pad-background",
  convertAssetId: "vfe:convert-asset-id",
  convertFormat: "vfe:convert-format",
  convertQuality: "vfe:convert-quality",
  convertWidth: "vfe:convert-width",
  convertHeight: "vfe:convert-height",
  convertFit: "vfe:convert-fit",
  convertBackground: "vfe:convert-background",
} as const;

function formatBytes(bytes: number | null | undefined) {
  if (!bytes || Number.isNaN(bytes)) {
    return "Unknown size";
  }

  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value.toFixed(value >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

function formatDuration(seconds: number | null | undefined) {
  if (seconds === null || seconds === undefined || Number.isNaN(seconds)) {
    return "Unknown duration";
  }

  const totalSeconds = Math.max(0, Math.round(seconds));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const remainingSeconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
  }

  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

function formatResolutionLabel(asset: MediaAsset) {
  if (!asset.metadata?.width || !asset.metadata?.height) {
    return null;
  }

  return `${asset.metadata.width}x${asset.metadata.height}`;
}

function formatCodecLabel(asset: MediaAsset) {
  const codecs = [asset.metadata?.videoCodec, asset.metadata?.audioCodec].filter(
    (value): value is string => Boolean(value),
  );

  if (codecs.length === 0) {
    return null;
  }

  return codecs.join(" / ");
}

function formatAssetSummary(asset: MediaAsset) {
  const details = [
    asset.metadata?.durationSeconds !== null && asset.metadata?.durationSeconds !== undefined
      ? formatDuration(asset.metadata.durationSeconds)
      : null,
    formatResolutionLabel(asset),
    formatCodecLabel(asset),
    formatBytes(asset.sizeBytes),
  ].filter((value): value is string => Boolean(value));

  return details.join(" | ");
}

function formatStatusLabel(status: ProcessingJob["status"]) {
  switch (status) {
    case "queued":
      return "Queued";
    case "processing":
      return "Processing";
    case "completed":
      return "Completed";
    case "failed":
      return "Failed";
    default:
      return status;
  }
}

function formatJobProgress(progress: ProcessingJob["progress"]) {
  if (typeof progress === "number") {
    return `${Math.round(progress)}%`;
  }

  if (typeof progress === "string") {
    return progress;
  }

  if (progress === true) {
    return "Running";
  }

  return null;
}

function isImageAsset(asset: MediaAsset) {
  return asset.mimeType.toLowerCase().startsWith("image/");
}

function isVideoAsset(asset: MediaAsset) {
  if (isImageAsset(asset)) {
    return false;
  }

  return (
    asset.mimeType.toLowerCase().startsWith("video/") ||
    Boolean(asset.metadata?.videoCodec)
  );
}

function isCropPadEligibleAsset(asset: MediaAsset) {
  return isVideoAsset(asset) || isImageAsset(asset);
}

function getSuggestedTrimEndTime(asset: MediaAsset | undefined) {
  const duration = asset?.metadata?.durationSeconds;

  if (duration === null || duration === undefined || Number.isNaN(duration)) {
    return "5";
  }

  return String(Number(Math.min(5, Math.max(1, duration)).toFixed(2)));
}

function getMergeCompatibilityIssues(selectedAssets: MediaAsset[]) {
  if (selectedAssets.length < 2) {
    return [];
  }

  return mergeCompatibilityChecks.flatMap((check) => {
    const values = new Map<string, string[]>();

    for (const asset of selectedAssets) {
      const value = check.readValue(asset);
      const assetLabels = values.get(value) ?? [];
      assetLabels.push(asset.originalName);
      values.set(value, assetLabels);
    }

    if (values.size <= 1) {
      return [];
    }

    return [
      `${check.label}: ${Array.from(values.entries())
        .map(([value, assets]) => `${value} (${assets.join(", ")})`)
        .join("; ")}`,
    ];
  });
}

function ensureEven(value: number) {
  const rounded = Math.max(2, Math.round(value));
  return rounded % 2 === 0 ? rounded : rounded + 1;
}

function getDefaultMergeSelection(nextAssets: MediaAsset[]) {
  const uploadAssets = nextAssets.filter((asset) => asset.kind === "upload");
  const sourceAssets = uploadAssets.length > 0 ? uploadAssets : nextAssets;

  return sourceAssets.map((asset) => asset.id);
}

function buildNormalizeTargetPlan(
  selectedAssets: MediaAsset[],
  preset: NormalizeTargetPreset,
) {
  if (selectedAssets.length === 0) {
    return {
      target: null,
      errorMessage: "Select at least one clip to prepare a normalize target.",
    };
  }

  let width = 1280;
  let height = 720;

  if (preset !== "hd-720p") {
    const assetsWithDimensions = selectedAssets.filter(
      (asset) => asset.metadata?.width && asset.metadata?.height,
    );

    if (assetsWithDimensions.length !== selectedAssets.length) {
      return {
        target: null,
        errorMessage:
          "Some selected clips are missing width or height metadata. Use Default 720p or re-upload those files.",
      };
    }

    if (preset === "match-largest") {
      const largestAsset = assetsWithDimensions.reduce((best, asset) => {
        const bestArea = (best.metadata?.width ?? 0) * (best.metadata?.height ?? 0);
        const assetArea = (asset.metadata?.width ?? 0) * (asset.metadata?.height ?? 0);

        return assetArea > bestArea ? asset : best;
      });

      width = largestAsset.metadata?.width ?? width;
      height = largestAsset.metadata?.height ?? height;
    }

    if (preset === "match-smallest") {
      const smallestAsset = assetsWithDimensions.reduce((best, asset) => {
        const bestArea = (best.metadata?.width ?? 0) * (best.metadata?.height ?? 0);
        const assetArea = (asset.metadata?.width ?? 0) * (asset.metadata?.height ?? 0);

        return assetArea < bestArea ? asset : best;
      });

      width = smallestAsset.metadata?.width ?? width;
      height = smallestAsset.metadata?.height ?? height;
    }

    if (preset === "match-average") {
      width =
        assetsWithDimensions.reduce(
          (sum, asset) => sum + (asset.metadata?.width ?? 0),
          0,
        ) / assetsWithDimensions.length;
      height =
        assetsWithDimensions.reduce(
          (sum, asset) => sum + (asset.metadata?.height ?? 0),
          0,
        ) / assetsWithDimensions.length;
    }
  }

  return {
    target: {
      preset,
      width: ensureEven(width),
      height: ensureEven(height),
      frameRate: 30,
      audioSampleRate: 48_000,
      audioChannels: 2,
      videoCodec: "h264" as const,
      audioCodec: "aac" as const,
    } satisfies NormalizeTargetProfile,
    errorMessage: null,
  };
}

function formatNormalizeTarget(target: NormalizeTargetProfile | null) {
  if (!target) {
    return "Target is unavailable.";
  }

  return `${target.width}x${target.height} | H.264/AAC | ${target.frameRate} fps | ${target.audioSampleRate / 1000} kHz stereo`;
}

function parseOptionalPositiveInteger(value: string) {
  if (!value.trim()) {
    return { value: undefined, error: null };
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return {
      value: undefined,
      error: "Width, height, and quality must use positive whole numbers.",
    };
  }

  return { value: parsed, error: null };
}

function buildConvertTargetPlan(input: {
  format: ConvertImageFormat;
  quality: string;
  width: string;
  height: string;
  fit: ConvertImageFit;
  background: string;
}) {
  const qualityResult = parseOptionalPositiveInteger(input.quality);
  const widthResult = parseOptionalPositiveInteger(input.width);
  const heightResult = parseOptionalPositiveInteger(input.height);

  const errorMessage =
    qualityResult.error ?? widthResult.error ?? heightResult.error ?? null;

  if (errorMessage) {
    return {
      target: null,
      errorMessage,
    };
  }

  const background = input.background.trim();

  if (background && !/^#[0-9a-fA-F]{6}$/.test(background)) {
    return {
      target: null,
      errorMessage: "Background must use a six-digit hex color such as #ffffff.",
    };
  }

  const target: ConvertImageTarget = {
    format: input.format,
    fit: input.fit,
  };

  if (input.format !== "png" && qualityResult.value) {
    target.quality = qualityResult.value;
  }

  if (widthResult.value) {
    target.width = widthResult.value;
  }

  if (heightResult.value) {
    target.height = heightResult.value;
  }

  if (background) {
    target.background = background;
  }

  return {
    target,
    errorMessage: null,
  };
}

function formatConvertTargetSummary(target: ConvertImageTarget | null) {
  if (!target) {
    return "Target is unavailable.";
  }

  const details = [
    target.format.toUpperCase(),
    target.width && target.height
      ? `${target.width}x${target.height}`
      : target.width
        ? `${target.width}px wide`
        : target.height
          ? `${target.height}px high`
          : "Keep original size",
    target.fit ? `Fit: ${target.fit}` : null,
    target.quality ? `Quality: ${target.quality}` : null,
  ].filter((value): value is string => Boolean(value));

  return details.join(" | ");
}

function buildCropPadTargetPlan(input: {
  asset: MediaAsset | null;
  mode: CropPadMode;
  width: string;
  height: string;
  anchorX: CropPadAnchorX;
  anchorY: CropPadAnchorY;
  background: string;
}) {
  if (!input.asset) {
    return {
      target: null,
      errorMessage: "Choose one image or video file before preparing crop / pad.",
    };
  }

  const widthResult = parseOptionalPositiveInteger(input.width);
  const heightResult = parseOptionalPositiveInteger(input.height);
  const errorMessage = widthResult.error ?? heightResult.error ?? null;

  if (errorMessage) {
    return {
      target: null,
      errorMessage,
    };
  }

  if (!widthResult.value || !heightResult.value) {
    return {
      target: null,
      errorMessage: "Enter both width and height for crop / pad.",
    };
  }

  const background = input.background.trim();

  if (background && !/^#[0-9a-fA-F]{6}$/.test(background)) {
    return {
      target: null,
      errorMessage: "Background must use a six-digit hex color such as #111111.",
    };
  }

  const sourceWidth = input.asset.metadata?.width ?? null;
  const sourceHeight = input.asset.metadata?.height ?? null;

  if (!sourceWidth || !sourceHeight) {
    return {
      target: null,
      errorMessage:
        "The selected file is missing width or height metadata. Re-upload it before crop / pad.",
    };
  }

  if (
    isVideoAsset(input.asset) &&
    (widthResult.value % 2 !== 0 || heightResult.value % 2 !== 0)
  ) {
    return {
      target: null,
      errorMessage: "Video crop / pad targets must use even width and height values.",
    };
  }

  if (widthResult.value === sourceWidth && heightResult.value === sourceHeight) {
    return {
      target: null,
      errorMessage: "Target size matches the source. Change at least one dimension.",
    };
  }

  if (
    input.mode === "crop" &&
    (widthResult.value > sourceWidth || heightResult.value > sourceHeight)
  ) {
    return {
      target: null,
      errorMessage: "Crop target cannot be larger than the current frame.",
    };
  }

  if (
    input.mode === "pad" &&
    (widthResult.value < sourceWidth || heightResult.value < sourceHeight)
  ) {
    return {
      target: null,
      errorMessage: "Pad target cannot be smaller than the current frame.",
    };
  }

  const target: CropPadTarget = {
    mode: input.mode,
    width: widthResult.value,
    height: heightResult.value,
    anchorX: input.anchorX,
    anchorY: input.anchorY,
  };

  if (input.mode === "pad" && background) {
    target.background = background;
  }

  return {
    target,
    errorMessage: null,
  };
}

function formatCropPadTargetSummary(
  asset: MediaAsset | null,
  target: CropPadTarget | null,
) {
  if (!target) {
    return "Target is unavailable.";
  }

  const details = [
    target.mode === "crop"
      ? `Crop to ${target.width}x${target.height}`
      : `Pad to ${target.width}x${target.height}`,
    `${target.anchorX ?? "center"} / ${target.anchorY ?? "center"}`,
    target.background ? `Background: ${target.background}` : null,
    asset && isVideoAsset(asset) ? "MP4 export" : "Keep original image format",
  ].filter((value): value is string => Boolean(value));

  return details.join(" | ");
}

function getJobTypeLabel(type: ProcessingJob["type"]) {
  switch (type) {
    case "trim":
      return "Trim job";
    case "merge":
      return "Merge job";
    case "normalize":
      return "Normalize job";
    case "crop-pad":
      return "Crop / pad job";
    case "convert-image":
      return "Convert image job";
    default:
      return type;
  }
}

function readSessionString(key: string, fallback: string) {
  if (typeof window === "undefined") {
    return fallback;
  }

  return window.sessionStorage.getItem(key) ?? fallback;
}

function readSessionStringArray(key: string) {
  if (typeof window === "undefined") {
    return [] as string[];
  }

  try {
    const rawValue = window.sessionStorage.getItem(key);
    return rawValue ? (JSON.parse(rawValue) as string[]) : [];
  } catch {
    return [];
  }
}

function AssetThumbnail({
  asset,
  compact = false,
}: {
  asset: MediaAsset;
  compact?: boolean;
}) {
  return (
    <div
      className={
        compact
          ? "h-14 w-20 overflow-hidden rounded-[0.9rem] bg-[#111111] sm:h-16 sm:w-24"
          : "h-20 w-full overflow-hidden rounded-[1rem] bg-[#111111] sm:h-24 sm:w-36"
      }
    >
      {asset.thumbnailUrl ? (
        <img
          src={toApiUrl(asset.thumbnailUrl)}
          alt={`${asset.originalName} preview`}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      ) : (
        <div
          className={
            compact
              ? "flex h-full w-full items-center justify-center bg-[#181818] px-2 text-center text-[10px] font-semibold uppercase tracking-[0.16em] text-white/70"
              : "flex h-full w-full items-center justify-center bg-[#181818] px-3 text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-white/70"
          }
        >
          {asset.kind}
        </div>
      )}
    </div>
  );
}

function SelectableAssetCard({
  asset,
  selected,
  inputType,
  inputName,
  onSelect,
}: {
  asset: MediaAsset;
  selected: boolean;
  inputType: "radio" | "checkbox";
  inputName?: string;
  onSelect: () => void;
}) {
  return (
    <label className="flex items-center gap-3 rounded-[1.25rem] border border-panel-border bg-white/78 px-3 py-3">
      <input
        type={inputType}
        name={inputName}
        checked={selected}
        onChange={onSelect}
        className="h-4 w-4 shrink-0"
      />
      <AssetThumbnail asset={asset} compact />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-semibold text-foreground">{asset.originalName}</p>
          {selected ? (
            <span className="rounded-full bg-[#111111] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white">
              Selected
            </span>
          ) : null}
        </div>
        <p className="mt-1 truncate text-[11px] uppercase tracking-[0.14em] text-muted">
          {asset.metadata?.formatName ?? asset.mimeType}
        </p>
        <p className="mt-1 text-xs leading-5 text-muted">{formatAssetSummary(asset)}</p>
      </div>
    </label>
  );
}

function PanelHeader({
  eyebrow,
  title,
  badge,
}: {
  eyebrow: string;
  title: string;
  badge?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="font-display text-sm font-semibold uppercase tracking-[0.24em] text-muted">
          {eyebrow}
        </p>
        <h2 className="mt-3 text-2xl font-semibold">{title}</h2>
      </div>
      {badge ? (
        <div className="rounded-full bg-accent-soft px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#8f3b13]">
          {badge}
        </div>
      ) : null}
    </div>
  );
}

export function EditorDashboard({
  activeView = "workspace",
}: {
  activeView?: EditorView;
}) {
  const activeRouteChipClasses =
    "border-[#2f2f2f] bg-[#2f2f2f] text-[#f8f5ef] shadow-[0_12px_30px_rgba(17,17,17,0.14)]";
  const idleRouteChipClasses =
    "border-panel-border bg-white/80 text-foreground hover:bg-white";
  const activeRouteTextStyle = { color: "#f8f5ef" } as const;
  const idleRouteTextStyle = { color: "#111111" } as const;
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [jobs, setJobs] = useState<ProcessingJob[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [trimAssetId, setTrimAssetId] = useState("");
  const [trimStartTime, setTrimStartTime] = useState("0");
  const [trimEndTime, setTrimEndTime] = useState("5");
  const [mergeAssetIds, setMergeAssetIds] = useState<string[]>([]);
  const [normalizePreset, setNormalizePreset] =
    useState<NormalizeTargetPreset>("hd-720p");
  const [isMergeHelpOpen, setIsMergeHelpOpen] = useState(false);
  const [cropPadAssetId, setCropPadAssetId] = useState("");
  const [cropPadMode, setCropPadMode] = useState<CropPadMode>("crop");
  const [cropPadWidth, setCropPadWidth] = useState("");
  const [cropPadHeight, setCropPadHeight] = useState("");
  const [cropPadAnchorX, setCropPadAnchorX] = useState<CropPadAnchorX>("center");
  const [cropPadAnchorY, setCropPadAnchorY] = useState<CropPadAnchorY>("center");
  const [cropPadBackground, setCropPadBackground] = useState("#111111");
  const [convertAssetId, setConvertAssetId] = useState("");
  const [convertFormat, setConvertFormat] = useState<ConvertImageFormat>("webp");
  const [convertQuality, setConvertQuality] = useState("92");
  const [convertWidth, setConvertWidth] = useState("");
  const [convertHeight, setConvertHeight] = useState("");
  const [convertFit, setConvertFit] = useState<ConvertImageFit>("contain");
  const [convertBackground, setConvertBackground] = useState("#ffffff");
  const [feedback, setFeedback] = useState(
    "Upload files once, then open only the function page you need for the next step.",
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [hasRestoredSession, setHasRestoredSession] = useState(false);
  const [isRefreshing, startRefreshTransition] = useTransition();

  const hasProcessingJobs = jobs.some(
    (job) => job.status === "queued" || job.status === "processing",
  );
  const videoAssets = assets.filter(isVideoAsset);
  const imageAssets = assets.filter(isImageAsset);
  const cropPadAssets = assets.filter(isCropPadEligibleAsset);
  const selectedMergeAssets = videoAssets.filter((asset) =>
    mergeAssetIds.includes(asset.id),
  );
  const mergeCompatibilityIssues = getMergeCompatibilityIssues(selectedMergeAssets);
  const mergeRequiresNormalization = mergeCompatibilityIssues.length > 0;
  const normalizeTargetPlan = buildNormalizeTargetPlan(
    selectedMergeAssets,
    normalizePreset,
  );
  const normalizeTarget = normalizeTargetPlan.target;
  const selectedNormalizePreset = normalizeTargetPresetOptions.find(
    (option) => option.value === normalizePreset,
  );
  const selectedCropPadAsset =
    cropPadAssets.find((asset) => asset.id === cropPadAssetId) ?? null;
  const cropPadTargetPlan = buildCropPadTargetPlan({
    asset: selectedCropPadAsset,
    mode: cropPadMode,
    width: cropPadWidth,
    height: cropPadHeight,
    anchorX: cropPadAnchorX,
    anchorY: cropPadAnchorY,
    background: cropPadBackground,
  });
  const convertTargetPlan = buildConvertTargetPlan({
    format: convertFormat,
    quality: convertQuality,
    width: convertWidth,
    height: convertHeight,
    fit: convertFit,
    background: convertBackground,
  });
  const selectedConvertAsset =
    imageAssets.find((asset) => asset.id === convertAssetId) ?? null;
  const currentViewMeta = editorViewMeta[activeView];

  function applyAssetsSnapshot(nextAssets: MediaAsset[]) {
    startRefreshTransition(() => {
      setAssets(nextAssets);

      const nextVideoAssets = nextAssets.filter(isVideoAsset);
      const nextCropPadAssets = nextAssets.filter(isCropPadEligibleAsset);
      const nextImageAssets = nextAssets.filter(isImageAsset);

      if (nextAssets.length === 0) {
        setTrimAssetId("");
        setTrimEndTime("5");
        setMergeAssetIds([]);
        setCropPadAssetId("");
        setCropPadWidth("");
        setCropPadHeight("");
        setConvertAssetId("");
        return;
      }

      const hasSelectedTrimAsset = nextVideoAssets.some(
        (asset) => asset.id === trimAssetId,
      );

      if (!hasSelectedTrimAsset) {
        const nextTrimAsset = nextVideoAssets[0];
        setTrimAssetId(nextTrimAsset?.id ?? "");
        setTrimEndTime(getSuggestedTrimEndTime(nextTrimAsset));
      }

      setMergeAssetIds((current) => {
        const filtered = current.filter((assetId) =>
          nextVideoAssets.some((asset) => asset.id === assetId),
        );

        return filtered.length > 0
          ? filtered
          : getDefaultMergeSelection(nextVideoAssets);
      });

      const hasSelectedConvertAsset = nextImageAssets.some(
        (asset) => asset.id === convertAssetId,
      );

      if (!hasSelectedConvertAsset) {
        setConvertAssetId(nextImageAssets[0]?.id ?? "");
      }

      const hasSelectedCropPadAsset = nextCropPadAssets.some(
        (asset) => asset.id === cropPadAssetId,
      );

      if (!hasSelectedCropPadAsset) {
        const nextCropPadAsset = nextCropPadAssets[0];
        setCropPadAssetId(nextCropPadAsset?.id ?? "");
        setCropPadWidth(
          nextCropPadAsset?.metadata?.width
            ? String(nextCropPadAsset.metadata.width)
            : "",
        );
        setCropPadHeight(
          nextCropPadAsset?.metadata?.height
            ? String(nextCropPadAsset.metadata.height)
            : "",
        );
      }
    });
  }

  async function loadAssets() {
    const response = await fetchJson<AssetsResponse>("/api/v1/assets");
    applyAssetsSnapshot(response.items);
  }

  async function loadJobs() {
    const response = await fetchJson<JobsResponse>("/api/v1/jobs");
    startRefreshTransition(() => {
      setJobs(response.items);
    });
  }

  async function ensureBackendReady(message: string) {
    setFeedback(message);
    const nextHealth = (await waitForBackendWake()) as HealthResponse;

    startRefreshTransition(() => {
      setHealth(nextHealth);
    });

    return nextHealth;
  }

  async function handleRefresh() {
    try {
      await ensureBackendReady("Refreshing uploads and queue history.");
      await Promise.all([loadAssets(), loadJobs()]);
      setErrorMessage("");
      setFeedback("Workspace refreshed.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Could not refresh your files and processing history.",
      );
    }
  }

  useEffect(() => {
    setTrimAssetId(readSessionString(sessionStorageKeys.trimAssetId, ""));
    setMergeAssetIds(readSessionStringArray(sessionStorageKeys.mergeAssetIds));
    setNormalizePreset(
      readSessionString(
        sessionStorageKeys.normalizePreset,
        "hd-720p",
      ) as NormalizeTargetPreset,
    );
    setCropPadAssetId(readSessionString(sessionStorageKeys.cropPadAssetId, ""));
    setCropPadMode(
      readSessionString(sessionStorageKeys.cropPadMode, "crop") as CropPadMode,
    );
    setCropPadWidth(readSessionString(sessionStorageKeys.cropPadWidth, ""));
    setCropPadHeight(readSessionString(sessionStorageKeys.cropPadHeight, ""));
    setCropPadAnchorX(
      readSessionString(
        sessionStorageKeys.cropPadAnchorX,
        "center",
      ) as CropPadAnchorX,
    );
    setCropPadAnchorY(
      readSessionString(
        sessionStorageKeys.cropPadAnchorY,
        "center",
      ) as CropPadAnchorY,
    );
    setCropPadBackground(
      readSessionString(sessionStorageKeys.cropPadBackground, "#111111"),
    );
    setConvertAssetId(readSessionString(sessionStorageKeys.convertAssetId, ""));
    setConvertFormat(
      readSessionString(
        sessionStorageKeys.convertFormat,
        "webp",
      ) as ConvertImageFormat,
    );
    setConvertQuality(readSessionString(sessionStorageKeys.convertQuality, "92"));
    setConvertWidth(readSessionString(sessionStorageKeys.convertWidth, ""));
    setConvertHeight(readSessionString(sessionStorageKeys.convertHeight, ""));
    setConvertFit(
      readSessionString(
        sessionStorageKeys.convertFit,
        "contain",
      ) as ConvertImageFit,
    );
    setConvertBackground(
      readSessionString(sessionStorageKeys.convertBackground, "#ffffff"),
    );
    setHasRestoredSession(true);
  }, []);

  useEffect(() => {
    if (!hasRestoredSession) {
      return;
    }

    let isActive = true;

    async function loadInitialData() {
      try {
        setFeedback("Preparing your workspace and loading the latest files.");

        const nextHealth = (await waitForBackendWake()) as HealthResponse;
        const [nextAssets, nextJobs] = await Promise.all([
          fetchJson<AssetsResponse>("/api/v1/assets"),
          fetchJson<JobsResponse>("/api/v1/jobs"),
        ]);

        if (!isActive) {
          return;
        }

        startRefreshTransition(() => {
          setHealth(nextHealth);
          setJobs(nextJobs.items);
        });

        applyAssetsSnapshot(nextAssets.items);
      } catch (error) {
        if (!isActive) {
          return;
        }

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Could not connect to the editing service.",
        );
      }
    }

    void loadInitialData();

    return () => {
      isActive = false;
    };
  }, [hasRestoredSession]);

  useEffect(() => {
    if (!hasRestoredSession || !hasProcessingJobs) {
      return;
    }

    let isActive = true;

    const intervalId = window.setInterval(() => {
      void (async () => {
        try {
          if (!isActive) {
            return;
          }

          await Promise.all([loadAssets(), loadJobs()]);
        } catch {
          return;
        }
      })();
    }, 2000);

    return () => {
      isActive = false;
      window.clearInterval(intervalId);
    };
  }, [hasProcessingJobs, hasRestoredSession, startRefreshTransition]);

  useEffect(() => {
    if (!mergeRequiresNormalization) {
      setIsMergeHelpOpen(false);
    }
  }, [mergeRequiresNormalization]);

  useEffect(() => {
    if (!hasRestoredSession) {
      return;
    }

    window.sessionStorage.setItem(sessionStorageKeys.trimAssetId, trimAssetId);
  }, [hasRestoredSession, trimAssetId]);

  useEffect(() => {
    if (!hasRestoredSession) {
      return;
    }

    window.sessionStorage.setItem(
      sessionStorageKeys.mergeAssetIds,
      JSON.stringify(mergeAssetIds),
    );
  }, [hasRestoredSession, mergeAssetIds]);

  useEffect(() => {
    if (!hasRestoredSession) {
      return;
    }

    window.sessionStorage.setItem(
      sessionStorageKeys.normalizePreset,
      normalizePreset,
    );
  }, [hasRestoredSession, normalizePreset]);

  useEffect(() => {
    if (!hasRestoredSession) {
      return;
    }

    window.sessionStorage.setItem(sessionStorageKeys.cropPadAssetId, cropPadAssetId);
  }, [hasRestoredSession, cropPadAssetId]);

  useEffect(() => {
    if (!hasRestoredSession) {
      return;
    }

    window.sessionStorage.setItem(sessionStorageKeys.cropPadMode, cropPadMode);
  }, [hasRestoredSession, cropPadMode]);

  useEffect(() => {
    if (!hasRestoredSession) {
      return;
    }

    window.sessionStorage.setItem(sessionStorageKeys.cropPadWidth, cropPadWidth);
  }, [hasRestoredSession, cropPadWidth]);

  useEffect(() => {
    if (!hasRestoredSession) {
      return;
    }

    window.sessionStorage.setItem(sessionStorageKeys.cropPadHeight, cropPadHeight);
  }, [hasRestoredSession, cropPadHeight]);

  useEffect(() => {
    if (!hasRestoredSession) {
      return;
    }

    window.sessionStorage.setItem(sessionStorageKeys.cropPadAnchorX, cropPadAnchorX);
  }, [hasRestoredSession, cropPadAnchorX]);

  useEffect(() => {
    if (!hasRestoredSession) {
      return;
    }

    window.sessionStorage.setItem(sessionStorageKeys.cropPadAnchorY, cropPadAnchorY);
  }, [hasRestoredSession, cropPadAnchorY]);

  useEffect(() => {
    if (!hasRestoredSession) {
      return;
    }

    window.sessionStorage.setItem(
      sessionStorageKeys.cropPadBackground,
      cropPadBackground,
    );
  }, [hasRestoredSession, cropPadBackground]);

  useEffect(() => {
    if (!hasRestoredSession) {
      return;
    }

    window.sessionStorage.setItem(sessionStorageKeys.convertAssetId, convertAssetId);
  }, [hasRestoredSession, convertAssetId]);

  useEffect(() => {
    if (!hasRestoredSession) {
      return;
    }

    window.sessionStorage.setItem(sessionStorageKeys.convertFormat, convertFormat);
  }, [hasRestoredSession, convertFormat]);

  useEffect(() => {
    if (!hasRestoredSession) {
      return;
    }

    window.sessionStorage.setItem(sessionStorageKeys.convertQuality, convertQuality);
  }, [hasRestoredSession, convertQuality]);

  useEffect(() => {
    if (!hasRestoredSession) {
      return;
    }

    window.sessionStorage.setItem(sessionStorageKeys.convertWidth, convertWidth);
  }, [hasRestoredSession, convertWidth]);

  useEffect(() => {
    if (!hasRestoredSession) {
      return;
    }

    window.sessionStorage.setItem(sessionStorageKeys.convertHeight, convertHeight);
  }, [hasRestoredSession, convertHeight]);

  useEffect(() => {
    if (!hasRestoredSession) {
      return;
    }

    window.sessionStorage.setItem(sessionStorageKeys.convertFit, convertFit);
  }, [hasRestoredSession, convertFit]);

  useEffect(() => {
    if (!hasRestoredSession) {
      return;
    }

    window.sessionStorage.setItem(
      sessionStorageKeys.convertBackground,
      convertBackground,
    );
  }, [hasRestoredSession, convertBackground]);

  async function handleUpload() {
    if (selectedFiles.length === 0) {
      setErrorMessage("Choose at least one file before uploading.");
      return;
    }

    setBusyAction("upload");
    setErrorMessage("");

    try {
      await ensureBackendReady("Preparing uploads.");
      const formData = new FormData();

      selectedFiles.forEach((file) => {
        formData.append("files", file);
      });

      const response = await fetch(toApiUrl("/api/v1/uploads"), {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json()) as UploadResponse & { message?: string };

      if (!response.ok) {
        throw new Error(payload.message ?? "Upload failed.");
      }

      await Promise.all([loadAssets(), loadJobs()]);

      setSelectedFiles([]);
      setFileInputKey((current) => current + 1);
      setFeedback(`Uploaded ${payload.items.length} file(s). Metadata is ready.`);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setBusyAction(null);
    }
  }

  async function handleTrimJob() {
    if (!trimAssetId) {
      setErrorMessage("Upload a video clip and choose it for trimming first.");
      return;
    }

    setBusyAction("trim");
    setErrorMessage("");

    try {
      await ensureBackendReady("Preparing your trim request.");
      const response = await fetchJson<JobResponse>("/api/v1/jobs/trim", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assetId: trimAssetId,
          startTime: Number(trimStartTime),
          endTime: Number(trimEndTime),
        }),
      });

      await loadJobs();
      setFeedback(`Trim job ${response.item.id.slice(0, 8)} has been queued.`);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Trim job failed.");
    } finally {
      setBusyAction(null);
    }
  }

  async function handleMergeJob() {
    if (mergeAssetIds.length < 2) {
      setErrorMessage("Select at least two video clips to merge.");
      return;
    }

    if (mergeRequiresNormalization) {
      setErrorMessage(
        "These clips still need normalization before merge. Open the Normalize page and align them first.",
      );
      return;
    }

    setBusyAction("merge");
    setErrorMessage("");

    try {
      await ensureBackendReady("Preparing your merge request.");
      const response = await fetchJson<JobResponse>("/api/v1/jobs/merge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sourceAssetIds: mergeAssetIds,
        }),
      });

      await loadJobs();
      setFeedback(`Merge job ${response.item.id.slice(0, 8)} has been queued.`);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Merge job failed.");
    } finally {
      setBusyAction(null);
    }
  }

  async function handleNormalizeJobs() {
    if (selectedMergeAssets.length === 0) {
      setErrorMessage("Select at least one clip before normalizing.");
      return;
    }

    if (!normalizeTarget) {
      setErrorMessage(
        normalizeTargetPlan.errorMessage ?? "Normalize target could not be prepared.",
      );
      return;
    }

    setBusyAction("normalize");
    setErrorMessage("");

    try {
      await ensureBackendReady("Preparing your clips for merge.");

      await Promise.all(
        selectedMergeAssets.map((asset) =>
          fetchJson<JobResponse>("/api/v1/jobs/normalize", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              assetId: asset.id,
              target: normalizeTarget,
            }),
          }),
        ),
      );

      await loadJobs();
      setFeedback(
        `Queued ${selectedMergeAssets.length} normalize job(s) to ${normalizeTarget.width}x${normalizeTarget.height}. When they finish, merge the new normalized outputs instead of the originals.`,
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Normalize jobs could not be queued.",
      );
    } finally {
      setBusyAction(null);
    }
  }

  function handleCropPadAssetSelect(asset: MediaAsset) {
    setCropPadAssetId(asset.id);
    setCropPadWidth(asset.metadata?.width ? String(asset.metadata.width) : "");
    setCropPadHeight(asset.metadata?.height ? String(asset.metadata.height) : "");
  }

  async function handleCropPadJob() {
    if (!cropPadAssetId) {
      setErrorMessage("Choose one image or video file before queueing crop / pad.");
      return;
    }

    if (!cropPadTargetPlan.target) {
      setErrorMessage(
        cropPadTargetPlan.errorMessage ?? "Crop / pad target could not be prepared.",
      );
      return;
    }

    setBusyAction("crop-pad");
    setErrorMessage("");

    try {
      await ensureBackendReady("Preparing your crop / pad request.");
      const response = await fetchJson<JobResponse>("/api/v1/jobs/crop-pad", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assetId: cropPadAssetId,
          target: cropPadTargetPlan.target,
        }),
      });

      await loadJobs();
      setFeedback(`Crop / pad job ${response.item.id.slice(0, 8)} has been queued.`);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Crop / pad job failed.");
    } finally {
      setBusyAction(null);
    }
  }

  async function handleConvertJob() {
    if (!convertAssetId) {
      setErrorMessage("Choose an uploaded image before creating a convert job.");
      return;
    }

    if (!convertTargetPlan.target) {
      setErrorMessage(
        convertTargetPlan.errorMessage ?? "Convert target could not be prepared.",
      );
      return;
    }

    setBusyAction("convert");
    setErrorMessage("");

    try {
      await ensureBackendReady("Preparing your image conversion request.");
      const response = await fetchJson<JobResponse>("/api/v1/jobs/convert-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assetId: convertAssetId,
          target: convertTargetPlan.target,
        }),
      });

      await loadJobs();
      setFeedback(`Convert job ${response.item.id.slice(0, 8)} has been queued.`);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Convert job failed.");
    } finally {
      setBusyAction(null);
    }
  }

  async function handleDeleteAsset(asset: MediaAsset) {
    const confirmed = window.confirm(
      `Delete "${asset.originalName}" from ${asset.storageDriver ?? "local"} storage?`,
    );

    if (!confirmed) {
      return;
    }

    setBusyAction(`delete:${asset.id}`);
    setErrorMessage("");

    try {
      await ensureBackendReady("Preparing file removal.");
      const response = await fetchJson<{ message?: string }>(
        `/api/v1/assets/${asset.id}`,
        {
          method: "DELETE",
        },
      );

      await Promise.all([loadAssets(), loadJobs()]);
      setFeedback(response.message ?? `Deleted ${asset.originalName}.`);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Asset delete failed.");
    } finally {
      setBusyAction(null);
    }
  }

  function toggleMergeAsset(assetId: string) {
    setMergeAssetIds((current) =>
      current.includes(assetId)
        ? current.filter((value) => value !== assetId)
        : [...current, assetId],
    );
  }

  function renderWorkspaceOverviewPanel() {
    return (
      <section className="glass-panel rounded-[2rem] p-6 sm:p-8">
        <PanelHeader
          eyebrow="Function launcher"
          title="Choose one action and jump straight to it"
          badge="Overview"
        />

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {functionRouteOptions.map((item) => (
            <Link
              key={item.view}
              href={item.href}
              className="rounded-[1.4rem] border border-panel-border bg-white/82 p-5 transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(17,17,17,0.08)]"
            >
              <p className="text-lg font-semibold text-foreground">{item.label}</p>
              <p className="mt-2 text-sm leading-6 text-muted">{item.description}</p>
            </Link>
          ))}

          <Link
            href="/jobs"
            className="rounded-[1.4rem] border border-panel-border bg-[#111111] p-5 text-white transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(17,17,17,0.14)]"
            style={activeRouteTextStyle}
          >
            <p className="text-lg font-semibold text-white">Open jobs queue</p>
            <p className="mt-2 text-sm leading-6 text-white/70">
              Review processing history, track current jobs, and download finished results without leaving the shared upload space.
            </p>
          </Link>
        </div>
      </section>
    );
  }

  function renderTrimPanel() {
    return (
      <section className="glass-panel rounded-[2rem] p-6 sm:p-8">
        <PanelHeader
          eyebrow="Trim function"
          title="Cut one clip to the exact moment range"
          badge="Function"
        />

        <div className="mt-6 space-y-4">
          {videoAssets.length > 0 ? (
            <div className="grid max-h-[18rem] gap-3 overflow-y-auto pr-1">
              {videoAssets.map((asset) => (
                <SelectableAssetCard
                  key={asset.id}
                  asset={asset}
                  selected={trimAssetId === asset.id}
                  inputType="radio"
                  inputName="trim-asset"
                  onSelect={() => {
                    setTrimAssetId(asset.id);
                    setTrimEndTime(getSuggestedTrimEndTime(asset));
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-[1.5rem] bg-white/72 p-5 text-sm leading-6 text-muted">
              Upload a video clip to enable trim.
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-foreground">
              Start time (seconds)
              <input
                type="number"
                min="0"
                step="0.1"
                value={trimStartTime}
                onChange={(event) => {
                  setTrimStartTime(event.target.value);
                }}
                className="rounded-2xl border border-panel-border bg-white px-4 py-3 text-sm"
              />
            </label>

            <label className="grid gap-2 text-sm font-medium text-foreground">
              End time (seconds)
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={trimEndTime}
                onChange={(event) => {
                  setTrimEndTime(event.target.value);
                }}
                className="rounded-2xl border border-panel-border bg-white px-4 py-3 text-sm"
              />
            </label>
          </div>

          <button
            type="button"
            onClick={() => {
              void handleTrimJob();
            }}
            disabled={busyAction === "trim" || !trimAssetId}
            className="rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busyAction === "trim" ? "Queueing trim..." : "Queue trim job"}
          </button>
        </div>
      </section>
    );
  }

  function renderMergePanel() {
    return (
      <section className="glass-panel rounded-[2rem] p-6 sm:p-8">
        <PanelHeader
          eyebrow="Merge function"
          title="Combine prepared clips into one final video"
          badge="Function"
        />

        <div className="mt-6 space-y-4">
          {videoAssets.length > 0 ? (
            <div className="grid max-h-[18rem] gap-3 overflow-y-auto pr-1">
              {videoAssets.map((asset) => (
                <SelectableAssetCard
                  key={asset.id}
                  asset={asset}
                  selected={mergeAssetIds.includes(asset.id)}
                  inputType="checkbox"
                  onSelect={() => {
                    toggleMergeAsset(asset.id);
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-[1.5rem] bg-white/72 p-5 text-sm leading-6 text-muted">
              Upload at least two video clips to enable merge.
            </div>
          )}

          {mergeRequiresNormalization ? (
            <div className="rounded-[1.5rem] bg-[#fff1ea] px-4 py-4 text-[#8f3b13]">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold">
                  Merge is blocked until the selected clips share one format.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsMergeHelpOpen((current) => !current);
                  }}
                  aria-expanded={isMergeHelpOpen}
                  aria-label="Toggle merge details"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-[#e8b39a] bg-white text-sm font-semibold text-[#8f3b13] transition hover:bg-[#fff8f4]"
                >
                  i
                </button>
              </div>

              {isMergeHelpOpen ? (
                <div className="mt-3 text-sm leading-6">
                  <p>
                    Open the dedicated Normalize page to align resolution, codecs, frame rate, and audio settings before merging.
                  </p>
                  {mergeCompatibilityIssues.map((issue) => (
                    <p key={issue} className="mt-2">
                      {issue}
                    </p>
                  ))}
                </div>
              ) : null}

              <div className="mt-4">
                <Link
                  href="/functions/normalize"
                  className="rounded-full border border-[#e8b39a] bg-white px-4 py-2 text-sm font-semibold text-[#8f3b13]"
                >
                  Open normalize page
                </Link>
              </div>
            </div>
          ) : null}

          <button
            type="button"
            onClick={() => {
              void handleMergeJob();
            }}
            disabled={
              busyAction === "merge" ||
              mergeAssetIds.length < 2 ||
              mergeRequiresNormalization
            }
            className="rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busyAction === "merge" ? "Queueing merge..." : "Queue merge job"}
          </button>
        </div>
      </section>
    );
  }

  function renderNormalizePanel() {
    return (
      <section className="glass-panel rounded-[2rem] p-6 sm:p-8">
        <PanelHeader
          eyebrow="Normalize function"
          title="Align clips before you merge them"
          badge="Function"
        />

        <div className="mt-6 space-y-4">
          {videoAssets.length > 0 ? (
            <div className="grid max-h-[16rem] gap-3 overflow-y-auto pr-1">
              {videoAssets.map((asset) => (
                <SelectableAssetCard
                  key={asset.id}
                  asset={asset}
                  selected={mergeAssetIds.includes(asset.id)}
                  inputType="checkbox"
                  onSelect={() => {
                    toggleMergeAsset(asset.id);
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-[1.5rem] bg-white/72 p-5 text-sm leading-6 text-muted">
              Upload video clips to prepare a normalize batch.
            </div>
          )}

          <div className="rounded-[1.5rem] bg-white/78 p-4">
            <p className="text-sm font-semibold text-foreground">Target preset</p>
            <p className="mt-2 text-sm leading-6 text-muted">
              {selectedNormalizePreset?.description ??
                "Choose how the selected clips should be aligned before merge."}
            </p>

            <label className="mt-4 grid gap-2 text-sm font-medium text-foreground">
              Preset
              <select
                value={normalizePreset}
                onChange={(event) => {
                  setNormalizePreset(event.target.value as NormalizeTargetPreset);
                }}
                className="rounded-2xl border border-panel-border bg-white px-4 py-3 text-sm"
              >
                {normalizeTargetPresetOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-[#f8f5ef] px-4 py-3">
                <p className="text-xs uppercase tracking-[0.16em] text-muted">Target canvas</p>
                <p className="mt-2 text-sm font-semibold">
                  {normalizeTarget
                    ? `${normalizeTarget.width}x${normalizeTarget.height}`
                    : "Unavailable"}
                </p>
              </div>
              <div className="rounded-2xl bg-[#f8f5ef] px-4 py-3">
                <p className="text-xs uppercase tracking-[0.16em] text-muted">Output profile</p>
                <p className="mt-2 text-sm font-semibold">
                  {formatNormalizeTarget(normalizeTarget)}
                </p>
              </div>
            </div>

            {normalizeTargetPlan.errorMessage ? (
              <p className="mt-4 rounded-2xl bg-[#fff1ea] px-4 py-3 text-sm text-[#8f3b13]">
                {normalizeTargetPlan.errorMessage}
              </p>
            ) : null}

            <button
              type="button"
              onClick={() => {
                void handleNormalizeJobs();
              }}
              disabled={busyAction === "normalize" || !normalizeTarget}
              className="mt-4 rounded-full border border-panel-border bg-white px-5 py-3 text-sm font-semibold text-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busyAction === "normalize"
                ? "Queueing normalize..."
                : "Normalize selected clips"}
            </button>
          </div>
        </div>
      </section>
    );
  }

  function renderCropPadPanel() {
    return (
      <section className="glass-panel rounded-[2rem] p-6 sm:p-8">
        <PanelHeader
          eyebrow="Crop / pad function"
          title="Tighten the frame or place it on a larger canvas"
          badge="Function"
        />

        <div className="mt-6 space-y-4">
          {cropPadAssets.length > 0 ? (
            <div className="grid max-h-[16rem] gap-3 overflow-y-auto pr-1">
              {cropPadAssets.map((asset) => (
                <SelectableAssetCard
                  key={asset.id}
                  asset={asset}
                  selected={cropPadAssetId === asset.id}
                  inputType="radio"
                  inputName="crop-pad-asset"
                  onSelect={() => {
                    handleCropPadAssetSelect(asset);
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-[1.5rem] bg-white/72 p-5 text-sm leading-6 text-muted">
              Upload a video clip or supported image to enable crop / pad.
            </div>
          )}

          <div className="grid gap-4 lg:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-foreground">
              Mode
              <select
                value={cropPadMode}
                onChange={(event) => {
                  setCropPadMode(event.target.value as CropPadMode);
                }}
                className="rounded-2xl border border-panel-border bg-white px-4 py-3 text-sm"
              >
                {cropPadModeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="rounded-[1.5rem] bg-white/78 px-4 py-4">
              <p className="text-sm font-semibold text-foreground">
                {cropPadModeOptions.find((option) => option.value === cropPadMode)?.label}
              </p>
              <p className="mt-2 text-sm leading-6 text-muted">
                {cropPadModeOptions.find((option) => option.value === cropPadMode)
                  ?.description ??
                  "Choose whether to remove frame edges or add canvas space."}
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-foreground">
              Width
              <input
                type="number"
                min="1"
                step="1"
                value={cropPadWidth}
                onChange={(event) => {
                  setCropPadWidth(event.target.value);
                }}
                className="rounded-2xl border border-panel-border bg-white px-4 py-3 text-sm"
              />
            </label>

            <label className="grid gap-2 text-sm font-medium text-foreground">
              Height
              <input
                type="number"
                min="1"
                step="1"
                value={cropPadHeight}
                onChange={(event) => {
                  setCropPadHeight(event.target.value);
                }}
                className="rounded-2xl border border-panel-border bg-white px-4 py-3 text-sm"
              />
            </label>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-foreground">
              Horizontal anchor
              <select
                value={cropPadAnchorX}
                onChange={(event) => {
                  setCropPadAnchorX(event.target.value as CropPadAnchorX);
                }}
                className="rounded-2xl border border-panel-border bg-white px-4 py-3 text-sm"
              >
                {cropPadHorizontalAnchorOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 text-sm font-medium text-foreground">
              Vertical anchor
              <select
                value={cropPadAnchorY}
                onChange={(event) => {
                  setCropPadAnchorY(event.target.value as CropPadAnchorY);
                }}
                className="rounded-2xl border border-panel-border bg-white px-4 py-3 text-sm"
              >
                {cropPadVerticalAnchorOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {cropPadMode === "pad" ? (
            <label className="grid gap-2 text-sm font-medium text-foreground">
              Background color
              <input
                type="text"
                value={cropPadBackground}
                onChange={(event) => {
                  setCropPadBackground(event.target.value);
                }}
                className="rounded-2xl border border-panel-border bg-white px-4 py-3 text-sm"
              />
            </label>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl bg-[#f8f5ef] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.16em] text-muted">Source</p>
              <p className="mt-2 text-sm font-semibold">
                {selectedCropPadAsset?.metadata?.width && selectedCropPadAsset?.metadata?.height
                  ? `${selectedCropPadAsset.metadata.width}x${selectedCropPadAsset.metadata.height}`
                  : "Choose a file"}
              </p>
            </div>
            <div className="rounded-2xl bg-[#f8f5ef] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.16em] text-muted">Output rule</p>
              <p className="mt-2 text-sm font-semibold">
                {formatCropPadTargetSummary(
                  selectedCropPadAsset,
                  cropPadTargetPlan.target,
                )}
              </p>
            </div>
            <div className="rounded-2xl bg-[#f8f5ef] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.16em] text-muted">File type</p>
              <p className="mt-2 text-sm font-semibold">
                {selectedCropPadAsset
                  ? isVideoAsset(selectedCropPadAsset)
                    ? "Video"
                    : "Image"
                  : "Unavailable"}
              </p>
            </div>
          </div>

          <div className="rounded-[1.5rem] bg-white/78 px-4 py-4 text-sm leading-6 text-muted">
            {selectedCropPadAsset && isVideoAsset(selectedCropPadAsset) ? (
              <p>
                Video outputs stay MP4/H.264/AAC, so width and height should use even numbers.
              </p>
            ) : (
              <p>
                Image outputs keep the original format. Use Convert when you also need PNG, JPEG,
                or WebP format switching.
              </p>
            )}
          </div>

          {cropPadTargetPlan.errorMessage ? (
            <p className="rounded-2xl bg-[#fff1ea] px-4 py-3 text-sm text-[#8f3b13]">
              {cropPadTargetPlan.errorMessage}
            </p>
          ) : null}

          <button
            type="button"
            onClick={() => {
              void handleCropPadJob();
            }}
            disabled={busyAction === "crop-pad" || !cropPadAssetId || !cropPadTargetPlan.target}
            className="rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busyAction === "crop-pad" ? "Queueing crop / pad..." : "Queue crop / pad job"}
          </button>
        </div>
      </section>
    );
  }

  function renderConvertPanel() {
    return (
      <section className="glass-panel rounded-[2rem] p-6 sm:p-8">
        <PanelHeader
          eyebrow="Convert function"
          title="Convert PNG, JPEG, and WebP files"
          badge="Function"
        />

        <div className="mt-6 space-y-4">
          {imageAssets.length > 0 ? (
            <div className="grid max-h-[14rem] gap-3 overflow-y-auto pr-1">
              {imageAssets.map((asset) => (
                <SelectableAssetCard
                  key={asset.id}
                  asset={asset}
                  selected={convertAssetId === asset.id}
                  inputType="radio"
                  inputName="convert-asset"
                  onSelect={() => {
                    setConvertAssetId(asset.id);
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-[1.5rem] bg-white/72 p-5 text-sm leading-6 text-muted">
              Upload PNG, JPEG, or WebP files to enable image conversion.
            </div>
          )}

          <div className="grid gap-4 lg:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-foreground">
              Output format
              <select
                value={convertFormat}
                onChange={(event) => {
                  setConvertFormat(event.target.value as ConvertImageFormat);
                }}
                className="rounded-2xl border border-panel-border bg-white px-4 py-3 text-sm"
              >
                {convertFormatOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 text-sm font-medium text-foreground">
              Fit mode
              <select
                value={convertFit}
                onChange={(event) => {
                  setConvertFit(event.target.value as ConvertImageFit);
                }}
                className="rounded-2xl border border-panel-border bg-white px-4 py-3 text-sm"
              >
                {convertFitOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-foreground">
              Width (optional)
              <input
                type="number"
                min="1"
                step="1"
                value={convertWidth}
                onChange={(event) => {
                  setConvertWidth(event.target.value);
                }}
                className="rounded-2xl border border-panel-border bg-white px-4 py-3 text-sm"
              />
            </label>

            <label className="grid gap-2 text-sm font-medium text-foreground">
              Height (optional)
              <input
                type="number"
                min="1"
                step="1"
                value={convertHeight}
                onChange={(event) => {
                  setConvertHeight(event.target.value);
                }}
                className="rounded-2xl border border-panel-border bg-white px-4 py-3 text-sm"
              />
            </label>
          </div>

          {convertFormat !== "png" ? (
            <label className="grid gap-2 text-sm font-medium text-foreground">
              Quality (1-100)
              <input
                type="number"
                min="1"
                max="100"
                step="1"
                value={convertQuality}
                onChange={(event) => {
                  setConvertQuality(event.target.value);
                }}
                className="rounded-2xl border border-panel-border bg-white px-4 py-3 text-sm"
              />
            </label>
          ) : null}

          <label className="grid gap-2 text-sm font-medium text-foreground">
            Background for JPEG or padded images
            <input
              type="text"
              value={convertBackground}
              onChange={(event) => {
                setConvertBackground(event.target.value);
              }}
              className="rounded-2xl border border-panel-border bg-white px-4 py-3 text-sm"
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-[#f8f5ef] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.16em] text-muted">Source</p>
              <p className="mt-2 text-sm font-semibold">
                {selectedConvertAsset?.originalName ?? "Choose an image"}
              </p>
            </div>
            <div className="rounded-2xl bg-[#f8f5ef] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.16em] text-muted">Target summary</p>
              <p className="mt-2 text-sm font-semibold">
                {formatConvertTargetSummary(convertTargetPlan.target)}
              </p>
            </div>
          </div>

          {convertTargetPlan.errorMessage ? (
            <p className="rounded-2xl bg-[#fff1ea] px-4 py-3 text-sm text-[#8f3b13]">
              {convertTargetPlan.errorMessage}
            </p>
          ) : null}

          <button
            type="button"
            onClick={() => {
              void handleConvertJob();
            }}
            disabled={busyAction === "convert" || !convertAssetId || !convertTargetPlan.target}
            className="rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busyAction === "convert" ? "Queueing convert..." : "Queue convert job"}
          </button>
        </div>
      </section>
    );
  }

  function renderJobsPanel() {
    return (
      <section className="glass-panel rounded-[2rem] p-6 sm:p-8">
        <PanelHeader
          eyebrow="Queue history"
          title="Watch processing and download finished outputs"
          badge="Jobs"
        />

        <div className="mt-6 grid max-h-[34rem] gap-4 overflow-y-auto pr-1">
          {jobs.length > 0 ? (
            jobs.map((job) => (
              <article
                key={job.id}
                className="rounded-[1.5rem] border border-panel-border bg-white/78 p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold">{getJobTypeLabel(job.type)}</p>
                    <p className="mt-1 text-sm text-muted">
                      {job.id} | {new Date(job.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-full bg-[#f8f5ef] px-4 py-2 text-sm font-semibold text-foreground">
                    {formatStatusLabel(job.status)}
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl bg-[#f8f5ef] px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.16em] text-muted">Type</p>
                    <p className="mt-2 text-sm font-semibold">{job.type}</p>
                  </div>
                  <div className="rounded-2xl bg-[#f8f5ef] px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.16em] text-muted">Sources</p>
                    <p className="mt-2 text-sm font-semibold">{job.sourceAssetIds.length}</p>
                  </div>
                  <div className="rounded-2xl bg-[#f8f5ef] px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.16em] text-muted">Progress</p>
                    <p className="mt-2 text-sm font-semibold">
                      {formatJobProgress(job.progress) ?? "Waiting for update"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  {job.downloadUrl ? (
                    <a
                      href={toApiUrl(job.downloadUrl)}
                      className="rounded-full border border-panel-border bg-white px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-[#f8f5ef]"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Download result
                    </a>
                  ) : null}

                  {job.error ? (
                    <p className="rounded-full bg-[#fff1ea] px-4 py-2 text-sm text-[#8f3b13]">
                      {job.error}
                    </p>
                  ) : null}
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-[1.5rem] bg-white/72 p-5 text-sm leading-6 text-muted">
              No jobs queued yet. Open one function page, queue work there, then return here to watch the history.
            </div>
          )}
        </div>
      </section>
    );
  }

  function renderActivePanel() {
    if (activeView === "trim") {
      return renderTrimPanel();
    }

    if (activeView === "merge") {
      return renderMergePanel();
    }

    if (activeView === "normalize") {
      return renderNormalizePanel();
    }

    if (activeView === "crop-pad") {
      return renderCropPadPanel();
    }

    if (activeView === "convert") {
      return renderConvertPanel();
    }

    if (activeView === "jobs") {
      return renderJobsPanel();
    }

    return renderWorkspaceOverviewPanel();
  }

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-5 py-6 sm:px-8 lg:px-10">
      <section className="glass-panel overflow-hidden rounded-[2rem]">
        <div className="grid gap-6 px-6 py-7 sm:px-8 lg:grid-cols-[1.2fr_0.9fr] lg:px-10">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-panel-border bg-white/70 px-4 py-2 text-sm text-muted">
              <span className="h-2.5 w-2.5 rounded-full bg-accent" />
              {currentViewMeta.eyebrow}
            </div>

            <div className="space-y-4">
              <p className="font-display text-sm font-semibold uppercase tracking-[0.28em] text-muted">
                {currentViewMeta.label}
              </p>
              <h1 className="max-w-3xl font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
                Choose one file action, open the right page, and stay focused on that job only.
              </h1>
              <p className="max-w-3xl text-base leading-8 text-muted sm:text-lg">
                {currentViewMeta.description}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {functionRouteOptions.map((item) => {
                const isActive = activeView === item.view;

                return (
                  <Link
                    key={item.view}
                    href={item.href}
                    className={`relative rounded-full border px-4 py-2 text-sm font-semibold transition ${
                      isActive ? activeRouteChipClasses : idleRouteChipClasses
                    }`}
                    style={isActive ? activeRouteTextStyle : idleRouteTextStyle}
                  >
                    <span
                      className={`relative z-10 ${
                        isActive ? "!text-[#f8f5ef]" : "text-foreground"
                      }`}
                      style={isActive ? activeRouteTextStyle : idleRouteTextStyle}
                    >
                      {item.shortLabel}
                    </span>
                  </Link>
                );
              })}

              <Link
                href="/jobs"
                className={`relative rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  activeView === "jobs"
                    ? activeRouteChipClasses
                    : idleRouteChipClasses
                }`}
                style={
                  activeView === "jobs" ? activeRouteTextStyle : idleRouteTextStyle
                }
              >
                <span
                  className={`relative z-10 ${
                    activeView === "jobs" ? "!text-[#f8f5ef]" : "text-foreground"
                  }`}
                  style={
                    activeView === "jobs" ? activeRouteTextStyle : idleRouteTextStyle
                  }
                >
                  Jobs
                </span>
              </Link>
            </div>
          </div>

          <div className="rounded-[1.75rem] bg-[#111111] p-4 text-white shadow-[0_30px_80px_rgba(17,17,17,0.22)]">
            <div className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.22em] text-white/45">
                    Workspace status
                  </p>
                  <p className="mt-1 text-lg font-semibold">
                    {health?.status === "ok" ? "Ready to edit" : "Starting up"}
                  </p>
                  <p className="mt-2 text-sm text-white/60">
                    {health?.status === "ok"
                      ? "Uploads and queue actions are available on every route."
                      : "Please wait a moment while the workspace wakes up."}
                  </p>
                </div>
                <div className="rounded-full bg-[#ff6b2c] px-3 py-1 text-xs font-semibold text-black">
                  {health?.status === "ok" ? "online" : "warming up"}
                </div>
              </div>

              <div className="space-y-3 rounded-[1.2rem] bg-white/6 p-4">
                {statusHighlights.map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-3 rounded-2xl border border-white/8 bg-black/20 px-4 py-3"
                  >
                    <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[#ff6b2c]" />
                    <p className="text-sm leading-6 text-white/84">{item}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-white px-4 py-3 text-black">
                  <p className="text-xs uppercase tracking-[0.2em] text-black/45">Assets</p>
                  <p className="mt-2 text-lg font-semibold">{assets.length}</p>
                </div>
                <div className="rounded-2xl bg-white/10 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/45">Jobs</p>
                  <p className="mt-2 text-lg font-semibold">{jobs.length}</p>
                </div>
                <div className="rounded-2xl bg-white/10 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/45">Polling</p>
                  <p className="mt-2 text-lg font-semibold">
                    {hasProcessingJobs || isRefreshing ? "Active" : "Idle"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.88fr_1.12fr]">
        <div className="space-y-5">
          <section className="glass-panel rounded-[2rem] p-6 sm:p-8">
            <PanelHeader
              eyebrow="Current feedback"
              title="Shared workspace notes"
              badge="Shared"
            />
            <p className="mt-5 text-sm leading-7 text-muted">{feedback}</p>
            {errorMessage ? (
              <p className="mt-4 rounded-2xl bg-[#fff1ea] px-4 py-3 text-sm text-[#8f3b13]">
                {errorMessage}
              </p>
            ) : null}
          </section>

          <section className="glass-panel rounded-[2rem] p-6 sm:p-8">
            <PanelHeader
              eyebrow="Upload media"
              title="Add files once and use them on every function page"
              badge="Shared"
            />

            <div className="mt-6 rounded-[1.5rem] border border-dashed border-panel-border bg-white/70 p-5">
              <input
                key={fileInputKey}
                type="file"
                multiple
                accept="video/*,audio/*,image/*"
                onChange={(event) => {
                  setSelectedFiles(Array.from(event.target.files ?? []));
                }}
                className="block w-full text-sm text-muted file:mr-4 file:rounded-full file:border-0 file:bg-foreground file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
              />

              <div className="mt-4 flex flex-wrap gap-2">
                {selectedFiles.length > 0 ? (
                  selectedFiles.map((file) => (
                    <span
                      key={`${file.name}-${file.lastModified}`}
                      className="rounded-full bg-white px-3 py-2 text-xs font-medium text-foreground shadow-sm"
                    >
                      {file.name}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-muted">No files selected yet.</span>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  void handleUpload();
                }}
                disabled={busyAction === "upload"}
                className="mt-5 rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busyAction === "upload" ? "Uploading..." : "Upload and probe metadata"}
              </button>
            </div>
          </section>
        </div>

        {renderActivePanel()}
      </section>

      <section className="glass-panel rounded-[2rem] p-6 sm:p-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-display text-sm font-semibold uppercase tracking-[0.24em] text-muted">
              Shared asset library
            </p>
            <h2 className="mt-3 text-2xl font-semibold">Uploads and generated outputs</h2>
          </div>
          <button
            type="button"
            onClick={() => {
              void handleRefresh();
            }}
            className="rounded-full border border-panel-border bg-white/80 px-4 py-2 text-sm font-semibold text-foreground"
          >
            Refresh
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-[1.35rem] bg-white/75 px-4 py-4">
            <p className="text-xs uppercase tracking-[0.16em] text-muted">All assets</p>
            <p className="mt-2 text-lg font-semibold">{assets.length}</p>
          </div>
          <div className="rounded-[1.35rem] bg-white/75 px-4 py-4">
            <p className="text-xs uppercase tracking-[0.16em] text-muted">Video-ready</p>
            <p className="mt-2 text-lg font-semibold">{videoAssets.length}</p>
          </div>
          <div className="rounded-[1.35rem] bg-white/75 px-4 py-4">
            <p className="text-xs uppercase tracking-[0.16em] text-muted">Image-ready</p>
            <p className="mt-2 text-lg font-semibold">{imageAssets.length}</p>
          </div>
        </div>

        <div className="mt-6 grid max-h-[34rem] gap-4 overflow-y-auto pr-1">
          {assets.length > 0 ? (
            assets.map((asset) => (
              <article
                key={asset.id}
                className="rounded-[1.2rem] border border-panel-border bg-white/84 p-3 shadow-sm"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <AssetThumbnail asset={asset} />

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-semibold text-foreground sm:text-base">
                        {asset.originalName}
                      </p>
                      <span className="rounded-full bg-[#111111] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white">
                        {asset.kind}
                      </span>
                      <span className="rounded-full bg-[#f3ede4] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
                        {asset.storageDriver ?? "local"}
                      </span>
                    </div>

                    <p className="mt-1 truncate text-xs uppercase tracking-[0.14em] text-muted">
                      {asset.metadata?.formatName ?? asset.mimeType}
                    </p>

                    <p className="mt-2 text-sm leading-6 text-muted">
                      {formatAssetSummary(asset)}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-2 sm:flex-col sm:items-stretch">
                    <a
                      href={toApiUrl(asset.downloadUrl)}
                      className="rounded-full border border-panel-border bg-white px-4 py-2 text-center text-sm font-semibold text-foreground"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Download
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        void handleDeleteAsset(asset);
                      }}
                      disabled={busyAction === `delete:${asset.id}`}
                      className="rounded-full border border-[#efc6b2] bg-[#fff1ea] px-4 py-2 text-sm font-semibold text-[#8f3b13] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {busyAction === `delete:${asset.id}` ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-[1.5rem] bg-white/72 p-5 text-sm leading-6 text-muted">
              Upload files to populate the shared asset library.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
