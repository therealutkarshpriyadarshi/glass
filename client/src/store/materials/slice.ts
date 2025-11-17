import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/api/server";
import {
  Material,
  CreateMaterialDTO,
  MaterialsResponse,
  MaterialResponse,
} from "./type";

interface MaterialState {
  materials: Material[];
  currentMaterial: Material | null;
  loading: boolean;
  uploadProgress: number;
  error: string | null;
}

const initialState: MaterialState = {
  materials: [],
  currentMaterial: null,
  loading: false,
  uploadProgress: 0,
  error: null,
};

// Fetch materials for a specific course
export const fetchMaterialsByCourse = createAsyncThunk(
  "materials/fetchByCourse",
  async (courseId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<MaterialsResponse>(
        `/materials/course/${courseId}`
      );
      return response.data.materials || [];
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch materials"
      );
    }
  }
);

// Create a new material
export const createMaterial = createAsyncThunk(
  "materials/create",
  async (materialData: CreateMaterialDTO, { rejectWithValue, dispatch }) => {
    try {
      const formData = new FormData();
      formData.append("title", materialData.title);
      formData.append("description", materialData.description);
      formData.append("courseId", materialData.courseId);

      // Add files to formData
      materialData.files.forEach((file) => {
        formData.append("files", file);
        formData.append("files", file.name); // Backend expects both file and filename
      });

      const response = await axiosInstance.post<MaterialResponse>(
        "/materials",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              dispatch(setUploadProgress(percentCompleted));
            }
          },
        }
      );

      // Reset upload progress
      dispatch(setUploadProgress(0));
      return response.data.material;
    } catch (error: any) {
      dispatch(setUploadProgress(0));
      return rejectWithValue(
        error.response?.data?.error || "Failed to create material"
      );
    }
  }
);

// Delete a material
export const deleteMaterial = createAsyncThunk(
  "materials/delete",
  async (materialId: number, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/materials/${materialId}`);
      return materialId;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to delete material"
      );
    }
  }
);

// Get a specific material
export const fetchMaterial = createAsyncThunk(
  "materials/fetchOne",
  async (materialId: number, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<Material>(
        `/materials/${materialId}`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch material"
      );
    }
  }
);

const materialSlice = createSlice({
  name: "materials",
  initialState,
  reducers: {
    setUploadProgress: (state, action) => {
      state.uploadProgress = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearMaterials: (state) => {
      state.materials = [];
    },
  },
  extraReducers: (builder) => {
    // Fetch materials by course
    builder.addCase(fetchMaterialsByCourse.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchMaterialsByCourse.fulfilled, (state, action) => {
      state.loading = false;
      state.materials = action.payload;
    });
    builder.addCase(fetchMaterialsByCourse.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Create material
    builder.addCase(createMaterial.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createMaterial.fulfilled, (state, action) => {
      state.loading = false;
      state.materials.push(action.payload);
    });
    builder.addCase(createMaterial.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Delete material
    builder.addCase(deleteMaterial.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteMaterial.fulfilled, (state, action) => {
      state.loading = false;
      state.materials = state.materials.filter(
        (material) => material.ID !== action.payload
      );
    });
    builder.addCase(deleteMaterial.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch single material
    builder.addCase(fetchMaterial.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchMaterial.fulfilled, (state, action) => {
      state.loading = false;
      state.currentMaterial = action.payload;
    });
    builder.addCase(fetchMaterial.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { setUploadProgress, clearError, clearMaterials } =
  materialSlice.actions;
export default materialSlice.reducer;
