import api from "./api";

export const signup = async (data: {
  name: string;
  email: string;
  password: string;
}) => {
  const response = await api.post("/users/register", data);
  return response.data;
};

export const login = async (data: {
  email: string;
  password: string;
}) => {
  const response = await api.post("/auth/login", data);
  return response.data;
};