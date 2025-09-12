import { Navigate } from "react-router";
import { useAuth } from "../context/hooks/useAuth";

export const restricedRoute = ({ children }) => {
  const user = useAuth();
  return <div>restricedRoute</div>;
};
