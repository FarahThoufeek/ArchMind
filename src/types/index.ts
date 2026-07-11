export type ImagePriority = "love" | "like" | "mood";

export interface ReferenceImage {
  id: string;
  dataUrl: string;
  fileName: string;
  priority: ImagePriority;
}

export interface DesignDNA {
  style: string;
  mood: string;
  palette: string[]; // hex values
  materials: string[];
  lighting: string;
  spatialNotes: string;
}

export type RenderType =
  | "exterior-a"
  | "exterior-b"
  | "exterior-c"
  | "living"
  | "kitchen"
  | "bedroom"
  | "floor-plan";

export interface Render {
  type: RenderType;
  label: string;
  imageUrl: string | null;
  loading: boolean;
}

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
}

export interface ProjectMeta {
  name: string;
  propertyType: "villa" | "apartment" | "commercial";
  budgetTier: "standard" | "premium" | "luxury";
}

export type ProjectPhase =
  | "setup"
  | "upload"
  | "analyzing"
  | "generating"
  | "refining";
