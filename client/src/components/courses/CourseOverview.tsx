import React from "react";
import {
  LayoutGrid,
  FileText,
  Users,
  MessageSquare,
  Calendar as CalendarIcon,
  Download,
} from "lucide-react";
import Announcement from "./announcement/Announcement";
import CoursePeople from "./people/CoursePeople";
import FilesView from "./files/FilesView";
import AddDropDown from "./AddDropDown";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const CourseOverview: React.FC = () => {
  const onTabChange = (value: string) => {
    console.log(value);
  };

  return (
    <div className="h-[90vh] overflow-auto relative">
      <div className="p-4 overflow-auto">
        <Tabs defaultValue="1" onValueChange={onTabChange}>
          <div className="sticky top-0 z-10 bg-background pt-2 pb-4">
            <div className="flex items-center justify-between mb-2">
              <TabsList className="w-auto">
                <TabsTrigger value="1" className="gap-2">
                  <LayoutGrid className="h-4 w-4" />
                  Announcements
                </TabsTrigger>
                <TabsTrigger value="2" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Files
                </TabsTrigger>
                <TabsTrigger value="3" className="gap-2">
                  <Users className="h-4 w-4" />
                  People
                </TabsTrigger>
                <TabsTrigger value="4" className="gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Chat
                </TabsTrigger>
                <TabsTrigger value="5" className="gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  Calendar
                </TabsTrigger>
                <TabsTrigger value="6" className="gap-2">
                  <Download className="h-4 w-4" />
                  Submissions
                </TabsTrigger>
              </TabsList>
              <AddDropDown />
            </div>
          </div>

          <TabsContent value="1">
            <Announcement />
          </TabsContent>
          <TabsContent value="2">
            <FilesView />
          </TabsContent>
          <TabsContent value="3">
            <CoursePeople />
          </TabsContent>
          <TabsContent value="4">
            {/* Chat content */}
          </TabsContent>
          <TabsContent value="5">
            {/* Calendar content */}
          </TabsContent>
          <TabsContent value="6">
            {/* Submissions content */}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CourseOverview;
