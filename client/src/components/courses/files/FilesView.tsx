import React, { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import {
  Download,
  FileText,
  FileImage,
  FileSpreadsheet,
  Archive,
  File,
  Calendar,
  Filter,
} from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import type { MaterialFile } from "@/store/materials/type";

const getFileIcon = (extension: string) => {
  const ext = extension.toLowerCase();
  if (["png", "jpg", "jpeg", "gif"].includes(ext)) {
    return <FileImage className="h-5 w-5" />;
  } else if (["xlsx", "xls", "csv"].includes(ext)) {
    return <FileSpreadsheet className="h-5 w-5" />;
  } else if (["zip", "rar"].includes(ext)) {
    return <Archive className="h-5 w-5" />;
  } else if (["pdf", "doc", "docx", "txt"].includes(ext)) {
    return <FileText className="h-5 w-5" />;
  }
  return <File className="h-5 w-5" />;
};

const getFileTypeLabel = (extension: string): string => {
  const ext = extension.toLowerCase();
  if (["png", "jpg", "jpeg", "gif"].includes(ext)) return "Image";
  if (["xlsx", "xls", "csv"].includes(ext)) return "Spreadsheet";
  if (["zip", "rar"].includes(ext)) return "Archive";
  if (["pdf"].includes(ext)) return "PDF";
  if (["doc", "docx"].includes(ext)) return "Document";
  if (["txt"].includes(ext)) return "Text";
  return "File";
};

interface FileWithMaterial extends MaterialFile {
  materialTitle: string;
  materialId: number;
}

const FilesView: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { materials, loading } = useAppSelector((state) => state.materials);
  const [filterType, setFilterType] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date-desc");

  // Flatten all files from materials with material context
  const allFiles = useMemo(() => {
    const files: FileWithMaterial[] = [];
    materials.forEach((material) => {
      if (material.files && material.files.length > 0) {
        material.files.forEach((file) => {
          files.push({
            ...file,
            materialTitle: material.title,
            materialId: material.ID,
          });
        });
      }
    });
    return files;
  }, [materials]);

  // Get unique file types
  const fileTypes = useMemo(() => {
    const types = new Set<string>();
    allFiles.forEach((file) => {
      types.add(getFileTypeLabel(file.extension));
    });
    return Array.from(types).sort();
  }, [allFiles]);

  // Filter files
  const filteredFiles = useMemo(() => {
    let filtered = [...allFiles];

    // Apply type filter
    if (filterType !== "all") {
      filtered = filtered.filter(
        (file) => getFileTypeLabel(file.extension) === filterType
      );
    }

    // Apply sorting
    switch (sortBy) {
      case "date-desc":
        filtered.sort(
          (a, b) =>
            new Date(b.CreatedAt).getTime() - new Date(a.CreatedAt).getTime()
        );
        break;
      case "date-asc":
        filtered.sort(
          (a, b) =>
            new Date(a.CreatedAt).getTime() - new Date(b.CreatedAt).getTime()
        );
        break;
      case "name-asc":
        filtered.sort((a, b) =>
          a.userFileName.localeCompare(b.userFileName)
        );
        break;
      case "name-desc":
        filtered.sort((a, b) =>
          b.userFileName.localeCompare(a.userFileName)
        );
        break;
    }

    return filtered;
  }, [allFiles, filterType, sortBy]);

  if (loading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Loading files...
      </div>
    );
  }

  if (allFiles.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No files available in this course yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filter:</span>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {fileTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Sort:</span>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date-desc">Newest first</SelectItem>
              <SelectItem value="date-asc">Oldest first</SelectItem>
              <SelectItem value="name-asc">Name (A-Z)</SelectItem>
              <SelectItem value="name-desc">Name (Z-A)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="ml-auto text-sm text-muted-foreground">
          {filteredFiles.length} file{filteredFiles.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Files grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFiles.map((file) => (
          <Card key={file.ID} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-accent">
                {getFileIcon(file.extension)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium truncate" title={file.userFileName}>
                  {file.userFileName}
                </h4>
                <p className="text-sm text-muted-foreground truncate">
                  {file.materialTitle}
                </p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(file.CreatedAt), "MMM d, yyyy")}
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    asChild
                  >
                    <a
                      href={file.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View
                    </a>
                  </Button>
                  <Button size="sm" variant="default" asChild>
                    <a href={file.fileUrl} download={file.userFileName}>
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FilesView;
