import React from "react";

const Login = () => {
  return <div>Login</div>;
};
export default Login;
// import React, { useState } from "react";
// import {
//   BookOpen,
//   Mail,
//   Lock,
//   User,
//   School,
//   Calendar,
//   Hash,
//   Github,
//   Linkedin,
//   Globe,
// } from "lucide-react";

// import { useAuth } from "../hooks/useAuth";

// const LoginPage = ({ onLogin }) => {
//   const [isSignUp, setIsSignUp] = useState(false);
//   const [currentStep, setCurrentStep] = useState(1);
//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     password: "",
//     college: "",
//     branch: "",
//     year: "",
//     skills: "",
//     interests: "",
//     github: "",
//     linkedin: "",
//     portfolio: "",
//     bio: "",
//   });

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (isSignUp && currentStep < 3) {
//       setCurrentStep(currentStep + 1);
//       return;
//     } // Mock authentication
//     const user = {
//       id: 1,
//       name: formData.name,
//       email: formData.email,
//       rollNumber: formData.rollNumber,
//       college: formData.college,
//       branch: formData.branch,
//       year: formData.year,
//       avatar: undefined,
//       karma: 1250,
//       badges: ["Top Contributor", "Notes King"],
//       skills: formData.skills
//         ? formData.skills.split(",").map((s) => s.trim())
//         : ["Python", "React", "Machine Learning"],
//       connections: 45,
//       bio:
//         formData.bio ||
//         "Computer Science student passionate about AI and web development. Always eager to help fellow students!",
//     };
//     onLogin(user);
//   };

//   const handleInputChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     });
//   };

//   const renderStep = () => {
//     switch (currentStep) {
//       case 1:
//         return (
//           <>
//             \
//             <div>
//               <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
//                 Full Name
//               </label>

//               <div className="relative">
//                 <User className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />

//                 <input
//                   type="text"
//                   name="name"
//                   value={formData.name}
//                   onChange={handleInputChange}
//                   className="focus:ring-primary-500 w-full rounded-lg border border-gray-300 bg-white py-3 pr-4 pl-10 text-gray-900 transition duration-200 focus:border-transparent focus:ring-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
//                   placeholder="Enter your full name"
//                   required
//                 />
//               </div>
//             </div>
//             <div>
//               <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
//                 College Email
//               </label>

//               <div className="relative">
//                 <Mail className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />

//                 <input
//                   type="email"
//                   name="email"
//                   value={formData.email}
//                   onChange={handleInputChange}
//                   className="focus:ring-primary-500 w-full rounded-lg border border-gray-300 bg-white py-3 pr-4 pl-10 text-gray-900 transition duration-200 focus:border-transparent focus:ring-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
//                   placeholder="your.name@college.edu"
//                   required
//                 />
//               </div>
//             </div>
//             <div>
//               <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
//                 Roll Number / Student ID
//               </label>

//               <div className="relative">
//                 <Hash className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />

//                 <input
//                   type="text"
//                   name="rollNumber"
//                   value={formData.rollNumber}
//                   onChange={handleInputChange}
//                   className="focus:ring-primary-500 w-full rounded-lg border border-gray-300 bg-white py-3 pr-4 pl-10 text-gray-900 transition duration-200 focus:border-transparent focus:ring-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
//                   placeholder="2021CS001"
//                   required
//                 />
//               </div>
//             </div>
//             <div>
//               <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
//                 Password
//               </label>

//               <div className="relative">
//                 <Lock className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />

//                 <input
//                   type="password"
//                   name="password"
//                   value={formData.password}
//                   onChange={handleInputChange}
//                   className="focus:ring-primary-500 w-full rounded-lg border border-gray-300 bg-white py-3 pr-4 pl-10 text-gray-900 transition duration-200 focus:border-transparent focus:ring-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
//                   placeholder="Create a strong password"
//                   required
//                 />
//               </div>
//             </div>
//           </>
//         );

//       case 2:
//         return (
//           <>
//             <div>
//               <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
//                 College/University
//               </label>

//               <div className="relative">
//                 <School className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />

//                 <input
//                   type="text"
//                   name="college"
//                   value={formData.college}
//                   onChange={handleInputChange}
//                   className="focus:ring-primary-500 w-full rounded-lg border border-gray-300 bg-white py-3 pr-4 pl-10 text-gray-900 transition duration-200 focus:border-transparent focus:ring-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
//                   placeholder="Stanford University"
//                   required
//                 />
//               </div>
//             </div>

//             <div>
//               <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
//                 Branch/Department
//               </label>

//               <div className="relative">
//                 <BookOpen className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />

//                 <input
//                   type="text"
//                   name="branch"
//                   value={formData.branch}
//                   onChange={handleInputChange}
//                   className="focus:ring-primary-500 w-full rounded-lg border border-gray-300 bg-white py-3 pr-4 pl-10 text-gray-900 transition duration-200 focus:border-transparent focus:ring-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
//                   placeholder="Computer Science"
//                   required
//                 />
//               </div>
//             </div>

//             <div>
//               <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
//                 Year of Study
//               </label>

//               <div className="relative">
//                 <Calendar className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />

//                 <select
//                   name="year"
//                   value={formData.year}
//                   onChange={handleInputChange}
//                   className="focus:ring-primary-500 w-full rounded-lg border border-gray-300 bg-white py-3 pr-4 pl-10 text-gray-900 transition duration-200 focus:border-transparent focus:ring-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
//                   required
//                 >
//                   <option value="">Select year</option>
//                   <option value="1">1st Year</option>
//                   <option value="2">2nd Year</option>
//                   <option value="3">3rd Year</option>
//                   <option value="4">4th Year</option>
//                   <option value="graduate">Graduate Student</option>
//                   <option value="alumni">Alumni</option>
//                 </select>
//               </div>
//             </div>

//             <div>
//               <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
//                 Skills (comma-separated)
//               </label>

//               <input
//                 type="text"
//                 name="skills"
//                 value={formData.skills}
//                 onChange={handleInputChange}
//                 className="focus:ring-primary-500 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 transition duration-200 focus:border-transparent focus:ring-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
//                 placeholder="Python, React, Machine Learning, Data Analysis"
//               />
//             </div>
//           </>
//         );

//       case 3:
//         return (
//           <>
//             <div>
//               <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
//                 Bio
//               </label>

//               <textarea
//                 name="bio"
//                 value={formData.bio}
//                 onChange={handleInputChange}
//                 rows={3}
//                 className="focus:ring-primary-500 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 transition duration-200 focus:border-transparent focus:ring-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
//                 placeholder="Tell us about yourself, your interests, and goals..."
//               />
//             </div>

//             <div>
//               <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
//                 GitHub Profile (optional)
//               </label>

//               <div className="relative">
//                 <Github className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />

//                 <input
//                   type="url"
//                   name="github"
//                   value={formData.github}
//                   onChange={handleInputChange}
//                   className="focus:ring-primary-500 w-full rounded-lg border border-gray-300 bg-white py-3 pr-4 pl-10 text-gray-900 transition duration-200 focus:border-transparent focus:ring-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
//                   placeholder="https://github.com/username"
//                 />
//               </div>
//             </div>

//             <div>
//               <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
//                 LinkedIn Profile (optional)
//               </label>

//               <div className="relative">
//                 <Linkedin className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />

//                 <input
//                   type="url"
//                   name="linkedin"
//                   value={formData.linkedin}
//                   onChange={handleInputChange}
//                   className="focus:ring-primary-500 w-full rounded-lg border border-gray-300 bg-white py-3 pr-4 pl-10 text-gray-900 transition duration-200 focus:border-transparent focus:ring-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
//                   placeholder="https://linkedin.com/in/username"
//                 />
//               </div>
//             </div>

//             <div>
//               <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
//                 Portfolio/Website (optional)
//               </label>

//               <div className="relative">
//                 <Globe className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />

//                 <input
//                   type="url"
//                   name="portfolio"
//                   value={formData.portfolio}
//                   onChange={handleInputChange}
//                   className="focus:ring-primary-500 w-full rounded-lg border border-gray-300 bg-white py-3 pr-4 pl-10 text-gray-900 transition duration-200 focus:border-transparent focus:ring-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
//                   placeholder="https://yourportfolio.com"
//                 />
//               </div>
//             </div>
//           </>
//         );

//       default:
//         return null;
//     }
//   };

//   return (
//     <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 transition-colors duration-200 dark:bg-gray-900">
//       <div className="grid w-full max-w-5xl items-center gap-8 px-4 lg:grid-cols-2">
//         {/* Hero Section */}
//         <div className="hidden lg:block">
//           <div className="text-center lg:text-left">
//             <div className="mb-6 flex items-center justify-center lg:justify-start">
//               <div className="bg-primary-600 rounded-xl p-3">
//                 <BookOpen className="h-8 w-8 text-white" />
//               </div>

//               <h1 className="text-primary-600 ml-3 text-3xl font-bold">
//                 Studium
//               </h1>
//             </div>

//             <h2 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white">
//               Your College Community Platform
//             </h2>

//             <p className="mb-8 text-xl text-gray-600 dark:text-gray-300">
//               The perfect blend of Notion, Reddit, and LinkedIn designed
//               specifically for college students. Connect, learn, and grow
//               together.
//             </p>

//             <div className="space-y-4">
//               <div className="flex items-center">
//                 <div className="bg-primary-100 dark:bg-primary-900 mr-4 rounded-lg p-2">
//                   <BookOpen className="text-primary-600 dark:text-primary-400 h-5 w-5" />
//                 </div>

//                 <span className="text-gray-700 dark:text-gray-300">
//                   Collaborative knowledge sharing
//                 </span>
//               </div>

//               <div className="flex items-center">
//                 <div className="bg-primary-100 dark:bg-primary-900 mr-4 rounded-lg p-2">
//                   <Mail className="text-primary-600 dark:text-primary-400 h-5 w-5" />
//                 </div>

//                 <span className="text-gray-700 dark:text-gray-300">
//                   Reddit-style community discussions
//                 </span>
//               </div>

//               <div className="flex items-center">
//                 <div className="bg-primary-100 dark:bg-primary-900 mr-4 rounded-lg p-2">
//                   <User className="text-primary-600 dark:text-primary-400 h-5 w-5" />
//                 </div>

//                 <span className="text-gray-700 dark:text-gray-300">
//                   Professional networking & mentorship
//                 </span>
//               </div>
//             </div>
//           </div>
//         </div>
//         {/* Auth Form */}
//         <div className="mx-auto w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 transition-colors duration-200 lg:p-8 dark:border-gray-700 dark:bg-gray-800">
//           <div className="mb-8 text-center">
//             <div className="mb-4 flex items-center justify-center lg:hidden">
//               <div className="bg-primary-600 rounded-xl p-3">
//                 <BookOpen className="h-8 w-8 text-white" />
//               </div>

//               <h1 className="text-primary-600 ml-3 text-2xl font-bold">
//                 Studium
//               </h1>
//             </div>

//             <h3 className="text-xl font-bold text-gray-900 lg:text-2xl dark:text-white">
//               {isSignUp ? `Join Your College Community` : "Welcome back"}
//             </h3>

//             <p className="mt-2 text-sm text-gray-600 lg:text-base dark:text-gray-300">
//               {isSignUp
//                 ? `Step ${currentStep} of 3: ${currentStep === 1 ? "Basic Information" : currentStep === 2 ? "Academic Details" : "Profile Setup"}`
//                 : "Sign in to your account"}
//             </p>
//           </div>
//           {/* Progress Bar for Sign Up */}
//           {isSignUp && (
//             <div className="mb-4 lg:mb-6">
//               <div className="mb-2 flex justify-between">
//                 {[1, 2, 3].map((step) => (
//                   <div
//                     key={step}
//                     className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium lg:h-8 lg:w-8 lg:text-sm ${
//                       step <= currentStep
//                         ? "bg-primary-600 text-white"
//                         : "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
//                     }`}
//                   >
//                     {step}
//                   </div>
//                 ))}
//               </div>

//               <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
//                 <div
//                   className="bg-primary-600 h-2 rounded-full transition-all duration-300"
//                   style={{ width: `${(currentStep / 3) * 100}%` }}
//                 ></div>
//               </div>
//             </div>
//           )}

//           <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
//             {isSignUp ? (
//               renderStep()
//             ) : (
//               <>
//                 <div>
//                   <label className="mb-2 block text-xs font-medium text-gray-700 lg:text-sm dark:text-gray-300">
//                     Email or Roll Number
//                   </label>

//                   <div className="relative">
//                     <Mail className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />

//                     <input
//                       type="text"
//                       name="email"
//                       value={formData.email}
//                       onChange={handleInputChange}
//                       className="focus:ring-primary-500 w-full rounded-lg border border-gray-300 bg-white py-2 pr-4 pl-10 text-sm text-gray-900 transition duration-200 focus:border-transparent focus:ring-2 lg:py-3 lg:text-base dark:border-gray-600 dark:bg-gray-800 dark:text-white"
//                       placeholder="your.email@college.edu or 2021CS001"
//                       required
//                     />
//                   </div>
//                 </div>

//                 <div>
//                   <label className="mb-2 block text-xs font-medium text-gray-700 lg:text-sm dark:text-gray-300">
//                     Password
//                   </label>

//                   <div className="relative">
//                     <Lock className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />

//                     <input
//                       type="password"
//                       name="password"
//                       value={formData.password}
//                       onChange={handleInputChange}
//                       className="focus:ring-primary-500 w-full rounded-lg border border-gray-300 bg-white py-2 pr-4 pl-10 text-sm text-gray-900 transition duration-200 focus:border-transparent focus:ring-2 lg:py-3 lg:text-base dark:border-gray-600 dark:bg-gray-800 dark:text-white"
//                       placeholder="Enter your password"
//                       required
//                     />
//                   </div>
//                 </div>
//               </>
//             )}

//             <div className="flex flex-col space-y-2 lg:flex-row lg:space-y-0 lg:space-x-3">
//               {isSignUp && currentStep > 1 && (
//                 <button
//                   type="button"
//                   onClick={() => setCurrentStep(currentStep - 1)}
//                   className="flex-1 rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition duration-200 hover:bg-gray-300 lg:py-3 lg:text-base dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
//                 >
//                   Back
//                 </button>
//               )}

//               <button
//                 type="submit"
//                 className="bg-primary-600 hover:bg-primary-700 focus:ring-primary-200 dark:focus:ring-primary-800 flex-1 rounded-lg px-4 py-2 text-sm font-medium text-white transition duration-200 focus:ring-4 lg:py-3 lg:text-base"
//               >
//                 {isSignUp
//                   ? currentStep < 3
//                     ? "Continue"
//                     : "Create Account"
//                   : "Sign In"}
//               </button>
//             </div>
//           </form>

//           <div className="mt-4 text-center lg:mt-6">
//             <p className="text-sm text-gray-600 lg:text-base dark:text-gray-300">
//               {isSignUp ? "Already have an account?" : "Don't have an account?"}

//               <button
//                 onClick={() => {
//                   setIsSignUp(!isSignUp);
//                   setCurrentStep(1);
//                 }}
//                 className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 ml-1 text-sm font-medium lg:text-base"
//               >
//                 {isSignUp ? "Sign In" : "Sign Up"}
//               </button>
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };
// export default LoginPage;
