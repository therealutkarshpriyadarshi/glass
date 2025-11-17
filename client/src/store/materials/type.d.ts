export interface MaterialFile {
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt: string | null;
  fileName: string;
  fileUrl: string;
  extension: string;
  userFileName: string;
  materialId: number;
}

export interface Material {
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt: string | null;
  title: string;
  description: string;
  courseId: number;
  files: MaterialFile[];
}

export interface CreateMaterialDTO {
  courseId: string;
  title: string;
  description: string;
  files: File[];
}

export interface MaterialsResponse {
  materials: Material[];
}

export interface MaterialResponse {
  material: Material;
}
