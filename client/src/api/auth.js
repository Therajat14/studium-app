import axios from "../utils/axiosInstance";

export const loginApi = async (user) => {
  const { data } = await axios.post("/auth/login", user);
  return data; // expects { token }
};

export const signupApi = async (email, password) => {
  const { data } = await axios.post("/auth/signup", { email, password });
  return data;
};

export const meApi = async () => {
  const { data } = await axios.get("/auth/me");
  return data; // expects { id, email, name }
};
