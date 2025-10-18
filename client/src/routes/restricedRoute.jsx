import { Navigate } from "react-router";
import { getToken } from "../utils/storage";

export const RestricedRoute = ({ children }) => {
  const token = getToken();
  return token ? children : <Navigate to="/login" replace />;
};
