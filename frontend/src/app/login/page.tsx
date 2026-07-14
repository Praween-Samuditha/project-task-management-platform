"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import api from "@/services/api";
import { setToken, setUser, isAuthenticated } from "@/lib/auth";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (isAuthenticated()) router.replace("/dashboard");
  }, [router]);

  const atlassianBlue = "#0052CC";
  const atlassianYellow = "#FFAB00";
  const darkBg = "#0B2147";

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await api.post("/auth/login", data);
      setToken(res.data.token);
      setUser(res.data.user);
      toast.success("Welcome back!");
      router.push("/dashboard");
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Invalid credentials");
    } finally { setLoading(false); }
  };

  const inputStyle = {
    width: "100%", height: 44, background: "rgba(255,255,255,0.05)",
    border: "2px solid rgba(255,255,255,0.2)", borderRadius: 4,
    color: "#fff", fontSize: 15, padding: "0 16px", outline: "none",
    fontFamily: "'-apple-system', BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    transition: "border-color 0.2s, background-color 0.2s"
  };

  return (
    <div style={{ fontFamily: "'-apple-system', BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", minHeight: "100vh", background: darkBg, display: "flex", flexDirection: "column" }}>
      
      {/* Navigation */}
      <nav style={{
        background: "transparent", height: 80, display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 40px", borderBottom: "1px solid rgba(255,255,255,0.1)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 32, height: 32, background: atlassianBlue, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M12 2L2 22h20L12 2zm0 4l6 14H6l6-14z" />
            </svg>
          </div>
          <span style={{ fontWeight: 700, fontSize: 24, color: "#fff", letterSpacing: "-0.5px" }}>FlowPilot</span>
        </div>
        <Link href="/" style={{ color: "#fff", fontWeight: 600, fontSize: 15, textDecoration: "none" }}>Back to home</Link>
      </nav>

      {/* Main Content */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ width: "100%", maxWidth: 1000, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 40 }}>
          
          {/* Left Text Side */}
          <div style={{ flex: 1, maxWidth: 500 }}>
            <h1 style={{ fontSize: "clamp(36px, 5vw, 48px)", fontWeight: 700, lineHeight: 1.15, marginBottom: 24, color: "#fff" }}>
              Log in to your workspace
            </h1>
            <p style={{ fontSize: 20, color: "#C1C7D0", marginBottom: 32, fontWeight: 500 }}>
              Access your agile boards, track progress, and build better - together.
            </p>
            
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#36B37E", fontSize: 24 }}>☑</div>
              <p style={{ fontSize: 15, color: "#DFE1E6", fontWeight: 500, margin: 0 }}>Secure access to all your connected projects</p>
            </div>
          </div>

          {/* Right Form Card */}
          <div style={{ width: "100%", maxWidth: 440 }}>
            <div style={{ background: "#161A1D", borderRadius: 8, padding: "40px", border: "1px solid #2C333A", boxShadow: "0 20px 50px rgba(0,0,0,0.5)" }}>
              <h2 style={{ fontSize: 24, fontWeight: 600, color: "#fff", marginBottom: 32 }}>Sign In</h2>
              
              <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column" as const, gap: 20 }}>
                
                <div>
                  <label style={{ display: "block", color: "#8A94A5", fontSize: 12, fontWeight: 700, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>Email Address</label>
                  <input
                    type="email"
                    placeholder="Enter email"
                    style={inputStyle}
                    {...register("email")}
                    onFocus={e => { e.target.style.borderColor = atlassianBlue; e.target.style.background = "rgba(255,255,255,0.1)"; }}
                    onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.2)"; e.target.style.background = "rgba(255,255,255,0.05)"; }}
                  />
                  {errors.email && <p style={{ fontSize: 13, color: "#FF5630", marginTop: 6, fontWeight: 500 }}>{errors.email.message}</p>}
                </div>

                <div>
                  <label style={{ display: "block", color: "#8A94A5", fontSize: 12, fontWeight: 700, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>Password</label>
                  <input
                    type="password"
                    placeholder="Enter password"
                    style={inputStyle}
                    {...register("password")}
                    onFocus={e => { e.target.style.borderColor = atlassianBlue; e.target.style.background = "rgba(255,255,255,0.1)"; }}
                    onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.2)"; e.target.style.background = "rgba(255,255,255,0.05)"; }}
                  />
                  {errors.password && <p style={{ fontSize: 13, color: "#FF5630", marginTop: 6, fontWeight: 500 }}>{errors.password.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: "100%", height: 48, background: loading ? "#42526E" : atlassianBlue,
                    color: "#fff", border: "none", borderRadius: 4,
                    fontSize: 16, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
                    fontFamily: "inherit", marginTop: 12, transition: "background 0.2s"
                  }}
                  onMouseEnter={e => !loading && (e.currentTarget.style.background = "#0065FF")}
                  onMouseLeave={e => !loading && (e.currentTarget.style.background = atlassianBlue)}
                >
                  {loading ? "Logging in..." : "Continue"}
                </button>
              </form>

              <div style={{ textAlign: "center", marginTop: 32 }}>
                <p style={{ color: "#8A94A5", fontSize: 14 }}>
                  Don't have an account?{" "}
                  <Link href="/register" style={{ color: atlassianYellow, fontWeight: 600, textDecoration: "none" }}
                  onMouseEnter={e => (e.currentTarget.style.textDecoration = "underline")}
                  onMouseLeave={e => (e.currentTarget.style.textDecoration = "none")}>
                    Sign up
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
