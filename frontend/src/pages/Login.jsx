import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import loginimg1 from "../assets/login-img1.png";
import logo from "../assets/spentwise-logo.jpg";
import useAuth from "../hooks/useAuth";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth(); // <-- this line was missing

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Fake login for now. Real authentication comes with the backend.
    login({ email: formData.email });
    navigate("/dashboard");
  };

  return (
    <div className="login-main-container">
      <div className="login-img-slideshow">
        <img src={loginimg1} alt="" />
      </div>

      <form className="login-form" onSubmit={handleSubmit}>
        <div className="login-brand">
          <img src={logo} alt="" className="login-logo" />
          <span className="login-brand-name">Spentwise</span>
        </div>

        <div className="login-content">
          <h2>Log in</h2>
          <p>
            Don't have an account? <Link to="/signup">Sign up</Link>
          </p>

          <div className="login-info">
            <input
              name="email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <input
              name="password"
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <button type="submit">Log in</button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default Login;