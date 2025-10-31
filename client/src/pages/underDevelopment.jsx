import React from "react";
import { Construction, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router"; // ✅ correct import

const UnderDevelopment = () => {
  const navigate = useNavigate(); // ✅ call the hook

  return (
    <div className="bg-background flex min-h-screen w-full flex-col items-center justify-center px-6 text-center">
      {/* Icon */}
      <Construction className="text-primary mb-6 h-16 w-16 animate-pulse" />

      {/* Heading */}
      <h1 className="mb-2 text-3xl font-semibold tracking-tight sm:text-4xl">
        Under Development
      </h1>

      {/* Subtext */}
      <p className="text-muted-foreground mb-8 max-w-md text-sm sm:text-base">
        We’re currently building this feature. Please check back soon!
      </p>

      {/* Button */}
      <Button
        className="flex items-center gap-2 px-6 py-5 text-base font-medium"
        onClick={() => navigate("/")}
      >
        <Clock className="h-5 w-5" />
        Go Home
      </Button>

      {/* Footer */}
      <p className="text-muted-foreground mt-10 text-xs">
        © {new Date().getFullYear()} Studium. All rights reserved.
      </p>
    </div>
  );
};

export default UnderDevelopment;
