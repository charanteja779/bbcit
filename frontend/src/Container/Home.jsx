import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

{/* <Link to="/home">Home</Link> */}

function Home() {
  const navigate = useNavigate();

  const handleLogin = () => {
    // fake login
    localStorage.setItem("user", "loggedIn");
    navigate("/dashboard");
  };

  return (
    <div>
      <h2>Login Page</h2>
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}

export default Home;