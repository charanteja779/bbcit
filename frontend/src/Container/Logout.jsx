import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Logout() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        navigate("/"); // redirect to login
    };

    return (<>
        <button onClick={handleLogout}>Logout</button>
    </>)
}

export default Logout;