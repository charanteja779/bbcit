import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import Logout from "./Logout";

{/* <Link to="/home">Home</Link> */}

function Dashboard() {
  const navigate = useNavigate();

  return (
    <div>
      <h2>Dashboard</h2>
      <Logout/>
    </div>
  );
}

export default Dashboard;