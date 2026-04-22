import React, { useState } from "react";
import axios from "axios";

function Register() {
  const [user, setUser] = useState({
    username: "",
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/register",
        user
      );

      alert(res.data.message);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div>
    <form onSubmit={handleSubmit}>
      <br/>
      <input name="username" placeholder="Username" onChange={handleChange} />
      <br/>
      <input name="email" placeholder="Email" onChange={handleChange} />
      <br/>
      <input name="password" type="password" placeholder="Password" onChange={handleChange} />
      <br/>
      <button type="submit">Register</button>
      <br/>
    </form>
    </div>
  );
}

export default Register;