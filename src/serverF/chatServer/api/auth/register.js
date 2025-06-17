// ❌ import axios from "axios";
const axios = require("axios");

const registerUser = async (userData) => {
  const response = await axios.post("http://localhost:4000/api/register", userData);
  return response.data;
};

module.exports = { registerUser };
