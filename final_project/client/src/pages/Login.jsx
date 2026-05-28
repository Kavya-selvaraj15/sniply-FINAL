import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import toast from "react-hot-toast";
import { Link2, Eye, EyeOff, ArrowRight } from "lucide-react";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.email) errs.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email))
      errs.email = "Enter a valid email";
    if (!form.password) errs.password = "Password is required";
    return errs;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/login", form);
      login(res.data.user, res.data.token);
      toast.success(`Welcome back, ${res.data.user.name}!`);
      navigate("/dashboard");
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed";
      toast.error(msg);
      if (err.response?.data?.errors) {
        const fieldErrors = {};
        err.response.data.errors.forEach((e) => {
          fieldErrors[e.field] = e.message;
        });
        setErrors(fieldErrors);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">
          <Link2 size={36} />
          <h1>
            Snip<em>ly</em>
          </h1>
        </div>
        <p className="auth-tagline">Shorten. Share. Track.</p>
        <div className="auth-decorations">
          <div className="deco-circle c1" />
          <div className="deco-circle c2" />
          <div className="deco-circle c3" />
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-card-header">
            <h2>Welcome back</h2>
            <p>Sign in to manage your links</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className={`field-group ${errors.email ? "error" : ""}`}>
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
              />
              {errors.email && (
                <span className="field-error">{errors.email}</span>
              )}
            </div>

            <div className={`field-group ${errors.password ? "error" : ""}`}>
              <label htmlFor="password">Password</label>
              <div className="input-with-icon">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <span className="field-error">{errors.password}</span>
              )}
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? (
                <span className="btn-spinner" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <p className="auth-switch">
            Don't have an account? <Link to="/register">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
