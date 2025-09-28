import  { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "./image.png";
import "./Log_in.css";

function Log_in() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

   

    try {
      const res = await fetch("http://localhost:3001/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      if (!res.ok) {
        throw new Error("فشل تسجيل الدخول ❌");
      }

      const data = await res.json();
      console.log("Login response:", data);

      alert("تم تسجيل الدخول بنجاح ✅");
      navigate("/home"); // بعد النجاح يوديك للصفحة
    } catch (err) {
      console.error(err);
      alert("الايميل أو الباسورد غير صحيح ⚠️");
    }
  };

  return (
    <div className="login-root">
      <div className="login-container">
        <div className="logo">
         <Link to={"/home"}><img src={Logo} alt="logo" /></Link> 
        </div>

        <h2 className="login-title">Log in</h2>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-field">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="Enter your email like you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="login-field">
            <label>Password</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button type="submit" className="login-btn">
            Login
          </button>

          {/* <div className="forget">
            <Link to="/forgotPassword">Forget Password?</Link>
          </div> */}
          <div className="noaccount">
            <p >
              Don't have an account? <Link to="/Signup">Sign Up</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Log_in;