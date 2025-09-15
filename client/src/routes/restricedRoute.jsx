import { Navigate } from "react-router";

import { getToken } from "../utils/storage";

export const restricedRoute = ({ children }) => {
  const token = getToken;
  return token ? children : <Navigate to="/login" replace />;
};
