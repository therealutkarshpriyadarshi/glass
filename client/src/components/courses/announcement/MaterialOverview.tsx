import React, { useState } from "react";
import {
  FileText,
  Download,
  Trash2,
  File,
  FileImage,
  FileSpreadsheet,
  Archive,
} from "lucide-react";
import type { Material } from "../../../store/materials/type";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { deleteMaterial } from "../../../store/materials/slice";
import { toast } from "sonner";
import { format } from "date-fns";

interface MaterialOverviewProps {
  materials: Material[];
}

const getFileIcon = (extension: string) => {
  const ext = extension.toLowerCase();
  if (["png", "jpg", "jpeg", "gif"].includes(ext)) {
    return <FileImage className="h-4 w-4" />;
  } else if (["xlsx", "xls", "csv"].includes(ext)) {
    return <FileSpreadsheet className="h-4 w-4" />;
  } else if (["zip", "rar"].includes(ext)) {
    return <Archive className="h-4 w-4" />;
  } else if (["pdf", "doc", "docx", "txt"].includes(ext)) {
    return <FileText className="h-4 w-4" />;
  }
  return <File className="h-4 w-4" />;
};

const MaterialOverview: React.FC<MaterialOverviewProps> = ({ materials }) => {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.materials);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [materialToDelete, setMaterialToDelete] = useState<Material | null>(
    null
  );

  const handleDeleteClick = (material: Material) => {
    setMaterialToDelete(material);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (materialToDelete) {
      try {
        await dispatch(deleteMaterial(materialToDelete.ID)).unwrap();
        toast.success("Material deleted successfully");
        setDeleteDialogOpen(false);
        setMaterialToDelete(null);
      } catch (error: any) {
        toast.error(error || "Failed to delete material");
      }
    }
  };

  return (
    <>
      <div className="space-y-0">
        {materials.map((material) => (
          <div
            key={material.ID}
            className="p-4 border-b border-border transition-colors hover:bg-accent/50"
          >
            <div className="flex items-start gap-4">
              <Avatar className="h-10 w-10 flex items-center justify-center bg-accent">
                <FileText className="h-5 w-5 text-accent-foreground" />
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-lg font-semibold text-foreground">
                    {material.title}
                  </h4>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDeleteClick(material)}
                    disabled={loading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {format(new Date(material.CreatedAt), "PPP 'at' p")}
                </p>
                <div className="space-y-2">
                  <p className="text-sm text-foreground">
                    {material.description}
                  </p>
                  {material.files && material.files.length > 0 && (
                    <ul className="list-none p-0 m-0 mt-2 space-y-1">
                      {material.files.map((file) => (
                        <li
                          key={file.ID}
                          className="text-sm flex items-center gap-2"
                        >
                          {getFileIcon(file.extension)}
                          <a
                            href={file.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex-1"
                          >
                            {file.userFileName}
                          </a>
                          <a
                            href={file.fileUrl}
                            download={file.userFileName}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <Download className="h-4 w-4" />
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Material</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{materialToDelete?.title}"? This
              action cannot be undone and will delete all associated files.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default MaterialOverview;
