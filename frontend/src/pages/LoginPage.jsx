import Login from "../components/Login";
import { useNavigate } from "react-router-dom";

function LoginPage({ onLogin }) {
  const navigate = useNavigate();

  const handleLogin = (user) => {
    onLogin(user);
    navigate("/dashboard");
  };

  return (
    <Login
      onLogin={handleLogin}
      onBack={() => navigate("/")}
    />
  );
}

export default LoginPage;