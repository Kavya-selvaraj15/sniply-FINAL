import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import toast from "react-hot-toast";
import { Link2, Eye, EyeOff, ArrowRight } from "lucide-react";

const Register = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Name is required";
    else if (form.name.trim().length < 2)
      errs.name = "Name must be at least 2 characters";
    if (!form.email) errs.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email))
      errs.email = "Enter a valid email";
    if (!form.password) errs.password = "Password is required";
    else if (form.password.length < 6)
      errs.password = "Password must be at least 6 characters";
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
      const res = await api.post("/auth/register", form);
      login(res.data.user, res.data.token);
      toast.success("Account created! Welcome aboard 🎉");
      navigate("/dashboard");
    } catch (err) {
      const msg = err.response?.data?.message || "Registration failed";
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

  const strength =
    form.password.length === 0
      ? 0
      : form.password.length < 6
        ? 1
        : form.password.length < 10
          ? 2
          : 3;

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">
          <Link2 size={36} />
          <h1>
            Snip<em>ly</em>
          </h1>
        </div>
        <p className="auth-tagline">Your links, your analytics.</p>
        <div className="auth-decorations">
          <div className="deco-circle c1" />
          <div className="deco-circle c2" />
          <div className="deco-circle c3" />
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-card-header">
            <h2>Create account</h2>
            <p>Start shortening links for free</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className={`field-group ${errors.name ? "error" : ""}`}>
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Jane Doe"
                autoComplete="name"
              />
              {errors.name && (
                <span className="field-error">{errors.name}</span>
              )}
            </div>

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
                  placeholder="Min. 6 characters"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {form.password && (
                <div className="password-strength">
                  <div className={`strength-bar s${strength}`}>
                    <span />
                    <span />
                    <span />
                  </div>
                  <span className="strength-label">
                    {["", "Weak", "Fair", "Strong"][strength]}
                  </span>
                </div>
              )}
              {errors.password && (
                <span className="field-error">{errors.password}</span>
              )}
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? (
                <span className="btn-spinner" />
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
