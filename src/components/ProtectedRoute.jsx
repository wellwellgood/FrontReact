import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const username = sessionStorage.getItem("username");
  const name = sessionStorage.getItem("name");

  if (!username || !name) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;