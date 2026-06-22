"use client";

import { useEffect, useState, useTransition } from "react";
import { fetchJson, toApiUrl, waitForBackendWake } from "@/lib/api";
import type {
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

const tools = [
  "Trim a clip to the exact start and end moment you need",
  "Merge prepared clips into one clean final export",
  "Review duration, resolution, size, and codec details before export",
  "Download completed results from one shared workspace",
];

const workflow = [
  {
    title: "Upload",
    description: "Add one clip or a full batch and keep everything ready in one place.",
  },
  {
    title: "Prepare",
    description: "Review file details, trim key moments, and normalize clips when formats differ.",
  },
  {
    title: "Export",
    description: "Start processing, follow progress, and download finished results when they are ready.",
  },
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

function getJobTypeLabel(type: ProcessingJob["type"]) {
  switch (type) {
    case "trim":
      return "Trim job";
    case "merge":
      return "Merge job";
    case "normalize":
      return "Normalize job";
    default:
      return type;
  }
}

export function EditorDashboard() {
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
  const [feedback, setFeedback] = useState(
    "Upload clips to start trimming, preparing, and exporting your project.",
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [isRefreshing, startRefreshTransition] = useTransition();

  const hasProcessingJobs = jobs.some(
    (job) => job.status === "queued" || job.status === "processing",
  );
  const selectedMergeAssets = assets.filter((asset) => mergeAssetIds.includes(asset.id));
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

  function applyAssetsSnapshot(nextAssets: MediaAsset[]) {
    startRefreshTransition(() => {
      setAssets(nextAssets);

      if (nextAssets.length === 0) {
        setTrimAssetId("");
        setTrimEndTime("5");
        setMergeAssetIds([]);
        return;
      }

      const hasSelectedTrimAsset = nextAssets.some((asset) => asset.id === trimAssetId);

      if (!hasSelectedTrimAsset) {
        setTrimAssetId(nextAssets[0].id);
        setTrimEndTime(getSuggestedTrimEndTime(nextAssets[0]));
      }

      setMergeAssetIds((current) => {
        const filtered = current.filter((assetId) =>
          nextAssets.some((asset) => asset.id === assetId),
        );

        return filtered.length > 0 ? filtered : getDefaultMergeSelection(nextAssets);
      });
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
      await ensureBackendReady("Preparing your workspace before refresh.");
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
    let isActive = true;

    async function loadInitialData() {
      try {
        setFeedback("Preparing your workspace and loading your latest files.");

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
  }, []);

  useEffect(() => {
    if (!hasProcessingJobs) {
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
  }, [hasProcessingJobs, startRefreshTransition]);

  useEffect(() => {
    if (!mergeRequiresNormalization) {
      setIsMergeHelpOpen(false);
    }
  }, [mergeRequiresNormalization]);

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
      setErrorMessage("Upload a file and choose it for trimming first.");
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
      setErrorMessage("Select at least two uploaded files to merge.");
      return;
    }

    if (mergeRequiresNormalization) {
      setErrorMessage(
        "Normalize the selected clips to the same format before merging. Match resolution, codecs, frame rate, and audio settings.",
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

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-10 px-5 py-6 sm:px-8 lg:px-10">
      <section className="glass-panel overflow-hidden rounded-[2rem]">
        <div className="grid gap-8 px-6 py-8 sm:px-8 lg:grid-cols-[1.2fr_0.9fr] lg:px-10 lg:py-10">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-panel-border bg-white/70 px-4 py-2 text-sm text-muted">
              <span className="h-2.5 w-2.5 rounded-full bg-accent" />
              Video editing workspace
            </div>

            <div className="space-y-5">
              <p className="font-display text-sm font-semibold uppercase tracking-[0.28em] text-muted">
                Video File Editor
              </p>
              <h1 className="max-w-3xl font-display text-5xl font-semibold leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
                Prepare clips faster, keep exports organized, and finish every video from one workspace.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-muted sm:text-xl">
                Upload files, review their details, trim key moments, normalize mixed formats, merge finished clips, and download the results when they are ready.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href="#workspace"
                className="rounded-full bg-foreground px-6 py-3 text-center text-sm font-semibold text-white transition-transform duration-200 hover:-translate-y-0.5"
              >
                Open workspace
              </a>
              <a
                href="/docs"
                className="rounded-full border border-panel-border bg-white/80 px-6 py-3 text-center text-sm font-semibold text-foreground transition-colors duration-200 hover:bg-white"
              >
                Read documentation
              </a>
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
                      ? "Uploads, trims, merges, and downloads are available."
                      : "Please wait a moment while the workspace wakes up."}
                  </p>
                </div>
                <div className="rounded-full bg-[#ff6b2c] px-3 py-1 text-xs font-semibold text-black">
                  {health?.status === "ok" ? "online" : "warming up"}
                </div>
              </div>

              <div className="space-y-3 rounded-[1.2rem] bg-white/6 p-4">
                {tools.map((item) => (
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

      <section id="workspace" className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="glass-panel rounded-[2rem] p-6 sm:p-8">
          <p className="font-display text-sm font-semibold uppercase tracking-[0.24em] text-muted">
            Editing flow
          </p>
          <h2 className="mt-4 font-display text-3xl font-semibold leading-tight sm:text-4xl">
            Everything you need to prepare clips and export a clean final result.
          </h2>
          <p className="mt-4 max-w-xl text-base leading-7 text-muted">
            Use one page to upload assets, review file details, trim clips, normalize mismatched formats, merge results, and keep completed exports easy to find.
          </p>

          <div className="mt-6 rounded-[1.5rem] bg-white/75 p-5">
            <p className="text-sm font-semibold text-foreground">Current feedback</p>
            <p className="mt-2 text-sm leading-6 text-muted">{feedback}</p>
            {errorMessage ? (
              <p className="mt-3 rounded-2xl bg-[#fff1ea] px-4 py-3 text-sm text-[#8f3b13]">
                {errorMessage}
              </p>
            ) : null}
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          {workflow.map((step, index) => (
            <article key={step.title} className="glass-panel rounded-[2rem] p-6">
              <p className="font-display text-5xl font-semibold text-accent">0{index + 1}</p>
              <h3 className="mt-5 text-xl font-semibold">{step.title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted">{step.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="glass-panel rounded-[2rem] p-6 sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-display text-sm font-semibold uppercase tracking-[0.24em] text-muted">
                Upload media
              </p>
              <h2 className="mt-3 text-2xl font-semibold">Add clips to your workspace</h2>
            </div>
            <div className="rounded-full bg-accent-soft px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#8f3b13]">
              Step 1
            </div>
          </div>

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
                <span className="text-sm text-muted">
                  No files selected yet.
                </span>
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
        </div>

        <div className="glass-panel rounded-[2rem] p-6 sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-display text-sm font-semibold uppercase tracking-[0.24em] text-muted">
                Available assets
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

          <div className="mt-6 grid gap-4">
            {assets.length > 0 ? (
              assets.map((asset) => (
                <article key={asset.id} className="rounded-[1.5rem] bg-white/78 p-5 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-lg font-semibold">{asset.originalName}</p>
                        <span className="rounded-full bg-[#111111] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-white">
                          {asset.kind}
                        </span>
                        <span className="rounded-full bg-[#f3ede4] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
                          {asset.storageDriver ?? "local"}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-muted">
                        {asset.metadata?.formatName ?? asset.mimeType}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <a
                        href={toApiUrl(asset.downloadUrl)}
                        className="rounded-full border border-panel-border px-4 py-2 text-sm font-semibold text-foreground"
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

                  <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-2xl bg-[#f8f5ef] px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.16em] text-muted">Duration</p>
                      <p className="mt-2 text-sm font-semibold">
                        {formatDuration(asset.metadata?.durationSeconds)}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-[#f8f5ef] px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.16em] text-muted">Resolution</p>
                      <p className="mt-2 text-sm font-semibold">
                        {asset.metadata?.width && asset.metadata?.height
                          ? `${asset.metadata.width}x${asset.metadata.height}`
                          : "Unknown"}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-[#f8f5ef] px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.16em] text-muted">Codec</p>
                      <p className="mt-2 text-sm font-semibold">
                        {asset.metadata?.videoCodec ?? asset.metadata?.audioCodec ?? "Unknown"}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-[#f8f5ef] px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.16em] text-muted">Size</p>
                      <p className="mt-2 text-sm font-semibold">{formatBytes(asset.sizeBytes)}</p>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-[1.5rem] bg-white/72 p-5 text-sm leading-6 text-muted">
                Upload files to populate the asset library.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <div className="glass-panel rounded-[2rem] p-6 sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-display text-sm font-semibold uppercase tracking-[0.24em] text-muted">
                Trim job
              </p>
              <h2 className="mt-3 text-2xl font-semibold">Cut one clip to the exact moment range</h2>
            </div>
            <div className="rounded-full bg-accent-soft px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#8f3b13]">
              Step 2A
            </div>
          </div>

          <div className="mt-6 grid gap-4">
            <label className="grid gap-2 text-sm font-medium text-foreground">
              Source asset
              <select
                value={trimAssetId}
                onChange={(event) => {
                  const nextAssetId = event.target.value;
                  setTrimAssetId(nextAssetId);
                  const asset = assets.find((item) => item.id === nextAssetId);
                  const suggestedEndTime =
                    asset?.metadata?.durationSeconds !== null &&
                    asset?.metadata?.durationSeconds !== undefined
                      ? Math.min(5, Math.max(1, asset.metadata.durationSeconds))
                      : 5;
                  setTrimEndTime(String(Number(suggestedEndTime.toFixed(2))));
                }}
                className="rounded-2xl border border-panel-border bg-white px-4 py-3 text-sm"
              >
                <option value="">Select uploaded asset</option>
                {assets.map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    {asset.originalName}
                  </option>
                ))}
              </select>
            </label>

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
        </div>

        <div className="glass-panel rounded-[2rem] p-6 sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-display text-sm font-semibold uppercase tracking-[0.24em] text-muted">
                Merge job
              </p>
              <h2 className="mt-3 text-2xl font-semibold">Combine prepared clips into one final video</h2>
            </div>
            <div className="rounded-full bg-accent-soft px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#8f3b13]">
              Step 2B
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {assets.length > 0 ? (
              assets.map((asset) => {
                const checked = mergeAssetIds.includes(asset.id);

                return (
                  <label
                    key={asset.id}
                    className="flex items-start gap-3 rounded-[1.5rem] bg-white/75 px-4 py-4"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        toggleMergeAsset(asset.id);
                      }}
                      className="mt-1 h-4 w-4"
                    />
                    <div>
                      <p className="text-sm font-semibold">{asset.originalName}</p>
                      <p className="mt-1 text-sm text-muted">
                        {formatDuration(asset.metadata?.durationSeconds)} · {formatBytes(asset.sizeBytes)}
                      </p>
                    </div>
                  </label>
                );
              })
            ) : (
              <div className="rounded-[1.5rem] bg-white/72 p-5 text-sm leading-6 text-muted">
                Upload at least two clips to enable merge.
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
                    aria-label="Toggle merge documentation"
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-[#e8b39a] bg-white text-sm font-semibold text-[#8f3b13] transition hover:bg-[#fff8f4]"
                  >
                    i
                  </button>
                </div>

                {isMergeHelpOpen ? (
                  <div className="mt-3 text-sm leading-6">
                    <p>
                      Merge needs clips with the same format first. Normalize the selected files so they share the same resolution, codecs, frame rate, and audio settings.
                    </p>
                    {mergeCompatibilityIssues.map((issue) => (
                      <p key={issue} className="mt-2">
                        {issue}
                      </p>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className="rounded-[1.5rem] bg-white/78 p-4">
              <p className="text-sm font-semibold text-foreground">Normalize for merge</p>
              <p className="mt-2 text-sm leading-6 text-muted">
                {selectedNormalizePreset?.description ??
                  "Choose how the selected clips should be aligned before merge."}
              </p>

              <label className="mt-4 grid gap-2 text-sm font-medium text-foreground">
                Target preset
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
                    {normalizeTarget ? `${normalizeTarget.width}x${normalizeTarget.height}` : "Unavailable"}
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
        </div>
      </section>

      <section className="glass-panel rounded-[2rem] p-6 sm:p-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-display text-sm font-semibold uppercase tracking-[0.24em] text-muted">
              Processing history
            </p>
            <h2 className="mt-3 text-2xl font-semibold">Track progress and download finished results</h2>
          </div>
          <div className="rounded-full bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted">
            Step 3
          </div>
        </div>

        <div className="mt-6 grid gap-4">
          {jobs.length > 0 ? (
            jobs.map((job) => (
              <article key={job.id} className="rounded-[1.5rem] bg-white/78 p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold">
                      {getJobTypeLabel(job.type)}
                    </p>
                    <p className="mt-1 text-sm text-muted">
                      {job.id} · {new Date(job.createdAt).toLocaleString()}
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
                    <p className="text-xs uppercase tracking-[0.16em] text-muted">Updated</p>
                    <p className="mt-2 text-sm font-semibold">
                      {new Date(job.updatedAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  {job.downloadUrl ? (
                    <a
                      href={toApiUrl(job.downloadUrl)}
                      className="rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-white"
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
              No jobs queued yet. Upload files and run trim or merge to populate this list.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
