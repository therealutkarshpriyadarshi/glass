import React from "react";
import { BookOpen, Users, TrendingUp, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: BookOpen,
    text: "Interactive online classrooms",
    description: "Engage with live sessions and recorded lectures"
  },
  {
    icon: Users,
    text: "Comprehensive course management",
    description: "Organize and track all your courses in one place"
  },
  {
    icon: TrendingUp,
    text: "Real-time progress tracking",
    description: "Monitor your learning journey with detailed analytics"
  },
  {
    icon: MessageSquare,
    text: "Collaborative learning tools",
    description: "Connect with peers and instructors effortlessly"
  },
];

const FeatureList: React.FC = () => (
  <div className="space-y-6">
    {features.map((feature, index) => {
      const Icon = feature.icon;
      return (
        <motion.div
          key={feature.text}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
          className="flex gap-4"
        >
          <div className="flex-shrink-0">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon className="h-5 w-5 text-primary" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground mb-1">{feature.text}</h3>
            <p className="text-sm text-muted-foreground">{feature.description}</p>
          </div>
        </motion.div>
      );
    })}
  </div>
);

export default FeatureList;
