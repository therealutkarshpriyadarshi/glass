import React from "react";
import { FileText, Link as LinkIcon } from "lucide-react";
import type { Material } from "../../../store/materials/type";
import { Avatar } from "@/components/ui/avatar";

interface MaterialOverviewProps {
  materials: Material[];
}

const MaterialOverview: React.FC<MaterialOverviewProps> = ({ materials }) => {
  return (
    <div className="space-y-0">
      {materials.map((material, index) => (
        <div
          key={index}
          className="p-4 border-b border-border transition-colors hover:bg-accent/50 cursor-pointer"
        >
          <div className="flex items-start gap-4">
            <Avatar className="h-10 w-10 flex items-center justify-center bg-green-500">
              <FileText className="h-5 w-5 text-white" />
            </Avatar>
            <div className="flex-1 min-w-0">
              <h4 className="text-lg font-semibold text-foreground mb-2">
                {material.title}
              </h4>
              <div className="space-y-2">
                <p className="text-sm text-foreground">{material.description}</p>
                {(material.fileLinks.length > 0 ||
                  material.links.length > 0) && (
                  <ul className="list-none p-0 m-0 mt-2 space-y-1">
                    {material.fileLinks.map((link, idx) => (
                      <li key={`file-${idx}`} className="text-sm">
                        <FileText className="inline h-4 w-4 mr-2" />
                        <a
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          File {idx + 1}
                        </a>
                      </li>
                    ))}
                    {material.links.map((link, idx) => (
                      <li key={`link-${idx}`} className="text-sm">
                        <LinkIcon className="inline h-4 w-4 mr-2" />
                        <a
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          Link {idx + 1}
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
  );
};

export default MaterialOverview;
