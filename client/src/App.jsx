import { BrowserRouter, Routes, Route } from "react-router";
import { AuthProvider } from "./context/AuthContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import PrivateRoute from "./routes/PrivateRoute";
import { RestricedRoute } from "./routes/restricedRoute";
import { Link } from "react-router";

// function App() {
//   return (
//     <AuthProvider>
//       <BrowserRouter>
//         <Routes>
//           <Route
//             path="/"
//             element={
//               <RestricedRoute>
//                 <Home />
//               </RestricedRoute>
//             }
//           />
//           <Route path="/login" element={<Login />} />
//           <Route path="/signup" element={<Signup />} />
//           <Route
//             path="/dashboard"
//             element={
//               <PrivateRoute>
//                 <Dashboard />
//               </PrivateRoute>
//             }
//           />
//         </Routes>
//       </BrowserRouter>
//     </AuthProvider>
//   );
// }

// export default App;
function App() {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="space-y-4 text-center">
        <h1 className="text-2xl font-semibold text-gray-800">
          🚧 Project Under Development
        </h1>

        <p className="text-gray-600">
          We’re working hard to bring this project to life. Stay tuned!
        </p>

        <a
          href="https://studim-demo.netlify.app"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block font-medium text-blue-600 hover:underline"
        >
          View the prototype here →
        </a>
      </div>
    </div>
  );
}

export default App;
