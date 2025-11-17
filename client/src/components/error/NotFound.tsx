import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const NotFound: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground text-center px-5">
      <h1
        className="text-[8rem] font-bold relative animate-pulse"
        style={{
          textShadow: '0.05em 0 0 hsl(var(--accent)), -0.05em -0.025em 0 hsl(var(--secondary)), 0.025em 0.05em 0 hsl(var(--warning))'
        }}
      >
        404
      </h1>
      <h2 className="text-3xl my-5">Oops! Page not found</h2>
      <p className="text-base max-w-[600px] mb-8 text-muted-foreground">
        The page you are looking for might have been removed, had its name
        changed, or is temporarily unavailable.
      </p>
      <Button asChild size="lg" className="rounded-full">
        <Link to="/">Go to Homepage</Link>
      </Button>
    </div>
  );
};

export default NotFound;
