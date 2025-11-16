import React from "react";

const features = [
  { icon: "✅", text: "Interactive online classrooms" },
  { icon: "📚", text: "Comprehensive course management" },
  { icon: "📊", text: "Real-time progress tracking" },
  { icon: "🤝", text: "Collaborative learning tools" },
];

const FeatureList: React.FC = () => (
  <ul className="list-none p-0 m-0">
    {features.map((feature, index) => (
      <li
        key={feature.text}
        className="mb-4 flex items-center animate-in slide-in-from-left duration-500"
        style={{ animationDelay: `${index * 100}ms` }}
      >
        <span className="mr-3 text-xl">{feature.icon}</span>
        <span className="text-foreground">{feature.text}</span>
      </li>
    ))}
  </ul>
);

export default FeatureList;
