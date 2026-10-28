import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import loginimg1 from "../assets/login-img1.png";
import logo from "../assets/spentwise-logo.jpg";
import "./Login.css";

function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreed: false,
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    console.log("Signup data:", {
      ...formData,
      password: "***",
      confirmPassword: "***",
    });
    // Fake signup for now. The backend will create the account later.
    navigate("/login");
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
          <h2>Create an account</h2>
          <p>
            Already have an account? <Link to="/login">Log in</Link>
          </p>

          <div className="login-info">
            <div className="signup-name-row">
              <input
                name="firstName"
                placeholder="First name"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
              <input
                name="lastName"
                placeholder="Last name"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>

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
              placeholder="Create a password"
              minLength={8}
              value={formData.password}
              onChange={handleChange}
              required
            />
            <input
              name="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />

            <label className="signup-terms">
              <input
                name="agreed"
                type="checkbox"
                checked={formData.agreed}
                onChange={handleChange}
                required
              />
              <span>
                I agree to the <a href="#terms">Terms and Conditions</a>
              </span>
            </label>

            {error && <p className="signup-error">{error}</p>}

            <button type="submit">Create account</button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default Signup;