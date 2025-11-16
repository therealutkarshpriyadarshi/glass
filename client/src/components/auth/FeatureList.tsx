import React from "react";
import { BookOpen, Users, TrendingUp, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: BookOpen,
    text: "Interactive online classrooms",
    description: "Engage with live sessions and recorded lectures",
    gradient: "from-blue-500 to-cyan-500",
    bgGradient: "from-blue-500/10 to-cyan-500/10",
  },
  {
    icon: Users,
    text: "Comprehensive course management",
    description: "Organize and track all your courses in one place",
    gradient: "from-purple-500 to-pink-500",
    bgGradient: "from-purple-500/10 to-pink-500/10",
  },
  {
    icon: TrendingUp,
    text: "Real-time progress tracking",
    description: "Monitor your learning journey with detailed analytics",
    gradient: "from-orange-500 to-yellow-500",
    bgGradient: "from-orange-500/10 to-yellow-500/10",
  },
  {
    icon: MessageSquare,
    text: "Collaborative learning tools",
    description: "Connect with peers and instructors effortlessly",
    gradient: "from-green-500 to-emerald-500",
    bgGradient: "from-green-500/10 to-emerald-500/10",
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
          className="flex gap-4 group cursor-default"
          whileHover={{ x: 10 }}
        >
          <div className="flex-shrink-0">
            <motion.div
              className={`h-12 w-12 rounded-xl bg-gradient-to-br ${feature.bgGradient} flex items-center justify-center border border-white/10 group-hover:border-white/20 transition-all`}
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <div className={`bg-gradient-to-br ${feature.gradient} bg-clip-text`}>
                <Icon className={`h-6 w-6 text-transparent bg-gradient-to-br ${feature.gradient} bg-clip-text`} style={{
                  filter: 'drop-shadow(0 0 8px currentColor)',
                  WebkitTextFillColor: 'transparent',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))`,
                }} />
              </div>
            </motion.div>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground mb-1 group-hover:text-white transition-colors">
              {feature.text}
            </h3>
            <p className="text-sm text-muted-foreground/90 group-hover:text-muted-foreground transition-colors">
              {feature.description}
            </p>
          </div>
        </motion.div>
      );
    })}
  </div>
);

export default FeatureList;
