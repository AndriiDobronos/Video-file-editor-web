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
export type VideoCompressionMode = "simple" | "advanced";
export type VideoCompressionPreset = "high-quality" | "balanced" | "small-file";
export type VideoCompressionEncoderPreset =
  | "ultrafast"
  | "superfast"
  | "veryfast"
  | "faster"
  | "fast"
  | "medium"
  | "slow";
export type CropPadMode = "crop" | "pad";
export type CropPadAnchorX = "left" | "center" | "right";
export type CropPadAnchorY = "top" | "center" | "bottom";

export type VideoCompressionTarget = {
  mode: VideoCompressionMode;
  preset?: VideoCompressionPreset;
  crf?: number;
  videoBitrateKbps?: number;
  audioBitrateKbps?: number;
  encoderPreset?: VideoCompressionEncoderPreset;
};

export type ConvertImageTarget = {
  format: ConvertImageFormat;
  quality?: number;
  width?: number;
  height?: number;
  fit?: ConvertImageFit;
  background?: string;
};

export type ExtractFrameTarget = {
  timeSeconds: number;
  format: ConvertImageFormat;
  quality?: number;
  width?: number;
  height?: number;
  fit?: ConvertImageFit;
  background?: string;
};

export type CropPadTarget = {
  mode: CropPadMode;
  width: number;
  height: number;
  anchorX?: CropPadAnchorX;
  anchorY?: CropPadAnchorY;
  background?: string;
};

export type ProcessingJob = {
  id: string;
  type:
    | "trim"
    | "merge"
    | "normalize"
    | "compress-video"
    | "extract-frame"
    | "crop-pad"
    | "convert-image";
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
    target?:
      | NormalizeTargetProfile
      | VideoCompressionTarget
      | ExtractFrameTarget
      | CropPadTarget
      | ConvertImageTarget;
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
