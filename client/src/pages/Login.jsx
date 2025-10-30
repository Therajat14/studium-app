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
import { Input } from "@/import React, { useState } from "react";
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

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const { login, signup } = useAuth();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    college: "",
    branch: "",
    year: "",
    skills: "",
    interests: "",
    github: "",
    linkedin: "",
    portfolio: "",
    bio: "",
  });

  const handleInputChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignUp) await signup(formData);
      else await login(formData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-muted/10 flex min-h-screen items-center justify-center p-4">
      <Card className="border-border w-full max-w-md border shadow-xl">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">
            {isSignUp ? "Create an Account" : "Welcome Back"}
          </CardTitle>
          <CardDescription className="text-center">
            {isSignUp
              ? "Fill in your details to join us!"
              : "Sign in to access your account"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <>
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="college">College</Label>
                  <Input
                    id="college"
                    name="college"
                    placeholder="ABC University"
                    value={formData.college}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="branch">Branch</Label>
                    <Input
                      id="branch"
                      name="branch"
                      placeholder="CSE"
                      value={formData.branch}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <Label htmlFor="year">Year</Label>
                    <Input
                      id="year"
                      name="year"
                      placeholder="3rd"
                      value={formData.year}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <Separator className="my-3" />
              </>
            )}

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                name="password"
                placeholder="********"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </div>

            {isSignUp && (
              <>
                <div>
                  <Label htmlFor="github">GitHub</Label>
                  <Input
                    id="github"
                    name="github"
                    placeholder="https://github.com/username"
                    value={formData.github}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    name="linkedin"
                    placeholder="https://linkedin.com/in/username"
                    value={formData.linkedin}
                    onChange={handleInputChange}
                  />
                </div>
              </>
            )}

            <Button type="submit" className="mt-4 w-full" disabled={loading}>
              {loading ? "Please wait..." : isSignUp ? "Sign Up" : "Login"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="text-muted-foreground flex justify-center text-sm">
          {isSignUp ? "Already have an account?" : "Don’t have an account?"}
          <Button
            variant="link"
            className="ml-1 p-0"
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {isSignUp ? "Login" : "Sign Up"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const { login, signup } = useAuth();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    college: "",
    branch: "",
    year: "",
    skills: "",
    interests: "",
    github: "",
    linkedin: "",
    portfolio: "",
    bio: "",
  });

  const handleInputChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignUp) await signup(formData);
      else await login(formData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-muted/10 flex min-h-screen items-center justify-center p-4">
      <Card className="border-border w-full max-w-md border shadow-xl">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">
            {isSignUp ? "Create an Account" : "Welcome Back"}
          </CardTitle>
          <CardDescription className="text-center">
            {isSignUp
              ? "Fill in your details to join us!"
              : "Sign in to access your account"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <>
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="college">College</Label>
                  <Input
                    id="college"
                    name="college"
                    placeholder="ABC University"
                    value={formData.college}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="branch">Branch</Label>
                    <Input
                      id="branch"
                      name="branch"
                      placeholder="CSE"
                      value={formData.branch}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <Label htmlFor="year">Year</Label>
                    <Input
                      id="year"
                      name="year"
                      placeholder="3rd"
                      value={formData.year}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <Separator className="my-3" />
              </>
            )}

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                name="password"
                placeholder="********"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </div>

            {isSignUp && (
              <>
                <div>
                  <Label htmlFor="github">GitHub</Label>
                  <Input
                    id="github"
                    name="github"
                    placeholder="https://github.com/username"
                    value={formData.github}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    name="linkedin"
                    placeholder="https://linkedin.com/in/username"
                    value={formData.linkedin}
                    onChange={handleInputChange}
                  />
                </div>
              </>
            )}

            <Button type="submit" className="mt-4 w-full" disabled={loading}>
              {loading ? "Please wait..." : isSignUp ? "Sign Up" : "Login"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="text-muted-foreground flex justify-center text-sm">
          {isSignUp ? "Already have an account?" : "Don’t have an account?"}
          <Button
            variant="link"
            className="ml-1 p-0"
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {isSignUp ? "Login" : "Sign Up"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
