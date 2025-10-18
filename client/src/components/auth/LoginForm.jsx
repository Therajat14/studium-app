import React, { useState } from "react";
import {
  BookOpen,
  Mail,
  Lock,
  User,
  School,
  Calendar,
  Hash,
  Github,
  Linkedin,
  Globe,
} from "lucide-react";

export const AuthPage = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    rollNumber: "",
    password: "",
    college: "",
    branch: "",
    year: "",
    skills: "",
    bio: "",
    github: "",
    linkedin: "",
    portfolio: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isSignUp && currentStep < 3) {
      setCurrentStep(currentStep + 1);
      return;
    }

    if (isSignUp) {
      console.log("Sign Up data:", formData);
      alert("✅ Account created!");
    } else {
      console.log("Login data:", {
        email: formData.email,
        password: formData.password,
      });
      alert("✅ Logged in!");
    }
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // ==========================
  // FORM STEPS FOR SIGNUP
  // ==========================
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            {/* Full Name */}
            <FormField
              label="Full Name"
              icon={<User />}
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
            />

            {/* College Email */}
            <FormField
              label="College Email"
              icon={<Mail />}
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your.email@college.edu"
              required
            />

            {/* Roll Number */}
            <FormField
              label="Roll Number"
              icon={<Hash />}
              type="text"
              name="rollNumber"
              value={formData.rollNumber}
              onChange={handleChange}
              placeholder="2021CS001"
              required
            />

            {/* Password */}
            <FormField
              label="Password"
              icon={<Lock />}
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a strong password"
              required
            />
          </>
        );

      case 2:
        return (
          <>
            {/* College */}
            <FormField
              label="College/University"
              icon={<School />}
              type="text"
              name="college"
              value={formData.college}
              onChange={handleChange}
              placeholder="Stanford University"
              required
            />

            {/* Branch */}
            <FormField
              label="Branch"
              icon={<BookOpen />}
              type="text"
              name="branch"
              value={formData.branch}
              onChange={handleChange}
              placeholder="Computer Science"
              required
            />

            {/* Year */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Year of Study
              </label>
              <div className="relative">
                <Calendar className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                <select
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-700 bg-gray-900 py-3 pr-4 pl-10 text-white focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="">Select year</option>
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                  <option value="graduate">Graduate</option>
                </select>
              </div>
            </div>

            {/* Skills */}
            <FormField
              label="Skills"
              type="text"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              placeholder="Python, React, Machine Learning"
            />
          </>
        );

      case 3:
        return (
          <>
            {/* Bio */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={3}
                className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500"
                placeholder="Tell us about yourself..."
              />
            </div>

            {/* GitHub */}
            <FormField
              label="GitHub"
              icon={<Github />}
              type="url"
              name="github"
              value={formData.github}
              onChange={handleChange}
              placeholder="https://github.com/username"
            />

            {/* LinkedIn */}
            <FormField
              label="LinkedIn"
              icon={<Linkedin />}
              type="url"
              name="linkedin"
              value={formData.linkedin}
              onChange={handleChange}
              placeholder="https://linkedin.com/in/username"
            />

            {/* Portfolio */}
            <FormField
              label="Portfolio"
              icon={<Globe />}
              type="url"
              name="portfolio"
              value={formData.portfolio}
              onChange={handleChange}
              placeholder="https://portfolio.com"
            />
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 p-6">
      <div className="grid w-full max-w-5xl items-center gap-8 lg:grid-cols-2">
        {/* Left Hero */}
        <div className="hidden lg:block">
          <div className="mb-6 flex items-center">
            <div className="rounded-xl bg-indigo-600 p-3">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <h1 className="ml-3 text-3xl font-bold text-indigo-500">Studium</h1>
          </div>
          <h2 className="mb-4 text-4xl font-bold text-white">
            {isSignUp ? "Join Your College Community" : "Welcome Back"}
          </h2>
          <p className="mb-8 text-lg text-gray-400">
            {isSignUp
              ? "Create your account and start exploring."
              : "Sign in with your college account to continue."}
          </p>
        </div>

        {/* Right Auth Form */}
        <div className="mx-auto w-full max-w-md rounded-2xl border border-gray-700 bg-gray-800 p-6 lg:p-8">
          <div className="mb-6 text-center">
            <h3 className="text-xl font-bold text-white">
              {isSignUp ? "Create an Account" : "Sign in to your account"}
            </h3>
            <p className="mt-2 text-sm text-gray-400">
              {isSignUp
                ? `Step ${currentStep} of 3`
                : "Enter your credentials below"}
            </p>
          </div>

          {isSignUp && <ProgressBar currentStep={currentStep} totalSteps={3} />}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp ? (
              renderStep()
            ) : (
              <>
                <FormField
                  label="Email or Roll Number"
                  icon={<Mail />}
                  type="text"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your.email@college.edu or 2021CS001"
                  required
                />
                <FormField
                  label="Password"
                  icon={<Lock />}
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                />
              </>
            )}

            {/* Actions */}
            <div className="flex space-x-3">
              {isSignUp && currentStep > 1 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="flex-1 rounded-lg bg-gray-700 py-3 text-gray-300 hover:bg-gray-600"
                >
                  Back
                </button>
              )}
              <button
                type="submit"
                className="flex-1 rounded-lg bg-indigo-600 py-3 text-white hover:bg-indigo-500"
              >
                {isSignUp
                  ? currentStep < 3
                    ? "Continue"
                    : "Create Account"
                  : "Sign In"}
              </button>
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-gray-400">
            {isSignUp ? "Already have an account?" : "Don’t have an account?"}
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setCurrentStep(1);
              }}
              className="ml-1 font-medium text-indigo-400 hover:text-indigo-300"
            >
              {isSignUp ? "Sign In" : "Sign Up"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

// 🔹 Helper Components
const FormField = ({ label, icon, ...props }) => (
  <div>
    <label className="mb-2 block text-sm font-medium text-gray-300">
      {label}
    </label>
    <div className="relative">
      {icon && (
        <span className="absolute top-1/2 left-3 -translate-y-1/2 transform text-gray-400">
          {icon}
        </span>
      )}
      <input
        {...props}
        className="w-full rounded-lg border border-gray-700 bg-gray-900 py-3 pr-4 pl-10 text-white focus:ring-2 focus:ring-indigo-500"
      />
    </div>
  </div>
);

const ProgressBar = ({ currentStep, totalSteps }) => (
  <div className="mb-6">
    <div className="mb-2 flex justify-between">
      {[...Array(totalSteps)].map((_, idx) => (
        <div
          key={idx}
          className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
            idx + 1 <= currentStep
              ? "bg-indigo-600 text-white"
              : "bg-gray-700 text-gray-400"
          }`}
        >
          {idx + 1}
        </div>
      ))}
    </div>
    <div className="h-2 w-full rounded-full bg-gray-700">
      <div
        className="h-2 rounded-full bg-indigo-600"
        style={{ width: `${(currentStep / totalSteps) * 100}%` }}
      />
    </div>
  </div>
);
