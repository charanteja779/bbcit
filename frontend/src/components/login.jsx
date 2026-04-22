import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";


function Login() {
  const navigate = useNavigate()
  const [user, setUser] = useState({
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const handleLogin = () => {
      // after API success
      localStorage.setItem("user", "loggedIn");
      navigate("/dashboard");
    };

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        user
      );
      
      // store token
      localStorage.setItem("token", res.data.token);
      await handleLogin()
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div>

      <form onSubmit={handleSubmit}>
        <br />
        <input name="email" placeholder="Email" onChange={handleChange} />
        <br />
        <input name="password" type="password" placeholder="Password" onChange={handleChange} />
        <br />
        <button type="submit">Login</button>
        <br />
      </form>

    </div>
  );
}

export default Login;