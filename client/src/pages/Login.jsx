import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
// Import all components from shadcn/ui
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  BookOpen,
  Mail,
  Lock,
  User,
  Hash,
  School,
  Calendar,
  Github,
  Linkedin,
  Check,
} from "lucide-react";

// --- AUTH FORM COMPONENT ---

const AuthForm = ({ onToggle }) => {
  const [isSignUp, setIsSignUp] = useState(true); // Default to SignUp for image match
  const [currentStep, setCurrentStep] = useState(1); // Mock step state
  const { login, signup } = useAuth();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "Alex Johnson",
    email: "alex.johnson@college.edu",
    password: "securepassword",
    rollNumber: "2021CS001", // Added rollNumber to match the image/structure
    college: "",
    branch: "",
    year: "",
    github: "",
    linkedin: "",
  });

  const handleInputChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Mimic the image's "Continue" button action for the first step
    if (isSignUp && currentStep < 3) {
      setCurrentStep(currentStep + 1);
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) await signup(formData);
      else await login(formData);
    } catch (error) {
      console.error("Authentication error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Helper component for styled input with icon
  const InputWithIcon = ({ Icon, ...props }) => (
    <div className="relative">
      <Icon className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
      <Input className="pl-10" {...props} />
    </div>
  );

  // Component to render the progress bar
  const ProgressBar = () => (
    <div className="mb-6">
      <h3 className="text-foreground text-sm font-semibold">
        Step {currentStep} of 3: Basic Information
      </h3>
      <div className="mt-3 flex items-center justify-between">
        {[1, 2, 3].map((step) => (
          <React.Fragment key={step}>
            {/* Step Circle */}
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                step <= currentStep
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {step <= currentStep ? (
                step < currentStep ? (
                  <Check className="h-4 w-4" />
                ) : (
                  step
                )
              ) : (
                step
              )}
            </div>
            {/* Connector Line */}
            {step < 3 && (
              <div
                className={`h-1 flex-1 transition-colors duration-300 ${
                  step < currentStep ? "bg-primary" : "bg-muted"
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  return (
    <Card className="w-full border-none shadow-none">
      <CardHeader className="mb-6 p-0">
        <CardTitle className="text-2xl font-bold">
          {isSignUp ? "Join Your College Community" : "Welcome Back"}
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          {isSignUp ? <ProgressBar /> : "Sign in to your account"}
        </CardDescription>
      </CardHeader>

      <CardContent className="p-0">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Fields for Step 1 (Matching the image) */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <InputWithIcon
                Icon={User}
                id="name"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleInputChange}
                required
                disabled={!isSignUp || currentStep > 1}
              />
            </div>

            <div>
              <Label htmlFor="email">College Email</Label>
              <InputWithIcon
                Icon={Mail}
                id="email"
                type="email"
                name="email"
                placeholder="your.name@college.edu"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={currentStep > 1 && isSignUp}
              />
            </div>

            <div>
              <Label htmlFor="rollNumber">Roll Number / Student ID</Label>
              <InputWithIcon
                Icon={Hash}
                id="rollNumber"
                name="rollNumber"
                placeholder="2021CS001"
                value={formData.rollNumber}
                onChange={handleInputChange}
                required
                disabled={!isSignUp || currentStep > 1}
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <InputWithIcon
                Icon={Lock}
                id="password"
                type="password"
                name="password"
                placeholder="Create a strong password"
                value={formData.password}
                onChange={handleInputChange}
                required
                disabled={currentStep > 1 && isSignUp}
              />
            </div>
          </div>
          {/* Note: In a real app, you would conditionally render the fields for step 2 & 3 here */}

          <Button type="submit" className="mt-6 w-full" disabled={loading}>
            {loading
              ? "Please wait..."
              : isSignUp && currentStep < 3
                ? "Continue"
                : isSignUp
                  ? "Create Account"
                  : "Sign In"}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="text-muted-foreground flex justify-center p-0 pt-6 text-sm">
        {isSignUp ? "Already have an account?" : "Don’t have an account?"}
        <Button
          variant="link"
          className="text-primary hover:text-primary/80 ml-1 p-0"
          onClick={() => {
            setIsSignUp(!isSignUp);
            setCurrentStep(1); // Reset step on switch
            // You might want to call onToggle here if the component is lifted
          }}
        >
          {isSignUp ? "Sign In" : "Sign Up"}
        </Button>
      </CardFooter>
    </Card>
  );
};

// --- WRAPPING CONTAINER COMPONENT ---

const LoginLayout = () => {
  return (
    // The main container. Min-h-screen for full height.
    // bg-background for theme compatibility.
    <div className="bg-background flex min-h-screen items-center justify-center p-4 lg:p-10">
      {/* Outer wrapper to center content and apply grid */}
      <div className="bg-card w-full max-w-6xl overflow-hidden rounded-xl shadow-2xl lg:grid lg:grid-cols-2 lg:shadow-none">
        {/* LEFT COLUMN: Hero/Marketing Section */}
        <div className="bg-primary text-primary-foreground hidden p-12 lg:flex lg:flex-col lg:items-start lg:justify-center">
          {/* Logo/Title */}
          <div className="mb-8 flex items-center">
            <BookOpen className="mr-3 h-8 w-8" />
            <h1 className="text-3xl font-bold">Studium</h1>
          </div>

          {/* Headline */}
          <h2 className="mb-4 text-4xl leading-tight font-bold">
            Your College Community Platform
          </h2>

          {/* Description */}
          <p className="mb-10 text-lg opacity-90">
            The perfect blend of Notion, Reddit, and LinkedIn designed
            specifically for college students. Connect, learn, and grow
            together.
          </p>

          {/* Features */}
          <div className="space-y-4">
            <div className="flex items-center">
              <BookOpen className="mr-3 h-5 w-5" />
              <span>Collaborative knowledge sharing</span>
            </div>
            <div className="flex items-center">
              <Mail className="mr-3 h-5 w-5" />
              <span>Reddit-style community discussions</span>
            </div>
            <div className="flex items-center">
              <User className="mr-3 h-5 w-5" />
              <span>Professional networking & mentorship</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Authentication Form */}
        <div className="p-8 lg:p-16">
          <AuthForm />
        </div>
      </div>
    </div>
  );
};

export default LoginLayout;
