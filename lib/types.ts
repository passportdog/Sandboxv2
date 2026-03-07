export type Database = {
  public: {
    Tables: {
      workflow_imports: { Row: WorkflowImport };
      workflow_templates: { Row: WorkflowTemplate };
      node_packs_registry: { Row: NodePackRegistry };
      node_packs_installed: { Row: NodePackInstalled };
      models_registry: { Row: ModelRegistry };
      model_cache: { Row: ModelCache };
      endpoints: { Row: Endpoint };
      runs: { Row: Run };
      run_events: { Row: RunEvent };
      artifacts: { Row: Artifact };
      pod_instances: { Row: PodInstance };
      snapshots: { Row: Snapshot };
    };
  };
};

export type WorkflowImport = {
  id: string;
  created_at: string;
  source_type: "paste" | "url" | "civitai";
  source_value: string | null;
  workflow_json: Record<string, unknown> | null;
  status: "pending" | "analyzing" | "analyzed" | "resolved" | "deployed" | "failed";
  import_report: ImportReport | null;
  error_message: string | null;
};

export type ImportReport = {
  class_types: Array<{ name: string; builtin: boolean }>;
  models: Array<{ filename: string; found: boolean; url?: string }>;
  node_packs: Array<{ name: string; allowed: boolean; safety_status?: string }>;
  param_schema: Record<string, ParamSchema>;
  estimated_vram_gb: number | null;
};

export type ParamSchema = {
  type: "string" | "number" | "boolean" | "select";
  default?: string | number | boolean;
  options?: string[];
  label?: string;
  description?: string;
};

export type WorkflowTemplate = {
  id: string;
  created_at: string;
  import_id: string;
  name: string;
  version: number;
  workflow_json: Record<string, unknown>;
  param_schema: Record<string, ParamSchema>;
  class_types: string[];
  required_models: string[];
  required_node_packs: string[];
};

export type NodePackRegistry = {
  id: string;
  created_at: string;
  name: string;
  repo_url: string;
  pinned_commit: string;
  safety_status: "approved" | "review" | "blocked";
  install_method: "git_clone" | "comfyui_manager" | "pip";
  class_types: string[];
  requires_restart: boolean;
  notes: string | null;
};

export type NodePackInstalled = {
  id: string;
  pod_id: string;
  pack_id: string;
  installed_commit: string;
  installed_at: string;
};

export type ModelRegistry = {
  id: string;
  created_at: string;
  filename: string;
  target_folder:
    | "checkpoints" | "loras" | "controlnet" | "vae" | "clip"
    | "clip_vision" | "unet" | "upscale_models" | "embeddings"
    | "style_models" | "diffusion_models" | "text_encoders" | "custom";
  format: "safetensors" | "ckpt" | "gguf" | "pt" | "bin";
  size_bytes: number | null;
  sha256: string | null;
  virus_scan: "pending" | "clean" | "flagged";
  pickle_scan: "pending" | "clean" | "flagged";
  civitai_model_id: string | null;
  civitai_url: string | null;
  base_model: string | null;
  download_url: string | null;
};

export type ModelCache = {
  id: string;
  pod_id: string;
  model_id: string;
  cached_at: string;
};

export type Endpoint = {
  id: string;
  created_at: string;
  slug: string;
  name: string;
  version: number;
  category: "t2i" | "i2v" | "video_i2v" | "keyframe" | "extractor" | "assembler";
  status: "draft" | "quarantine" | "approved" | "deprecated";
  worker_pool: string;
  min_vram_gb: number;
  param_schema: Record<string, ParamSchema>;
  default_params: Record<string, unknown>;
  required_models: string[];
  required_node_packs: string[];
  template_id: string | null;
  snapshot_id: string | null;
};

export type Run = {
  id: string;
  created_at: string;
  endpoint_id: string;
  endpoint_slug: string;
  status:
    | "pending" | "submitted" | "executing" | "uploading"
    | "succeeded" | "failed" | "cancelled" | "timed_out";
  caller: "ghosta" | "manual" | "quarantine" | "test" | "api";
  params: Record<string, unknown>;
  provenance: Record<string, unknown> | null;
  worker_id: string | null;
  gpu_type: string | null;
  vram_gb: number | null;
  gpu_seconds: number | null;
  cost_cents: number | null;
  progress: number | null;
  error_message: string | null;
  started_at: string | null;
  completed_at: string | null;
};

export type RunEvent = {
  id: string;
  run_id: string;
  created_at: string;
  event_type:
    | "created" | "worker_assigned" | "submitted" | "executing" | "progress"
    | "output_ready" | "uploading" | "vaulted" | "succeeded" | "failed"
    | "worker_released" | "cancelled" | "timeout" | "approved" | "rejected";
  payload: Record<string, unknown> | null;
  message: string | null;
};

export type Artifact = {
  id: string;
  run_id: string;
  created_at: string;
  filename: string;
  content_type: string;
  size_bytes: number | null;
  url: string;
  thumbnail_url: string | null;
};

export type PodInstance = {
  id: string;
  created_at: string;
  runpod_pod_id: string;
  template_type: "prod" | "quarantine";
  gpu_type: string;
  vram_gb: number;
  pool: "image" | "video" | "tts" | "utility";
  status:
    | "creating" | "booting" | "ready" | "busy" | "idle"
    | "stopping" | "stopped" | "error" | "restoring" | "restarting";
  comfyui_url: string | null;
  current_run_id: string | null;
  total_runs: number;
  total_gpu_seconds: number;
  total_cost_cents: number;
  last_heartbeat: string | null;
  error_message: string | null;
};

export type Snapshot = {
  id: string;
  created_at: string;
  name: string;
  pod_id: string | null;
  comfyui_version: string;
  node_packs: Array<{ name: string; commit: string }>;
  models: string[];
  is_locked: boolean;
  endpoint_id: string | null;
};

// Edge function response types
export type ImportReportResponse = {
  import_id: string;
  report: ImportReport;
};
