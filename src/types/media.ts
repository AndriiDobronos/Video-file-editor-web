export type MediaMetadata = {
  formatName: string | null;
  durationSeconds: number | null;
  sizeBytes: number | null;
  bitRate: number | null;
  width: number | null;
  height: number | null;
  videoCodec: string | null;
  audioCodec: string | null;
  frameRate: string | null;
  audioSampleRate: number | null;
  audioChannels: number | null;
};

export type MediaAsset = {
  id: string;
  kind: "upload" | "output";
  storageDriver?: "local" | "r2";
  originalName: string;
  mimeType: string;
  thumbnailMimeType?: string | null;
  sizeBytes: number;
  createdAt: string;
  downloadUrl: string;
  thumbnailUrl?: string | null;
  metadata: MediaMetadata | null;
};

export type NormalizeTargetPreset =
  | "hd-720p"
  | "match-largest"
  | "match-smallest"
  | "match-average";

export type NormalizeTargetProfile = {
  preset: NormalizeTargetPreset;
  width: number;
  height: number;
  frameRate: number;
  audioSampleRate: number;
  audioChannels: number;
  videoCodec: "h264";
  audioCodec: "aac";
};

export type ConvertImageFormat = "png" | "jpeg" | "webp";
export type ConvertImageFit = "contain" | "cover" | "stretch";

export type ConvertImageTarget = {
  format: ConvertImageFormat;
  quality?: number;
  width?: number;
  height?: number;
  fit?: ConvertImageFit;
  background?: string;
};

export type ProcessingJob = {
  id: string;
  type: "trim" | "merge" | "normalize" | "convert-image";
  status: "queued" | "processing" | "completed" | "failed";
  sourceAssetIds: string[];
  outputAssetId: string | null;
  downloadUrl: string | null;
  error: string | null;
  createdAt: string;
  updatedAt: string;
  progress?: string | boolean | number | object | null;
  options: {
    assetId?: string;
    startTime?: number;
    endTime?: number;
    sourceAssetIds?: string[];
    target?: NormalizeTargetProfile | ConvertImageTarget;
  };
};

export type HealthResponse = {
  status: string;
  service: string;
  redis?: string;
  storageDriver?: "local" | "r2";
  objectStorage?: "ok" | "error" | "skipped";
  objectStorageBucket?: string | null;
  objectStorageMessage?: string | null;
  workerMode?: "embedded" | "external";
  timestamp: string;
};
