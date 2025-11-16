import React from "react";
import type { Mentor, Student } from "../../../store/people/type";
import { Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface TemplateProps {
  title: string;
  data: Mentor[] | Student[];
}

const Template: React.FC<TemplateProps> = ({ title, data }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>{title}</CardTitle>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-4 p-2 rounded-lg hover:bg-accent/50 transition-colors"
            >
              <Avatar>
                <AvatarImage src={item.profilePictureUrl} alt={item.name} />
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground">{item.name}</p>
                <p className="text-sm text-muted-foreground truncate">
                  {item.email}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default Template;
