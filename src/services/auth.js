import api from "./api";

export const login = (credentials) => {
  return api.post('/auth/login', credentials); // Endpoint of API login
};

export const register = (userData) => {
  return api.post('/auth/register', userData); // Endpoint of API register
}

export const logout = () => {
  return api.post('/auth/logout'); // Endpoint of API logout
}