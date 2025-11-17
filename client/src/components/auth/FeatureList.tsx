import React from "react";
import { BookOpen, Users, TrendingUp, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: BookOpen,
    text: "Interactive online classrooms",
    description: "Engage with live sessions and recorded lectures",
    color: "primary",
  },
  {
    icon: Users,
    text: "Comprehensive course management",
    description: "Organize and track all your courses in one place",
    color: "secondary",
  },
  {
    icon: TrendingUp,
    text: "Real-time progress tracking",
    description: "Monitor your learning journey with detailed analytics",
    color: "accent",
  },
  {
    icon: MessageSquare,
    text: "Collaborative learning tools",
    description: "Connect with peers and instructors effortlessly",
    color: "success",
  },
];

const FeatureList: React.FC = () => (
  <div className="space-y-5">
    {features.map((feature, index) => {
      const Icon = feature.icon;
      return (
        <motion.div
          key={feature.text}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
          className="flex gap-3"
        >
          <div className="flex-shrink-0">
            <div className={`h-9 w-9 rounded-lg bg-${feature.color}/10 flex items-center justify-center border border-${feature.color}/20`}>
              <Icon className={`h-4 w-4 text-${feature.color}`} />
            </div>
          </div>
          <div className="flex-1 pt-0.5">
            <h3 className="font-medium text-foreground text-sm mb-0.5">
              {feature.text}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {feature.description}
            </p>
          </div>
        </motion.div>
      );
    })}
  </div>
);

export default FeatureList;
