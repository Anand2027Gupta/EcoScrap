import { useNavigate } from "react-router-dom";
import Landing from "../components/LandingPage";

function LandingPage() {
  const navigate = useNavigate();

  return (
    <Landing
      onGetStarted={() => navigate("/login")}
    />
  );
}

export default LandingPage;