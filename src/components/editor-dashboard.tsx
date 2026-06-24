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
  AudioExtractFormat,
  AudioTrackEditMode,
  AudioTrackEditTarget,
  AudioVolumeTarget,
  ExtractFrameTarget,
  AudioExtractTarget,
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
  PlaybackSpeedTarget,
  ProcessingJob,
  TextOverlayHorizontal,
  TextOverlayTarget,
  TextOverlayVertical,
  VideoCompressionEncoderPreset,
  VideoCompressionMode,
  VideoCompressionPreset,
  VideoCompressionTarget,
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
  "Compress, extract, add text, crop, trim, convert, and merge all reuse the same shared asset library",
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

const compressionModeOptions: Array<{
  value: VideoCompressionMode;
  label: string;
  description: string;
}> = [
  {
    value: "simple",
    label: "Simple",
    description: "Pick a ready-made compression profile and export quickly.",
  },
  {
    value: "advanced",
    label: "Advanced",
    description: "Tune CRF, bitrate, and encoder preset yourself.",
  },
];

const compressionPresetOptions: Array<{
  value: VideoCompressionPreset;
  label: string;
  description: string;
}> = [
  {
    value: "high-quality",
    label: "High quality",
    description: "Larger file, cleaner image, and safer detail retention.",
  },
  {
    value: "balanced",
    label: "Balanced",
    description: "A practical middle ground for everyday exports.",
  },
  {
    value: "small-file",
    label: "Small file",
    description: "Pushes file size lower when delivery weight matters most.",
  },
];

const compressionEncoderPresetOptions: Array<{
  value: VideoCompressionEncoderPreset;
  label: string;
  description: string;
}> = [
  {
    value: "veryfast",
    label: "Very fast",
    description: "Faster export time with slightly weaker compression efficiency.",
  },
  {
    value: "medium",
    label: "Medium",
    description: "A balanced default between speed and compression efficiency.",
  },
  {
    value: "slow",
    label: "Slow",
    description: "Takes longer but can squeeze file size down more effectively.",
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

const audioExtractFormatOptions: Array<{
  value: AudioExtractFormat;
  label: string;
  description: string;
}> = [
  {
    value: "mp3",
    label: "MP3",
    description: "A lightweight choice for voice tracks, music drafts, and general sharing.",
  },
  {
    value: "m4a",
    label: "M4A",
    description: "A clean AAC export that stays practical for modern apps and browsers.",
  },
  {
    value: "wav",
    label: "WAV",
    description: "A larger uncompressed output when you want easier handoff to audio tools.",
  },
];

const audioTrackModeOptions: Array<{
  value: AudioTrackEditMode;
  label: string;
  description: string;
}> = [
  {
    value: "mute",
    label: "Mute audio",
    description: "Keep the picture and export the video without any soundtrack.",
  },
  {
    value: "replace",
    label: "Replace audio",
    description: "Swap the current soundtrack for another uploaded audio source.",
  },
];

const speedPresetOptions = [0.5, 0.75, 1, 1.25, 1.5, 2] as const;
const audioVolumeQuickOptions = [
  { label: "Mute", value: "mute" as const },
  { label: "-12 dB", value: -12 },
  { label: "-6 dB", value: -6 },
  { label: "-3 dB", value: -3 },
  { label: "0 dB", value: 0 },
  { label: "+3 dB", value: 3 },
  { label: "+6 dB", value: 6 },
] as const;

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

const textOverlayHorizontalOptions: Array<{
  value: TextOverlayHorizontal;
  label: string;
}> = [
  { value: "left", label: "Left" },
  { value: "center", label: "Center" },
  { value: "right", label: "Right" },
];

const textOverlayVerticalOptions: Array<{
  value: TextOverlayVertical;
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
  compressAssetId: "vfe:compress-asset-id",
  compressMode: "vfe:compress-mode",
  compressPreset: "vfe:compress-preset",
  compressCrf: "vfe:compress-crf",
  compressVideoBitrate: "vfe:compress-video-bitrate",
  compressAudioBitrate: "vfe:compress-audio-bitrate",
  compressEncoderPreset: "vfe:compress-encoder-preset",
  extractAssetId: "vfe:extract-asset-id",
  extractTimeSeconds: "vfe:extract-time-seconds",
  extractFormat: "vfe:extract-format",
  extractQuality: "vfe:extract-quality",
  extractWidth: "vfe:extract-width",
  extractHeight: "vfe:extract-height",
  extractFit: "vfe:extract-fit",
  extractBackground: "vfe:extract-background",
  extractAudioAssetId: "vfe:extract-audio-asset-id",
  extractAudioFormat: "vfe:extract-audio-format",
  audioTrackAssetId: "vfe:audio-track-asset-id",
  audioTrackMode: "vfe:audio-track-mode",
  audioTrackReplacementAssetId: "vfe:audio-track-replacement-asset-id",
  audioTrackLoopReplacement: "vfe:audio-track-loop-replacement",
  changeSpeedAssetId: "vfe:change-speed-asset-id",
  changeSpeedRate: "vfe:change-speed-rate",
  audioVolumeAssetId: "vfe:audio-volume-asset-id",
  audioVolumeMute: "vfe:audio-volume-mute",
  audioVolumeGainDb: "vfe:audio-volume-gain-db",
  audioVolumeCustomRange: "vfe:audio-volume-custom-range",
  audioVolumeStartTime: "vfe:audio-volume-start-time",
  audioVolumeEndTime: "vfe:audio-volume-end-time",
  audioVolumePreventClipping: "vfe:audio-volume-prevent-clipping",
  textOverlayAssetId: "vfe:text-overlay-asset-id",
  textOverlayText: "vfe:text-overlay-text",
  textOverlayStartTime: "vfe:text-overlay-start-time",
  textOverlayEndTime: "vfe:text-overlay-end-time",
  textOverlayFontSize: "vfe:text-overlay-font-size",
  textOverlayFontColor: "vfe:text-overlay-font-color",
  textOverlayBackgroundColor: "vfe:text-overlay-background-color",
  textOverlayBackgroundOpacity: "vfe:text-overlay-background-opacity",
  textOverlayHorizontal: "vfe:text-overlay-horizontal",
  textOverlayVertical: "vfe:text-overlay-vertical",
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

function hasAudioStream(asset: MediaAsset) {
  return Boolean(asset.metadata?.audioCodec) || asset.mimeType.toLowerCase().startsWith("audio/");
}

function isAudioOnlyAsset(asset: MediaAsset) {
  return hasAudioStream(asset) && !isVideoAsset(asset);
}

function isTimedMediaAsset(asset: MediaAsset) {
  return isVideoAsset(asset) || isAudioOnlyAsset(asset);
}

function isCropPadEligibleAsset(asset: MediaAsset) {
  return isVideoAsset(asset) || isImageAsset(asset);
}

function canRegenerateThumbnail(asset: MediaAsset) {
  return isCropPadEligibleAsset(asset);
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

function mergeUniqueAssets(...groups: MediaAsset[][]) {
  const deduped = new Map<string, MediaAsset>();

  for (const group of groups) {
    for (const asset of group) {
      deduped.set(asset.id, asset);
    }
  }

  return Array.from(deduped.values());
}

function getDefaultReplacementAudioId(
  audioAssets: MediaAsset[],
  selectedVideoAssetId: string,
) {
  const preferredReplacement = audioAssets.find((asset) => asset.id !== selectedVideoAssetId);
  return preferredReplacement?.id ?? audioAssets[0]?.id ?? "";
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

function parseOptionalPositiveInteger(
  value: string,
  label = "Width, height, and quality",
) {
  if (!value.trim()) {
    return { value: undefined, error: null };
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return {
      value: undefined,
      error: `${label} must use positive whole numbers.`,
    };
  }

  return { value: parsed, error: null };
}

function parseOptionalIntegerInRange(
  value: string,
  config: { min: number; max: number; label: string },
) {
  if (!value.trim()) {
    return { value: undefined, error: null };
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < config.min || parsed > config.max) {
    return {
      value: undefined,
      error: `${config.label} must be a whole number between ${config.min} and ${config.max}.`,
    };
  }

  return { value: parsed, error: null };
}

function parseRequiredNonNegativeNumber(value: string, label: string) {
  if (!value.trim()) {
    return {
      value: undefined,
      error: `${label} is required.`,
    };
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < 0) {
    return {
      value: undefined,
      error: `${label} must be zero or greater.`,
    };
  }

  return { value: parsed, error: null };
}

function parseOptionalNonNegativeNumber(value: string, label: string) {
  if (!value.trim()) {
    return {
      value: undefined,
      error: null,
    };
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < 0) {
    return {
      value: undefined,
      error: `${label} must be zero or greater.`,
    };
  }

  return { value: parsed, error: null };
}

function parseOptionalPercentage(value: string, label: string) {
  if (!value.trim()) {
    return {
      value: undefined,
      error: null,
    };
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100) {
    return {
      value: undefined,
      error: `${label} must be between 0 and 100.`,
    };
  }

  return { value: parsed, error: null };
}

function hexToRgbChannels(color: string) {
  const hexMatch = color.trim().match(/^#([0-9a-fA-F]{6})$/);

  if (!hexMatch) {
    return null;
  }

  return {
    red: Number.parseInt(hexMatch[1].slice(0, 2), 16),
    green: Number.parseInt(hexMatch[1].slice(2, 4), 16),
    blue: Number.parseInt(hexMatch[1].slice(4, 6), 16),
  };
}

function formatOverlayAlpha(alpha: number) {
  const clampedAlpha = Number.isFinite(alpha) ? Math.max(0, Math.min(1, alpha)) : 0.72;

  return clampedAlpha
    .toFixed(2)
    .replace(/\.?0+$/, "");
}

function buildRgbaColorString(color: string, opacityPercent: number) {
  const rgb = hexToRgbChannels(color);

  if (!rgb) {
    return null;
  }

  const resolvedOpacityPercent = Number.isFinite(opacityPercent) ? opacityPercent : 72;

  return `rgba(${rgb.red}, ${rgb.green}, ${rgb.blue}, ${formatOverlayAlpha(
    resolvedOpacityPercent / 100,
  )})`;
}

function buildCompressionTargetPlan(input: {
  mode: VideoCompressionMode;
  preset: VideoCompressionPreset;
  crf: string;
  videoBitrateKbps: string;
  audioBitrateKbps: string;
  encoderPreset: VideoCompressionEncoderPreset;
}) {
  if (input.mode === "simple") {
    return {
      target: {
        mode: "simple",
        preset: input.preset,
      } satisfies VideoCompressionTarget,
      errorMessage: null,
    };
  }

  const crfResult = parseOptionalIntegerInRange(input.crf, {
    min: 0,
    max: 51,
    label: "CRF",
  });
  const videoBitrateResult = parseOptionalPositiveInteger(
    input.videoBitrateKbps,
    "Video bitrate",
  );
  const audioBitrateResult = parseOptionalPositiveInteger(
    input.audioBitrateKbps,
    "Audio bitrate",
  );

  const errorMessage =
    crfResult.error ?? videoBitrateResult.error ?? audioBitrateResult.error ?? null;

  if (errorMessage) {
    return {
      target: null,
      errorMessage,
    };
  }

  const target: VideoCompressionTarget = {
    mode: "advanced",
    encoderPreset: input.encoderPreset,
  };

  if (typeof crfResult.value === "number") {
    target.crf = crfResult.value;
  }

  if (videoBitrateResult.value) {
    target.videoBitrateKbps = videoBitrateResult.value;
  }

  if (audioBitrateResult.value) {
    target.audioBitrateKbps = audioBitrateResult.value;
  }

  return {
    target,
    errorMessage: null,
  };
}

function formatCompressionTargetSummary(target: VideoCompressionTarget | null) {
  if (!target) {
    return "Target is unavailable.";
  }

  if (target.mode === "simple") {
    const selectedPreset = compressionPresetOptions.find(
      (option) => option.value === target.preset,
    );

    return `${selectedPreset?.label ?? "Balanced"} | MP4/H.264/AAC`;
  }

  const details = [
    "Advanced",
    typeof target.crf === "number" ? `CRF ${target.crf}` : null,
    target.videoBitrateKbps ? `${target.videoBitrateKbps} kbps video` : null,
    target.audioBitrateKbps ? `${target.audioBitrateKbps} kbps audio` : null,
    target.encoderPreset ? `${target.encoderPreset} preset` : null,
  ].filter((value): value is string => Boolean(value));

  return details.join(" | ");
}

function buildConvertTargetPlan(input: {
  format: ConvertImageFormat;
  quality: string;
  width: string;
  height: string;
  fit: ConvertImageFit;
  background: string;
}) {
  const qualityResult = parseOptionalPositiveInteger(input.quality, "Quality");
  const widthResult = parseOptionalPositiveInteger(input.width, "Width");
  const heightResult = parseOptionalPositiveInteger(input.height, "Height");

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

function buildExtractFrameTargetPlan(input: {
  asset: MediaAsset | null;
  timeSeconds: string;
  format: ConvertImageFormat;
  quality: string;
  width: string;
  height: string;
  fit: ConvertImageFit;
  background: string;
}) {
  if (!input.asset) {
    return {
      target: null,
      errorMessage: "Choose one video clip before extracting a frame.",
    };
  }

  const timeResult = parseRequiredNonNegativeNumber(input.timeSeconds, "Frame time");
  const qualityResult = parseOptionalPositiveInteger(input.quality);
  const widthResult = parseOptionalPositiveInteger(input.width);
  const heightResult = parseOptionalPositiveInteger(input.height);

  const errorMessage =
    timeResult.error ??
    qualityResult.error ??
    widthResult.error ??
    heightResult.error ??
    null;

  if (errorMessage) {
    return {
      target: null,
      errorMessage,
    };
  }

  const duration = input.asset.metadata?.durationSeconds;

  if (
    typeof duration === "number" &&
    typeof timeResult.value === "number" &&
    timeResult.value > duration
  ) {
    return {
      target: null,
      errorMessage: "Frame time cannot be greater than the source duration.",
    };
  }

  const background = input.background.trim();

  if (background && !/^#[0-9a-fA-F]{6}$/.test(background)) {
    return {
      target: null,
      errorMessage: "Background must use a six-digit hex color such as #ffffff.",
    };
  }

  const target: ExtractFrameTarget = {
    timeSeconds: timeResult.value ?? 0,
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

function formatExtractFrameTargetSummary(target: ExtractFrameTarget | null) {
  if (!target) {
    return "Target is unavailable.";
  }

  const details = [
    `${target.timeSeconds.toFixed(2)}s`,
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

function buildExtractAudioTargetPlan(input: {
  asset: MediaAsset | null;
  format: AudioExtractFormat;
}) {
  if (!input.asset) {
    return {
      target: null,
      errorMessage: "Choose one video clip before extracting audio.",
    };
  }

  if (!isVideoAsset(input.asset)) {
    return {
      target: null,
      errorMessage: "Audio extraction currently works with video clips only.",
    };
  }

  if (!hasAudioStream(input.asset)) {
    return {
      target: null,
      errorMessage: "The selected video does not contain an audio track to extract.",
    };
  }

  return {
    target: {
      format: input.format,
    } satisfies AudioExtractTarget,
    errorMessage: null,
  };
}

function formatExtractAudioTargetSummary(target: AudioExtractTarget | null) {
  if (!target) {
    return "Target is unavailable.";
  }

  const selectedFormat = audioExtractFormatOptions.find(
    (option) => option.value === target.format,
  );

  return `${selectedFormat?.label ?? target.format.toUpperCase()} audio export`;
}

function buildAudioTrackEditTargetPlan(input: {
  asset: MediaAsset | null;
  mode: AudioTrackEditMode;
  replacementAsset: MediaAsset | null;
  loopReplacement: boolean;
}) {
  if (!input.asset) {
    return {
      target: null,
      errorMessage: "Choose one video clip before editing its soundtrack.",
    };
  }

  if (!isVideoAsset(input.asset)) {
    return {
      target: null,
      errorMessage: "Mute / replace audio currently works with video clips only.",
    };
  }

  if (input.mode === "mute") {
    return {
      target: {
        mode: "mute",
      } satisfies AudioTrackEditTarget,
      errorMessage: null,
    };
  }

  if (!input.replacementAsset) {
    return {
      target: null,
      errorMessage: "Choose a replacement audio source before queueing the job.",
    };
  }

  if (!hasAudioStream(input.replacementAsset)) {
    return {
      target: null,
      errorMessage: "The selected replacement file does not contain an audio track.",
    };
  }

  return {
    target: {
      mode: "replace",
      replacementAssetId: input.replacementAsset.id,
      loopReplacement: input.loopReplacement,
    } satisfies AudioTrackEditTarget,
    errorMessage: null,
  };
}

function formatAudioTrackEditTargetSummary(
  target: AudioTrackEditTarget | null,
  replacementAsset: MediaAsset | null,
) {
  if (!target) {
    return "Target is unavailable.";
  }

  if (target.mode === "mute") {
    return "Remove the soundtrack and keep a silent video export.";
  }

  return [
    replacementAsset?.originalName ?? "Replacement audio",
    target.loopReplacement === false ? "Use replacement once" : "Loop replacement to fill clip",
  ].join(" | ");
}

function buildPlaybackSpeedTargetPlan(input: {
  asset: MediaAsset | null;
  rate: string;
}) {
  if (!input.asset) {
    return {
      target: null,
      errorMessage: "Choose one video or audio file before changing speed.",
    };
  }

  if (!isTimedMediaAsset(input.asset)) {
    return {
      target: null,
      errorMessage: "Speed change currently supports video files and audio files only.",
    };
  }

  if (!input.rate.trim()) {
    return {
      target: null,
      errorMessage: "Playback speed is required.",
    };
  }

  const parsed = Number(input.rate);

  if (!Number.isFinite(parsed) || parsed < 0.25 || parsed > 4) {
    return {
      target: null,
      errorMessage: "Playback speed must stay between 0.25x and 4x.",
    };
  }

  return {
    target: {
      rate: parsed,
    } satisfies PlaybackSpeedTarget,
    errorMessage: null,
  };
}

function formatPlaybackSpeedTargetSummary(
  asset: MediaAsset | null,
  target: PlaybackSpeedTarget | null,
) {
  if (!target) {
    return "Target is unavailable.";
  }

  const outputHint = asset
    ? isVideoAsset(asset)
      ? "MP4 video export"
      : "MP3 audio export"
    : "Output unavailable";

  return `${target.rate.toFixed(2)}x | ${outputHint}`;
}

function buildAudioVolumeTargetPlan(input: {
  asset: MediaAsset | null;
  mute: boolean;
  gainDb: string;
  useCustomRange: boolean;
  startTime: string;
  endTime: string;
  preventClipping: boolean;
}) {
  if (!input.asset) {
    return {
      target: null,
      errorMessage: "Choose one video or audio file before adjusting audio volume.",
    };
  }

  if (!hasAudioStream(input.asset)) {
    return {
      target: null,
      errorMessage: "Audio volume currently requires a file that already contains audio.",
    };
  }

  let resolvedGainDb: number | undefined;

  if (!input.mute) {
    if (!input.gainDb.trim()) {
      return {
        target: null,
        errorMessage: "Enter a gain value in dB or choose mute.",
      };
    }

    const parsedGainDb = Number(input.gainDb);

    if (!Number.isFinite(parsedGainDb) || parsedGainDb < -30 || parsedGainDb > 20) {
      return {
        target: null,
        errorMessage: "Audio gain must stay between -30 dB and +20 dB.",
      };
    }

    resolvedGainDb = parsedGainDb;
  }

  const startTimeResult = input.useCustomRange
    ? parseRequiredNonNegativeNumber(input.startTime, "Start time")
    : { value: undefined, error: null };
  const endTimeResult = input.useCustomRange
    ? parseRequiredNonNegativeNumber(input.endTime, "End time")
    : { value: undefined, error: null };
  const errorMessage = startTimeResult.error ?? endTimeResult.error ?? null;

  if (errorMessage) {
    return {
      target: null,
      errorMessage,
    };
  }

  if (
    input.useCustomRange &&
    typeof startTimeResult.value === "number" &&
    typeof endTimeResult.value === "number" &&
    endTimeResult.value <= startTimeResult.value
  ) {
    return {
      target: null,
      errorMessage: "End time must be greater than the start time.",
    };
  }

  const duration = input.asset.metadata?.durationSeconds;

  if (
    input.useCustomRange &&
    typeof duration === "number" &&
    typeof startTimeResult.value === "number" &&
    startTimeResult.value > duration
  ) {
    return {
      target: null,
      errorMessage: "Start time cannot be greater than the source duration.",
    };
  }

  if (
    input.useCustomRange &&
    typeof duration === "number" &&
    typeof endTimeResult.value === "number" &&
    endTimeResult.value > duration
  ) {
    return {
      target: null,
      errorMessage: "End time cannot be greater than the source duration.",
    };
  }

  const target: AudioVolumeTarget = {};

  if (input.mute) {
    target.mute = true;
  } else {
    target.gainDb = resolvedGainDb;
  }

  if (input.useCustomRange) {
    target.startTime = startTimeResult.value;
    target.endTime = endTimeResult.value;
  }

  if (input.preventClipping) {
    target.preventClipping = true;
  }

  return {
    target,
    errorMessage: null,
  };
}

function formatAudioVolumeTargetSummary(
  asset: MediaAsset | null,
  target: AudioVolumeTarget | null,
) {
  if (!target) {
    return "Target is unavailable.";
  }

  const gainLabel = target.mute
    ? "Mute"
    : `${(target.gainDb ?? 0) > 0 ? "+" : ""}${(target.gainDb ?? 0)
        .toFixed(2)
        .replace(/\.?0+$/, "")} dB`;
  const rangeLabel =
    typeof target.startTime === "number" && typeof target.endTime === "number"
      ? `${target.startTime.toFixed(2)}s to ${target.endTime.toFixed(2)}s`
      : "Full media";
  const outputHint = asset
    ? isVideoAsset(asset)
      ? "MP4 video export"
      : "Audio export"
    : "Output unavailable";

  return [
    gainLabel,
    rangeLabel,
    target.preventClipping ? "Clipping protection on" : null,
    outputHint,
  ]
    .filter((value): value is string => Boolean(value))
    .join(" | ");
}

function buildTextOverlayTargetPlan(input: {
  asset: MediaAsset | null;
  text: string;
  startTime: string;
  endTime: string;
  fontSize: string;
  fontColor: string;
  backgroundColor: string;
  backgroundOpacity: string;
  horizontal: TextOverlayHorizontal;
  vertical: TextOverlayVertical;
}) {
  if (!input.asset) {
    return {
      target: null,
      errorMessage: "Choose one video clip before adding text.",
    };
  }

  if (!isVideoAsset(input.asset)) {
    return {
      target: null,
      errorMessage: "Text overlay currently works with video clips only.",
    };
  }

  const overlayText = input.text.trim();

  if (!overlayText) {
    return {
      target: null,
      errorMessage: "Enter the text you want to burn into the video.",
    };
  }

  const startTimeResult = parseOptionalNonNegativeNumber(
    input.startTime,
    "Start time",
  );
  const endTimeResult = parseOptionalNonNegativeNumber(input.endTime, "End time");
  const fontSizeResult = parseOptionalPositiveInteger(input.fontSize, "Font size");
  const backgroundOpacityResult = parseOptionalPercentage(
    input.backgroundOpacity,
    "Box opacity",
  );
  const errorMessage =
    startTimeResult.error ??
    endTimeResult.error ??
    fontSizeResult.error ??
    backgroundOpacityResult.error ??
    null;

  if (errorMessage) {
    return {
      target: null,
      errorMessage,
    };
  }

  if (
    typeof startTimeResult.value === "number" &&
    typeof endTimeResult.value === "number" &&
    endTimeResult.value <= startTimeResult.value
  ) {
    return {
      target: null,
      errorMessage: "End time must be greater than the start time.",
    };
  }

  const duration = input.asset.metadata?.durationSeconds;

  if (
    typeof duration === "number" &&
    typeof startTimeResult.value === "number" &&
    startTimeResult.value > duration
  ) {
    return {
      target: null,
      errorMessage: "Start time cannot be greater than the source duration.",
    };
  }

  if (
    typeof duration === "number" &&
    typeof endTimeResult.value === "number" &&
    endTimeResult.value > duration
  ) {
    return {
      target: null,
      errorMessage: "End time cannot be greater than the source duration.",
    };
  }

  const fontColor = input.fontColor.trim();
  const backgroundColor = input.backgroundColor.trim();

  if (fontColor && !/^#[0-9a-fA-F]{6}$/.test(fontColor)) {
    return {
      target: null,
      errorMessage: "Font color must use a six-digit hex value such as #ffffff.",
    };
  }

  if (backgroundColor && !/^#[0-9a-fA-F]{6}$/.test(backgroundColor)) {
    return {
      target: null,
      errorMessage: "Box color must use a six-digit hex value such as #111111.",
    };
  }

  const resolvedBackgroundColor =
    buildRgbaColorString(
      backgroundColor || "#111111",
      backgroundOpacityResult.value ?? 72,
    ) ?? null;

  if (!resolvedBackgroundColor) {
    return {
      target: null,
      errorMessage: "Box color could not be converted into a valid RGBA value.",
    };
  }

  const target: TextOverlayTarget = {
    text: overlayText,
    fontSize: fontSizeResult.value ?? 42,
    fontColor: fontColor || "#ffffff",
    backgroundColor: resolvedBackgroundColor,
    horizontal: input.horizontal,
    vertical: input.vertical,
  };

  if (typeof startTimeResult.value === "number") {
    target.startTime = startTimeResult.value;
  }

  if (typeof endTimeResult.value === "number") {
    target.endTime = endTimeResult.value;
  }

  return {
    target,
    errorMessage: null,
  };
}

function formatTextOverlayTargetSummary(target: TextOverlayTarget | null) {
  if (!target) {
    return "Target is unavailable.";
  }

  const textPreview =
    target.text.length > 36 ? `${target.text.slice(0, 36).trimEnd()}...` : target.text;
  const visibility =
    typeof target.startTime === "number" && typeof target.endTime === "number"
      ? `${target.startTime.toFixed(2)}s to ${target.endTime.toFixed(2)}s`
      : typeof target.startTime === "number"
        ? `From ${target.startTime.toFixed(2)}s`
        : typeof target.endTime === "number"
          ? `Until ${target.endTime.toFixed(2)}s`
          : "Entire clip";
  const details = [
    `"${textPreview}"`,
    visibility,
    `${target.fontSize ?? 42}px`,
    `${target.horizontal ?? "center"} / ${target.vertical ?? "bottom"}`,
    target.backgroundColor ? `Box: ${target.backgroundColor}` : null,
  ];

  return details.filter((value): value is string => Boolean(value)).join(" | ");
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
    case "compress-video":
      return "Compress video job";
    case "extract-frame":
      return "Extract frame job";
    case "extract-audio":
      return "Extract audio job";
    case "edit-audio-track":
      return "Audio track job";
    case "change-speed":
      return "Change speed job";
    case "audio-volume":
      return "Audio volume job";
    case "overlay-text":
      return "Text overlay job";
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

function getAssetLibraryScope(
  activeView: EditorView,
  collections: {
    assets: MediaAsset[];
    videoAssets: MediaAsset[];
    imageAssets: MediaAsset[];
    cropPadAssets: MediaAsset[];
    videoWithAudioAssets: MediaAsset[];
    audioTrackAssets: MediaAsset[];
    timedMediaAssets: MediaAsset[];
    audioCapableAssets: MediaAsset[];
  },
) {
  if (
    activeView === "trim" ||
    activeView === "compress" ||
    activeView === "extract-frame" ||
    activeView === "text-overlay" ||
    activeView === "merge" ||
    activeView === "normalize"
  ) {
    return {
      countLabel: "Visible videos",
      description: "Only video files are shown on this page because this function works with video sources.",
      items: collections.videoAssets,
      emptyMessage: "Upload a video file to populate this page.",
    };
  }

  if (activeView === "extract-audio") {
    return {
      countLabel: "Videos with audio",
      description: "Only videos that already contain an audio stream stay visible here because Extract audio needs a soundtrack to pull out.",
      items: collections.videoWithAudioAssets,
      emptyMessage: "Upload a video with audio to populate this page.",
    };
  }

  if (activeView === "audio-track") {
    return {
      countLabel: "Track-ready files",
      description: "This page keeps video targets and audio-capable replacement files visible together so soundtrack editing stays focused.",
      items: collections.audioTrackAssets,
      emptyMessage: "Upload a video and at least one audio-capable file to populate this page.",
    };
  }

  if (activeView === "change-speed") {
    return {
      countLabel: "Timed media",
      description: "Only video clips and audio files stay visible here because speed changes apply to time-based media only.",
      items: collections.timedMediaAssets,
      emptyMessage: "Upload a video clip or audio file to populate this page.",
    };
  }

  if (activeView === "audio-volume") {
    return {
      countLabel: "Audio-ready media",
      description: "Only files that already contain an audio stream stay visible here because volume changes work on sound, not silent media.",
      items: collections.audioCapableAssets,
      emptyMessage: "Upload a video or audio file that contains sound to populate this page.",
    };
  }

  if (activeView === "convert") {
    return {
      countLabel: "Visible images",
      description: "Only still images are shown on this page because Convert works with image sources.",
      items: collections.imageAssets,
      emptyMessage: "Upload a PNG, JPEG, or WebP file to populate this page.",
    };
  }

  if (activeView === "crop-pad") {
    return {
      countLabel: "Crop / Pad ready",
      description: "Crop / Pad accepts both video clips and supported still images, so both stay visible here.",
      items: collections.cropPadAssets,
      emptyMessage: "Upload a video or supported image file to populate this page.",
    };
  }

  return {
    countLabel: "Visible now",
    description: "Showing every uploaded and generated file in the shared workspace.",
    items: collections.assets,
    emptyMessage: "Upload your first file to populate the shared library.",
  };
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
  const [compressAssetId, setCompressAssetId] = useState("");
  const [compressMode, setCompressMode] = useState<VideoCompressionMode>("simple");
  const [compressPreset, setCompressPreset] =
    useState<VideoCompressionPreset>("balanced");
  const [compressCrf, setCompressCrf] = useState("");
  const [compressVideoBitrate, setCompressVideoBitrate] = useState("");
  const [compressAudioBitrate, setCompressAudioBitrate] = useState("");
  const [compressEncoderPreset, setCompressEncoderPreset] =
    useState<VideoCompressionEncoderPreset>("medium");
  const [extractAssetId, setExtractAssetId] = useState("");
  const [extractTimeSeconds, setExtractTimeSeconds] = useState("0");
  const [extractFormat, setExtractFormat] = useState<ConvertImageFormat>("jpeg");
  const [extractQuality, setExtractQuality] = useState("92");
  const [extractWidth, setExtractWidth] = useState("");
  const [extractHeight, setExtractHeight] = useState("");
  const [extractFit, setExtractFit] = useState<ConvertImageFit>("contain");
  const [extractBackground, setExtractBackground] = useState("#ffffff");
  const [extractAudioAssetId, setExtractAudioAssetId] = useState("");
  const [extractAudioFormat, setExtractAudioFormat] =
    useState<AudioExtractFormat>("mp3");
  const [audioTrackAssetId, setAudioTrackAssetId] = useState("");
  const [audioTrackMode, setAudioTrackMode] = useState<AudioTrackEditMode>("mute");
  const [audioTrackReplacementAssetId, setAudioTrackReplacementAssetId] =
    useState("");
  const [audioTrackLoopReplacement, setAudioTrackLoopReplacement] =
    useState(true);
  const [changeSpeedAssetId, setChangeSpeedAssetId] = useState("");
  const [changeSpeedRate, setChangeSpeedRate] = useState("1");
  const [audioVolumeAssetId, setAudioVolumeAssetId] = useState("");
  const [audioVolumeMute, setAudioVolumeMute] = useState(false);
  const [audioVolumeGainDb, setAudioVolumeGainDb] = useState("0");
  const [audioVolumeUseCustomRange, setAudioVolumeUseCustomRange] = useState(false);
  const [audioVolumeStartTime, setAudioVolumeStartTime] = useState("");
  const [audioVolumeEndTime, setAudioVolumeEndTime] = useState("");
  const [audioVolumePreventClipping, setAudioVolumePreventClipping] = useState(true);
  const [textOverlayAssetId, setTextOverlayAssetId] = useState("");
  const [textOverlayText, setTextOverlayText] = useState("Sample caption");
  const [textOverlayStartTime, setTextOverlayStartTime] = useState("");
  const [textOverlayEndTime, setTextOverlayEndTime] = useState("");
  const [textOverlayFontSize, setTextOverlayFontSize] = useState("42");
  const [textOverlayFontColor, setTextOverlayFontColor] = useState("#ffffff");
  const [textOverlayBackgroundColor, setTextOverlayBackgroundColor] =
    useState("#111111");
  const [textOverlayBackgroundOpacity, setTextOverlayBackgroundOpacity] =
    useState("72");
  const [textOverlayHorizontal, setTextOverlayHorizontal] =
    useState<TextOverlayHorizontal>("center");
  const [textOverlayVertical, setTextOverlayVertical] =
    useState<TextOverlayVertical>("bottom");
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
  const [isLibraryRefreshing, setIsLibraryRefreshing] = useState(false);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [hasRestoredSession, setHasRestoredSession] = useState(false);
  const [isRefreshing, startRefreshTransition] = useTransition();

  const hasProcessingJobs = jobs.some(
    (job) => job.status === "queued" || job.status === "processing",
  );
  const videoAssets = assets.filter(isVideoAsset);
  const videoWithAudioAssets = videoAssets.filter(hasAudioStream);
  const audioOnlyAssets = assets.filter(isAudioOnlyAsset);
  const audioSourceAssets = assets.filter(hasAudioStream);
  const audioCapableAssets = assets.filter(hasAudioStream);
  const audioTrackAssets = mergeUniqueAssets(videoAssets, audioSourceAssets);
  const timedMediaAssets = assets.filter(isTimedMediaAsset);
  const imageAssets = assets.filter(isImageAsset);
  const cropPadAssets = assets.filter(isCropPadEligibleAsset);
  const selectedCompressAsset =
    videoAssets.find((asset) => asset.id === compressAssetId) ?? null;
  const compressTargetPlan = buildCompressionTargetPlan({
    mode: compressMode,
    preset: compressPreset,
    crf: compressCrf,
    videoBitrateKbps: compressVideoBitrate,
    audioBitrateKbps: compressAudioBitrate,
    encoderPreset: compressEncoderPreset,
  });
  const selectedExtractAsset =
    videoAssets.find((asset) => asset.id === extractAssetId) ?? null;
  const extractFrameTargetPlan = buildExtractFrameTargetPlan({
    asset: selectedExtractAsset,
    timeSeconds: extractTimeSeconds,
    format: extractFormat,
    quality: extractQuality,
    width: extractWidth,
    height: extractHeight,
    fit: extractFit,
    background: extractBackground,
  });
  const selectedExtractAudioAsset =
    videoWithAudioAssets.find((asset) => asset.id === extractAudioAssetId) ?? null;
  const extractAudioTargetPlan = buildExtractAudioTargetPlan({
    asset: selectedExtractAudioAsset,
    format: extractAudioFormat,
  });
  const selectedAudioTrackAsset =
    videoAssets.find((asset) => asset.id === audioTrackAssetId) ?? null;
  const selectedAudioTrackReplacementAsset =
    audioSourceAssets.find((asset) => asset.id === audioTrackReplacementAssetId) ?? null;
  const audioTrackTargetPlan = buildAudioTrackEditTargetPlan({
    asset: selectedAudioTrackAsset,
    mode: audioTrackMode,
    replacementAsset: selectedAudioTrackReplacementAsset,
    loopReplacement: audioTrackLoopReplacement,
  });
  const selectedChangeSpeedAsset =
    timedMediaAssets.find((asset) => asset.id === changeSpeedAssetId) ?? null;
  const changeSpeedTargetPlan = buildPlaybackSpeedTargetPlan({
    asset: selectedChangeSpeedAsset,
    rate: changeSpeedRate,
  });
  const selectedAudioVolumeAsset =
    audioCapableAssets.find((asset) => asset.id === audioVolumeAssetId) ?? null;
  const audioVolumeTargetPlan = buildAudioVolumeTargetPlan({
    asset: selectedAudioVolumeAsset,
    mute: audioVolumeMute,
    gainDb: audioVolumeGainDb,
    useCustomRange: audioVolumeUseCustomRange,
    startTime: audioVolumeStartTime,
    endTime: audioVolumeEndTime,
    preventClipping: audioVolumePreventClipping,
  });
  const selectedTextOverlayAsset =
    videoAssets.find((asset) => asset.id === textOverlayAssetId) ?? null;
  const textOverlayTargetPlan = buildTextOverlayTargetPlan({
    asset: selectedTextOverlayAsset,
    text: textOverlayText,
    startTime: textOverlayStartTime,
    endTime: textOverlayEndTime,
    fontSize: textOverlayFontSize,
    fontColor: textOverlayFontColor,
    backgroundColor: textOverlayBackgroundColor,
    backgroundOpacity: textOverlayBackgroundOpacity,
    horizontal: textOverlayHorizontal,
    vertical: textOverlayVertical,
  });
  const textOverlayBackgroundPreview =
    buildRgbaColorString(
      textOverlayBackgroundColor,
      Number(textOverlayBackgroundOpacity || "72"),
    ) ?? "rgba(17, 17, 17, 0.72)";
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
  const assetLibraryScope = getAssetLibraryScope(activeView, {
    assets,
    videoAssets,
    imageAssets,
    cropPadAssets,
    videoWithAudioAssets,
    audioTrackAssets,
    timedMediaAssets,
    audioCapableAssets,
  });
  const assetLibraryAssets = assetLibraryScope.items;

  function applyAssetsSnapshot(nextAssets: MediaAsset[]) {
    startRefreshTransition(() => {
      setAssets(nextAssets);

      const nextVideoAssets = nextAssets.filter(isVideoAsset);
      const nextVideoWithAudioAssets = nextVideoAssets.filter(hasAudioStream);
      const nextAudioSourceAssets = nextAssets.filter(hasAudioStream);
      const nextAudioCapableAssets = nextAssets.filter(hasAudioStream);
      const nextTimedMediaAssets = nextAssets.filter(isTimedMediaAsset);
      const nextCropPadAssets = nextAssets.filter(isCropPadEligibleAsset);
      const nextImageAssets = nextAssets.filter(isImageAsset);

      if (nextAssets.length === 0) {
        setTrimAssetId("");
        setTrimEndTime("5");
        setCompressAssetId("");
        setExtractAssetId("");
        setExtractAudioAssetId("");
        setAudioTrackAssetId("");
        setAudioTrackReplacementAssetId("");
        setChangeSpeedAssetId("");
        setAudioVolumeAssetId("");
        setAudioVolumeStartTime("");
        setAudioVolumeEndTime("");
        setTextOverlayAssetId("");
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

      const hasSelectedCompressAsset = nextVideoAssets.some(
        (asset) => asset.id === compressAssetId,
      );

      if (!hasSelectedCompressAsset) {
        setCompressAssetId(nextVideoAssets[0]?.id ?? "");
      }

      const hasSelectedExtractAsset = nextVideoAssets.some(
        (asset) => asset.id === extractAssetId,
      );

      if (!hasSelectedExtractAsset) {
        const nextExtractAsset = nextVideoAssets[0];
        setExtractAssetId(nextExtractAsset?.id ?? "");
        setExtractTimeSeconds(
          nextExtractAsset?.metadata?.durationSeconds
            ? String(Number(Math.min(1, nextExtractAsset.metadata.durationSeconds).toFixed(2)))
            : "0",
        );
      }

      const hasSelectedExtractAudioAsset = nextVideoWithAudioAssets.some(
        (asset) => asset.id === extractAudioAssetId,
      );

      if (!hasSelectedExtractAudioAsset) {
        setExtractAudioAssetId(nextVideoWithAudioAssets[0]?.id ?? "");
      }

      const hasSelectedAudioTrackAsset = nextVideoAssets.some(
        (asset) => asset.id === audioTrackAssetId,
      );

      if (!hasSelectedAudioTrackAsset) {
        const nextAudioTrackAssetId = nextVideoAssets[0]?.id ?? "";
        setAudioTrackAssetId(nextAudioTrackAssetId);
        setAudioTrackReplacementAssetId(
          getDefaultReplacementAudioId(nextAudioSourceAssets, nextAudioTrackAssetId),
        );
      } else {
        const hasSelectedAudioReplacement = nextAudioSourceAssets.some(
          (asset) => asset.id === audioTrackReplacementAssetId,
        );

        if (!hasSelectedAudioReplacement) {
          setAudioTrackReplacementAssetId(
            getDefaultReplacementAudioId(nextAudioSourceAssets, audioTrackAssetId),
          );
        }
      }

      const hasSelectedChangeSpeedAsset = nextTimedMediaAssets.some(
        (asset) => asset.id === changeSpeedAssetId,
      );

      if (!hasSelectedChangeSpeedAsset) {
        setChangeSpeedAssetId(nextTimedMediaAssets[0]?.id ?? "");
      }

      const hasSelectedAudioVolumeAsset = nextAudioCapableAssets.some(
        (asset) => asset.id === audioVolumeAssetId,
      );

      if (!hasSelectedAudioVolumeAsset) {
        setAudioVolumeAssetId(nextAudioCapableAssets[0]?.id ?? "");
      }

      const hasSelectedTextOverlayAsset = nextVideoAssets.some(
        (asset) => asset.id === textOverlayAssetId,
      );

      if (!hasSelectedTextOverlayAsset) {
        setTextOverlayAssetId(nextVideoAssets[0]?.id ?? "");
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
    setIsLibraryRefreshing(true);

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
    } finally {
      setIsLibraryRefreshing(false);
    }
  }

  useEffect(() => {
    setTrimAssetId(readSessionString(sessionStorageKeys.trimAssetId, ""));
    setCompressAssetId(readSessionString(sessionStorageKeys.compressAssetId, ""));
    setCompressMode(
      readSessionString(sessionStorageKeys.compressMode, "simple") as VideoCompressionMode,
    );
    setCompressPreset(
      readSessionString(
        sessionStorageKeys.compressPreset,
        "balanced",
      ) as VideoCompressionPreset,
    );
    setCompressCrf(readSessionString(sessionStorageKeys.compressCrf, ""));
    setCompressVideoBitrate(
      readSessionString(sessionStorageKeys.compressVideoBitrate, ""),
    );
    setCompressAudioBitrate(
      readSessionString(sessionStorageKeys.compressAudioBitrate, ""),
    );
    setCompressEncoderPreset(
      readSessionString(
        sessionStorageKeys.compressEncoderPreset,
        "medium",
      ) as VideoCompressionEncoderPreset,
    );
    setExtractAssetId(readSessionString(sessionStorageKeys.extractAssetId, ""));
    setExtractTimeSeconds(readSessionString(sessionStorageKeys.extractTimeSeconds, "0"));
    setExtractFormat(
      readSessionString(
        sessionStorageKeys.extractFormat,
        "jpeg",
      ) as ConvertImageFormat,
    );
    setExtractQuality(readSessionString(sessionStorageKeys.extractQuality, "92"));
    setExtractWidth(readSessionString(sessionStorageKeys.extractWidth, ""));
    setExtractHeight(readSessionString(sessionStorageKeys.extractHeight, ""));
    setExtractFit(
      readSessionString(
        sessionStorageKeys.extractFit,
        "contain",
      ) as ConvertImageFit,
    );
    setExtractBackground(
      readSessionString(sessionStorageKeys.extractBackground, "#ffffff"),
    );
    setExtractAudioAssetId(
      readSessionString(sessionStorageKeys.extractAudioAssetId, ""),
    );
    setExtractAudioFormat(
      readSessionString(
        sessionStorageKeys.extractAudioFormat,
        "mp3",
      ) as AudioExtractFormat,
    );
    setAudioTrackAssetId(
      readSessionString(sessionStorageKeys.audioTrackAssetId, ""),
    );
    setAudioTrackMode(
      readSessionString(sessionStorageKeys.audioTrackMode, "mute") as AudioTrackEditMode,
    );
    setAudioTrackReplacementAssetId(
      readSessionString(sessionStorageKeys.audioTrackReplacementAssetId, ""),
    );
    setAudioTrackLoopReplacement(
      readSessionString(sessionStorageKeys.audioTrackLoopReplacement, "true") !== "false",
    );
    setChangeSpeedAssetId(
      readSessionString(sessionStorageKeys.changeSpeedAssetId, ""),
    );
    setChangeSpeedRate(readSessionString(sessionStorageKeys.changeSpeedRate, "1"));
    setAudioVolumeAssetId(
      readSessionString(sessionStorageKeys.audioVolumeAssetId, ""),
    );
    setAudioVolumeMute(
      readSessionString(sessionStorageKeys.audioVolumeMute, "false") === "true",
    );
    setAudioVolumeGainDb(
      readSessionString(sessionStorageKeys.audioVolumeGainDb, "0"),
    );
    setAudioVolumeUseCustomRange(
      readSessionString(sessionStorageKeys.audioVolumeCustomRange, "false") === "true",
    );
    setAudioVolumeStartTime(
      readSessionString(sessionStorageKeys.audioVolumeStartTime, ""),
    );
    setAudioVolumeEndTime(
      readSessionString(sessionStorageKeys.audioVolumeEndTime, ""),
    );
    setAudioVolumePreventClipping(
      readSessionString(sessionStorageKeys.audioVolumePreventClipping, "true") !== "false",
    );
    setTextOverlayAssetId(
      readSessionString(sessionStorageKeys.textOverlayAssetId, ""),
    );
    setTextOverlayText(
      readSessionString(sessionStorageKeys.textOverlayText, "Sample caption"),
    );
    setTextOverlayStartTime(
      readSessionString(sessionStorageKeys.textOverlayStartTime, ""),
    );
    setTextOverlayEndTime(
      readSessionString(sessionStorageKeys.textOverlayEndTime, ""),
    );
    setTextOverlayFontSize(
      readSessionString(sessionStorageKeys.textOverlayFontSize, "42"),
    );
    setTextOverlayFontColor(
      readSessionString(sessionStorageKeys.textOverlayFontColor, "#ffffff"),
    );
    setTextOverlayBackgroundColor(
      readSessionString(sessionStorageKeys.textOverlayBackgroundColor, "#111111"),
    );
    setTextOverlayBackgroundOpacity(
      readSessionString(sessionStorageKeys.textOverlayBackgroundOpacity, "72"),
    );
    setTextOverlayHorizontal(
      readSessionString(
        sessionStorageKeys.textOverlayHorizontal,
        "center",
      ) as TextOverlayHorizontal,
    );
    setTextOverlayVertical(
      readSessionString(
        sessionStorageKeys.textOverlayVertical,
        "bottom",
      ) as TextOverlayVertical,
    );
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
    if (!hasRestoredSession || audioTrackMode !== "replace") {
      return;
    }

    if (selectedAudioTrackReplacementAsset) {
      return;
    }

    setAudioTrackReplacementAssetId(
      getDefaultReplacementAudioId(audioSourceAssets, audioTrackAssetId),
    );
  }, [
    audioSourceAssets,
    audioTrackAssetId,
    audioTrackMode,
    hasRestoredSession,
    selectedAudioTrackReplacementAsset,
  ]);

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

    window.sessionStorage.setItem(sessionStorageKeys.compressAssetId, compressAssetId);
  }, [hasRestoredSession, compressAssetId]);

  useEffect(() => {
    if (!hasRestoredSession) {
      return;
    }

    window.sessionStorage.setItem(sessionStorageKeys.compressMode, compressMode);
  }, [hasRestoredSession, compressMode]);

  useEffect(() => {
    if (!hasRestoredSession) {
      return;
    }

    window.sessionStorage.setItem(sessionStorageKeys.compressPreset, compressPreset);
  }, [hasRestoredSession, compressPreset]);

  useEffect(() => {
    if (!hasRestoredSession) {
      return;
    }

    window.sessionStorage.setItem(sessionStorageKeys.compressCrf, compressCrf);
  }, [hasRestoredSession, compressCrf]);

  useEffect(() => {
    if (!hasRestoredSession) {
      return;
    }

    window.sessionStorage.setItem(
      sessionStorageKeys.compressVideoBitrate,
      compressVideoBitrate,
    );
  }, [hasRestoredSession, compressVideoBitrate]);

  useEffect(() => {
    if (!hasRestoredSession) {
      return;
    }

    window.sessionStorage.setItem(
      sessionStorageKeys.compressAudioBitrate,
      compressAudioBitrate,
    );
  }, [hasRestoredSession, compressAudioBitrate]);

  useEffect(() => {
    if (!hasRestoredSession) {
      return;
    }

    window.sessionStorage.setItem(
      sessionStorageKeys.compressEncoderPreset,
      compressEncoderPreset,
    );
  }, [hasRestoredSession, compressEncoderPreset]);

  useEffect(() => {
    if (!hasRestoredSession) {
      return;
    }

    window.sessionStorage.setItem(sessionStorageKeys.extractAssetId, extractAssetId);
  }, [hasRestoredSession, extractAssetId]);

  useEffect(() => {
    if (!hasRestoredSession) {
      return;
    }

    window.sessionStorage.setItem(
      sessionStorageKeys.extractTimeSeconds,
      extractTimeSeconds,
    );
  }, [hasRestoredSession, extractTimeSeconds]);

  useEffect(() => {
    if (!hasRestoredSession) {
      return;
    }

    window.sessionStorage.setItem(sessionStorageKeys.extractFormat, extractFormat);
  }, [hasRestoredSession, extractFormat]);

  useEffect(() => {
    if (!hasRestoredSession) {
      return;
    }

    window.sessionStorage.setItem(sessionStorageKeys.extractQuality, extractQuality);
  }, [hasRestoredSession, extractQuality]);

  useEffect(() => {
    if (!hasRestoredSession) {
      return;
    }

    window.sessionStorage.setItem(sessionStorageKeys.extractWidth, extractWidth);
  }, [hasRestoredSession, extractWidth]);

  useEffect(() => {
    if (!hasRestoredSession) {
      return;
    }

    window.sessionStorage.setItem(sessionStorageKeys.extractHeight, extractHeight);
  }, [hasRestoredSession, extractHeight]);

  useEffect(() => {
    if (!hasRestoredSession) {
      return;
    }

    window.sessionStorage.setItem(sessionStorageKeys.extractFit, extractFit);
  }, [hasRestoredSession, extractFit]);

  useEffect(() => {
    if (!hasRestoredSession) {
      return;
    }

    window.sessionStorage.setItem(
      sessionStorageKeys.extractBackground,
      extractBackground,
    );
  }, [hasRestoredSession, extractBackground]);

  useEffect(() => {
    if (!hasRestoredSession) {
      return;
    }

    window.sessionStorage.setItem(
      sessionStorageKeys.extractAudioAssetId,
      extractAudioAssetId,
    );
  }, [extractAudioAssetId, hasRestoredSession]);

  useEffect(() => {
    if (!hasRestoredSession) {
      return;
    }

    window.sessionStorage.setItem(
      sessionStorageKeys.extractAudioFormat,
      extractAudioFormat,
    );
  }, [extractAudioFormat, hasRestoredSession]);

  useEffect(() => {
    if (!hasRestoredSession) {
      return;
    }

    window.sessionStorage.setItem(
      sessionStorageKeys.audioTrackAssetId,
      audioTrackAssetId,
    );
  }, [audioTrackAssetId, hasRestoredSession]);

  useEffect(() => {
    if (!hasRestoredSession) {
      return;
    }

    window.sessionStorage.setItem(
      sessionStorageKeys.audioTrackMode,
      audioTrackMode,
    );
  }, [audioTrackMode, hasRestoredSession]);

  useEffect(() => {
    if (!hasRestoredSession) {
      return;
    }

    window.sessionStorage.setItem(
      sessionStorageKeys.audioTrackReplacementAssetId,
      audioTrackReplacementAssetId,
    );
  }, [audioTrackReplacementAssetId, hasRestoredSession]);

  useEffect(() => {
    if (!hasRestoredSession) {
      return;
    }

    window.sessionStorage.setItem(
      sessionStorageKeys.audioTrackLoopReplacement,
      String(audioTrackLoopReplacement),
    );
  }, [audioTrackLoopReplacement, hasRestoredSession]);

  useEffect(() => {
    if (!hasRestoredSession) {
      return;
    }

    window.sessionStorage.setItem(
      sessionStorageKeys.changeSpeedAssetId,
      changeSpeedAssetId,
    );
  }, [changeSpeedAssetId, hasRestoredSession]);

  useEffect(() => {
    if (!hasRestoredSession) {
      return;
    }

    window.sessionStorage.setItem(
      sessionStorageKeys.changeSpeedRate,
      changeSpeedRate,
    );
  }, [changeSpeedRate, hasRestoredSession]);

  useEffect(() => {
    if (!hasRestoredSession) {
      return;
    }

    window.sessionStorage.setItem(
      sessionStorageKeys.audioVolumeAssetId,
      audioVolumeAssetId,
    );
  }, [audioVolumeAssetId, hasRestoredSession]);

  useEffect(() => {
    if (!hasRestoredSession) {
      return;
    }

    window.sessionStorage.setItem(
      sessionStorageKeys.audioVolumeMute,
      String(audioVolumeMute),
    );
  }, [audioVolumeMute, hasRestoredSession]);

  useEffect(() => {
    if (!hasRestoredSession) {
      return;
    }

    window.sessionStorage.setItem(
      sessionStorageKeys.audioVolumeGainDb,
      audioVolumeGainDb,
    );
  }, [audioVolumeGainDb, hasRestoredSession]);

  useEffect(() => {
    if (!hasRestoredSession) {
      return;
    }

    window.sessionStorage.setItem(
      sessionStorageKeys.audioVolumeCustomRange,
      String(audioVolumeUseCustomRange),
    );
  }, [audioVolumeUseCustomRange, hasRestoredSession]);

  useEffect(() => {
    if (!hasRestoredSession) {
      return;
    }

    window.sessionStorage.setItem(
      sessionStorageKeys.audioVolumeStartTime,
      audioVolumeStartTime,
    );
  }, [audioVolumeStartTime, hasRestoredSession]);

  useEffect(() => {
    if (!hasRestoredSession) {
      return;
    }

    window.sessionStorage.setItem(
      sessionStorageKeys.audioVolumeEndTime,
      audioVolumeEndTime,
    );
  }, [audioVolumeEndTime, hasRestoredSession]);

  useEffect(() => {
    if (!hasRestoredSession) {
      return;
    }

    window.sessionStorage.setItem(
      sessionStorageKeys.audioVolumePreventClipping,
      String(audioVolumePreventClipping),
    );
  }, [audioVolumePreventClipping, hasRestoredSession]);

  useEffect(() => {
    if (!hasRestoredSession) {
      return;
    }

    window.sessionStorage.setItem(
      sessionStorageKeys.textOverlayAssetId,
      textOverlayAssetId,
    );
  }, [hasRestoredSession, textOverlayAssetId]);

  useEffect(() => {
    if (!hasRestoredSession) {
      return;
    }

    window.sessionStorage.setItem(sessionStorageKeys.textOverlayText, textOverlayText);
  }, [hasRestoredSession, textOverlayText]);

  useEffect(() => {
    if (!hasRestoredSession) {
      return;
    }

    window.sessionStorage.setItem(
      sessionStorageKeys.textOverlayStartTime,
      textOverlayStartTime,
    );
  }, [hasRestoredSession, textOverlayStartTime]);

  useEffect(() => {
    if (!hasRestoredSession) {
      return;
    }

    window.sessionStorage.setItem(
      sessionStorageKeys.textOverlayEndTime,
      textOverlayEndTime,
    );
  }, [hasRestoredSession, textOverlayEndTime]);

  useEffect(() => {
    if (!hasRestoredSession) {
      return;
    }

    window.sessionStorage.setItem(
      sessionStorageKeys.textOverlayFontSize,
      textOverlayFontSize,
    );
  }, [hasRestoredSession, textOverlayFontSize]);

  useEffect(() => {
    if (!hasRestoredSession) {
      return;
    }

    window.sessionStorage.setItem(
      sessionStorageKeys.textOverlayFontColor,
      textOverlayFontColor,
    );
  }, [hasRestoredSession, textOverlayFontColor]);

  useEffect(() => {
    if (!hasRestoredSession) {
      return;
    }

    window.sessionStorage.setItem(
      sessionStorageKeys.textOverlayBackgroundColor,
      textOverlayBackgroundColor,
    );
  }, [hasRestoredSession, textOverlayBackgroundColor]);

  useEffect(() => {
    if (!hasRestoredSession) {
      return;
    }

    window.sessionStorage.setItem(
      sessionStorageKeys.textOverlayBackgroundOpacity,
      textOverlayBackgroundOpacity,
    );
  }, [hasRestoredSession, textOverlayBackgroundOpacity]);

  useEffect(() => {
    if (!hasRestoredSession) {
      return;
    }

    window.sessionStorage.setItem(
      sessionStorageKeys.textOverlayHorizontal,
      textOverlayHorizontal,
    );
  }, [hasRestoredSession, textOverlayHorizontal]);

  useEffect(() => {
    if (!hasRestoredSession) {
      return;
    }

    window.sessionStorage.setItem(
      sessionStorageKeys.textOverlayVertical,
      textOverlayVertical,
    );
  }, [hasRestoredSession, textOverlayVertical]);

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

  async function handleCompressJob() {
    if (!compressAssetId) {
      setErrorMessage("Choose one uploaded video before creating a compression job.");
      return;
    }

    if (!compressTargetPlan.target) {
      setErrorMessage(
        compressTargetPlan.errorMessage ?? "Compression target could not be prepared.",
      );
      return;
    }

    setBusyAction("compress");
    setErrorMessage("");

    try {
      await ensureBackendReady("Preparing your video compression request.");
      const response = await fetchJson<JobResponse>("/api/v1/jobs/compress-video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assetId: compressAssetId,
          target: compressTargetPlan.target,
        }),
      });

      await loadJobs();
      setFeedback(`Compression job ${response.item.id.slice(0, 8)} has been queued.`);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Compression job failed.");
    } finally {
      setBusyAction(null);
    }
  }

  async function handleExtractFrameJob() {
    if (!extractAssetId) {
      setErrorMessage("Choose one video clip before extracting a frame.");
      return;
    }

    if (!extractFrameTargetPlan.target) {
      setErrorMessage(
        extractFrameTargetPlan.errorMessage ?? "Frame extraction target could not be prepared.",
      );
      return;
    }

    setBusyAction("extract-frame");
    setErrorMessage("");

    try {
      await ensureBackendReady("Preparing your frame extraction request.");
      const response = await fetchJson<JobResponse>("/api/v1/jobs/extract-frame", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assetId: extractAssetId,
          target: extractFrameTargetPlan.target,
        }),
      });

      await loadJobs();
      setFeedback(`Frame extraction job ${response.item.id.slice(0, 8)} has been queued.`);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Frame extraction job failed.",
      );
    } finally {
      setBusyAction(null);
    }
  }

  async function handleExtractAudioJob() {
    if (!extractAudioAssetId) {
      setErrorMessage("Choose one video clip before extracting audio.");
      return;
    }

    if (!extractAudioTargetPlan.target) {
      setErrorMessage(
        extractAudioTargetPlan.errorMessage ??
          "Audio extraction target could not be prepared.",
      );
      return;
    }

    setBusyAction("extract-audio");
    setErrorMessage("");

    try {
      await ensureBackendReady("Preparing your audio extraction request.");
      const response = await fetchJson<JobResponse>("/api/v1/jobs/extract-audio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assetId: extractAudioAssetId,
          target: extractAudioTargetPlan.target,
        }),
      });

      await loadJobs();
      setFeedback(`Audio extraction job ${response.item.id.slice(0, 8)} has been queued.`);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Audio extraction job failed.",
      );
    } finally {
      setBusyAction(null);
    }
  }

  async function handleEditAudioTrackJob() {
    if (!audioTrackAssetId) {
      setErrorMessage("Choose one video clip before editing its soundtrack.");
      return;
    }

    if (!audioTrackTargetPlan.target) {
      setErrorMessage(
        audioTrackTargetPlan.errorMessage ??
          "Audio track target could not be prepared.",
      );
      return;
    }

    setBusyAction("audio-track");
    setErrorMessage("");

    try {
      await ensureBackendReady("Preparing your audio track edit request.");
      const response = await fetchJson<JobResponse>("/api/v1/jobs/edit-audio-track", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assetId: audioTrackAssetId,
          target: audioTrackTargetPlan.target,
        }),
      });

      await loadJobs();
      setFeedback(`Audio track job ${response.item.id.slice(0, 8)} has been queued.`);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Audio track job failed.");
    } finally {
      setBusyAction(null);
    }
  }

  async function handleChangeSpeedJob() {
    if (!changeSpeedAssetId) {
      setErrorMessage("Choose one video or audio file before changing speed.");
      return;
    }

    if (!changeSpeedTargetPlan.target) {
      setErrorMessage(
        changeSpeedTargetPlan.errorMessage ??
          "Playback speed target could not be prepared.",
      );
      return;
    }

    setBusyAction("change-speed");
    setErrorMessage("");

    try {
      await ensureBackendReady("Preparing your playback speed request.");
      const response = await fetchJson<JobResponse>("/api/v1/jobs/change-speed", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assetId: changeSpeedAssetId,
          target: changeSpeedTargetPlan.target,
        }),
      });

      await loadJobs();
      setFeedback(`Speed change job ${response.item.id.slice(0, 8)} has been queued.`);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Speed change job failed.");
    } finally {
      setBusyAction(null);
    }
  }

  async function handleAudioVolumeJob() {
    if (!audioVolumeAssetId) {
      setErrorMessage("Choose one video or audio file before adjusting audio volume.");
      return;
    }

    if (!audioVolumeTargetPlan.target) {
      setErrorMessage(
        audioVolumeTargetPlan.errorMessage ??
          "Audio volume target could not be prepared.",
      );
      return;
    }

    setBusyAction("audio-volume");
    setErrorMessage("");

    try {
      await ensureBackendReady("Preparing your audio volume request.");
      const response = await fetchJson<JobResponse>("/api/v1/jobs/audio-volume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assetId: audioVolumeAssetId,
          target: audioVolumeTargetPlan.target,
        }),
      });

      await loadJobs();
      setFeedback(`Audio volume job ${response.item.id.slice(0, 8)} has been queued.`);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Audio volume job failed.");
    } finally {
      setBusyAction(null);
    }
  }

  async function handleTextOverlayJob() {
    if (!textOverlayAssetId) {
      setErrorMessage("Choose one video clip before adding text.");
      return;
    }

    if (!textOverlayTargetPlan.target) {
      setErrorMessage(
        textOverlayTargetPlan.errorMessage ??
          "Text overlay target could not be prepared.",
      );
      return;
    }

    setBusyAction("text-overlay");
    setErrorMessage("");

    try {
      await ensureBackendReady("Preparing your text overlay request.");
      const response = await fetchJson<JobResponse>("/api/v1/jobs/overlay-text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assetId: textOverlayAssetId,
          target: textOverlayTargetPlan.target,
        }),
      });

      await loadJobs();
      setFeedback(`Text overlay job ${response.item.id.slice(0, 8)} has been queued.`);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Text overlay job failed.");
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

  async function handleRegenerateThumbnail(asset: MediaAsset) {
    setBusyAction(`thumbnail:${asset.id}`);
    setErrorMessage("");

    try {
      await ensureBackendReady("Refreshing the thumbnail preview.");
      const response = await fetchJson<{ item?: MediaAsset; message?: string }>(
        `/api/v1/assets/${asset.id}/thumbnail/regenerate`,
        {
          method: "POST",
        },
      );

      await loadAssets();
      setFeedback(response.message ?? `Thumbnail preview for ${asset.originalName} was refreshed.`);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Thumbnail preview could not be refreshed.",
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

  function renderCompressPanel() {
    const selectedCompressionPreset = compressionPresetOptions.find(
      (option) => option.value === compressPreset,
    );
    const selectedCompressionMode = compressionModeOptions.find(
      (option) => option.value === compressMode,
    );

    return (
      <section className="glass-panel rounded-[2rem] p-6 sm:p-8">
        <PanelHeader
          eyebrow="Compress function"
          title="Shrink one video or transcode it into a cleaner export"
          badge="Function"
        />

        <div className="mt-6 space-y-4">
          {videoAssets.length > 0 ? (
            <div className="grid max-h-[18rem] gap-3 overflow-y-auto pr-1">
              {videoAssets.map((asset) => (
                <SelectableAssetCard
                  key={asset.id}
                  asset={asset}
                  selected={compressAssetId === asset.id}
                  inputType="radio"
                  inputName="compress-asset"
                  onSelect={() => {
                    setCompressAssetId(asset.id);
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-[1.5rem] bg-white/72 p-5 text-sm leading-6 text-muted">
              Upload a video clip to enable compression.
            </div>
          )}

          <div className="grid gap-4 lg:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-foreground">
              Mode
              <select
                value={compressMode}
                onChange={(event) => {
                  setCompressMode(event.target.value as VideoCompressionMode);
                }}
                className="rounded-2xl border border-panel-border bg-white px-4 py-3 text-sm"
              >
                {compressionModeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="rounded-[1.5rem] bg-white/78 px-4 py-4">
              <p className="text-sm font-semibold text-foreground">
                {selectedCompressionMode?.label ?? "Compression mode"}
              </p>
              <p className="mt-2 text-sm leading-6 text-muted">
                {selectedCompressionMode?.description ??
                  "Choose a preset workflow or tune compression settings yourself."}
              </p>
            </div>
          </div>

          {compressMode === "simple" ? (
            <div className="rounded-[1.5rem] bg-white/78 p-4">
              <label className="grid gap-2 text-sm font-medium text-foreground">
                Preset
                <select
                  value={compressPreset}
                  onChange={(event) => {
                    setCompressPreset(event.target.value as VideoCompressionPreset);
                  }}
                  className="rounded-2xl border border-panel-border bg-white px-4 py-3 text-sm"
                >
                  {compressionPresetOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <p className="mt-3 text-sm leading-6 text-muted">
                {selectedCompressionPreset?.description ??
                  "Choose how aggressively the file should be compressed."}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium text-foreground">
                CRF (0-51, optional)
                <input
                  type="number"
                  min="0"
                  max="51"
                  step="1"
                  value={compressCrf}
                  onChange={(event) => {
                    setCompressCrf(event.target.value);
                  }}
                  className="rounded-2xl border border-panel-border bg-white px-4 py-3 text-sm"
                />
              </label>

              <label className="grid gap-2 text-sm font-medium text-foreground">
                Encoder preset
                <select
                  value={compressEncoderPreset}
                  onChange={(event) => {
                    setCompressEncoderPreset(
                      event.target.value as VideoCompressionEncoderPreset,
                    );
                  }}
                  className="rounded-2xl border border-panel-border bg-white px-4 py-3 text-sm"
                >
                  {compressionEncoderPresetOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2 text-sm font-medium text-foreground">
                Video bitrate kbps (optional)
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={compressVideoBitrate}
                  onChange={(event) => {
                    setCompressVideoBitrate(event.target.value);
                  }}
                  className="rounded-2xl border border-panel-border bg-white px-4 py-3 text-sm"
                />
              </label>

              <label className="grid gap-2 text-sm font-medium text-foreground">
                Audio bitrate kbps (optional)
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={compressAudioBitrate}
                  onChange={(event) => {
                    setCompressAudioBitrate(event.target.value);
                  }}
                  className="rounded-2xl border border-panel-border bg-white px-4 py-3 text-sm"
                />
              </label>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-[#f8f5ef] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.16em] text-muted">Source</p>
              <p className="mt-2 text-sm font-semibold">
                {selectedCompressAsset?.originalName ?? "Choose a video"}
              </p>
            </div>
            <div className="rounded-2xl bg-[#f8f5ef] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.16em] text-muted">Target summary</p>
              <p className="mt-2 text-sm font-semibold">
                {formatCompressionTargetSummary(compressTargetPlan.target)}
              </p>
            </div>
          </div>

          <div className="rounded-[1.5rem] bg-white/78 px-4 py-4 text-sm leading-6 text-muted">
            Output stays MP4 with H.264 video and AAC audio so the result is easier to preview,
            merge, and deliver.
          </div>

          {compressTargetPlan.errorMessage ? (
            <p className="rounded-2xl bg-[#fff1ea] px-4 py-3 text-sm text-[#8f3b13]">
              {compressTargetPlan.errorMessage}
            </p>
          ) : null}

          <button
            type="button"
            onClick={() => {
              void handleCompressJob();
            }}
            disabled={busyAction === "compress" || !compressAssetId || !compressTargetPlan.target}
            className="rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busyAction === "compress" ? "Queueing compression..." : "Queue compress job"}
          </button>
        </div>
      </section>
    );
  }

  function renderExtractFramePanel() {
    return (
      <section className="glass-panel rounded-[2rem] p-6 sm:p-8">
        <PanelHeader
          eyebrow="Extract frame function"
          title="Capture one still frame from a video clip"
          badge="Function"
        />

        <div className="mt-6 space-y-4">
          {videoAssets.length > 0 ? (
            <div className="grid max-h-[18rem] gap-3 overflow-y-auto pr-1">
              {videoAssets.map((asset) => (
                <SelectableAssetCard
                  key={asset.id}
                  asset={asset}
                  selected={extractAssetId === asset.id}
                  inputType="radio"
                  inputName="extract-asset"
                  onSelect={() => {
                    setExtractAssetId(asset.id);
                    setExtractTimeSeconds(
                      asset.metadata?.durationSeconds
                        ? String(Number(Math.min(1, asset.metadata.durationSeconds).toFixed(2)))
                        : "0",
                    );
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-[1.5rem] bg-white/72 p-5 text-sm leading-6 text-muted">
              Upload a video clip to enable frame extraction.
            </div>
          )}

          <div className="grid gap-4 lg:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-foreground">
              Frame time (seconds)
              <input
                type="number"
                min="0"
                step="0.1"
                value={extractTimeSeconds}
                onChange={(event) => {
                  setExtractTimeSeconds(event.target.value);
                }}
                className="rounded-2xl border border-panel-border bg-white px-4 py-3 text-sm"
              />
            </label>

            <label className="grid gap-2 text-sm font-medium text-foreground">
              Output format
              <select
                value={extractFormat}
                onChange={(event) => {
                  setExtractFormat(event.target.value as ConvertImageFormat);
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
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-foreground">
              Fit mode
              <select
                value={extractFit}
                onChange={(event) => {
                  setExtractFit(event.target.value as ConvertImageFit);
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

            {extractFormat !== "png" ? (
              <label className="grid gap-2 text-sm font-medium text-foreground">
                Quality (1-100)
                <input
                  type="number"
                  min="1"
                  max="100"
                  step="1"
                  value={extractQuality}
                  onChange={(event) => {
                    setExtractQuality(event.target.value);
                  }}
                  className="rounded-2xl border border-panel-border bg-white px-4 py-3 text-sm"
                />
              </label>
            ) : (
              <div className="rounded-[1.5rem] bg-white/78 px-4 py-4 text-sm leading-6 text-muted">
                PNG ignores quality because it stays lossless.
              </div>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-foreground">
              Width (optional)
              <input
                type="number"
                min="1"
                step="1"
                value={extractWidth}
                onChange={(event) => {
                  setExtractWidth(event.target.value);
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
                value={extractHeight}
                onChange={(event) => {
                  setExtractHeight(event.target.value);
                }}
                className="rounded-2xl border border-panel-border bg-white px-4 py-3 text-sm"
              />
            </label>
          </div>

          <label className="grid gap-2 text-sm font-medium text-foreground">
            Background for JPEG or padded frames
            <input
              type="text"
              value={extractBackground}
              onChange={(event) => {
                setExtractBackground(event.target.value);
              }}
              className="rounded-2xl border border-panel-border bg-white px-4 py-3 text-sm"
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-[#f8f5ef] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.16em] text-muted">Source</p>
              <p className="mt-2 text-sm font-semibold">
                {selectedExtractAsset?.originalName ?? "Choose a video"}
              </p>
            </div>
            <div className="rounded-2xl bg-[#f8f5ef] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.16em] text-muted">Target summary</p>
              <p className="mt-2 text-sm font-semibold">
                {formatExtractFrameTargetSummary(extractFrameTargetPlan.target)}
              </p>
            </div>
          </div>

          {extractFrameTargetPlan.errorMessage ? (
            <p className="rounded-2xl bg-[#fff1ea] px-4 py-3 text-sm text-[#8f3b13]">
              {extractFrameTargetPlan.errorMessage}
            </p>
          ) : null}

          <button
            type="button"
            onClick={() => {
              void handleExtractFrameJob();
            }}
            disabled={
              busyAction === "extract-frame" ||
              !extractAssetId ||
              !extractFrameTargetPlan.target
            }
            className="rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busyAction === "extract-frame"
              ? "Queueing frame extraction..."
              : "Queue extract frame job"}
          </button>
        </div>
      </section>
    );
  }

  function renderExtractAudioPanel() {
    const selectedExtractAudioFormat = audioExtractFormatOptions.find(
      (option) => option.value === extractAudioFormat,
    );

    return (
      <section className="glass-panel rounded-[2rem] p-6 sm:p-8">
        <PanelHeader
          eyebrow="Extract audio function"
          title="Pull the soundtrack out of one video clip"
          badge="Function"
        />

        <div className="mt-6 space-y-4">
          {videoWithAudioAssets.length > 0 ? (
            <div className="grid max-h-[16rem] gap-3 overflow-y-auto pr-1">
              {videoWithAudioAssets.map((asset) => (
                <SelectableAssetCard
                  key={asset.id}
                  asset={asset}
                  selected={extractAudioAssetId === asset.id}
                  inputType="radio"
                  inputName="extract-audio-asset"
                  onSelect={() => {
                    setExtractAudioAssetId(asset.id);
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-[1.5rem] bg-white/72 p-5 text-sm leading-6 text-muted">
              Upload a video that already contains audio to enable audio extraction.
            </div>
          )}

          <div className="grid gap-4 lg:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-foreground">
              Output format
              <select
                value={extractAudioFormat}
                onChange={(event) => {
                  setExtractAudioFormat(event.target.value as AudioExtractFormat);
                }}
                className="rounded-2xl border border-panel-border bg-white px-4 py-3 text-sm"
              >
                {audioExtractFormatOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="rounded-[1.5rem] bg-white/78 px-4 py-4">
              <p className="text-sm font-semibold text-foreground">
                {selectedExtractAudioFormat?.label ?? "Audio format"}
              </p>
              <p className="mt-2 text-sm leading-6 text-muted">
                {selectedExtractAudioFormat?.description ??
                  "Choose how the extracted soundtrack should be exported."}
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-[#f8f5ef] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.16em] text-muted">Source</p>
              <p className="mt-2 text-sm font-semibold">
                {selectedExtractAudioAsset?.originalName ?? "Choose a video"}
              </p>
            </div>
            <div className="rounded-2xl bg-[#f8f5ef] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.16em] text-muted">Target summary</p>
              <p className="mt-2 text-sm font-semibold">
                {formatExtractAudioTargetSummary(extractAudioTargetPlan.target)}
              </p>
            </div>
          </div>

          <div className="rounded-[1.5rem] bg-white/78 px-4 py-4 text-sm leading-6 text-muted">
            Use this when you need the voice track, music, or ambience as a separate file for
            another step.
          </div>

          {extractAudioTargetPlan.errorMessage ? (
            <p className="rounded-2xl bg-[#fff1ea] px-4 py-3 text-sm text-[#8f3b13]">
              {extractAudioTargetPlan.errorMessage}
            </p>
          ) : null}

          <button
            type="button"
            onClick={() => {
              void handleExtractAudioJob();
            }}
            disabled={
              busyAction === "extract-audio" ||
              !extractAudioAssetId ||
              !extractAudioTargetPlan.target
            }
            className="rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busyAction === "extract-audio"
              ? "Queueing audio extraction..."
              : "Queue extract audio job"}
          </button>
        </div>
      </section>
    );
  }

  function renderAudioTrackPanel() {
    const selectedAudioTrackMode = audioTrackModeOptions.find(
      (option) => option.value === audioTrackMode,
    );

    return (
      <section className="glass-panel rounded-[2rem] p-6 sm:p-8">
        <PanelHeader
          eyebrow="Audio track function"
          title="Mute a video or replace its soundtrack"
          badge="Function"
        />

        <div className="mt-6 space-y-4">
          {videoAssets.length > 0 ? (
            <div className="grid max-h-[16rem] gap-3 overflow-y-auto pr-1">
              {videoAssets.map((asset) => (
                <SelectableAssetCard
                  key={asset.id}
                  asset={asset}
                  selected={audioTrackAssetId === asset.id}
                  inputType="radio"
                  inputName="audio-track-asset"
                  onSelect={() => {
                    setAudioTrackAssetId(asset.id);

                    if (
                      !audioTrackReplacementAssetId ||
                      audioTrackReplacementAssetId === asset.id
                    ) {
                      setAudioTrackReplacementAssetId(
                        getDefaultReplacementAudioId(audioSourceAssets, asset.id),
                      );
                    }
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-[1.5rem] bg-white/72 p-5 text-sm leading-6 text-muted">
              Upload a video clip to enable soundtrack editing.
            </div>
          )}

          <div className="grid gap-4 lg:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-foreground">
              Mode
              <select
                value={audioTrackMode}
                onChange={(event) => {
                  setAudioTrackMode(event.target.value as AudioTrackEditMode);
                }}
                className="rounded-2xl border border-panel-border bg-white px-4 py-3 text-sm"
              >
                {audioTrackModeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="rounded-[1.5rem] bg-white/78 px-4 py-4">
              <p className="text-sm font-semibold text-foreground">
                {selectedAudioTrackMode?.label ?? "Audio mode"}
              </p>
              <p className="mt-2 text-sm leading-6 text-muted">
                {selectedAudioTrackMode?.description ??
                  "Choose whether the next export should be silent or use a new soundtrack."}
              </p>
            </div>
          </div>

          {audioTrackMode === "replace" ? (
            <div className="space-y-4 rounded-[1.5rem] bg-white/78 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">Replacement source</p>
                  <p className="mt-1 text-sm leading-6 text-muted">
                    Choose any uploaded file that already contains audio.
                  </p>
                </div>
                <label className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
                  <input
                    type="checkbox"
                    checked={audioTrackLoopReplacement}
                    onChange={(event) => {
                      setAudioTrackLoopReplacement(event.target.checked);
                    }}
                    className="h-4 w-4"
                  />
                  Loop to fit clip
                </label>
              </div>

              {audioSourceAssets.length > 0 ? (
                <div className="grid max-h-[16rem] gap-3 overflow-y-auto pr-1">
                  {audioSourceAssets.map((asset) => (
                    <SelectableAssetCard
                      key={asset.id}
                      asset={asset}
                      selected={audioTrackReplacementAssetId === asset.id}
                      inputType="radio"
                      inputName="audio-track-replacement"
                      onSelect={() => {
                        setAudioTrackReplacementAssetId(asset.id);
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-[1.4rem] bg-white p-4 text-sm leading-6 text-muted">
                  Upload an audio file or another video with sound before using Replace audio.
                </div>
              )}
            </div>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl bg-[#f8f5ef] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.16em] text-muted">Video target</p>
              <p className="mt-2 text-sm font-semibold">
                {selectedAudioTrackAsset?.originalName ?? "Choose a video"}
              </p>
            </div>
            <div className="rounded-2xl bg-[#f8f5ef] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.16em] text-muted">Audio source</p>
              <p className="mt-2 text-sm font-semibold">
                {audioTrackMode === "mute"
                  ? "Muted export"
                  : selectedAudioTrackReplacementAsset?.originalName ?? "Choose audio"}
              </p>
            </div>
            <div className="rounded-2xl bg-[#f8f5ef] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.16em] text-muted">Target summary</p>
              <p className="mt-2 text-sm font-semibold">
                {formatAudioTrackEditTargetSummary(
                  audioTrackTargetPlan.target,
                  selectedAudioTrackReplacementAsset,
                )}
              </p>
            </div>
          </div>

          <div className="rounded-[1.5rem] bg-white/78 px-4 py-4 text-sm leading-6 text-muted">
            Output stays MP4 so the edited clip remains easy to preview, queue again, and merge
            later.
          </div>

          {audioTrackTargetPlan.errorMessage ? (
            <p className="rounded-2xl bg-[#fff1ea] px-4 py-3 text-sm text-[#8f3b13]">
              {audioTrackTargetPlan.errorMessage}
            </p>
          ) : null}

          <button
            type="button"
            onClick={() => {
              void handleEditAudioTrackJob();
            }}
            disabled={
              busyAction === "audio-track" ||
              !audioTrackAssetId ||
              !audioTrackTargetPlan.target
            }
            className="rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busyAction === "audio-track"
              ? "Queueing audio track edit..."
              : "Queue audio track job"}
          </button>
        </div>
      </section>
    );
  }

  function renderChangeSpeedPanel() {
    return (
      <section className="glass-panel rounded-[2rem] p-6 sm:p-8">
        <PanelHeader
          eyebrow="Change speed function"
          title="Speed up or slow down video and audio files"
          badge="Function"
        />

        <div className="mt-6 space-y-4">
          {timedMediaAssets.length > 0 ? (
            <div className="grid max-h-[16rem] gap-3 overflow-y-auto pr-1">
              {timedMediaAssets.map((asset) => (
                <SelectableAssetCard
                  key={asset.id}
                  asset={asset}
                  selected={changeSpeedAssetId === asset.id}
                  inputType="radio"
                  inputName="change-speed-asset"
                  onSelect={() => {
                    setChangeSpeedAssetId(asset.id);
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-[1.5rem] bg-white/72 p-5 text-sm leading-6 text-muted">
              Upload a video clip or audio file to enable playback speed changes.
            </div>
          )}

          <label className="grid gap-2 text-sm font-medium text-foreground">
            Playback rate (0.25x to 4x)
            <input
              type="number"
              min="0.25"
              max="4"
              step="0.05"
              value={changeSpeedRate}
              onChange={(event) => {
                setChangeSpeedRate(event.target.value);
              }}
              className="rounded-2xl border border-panel-border bg-white px-4 py-3 text-sm"
            />
          </label>

          <div className="flex flex-wrap gap-2">
            {speedPresetOptions.map((rate) => {
              const isActive = Number(changeSpeedRate) === rate;

              return (
                <button
                  key={rate}
                  type="button"
                  onClick={() => {
                    setChangeSpeedRate(String(rate));
                  }}
                  className={
                    isActive
                      ? "rounded-full bg-[#111111] px-3.5 py-2 text-sm font-semibold text-white"
                      : "rounded-full border border-panel-border bg-white px-3.5 py-2 text-sm font-semibold text-foreground"
                  }
                >
                  {rate}x
                </button>
              );
            })}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-[#f8f5ef] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.16em] text-muted">Source</p>
              <p className="mt-2 text-sm font-semibold">
                {selectedChangeSpeedAsset?.originalName ?? "Choose media"}
              </p>
            </div>
            <div className="rounded-2xl bg-[#f8f5ef] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.16em] text-muted">Target summary</p>
              <p className="mt-2 text-sm font-semibold">
                {formatPlaybackSpeedTargetSummary(
                  selectedChangeSpeedAsset,
                  changeSpeedTargetPlan.target,
                )}
              </p>
            </div>
          </div>

          <div className="rounded-[1.5rem] bg-white/78 px-4 py-4 text-sm leading-6 text-muted">
            Video sources stay video, while audio-only sources export as MP3 after the speed
            change.
          </div>

          {changeSpeedTargetPlan.errorMessage ? (
            <p className="rounded-2xl bg-[#fff1ea] px-4 py-3 text-sm text-[#8f3b13]">
              {changeSpeedTargetPlan.errorMessage}
            </p>
          ) : null}

          <button
            type="button"
            onClick={() => {
              void handleChangeSpeedJob();
            }}
            disabled={
              busyAction === "change-speed" ||
              !changeSpeedAssetId ||
              !changeSpeedTargetPlan.target
            }
            className="rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busyAction === "change-speed"
              ? "Queueing speed change..."
              : "Queue speed change job"}
          </button>
        </div>
      </section>
    );
  }

  function renderAudioVolumePanel() {
    const currentGainValue = Number(audioVolumeGainDb || "0");

    return (
      <section className="glass-panel rounded-[2rem] p-6 sm:p-8">
        <PanelHeader
          eyebrow="Audio volume function"
          title="Raise, lower, or mute the soundtrack"
          badge="Function"
        />

        <div className="mt-6 space-y-4">
          {audioCapableAssets.length > 0 ? (
            <div className="grid max-h-[16rem] gap-3 overflow-y-auto pr-1">
              {audioCapableAssets.map((asset) => (
                <SelectableAssetCard
                  key={asset.id}
                  asset={asset}
                  selected={audioVolumeAssetId === asset.id}
                  inputType="radio"
                  inputName="audio-volume-asset"
                  onSelect={() => {
                    setAudioVolumeAssetId(asset.id);
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-[1.5rem] bg-white/72 p-5 text-sm leading-6 text-muted">
              Upload a video or audio file with sound to enable audio volume adjustments.
            </div>
          )}

          <div className="rounded-[1.5rem] bg-white/78 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">Volume gain</p>
                <p className="mt-1 text-sm leading-6 text-muted">
                  0 dB keeps the original level, negative values make it quieter, and positive
                  values make it louder.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setAudioVolumeMute((current) => !current);
                }}
                className={
                  audioVolumeMute
                    ? "rounded-full bg-[#111111] px-4 py-2 text-sm font-semibold text-white"
                    : "rounded-full border border-panel-border bg-white px-4 py-2 text-sm font-semibold text-foreground"
                }
              >
                {audioVolumeMute ? "Mute enabled" : "Mute"}
              </button>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-[0.42fr_0.58fr]">
              <label className="grid gap-2 text-sm font-medium text-foreground">
                Gain (dB)
                <input
                  type="number"
                  min="-30"
                  max="20"
                  step="0.5"
                  value={audioVolumeGainDb}
                  onChange={(event) => {
                    setAudioVolumeMute(false);
                    setAudioVolumeGainDb(event.target.value);
                  }}
                  disabled={audioVolumeMute}
                  className="rounded-2xl border border-panel-border bg-white px-4 py-3 text-sm disabled:cursor-not-allowed disabled:bg-[#f5f1ea] disabled:text-muted"
                />
              </label>

              <label className="grid gap-2 text-sm font-medium text-foreground">
                Drag to adjust
                <input
                  type="range"
                  min="-30"
                  max="20"
                  step="0.5"
                  value={Number.isFinite(currentGainValue) ? currentGainValue : 0}
                  onChange={(event) => {
                    setAudioVolumeMute(false);
                    setAudioVolumeGainDb(event.target.value);
                  }}
                  disabled={audioVolumeMute}
                  className="mt-3 w-full accent-[#111111] disabled:cursor-not-allowed"
                />
              </label>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {audioVolumeQuickOptions.map((option) => {
                const isActive =
                  option.value === "mute"
                    ? audioVolumeMute
                    : !audioVolumeMute && Number(audioVolumeGainDb || "0") === option.value;

                return (
                  <button
                    key={option.label}
                    type="button"
                    onClick={() => {
                      if (option.value === "mute") {
                        setAudioVolumeMute(true);
                        return;
                      }

                      setAudioVolumeMute(false);
                      setAudioVolumeGainDb(String(option.value));
                    }}
                    className={
                      isActive
                        ? "rounded-full bg-[#111111] px-3.5 py-2 text-sm font-semibold text-white"
                        : "rounded-full border border-panel-border bg-white px-3.5 py-2 text-sm font-semibold text-foreground"
                    }
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-[1.5rem] bg-white/78 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">Optional range</p>
                <p className="mt-1 text-sm leading-6 text-muted">
                  Apply the volume change to the full file or just one selected time range.
                </p>
              </div>
              <label className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
                <input
                  type="checkbox"
                  checked={audioVolumeUseCustomRange}
                  onChange={(event) => {
                    setAudioVolumeUseCustomRange(event.target.checked);
                  }}
                  className="h-4 w-4"
                />
                Use custom range
              </label>
            </div>

            {audioVolumeUseCustomRange ? (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-medium text-foreground">
                  Start time (seconds)
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={audioVolumeStartTime}
                    onChange={(event) => {
                      setAudioVolumeStartTime(event.target.value);
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
                    value={audioVolumeEndTime}
                    onChange={(event) => {
                      setAudioVolumeEndTime(event.target.value);
                    }}
                    className="rounded-2xl border border-panel-border bg-white px-4 py-3 text-sm"
                  />
                </label>
              </div>
            ) : null}

            <label className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-foreground">
              <input
                type="checkbox"
                checked={audioVolumePreventClipping}
                onChange={(event) => {
                  setAudioVolumePreventClipping(event.target.checked);
                }}
                className="h-4 w-4"
              />
              Prevent clipping on louder exports
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl bg-[#f8f5ef] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.16em] text-muted">Source</p>
              <p className="mt-2 text-sm font-semibold">
                {selectedAudioVolumeAsset?.originalName ?? "Choose media"}
              </p>
            </div>
            <div className="rounded-2xl bg-[#f8f5ef] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.16em] text-muted">File type</p>
              <p className="mt-2 text-sm font-semibold">
                {selectedAudioVolumeAsset
                  ? isVideoAsset(selectedAudioVolumeAsset)
                    ? "Video with audio"
                    : "Audio file"
                  : "Unavailable"}
              </p>
            </div>
            <div className="rounded-2xl bg-[#f8f5ef] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.16em] text-muted">Target summary</p>
              <p className="mt-2 text-sm font-semibold">
                {formatAudioVolumeTargetSummary(
                  selectedAudioVolumeAsset,
                  audioVolumeTargetPlan.target,
                )}
              </p>
            </div>
          </div>

          <div className="rounded-[1.5rem] bg-white/78 px-4 py-4 text-sm leading-6 text-muted">
            Video sources keep a video export, while audio-only sources stay in an audio-only
            export. Use this page before transition merge if different clips feel too loud or too
            quiet compared with each other.
          </div>

          {audioVolumeTargetPlan.errorMessage ? (
            <p className="rounded-2xl bg-[#fff1ea] px-4 py-3 text-sm text-[#8f3b13]">
              {audioVolumeTargetPlan.errorMessage}
            </p>
          ) : null}

          <button
            type="button"
            onClick={() => {
              void handleAudioVolumeJob();
            }}
            disabled={
              busyAction === "audio-volume" ||
              !audioVolumeAssetId ||
              !audioVolumeTargetPlan.target
            }
            className="rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busyAction === "audio-volume"
              ? "Queueing audio volume..."
              : "Queue audio volume job"}
          </button>
        </div>
      </section>
    );
  }

  function renderTextOverlayPanel() {
    return (
      <section className="glass-panel rounded-[2rem] p-6 sm:p-8">
        <PanelHeader
          eyebrow="Text overlay function"
          title="Burn one title or caption directly into a video"
          badge="Function"
        />

        <div className="mt-6 space-y-4">
          {videoAssets.length > 0 ? (
            <div className="grid max-h-[18rem] gap-3 overflow-y-auto pr-1">
              {videoAssets.map((asset) => (
                <SelectableAssetCard
                  key={asset.id}
                  asset={asset}
                  selected={textOverlayAssetId === asset.id}
                  inputType="radio"
                  inputName="text-overlay-asset"
                  onSelect={() => {
                    setTextOverlayAssetId(asset.id);
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-[1.5rem] bg-white/72 p-5 text-sm leading-6 text-muted">
              Upload a video clip to enable text overlay.
            </div>
          )}

          <label className="grid gap-2 text-sm font-medium text-foreground">
            Overlay text
            <textarea
              value={textOverlayText}
              onChange={(event) => {
                setTextOverlayText(event.target.value);
              }}
              rows={4}
              placeholder="Enter a title, caption, subtitle line, or short note."
              className="min-h-[7.5rem] rounded-2xl border border-panel-border bg-white px-4 py-3 text-sm"
            />
          </label>

          <div className="grid gap-4 lg:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-foreground">
              Start time (optional)
              <input
                type="number"
                min="0"
                step="0.1"
                value={textOverlayStartTime}
                onChange={(event) => {
                  setTextOverlayStartTime(event.target.value);
                }}
                className="rounded-2xl border border-panel-border bg-white px-4 py-3 text-sm"
              />
            </label>

            <label className="grid gap-2 text-sm font-medium text-foreground">
              End time (optional)
              <input
                type="number"
                min="0"
                step="0.1"
                value={textOverlayEndTime}
                onChange={(event) => {
                  setTextOverlayEndTime(event.target.value);
                }}
                className="rounded-2xl border border-panel-border bg-white px-4 py-3 text-sm"
              />
            </label>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-foreground">
              Font size
              <input
                type="number"
                min="1"
                step="1"
                value={textOverlayFontSize}
                onChange={(event) => {
                  setTextOverlayFontSize(event.target.value);
                }}
                className="rounded-2xl border border-panel-border bg-white px-4 py-3 text-sm"
              />
            </label>

            <label className="grid gap-2 text-sm font-medium text-foreground">
              Horizontal position
              <select
                value={textOverlayHorizontal}
                onChange={(event) => {
                  setTextOverlayHorizontal(
                    event.target.value as TextOverlayHorizontal,
                  );
                }}
                className="rounded-2xl border border-panel-border bg-white px-4 py-3 text-sm"
              >
                {textOverlayHorizontalOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 text-sm font-medium text-foreground">
              Font color
              <div className="flex items-center gap-3 rounded-2xl border border-panel-border bg-white px-4 py-3">
                <input
                  type="color"
                  value={textOverlayFontColor}
                  onChange={(event) => {
                    setTextOverlayFontColor(event.target.value);
                  }}
                  className="h-10 w-14 rounded-md border border-panel-border bg-transparent"
                />
                <span className="text-sm text-muted">{textOverlayFontColor}</span>
              </div>
            </label>

            <label className="grid gap-2 text-sm font-medium text-foreground">
              Vertical position
              <select
                value={textOverlayVertical}
                onChange={(event) => {
                  setTextOverlayVertical(event.target.value as TextOverlayVertical);
                }}
                className="rounded-2xl border border-panel-border bg-white px-4 py-3 text-sm"
              >
                {textOverlayVerticalOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 text-sm font-medium text-foreground lg:col-span-2">
              Box color (RGBA)
              <div className="grid gap-3 rounded-2xl border border-panel-border bg-white px-4 py-3 sm:grid-cols-[auto_1fr] sm:items-center">
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={textOverlayBackgroundColor}
                    onChange={(event) => {
                      setTextOverlayBackgroundColor(event.target.value);
                    }}
                    className="h-10 w-14 rounded-md border border-panel-border bg-transparent"
                  />
                  <div
                    className="h-10 w-14 rounded-md border border-panel-border"
                    style={{ backgroundColor: textOverlayBackgroundPreview }}
                    title={textOverlayBackgroundPreview}
                  />
                </div>

                <div className="grid gap-2">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="text-sm text-muted">{textOverlayBackgroundPreview}</span>
                    <span className="rounded-full bg-[#f3ede4] px-2.5 py-1 text-xs font-semibold text-foreground">
                      {textOverlayBackgroundOpacity}% opacity
                    </span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={textOverlayBackgroundOpacity}
                    onChange={(event) => {
                      setTextOverlayBackgroundOpacity(event.target.value);
                    }}
                    className="w-full accent-[#111111]"
                  />
                </div>
              </div>
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-[#f8f5ef] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.16em] text-muted">Source</p>
              <p className="mt-2 text-sm font-semibold">
                {selectedTextOverlayAsset?.originalName ?? "Choose a video"}
              </p>
            </div>
            <div className="rounded-2xl bg-[#f8f5ef] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.16em] text-muted">Target summary</p>
              <p className="mt-2 text-sm font-semibold">
                {formatTextOverlayTargetSummary(textOverlayTargetPlan.target)}
              </p>
            </div>
          </div>

          <div className="rounded-[1.5rem] bg-white/78 px-4 py-4 text-sm leading-6 text-muted">
            This version burns the text directly into the MP4 export. FFmpeg can also render
            real subtitle files later, but this page already covers titles, captions, and
            simple on-screen notes.
          </div>

          {textOverlayTargetPlan.errorMessage ? (
            <p className="rounded-2xl bg-[#fff1ea] px-4 py-3 text-sm text-[#8f3b13]">
              {textOverlayTargetPlan.errorMessage}
            </p>
          ) : null}

          <button
            type="button"
            onClick={() => {
              void handleTextOverlayJob();
            }}
            disabled={
              busyAction === "text-overlay" ||
              !textOverlayAssetId ||
              !textOverlayTargetPlan.target
            }
            className="rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busyAction === "text-overlay"
              ? "Queueing text overlay..."
              : "Queue text overlay job"}
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

    if (activeView === "compress") {
      return renderCompressPanel();
    }

    if (activeView === "extract-frame") {
      return renderExtractFramePanel();
    }

    if (activeView === "extract-audio") {
      return renderExtractAudioPanel();
    }

    if (activeView === "audio-track") {
      return renderAudioTrackPanel();
    }

    if (activeView === "change-speed") {
      return renderChangeSpeedPanel();
    }

    if (activeView === "audio-volume") {
      return renderAudioVolumePanel();
    }

    if (activeView === "text-overlay") {
      return renderTextOverlayPanel();
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
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
              {assetLibraryScope.description}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              void handleRefresh();
            }}
            disabled={isLibraryRefreshing}
            className="inline-flex items-center gap-2 rounded-full border border-panel-border bg-white/80 px-4 py-2 text-sm font-semibold text-foreground transition disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLibraryRefreshing ? (
              <>
                <span
                  aria-hidden="true"
                  className="h-4 w-4 animate-spin rounded-full border-2 border-[#111111]/20 border-t-[#111111]"
                />
                Refreshing...
              </>
            ) : (
              "Refresh"
            )}
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-[1.35rem] bg-white/75 px-4 py-4">
            <p className="text-xs uppercase tracking-[0.16em] text-muted">
              {assetLibraryScope.countLabel}
            </p>
            <p className="mt-2 text-lg font-semibold">{assetLibraryAssets.length}</p>
          </div>
          <div className="rounded-[1.35rem] bg-white/75 px-4 py-4">
            <p className="text-xs uppercase tracking-[0.16em] text-muted">All assets</p>
            <p className="mt-2 text-lg font-semibold">{assets.length}</p>
          </div>
          <div className="rounded-[1.35rem] bg-white/75 px-4 py-4">
            <p className="text-xs uppercase tracking-[0.16em] text-muted">Current outputs</p>
            <p className="mt-2 text-lg font-semibold">
              {assets.filter((asset) => asset.kind === "output").length}
            </p>
          </div>
        </div>

        <div className="mt-6 grid max-h-[34rem] gap-4 overflow-y-auto pr-1">
          {assetLibraryAssets.length > 0 ? (
            assetLibraryAssets.map((asset) => (
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
                    {canRegenerateThumbnail(asset) ? (
                      <button
                        type="button"
                        onClick={() => {
                          void handleRegenerateThumbnail(asset);
                        }}
                        disabled={busyAction === `thumbnail:${asset.id}`}
                        className="rounded-full border border-panel-border bg-white px-4 py-2 text-center text-sm font-semibold text-foreground transition hover:bg-[#f8f5ef] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {busyAction === `thumbnail:${asset.id}`
                          ? "Refreshing preview..."
                          : "Regenerate preview"}
                      </button>
                    ) : null}
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
              {assetLibraryScope.emptyMessage}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
