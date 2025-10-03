import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000", // adjust if backend runs elsewhere
});

export default API;
