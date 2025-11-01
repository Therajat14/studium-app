import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
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
import { BookOpen, Mail, Lock, User, Hash, Check } from "lucide-react";
import { useNavigate } from "react-router";

// ------------------- AUTH FORM -------------------

const AuthForm = ({ onToggle }) => {
  const [isSignUp, setIsSignUp] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { login, signup } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    rollNumber: "",
  });

  const navigate = useNavigate();

  const handleInputChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Multi-step mock
    if (isSignUp && currentStep < 3) {
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setLoading(false);
      }, 400);
      return;
    }

    try {
      if (isSignUp) await signup(formData);
      else await login(formData);
      navigate("/feed");
    } catch (error) {
      console.error("Auth Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Input field with icon
  const InputWithIcon = ({ Icon, label, ...props }) => (
    <div className="space-y-2">
      <Label htmlFor={props.id}>{label}</Label>
      <div className="relative">
        <Icon className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input className="pl-9" {...props} />
      </div>
    </div>
  );

  // 🔹 Progress bar for sign up
  const ProgressBar = () => (
    <div className="mb-4">
      <p className="text-muted-foreground mb-2 text-sm font-medium">
        Step {currentStep} of 3
      </p>
      <div className="flex items-center justify-between">
        {[1, 2, 3].map((step) => (
          <React.Fragment key={step}>
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                step <= currentStep
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {step < currentStep ? <Check className="h-3.5 w-3.5" /> : step}
            </div>
            {step < 3 && (
              <div
                className={`h-1 flex-1 transition-colors ${
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
    <Card className="border-border bg-card w-full border shadow-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          {isSignUp ? "Join Your College Community" : "Welcome Back"}
        </CardTitle>
        <CardDescription>
          {isSignUp ? (
            <>
              Complete your profile to get started.
              <ProgressBar />
            </>
          ) : (
            "Sign in to your account to continue."
          )}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <>
              <InputWithIcon
                Icon={User}
                label="Full Name"
                id="name"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleInputChange}
                disabled={currentStep > 1}
                required
              />

              <InputWithIcon
                Icon={Hash}
                label="Roll Number / Student ID"
                id="rollNumber"
                name="rollNumber"
                placeholder="2021CS001"
                value={formData.rollNumber}
                onChange={handleInputChange}
                disabled={currentStep > 1}
                required
              />
            </>
          )}

          <InputWithIcon
            Icon={Mail}
            label="College Email"
            id="email"
            name="email"
            type="email"
            placeholder="your.name@college.edu"
            value={formData.email}
            onChange={handleInputChange}
            disabled={currentStep > 1 && isSignUp}
            required
          />

          <InputWithIcon
            Icon={Lock}
            label="Password"
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleInputChange}
            required
          />

          <Button type="submit" className="mt-4 w-full" disabled={loading}>
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

      <Separator className="my-4" />

      <CardFooter className="text-muted-foreground flex justify-center text-sm">
        {isSignUp ? "Already have an account?" : "Don’t have an account?"}
        <Button
          variant="link"
          className="text-primary ml-1 p-0"
          onClick={() => {
            setIsSignUp(!isSignUp);
            setCurrentStep(1);
            onToggle?.();
          }}
        >
          {isSignUp ? "Sign In" : "Sign Up"}
        </Button>
      </CardFooter>
    </Card>
  );
};

// ------------------- PAGE LAYOUT -------------------

const LoginLayout = () => {
  return (
    <div className="bg-background flex min-h-screen items-center justify-center px-4 lg:px-8">
      <div className="border-border bg-card w-full max-w-5xl overflow-hidden rounded-xl border shadow-lg lg:grid lg:grid-cols-2">
        {/* Left Section */}
        <div className="bg-primary text-primary-foreground hidden flex-col justify-center space-y-6 p-10 lg:flex">
          <div className="flex items-center space-x-3">
            <BookOpen className="h-7 w-7" />
            <h1 className="text-3xl font-bold">Studium</h1>
          </div>

          <h2 className="text-4xl leading-tight font-bold">
            Your College Community Platform
          </h2>

          <p className="text-base opacity-90">
            A hybrid of Notion, Reddit, and LinkedIn — designed for college
            students to connect, learn, and grow together.
          </p>

          <Separator className="bg-primary-foreground/40 my-4" />

          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" /> Collaborative learning spaces
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4" /> Smart community discussions
            </li>
            <li className="flex items-center gap-2">
              <User className="h-4 w-4" /> Career networking & mentorship
            </li>
          </ul>
        </div>

        {/* Right Section */}
        <div className="flex items-center justify-center p-8 lg:p-16">
          <AuthForm />
        </div>
      </div>
    </div>
  );
};

export default LoginLayout;
