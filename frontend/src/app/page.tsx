"use client";

import Link from "next/link";

export default function Home() {
  const atlassianBlue = "#0052CC";
  const atlassianYellow = "#FFAB00";
  const darkBg = "#0B2147";

  return (
    <div style={{ fontFamily: "'-apple-system', BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", background: darkBg, color: "#fff", minHeight: "100vh", overflowX: "hidden" }}>
      
      {/* Navigation */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: "#ffffff", height: 72, display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 24px", boxShadow: "0 1px 2px rgba(0,0,0,0.1)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 32, height: 32, background: atlassianBlue, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M12 2L2 22h20L12 2zm0 4l6 14H6l6-14z" />
              </svg>
            </div>
            <span style={{ fontWeight: 700, fontSize: 24, color: "#253858", letterSpacing: "-0.5px" }}>FlowPilot</span>
          </div>
          
          <div style={{ display: "flex", gap: 24, color: "#42526E", fontWeight: 600, fontSize: 14 }}>
            {["Features ⌄", "Solutions ⌄", "Product guide", "Templates ⌄", "Pricing"].map(item => (
              <span key={item} style={{ cursor: "pointer" }}
                onMouseEnter={e => (e.currentTarget.style.color = atlassianBlue)}
                onMouseLeave={e => (e.currentTarget.style.color = "#42526E")}>{item}</span>
            ))}
          </div>
        </div>
        
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <Link href="/register" style={{
            background: atlassianBlue, color: "#fff", fontWeight: 600, fontSize: 14,
            padding: "8px 16px", borderRadius: 3, textDecoration: "none", transition: "background 0.2s"
          }}
          onMouseEnter={e => (e.currentTarget.style.background = "#0065FF")}
          onMouseLeave={e => (e.currentTarget.style.background = atlassianBlue)}>
            Get it free
          </Link>
          <Link href="/login" style={{ color: "#253858", fontWeight: 600, fontSize: 15, textDecoration: "none" }}
          onMouseEnter={e => (e.currentTarget.style.color = atlassianBlue)}
          onMouseLeave={e => (e.currentTarget.style.color = "#253858")}>
            Sign In
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ paddingTop: 160, paddingBottom: 80, display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: 1200, margin: "0 auto", paddingLeft: 40, paddingRight: 40 }}>
        <div style={{ maxWidth: 500 }}>
          <h1 style={{ fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 700, lineHeight: 1.15, marginBottom: 24, color: "#fff" }}>
            Move fast, stay aligned, and build better - together
          </h1>
          <p style={{ fontSize: 20, color: "#C1C7D0", marginBottom: 32, fontWeight: 500 }}>
            The #1 software development tool used by agile teams
          </p>
          <Link href="/register" style={{
            display: "inline-block", background: atlassianYellow, color: "#172B4D",
            fontWeight: 700, fontSize: 16, padding: "12px 24px", borderRadius: 3, textDecoration: "none",
            transition: "background 0.2s"
          }}
          onMouseEnter={e => (e.currentTarget.style.background = "#FFC400")}
          onMouseLeave={e => (e.currentTarget.style.background = atlassianYellow)}>
            Get it free
          </Link>
        </div>

        {/* Abstract UI Elements */}
        <div style={{ position: "relative", width: 600, height: 400 }}>
           <div style={{ position: "absolute", top: 20, left: 0, width: 320, background: "#22272B", borderRadius: 8, padding: 16, border: "1px solid #444", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>
              <p style={{ fontSize: 14, color: "#B3BAC5", marginBottom: 12 }}>Quick booking for featured accommodations on website</p>
              <div style={{ background: "#998DD9", color: "#172B4D", fontSize: 10, fontWeight: 700, padding: "4px 8px", borderRadius: 3, display: "inline-block", marginBottom: 12, letterSpacing: "1px" }}>CHECKOUT FEATURES</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#36B37E", fontSize: 12, fontWeight: 600 }}>☑ ETL-168</span>
                <div style={{ width: 24, height: 24, background: "#FF5630", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700 }}>A</div>
              </div>
           </div>

           <div style={{ position: "absolute", top: 140, right: 20, width: 380, background: "#161A1D", borderRadius: 8, padding: 0, border: "1px solid #333", boxShadow: "0 20px 40px rgba(0,0,0,0.6)" }}>
              <div style={{ padding: "12px 16px", borderBottom: "1px solid #2C333A", color: "#8A94A5", fontSize: 12, fontWeight: 600 }}>Releases</div>
              {[ 
                { id: "ETL-164", label: "Selection", status: "IN PROGRESS", color: "#0052CC" },
                { id: "ETL-166", label: "Transact...", status: "IN PROGRESS", color: "#0052CC" },
                { id: "ETL-168", label: "Quick book...", status: "TO DO", color: "#42526E" },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", borderBottom: "1px solid #2C333A" }}>
                   <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                     <span style={{ color: "#36B37E", fontSize: 12 }}>☑</span>
                     <span style={{ color: "#8A94A5", fontSize: 12, fontWeight: 500 }}>{item.id} <span style={{ color: "#DFE1E6" }}>{item.label}</span></span>
                   </div>
                   <span style={{ background: item.color, color: "#fff", fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 3 }}>{item.status}</span>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* Section 2 */}
      <section style={{ background: "#0B2147", paddingTop: 80, paddingBottom: 120, textAlign: "center" }}>
         <h2 style={{ fontSize: 36, fontWeight: 700, color: "#fff", marginBottom: 32 }}>All from a single source of truth</h2>
         <div style={{ display: "flex", justifyContent: "center", gap: 16, marginBottom: 60 }}>
            {["Plan", "Track", "Release", "Report", "Automate"].map((tab, index) => (
              <div key={tab} style={{ 
                background: index === 0 ? "#36B37E" : "#172B4D", 
                color: index === 0 ? "#172B4D" : "#fff",
                padding: "8px 20px", borderRadius: 24, fontSize: 16, fontWeight: 600, cursor: "pointer"
              }}>
                {tab}
              </div>
            ))}
         </div>

         {/* Full board mockup */}
         <div style={{ maxWidth: 1100, margin: "0 auto", background: "#161A1D", borderRadius: 8, padding: 0, textAlign: "left", boxShadow: "0 20px 50px rgba(0,0,0,0.5)", overflow: "hidden", border: "1px solid #2C333A" }}>
            <div style={{ background: "#22272B", padding: "12px 24px", display: "flex", alignItems: "center", borderBottom: "1px solid #333", gap: 20 }}>
               <span style={{ color: "#fff", fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
                 <div style={{ width: 16, height: 16, background: atlassianBlue, borderRadius: 2 }} /> FlowPilot
               </span>
               <div style={{ display: "flex", gap: 16, color: "#A6B0C3", fontSize: 13, fontWeight: 500 }}>
                 <span>Your work ⌄</span>
                 <span style={{ color: "#4C9AFF" }}>Projects ⌄</span>
                 <span>Filters ⌄</span>
                 <span>Dashboards ⌄</span>
               </div>
               <div style={{ marginLeft: "auto", background: atlassianBlue, color: "#fff", padding: "4px 12px", borderRadius: 3, fontSize: 13, fontWeight: 600 }}>Create</div>
            </div>

            <div style={{ display: "flex", height: 500 }}>
               {/* Sidebar */}
               <div style={{ width: 220, background: "#1D2125", borderRight: "1px solid #2C333A", padding: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                     <div style={{ width: 32, height: 32, background: "linear-gradient(135deg, #6554C0, #403294)", borderRadius: 4 }} />
                     <div>
                       <div style={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>Beyond Gravity</div>
                       <div style={{ color: "#8A94A5", fontSize: 11 }}>Software project</div>
                     </div>
                  </div>
                  
                  <div style={{ color: "#8A94A5", fontSize: 11, fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>PLANNING</div>
                  <div style={{ color: "#B3BAC5", fontSize: 13, fontWeight: 500, padding: "8px 0", cursor: "pointer" }}>Timeline</div>
                  <div style={{ color: "#B3BAC5", fontSize: 13, fontWeight: 500, padding: "8px 0", cursor: "pointer" }}>Backlog</div>
                  <div style={{ color: "#4C9AFF", background: "rgba(76,154,255,0.1)", fontSize: 13, fontWeight: 600, padding: "8px 12px", borderRadius: 3, cursor: "pointer", marginLeft: -12, borderLeft: "3px solid #4C9AFF" }}>Board</div>
               </div>

               {/* Board Columns */}
               <div style={{ flex: 1, padding: 24, background: "#161A1D", display: "flex", gap: 16, overflowX: "hidden" }}>
                  {[
                    { title: "TO DO", count: 6, items: [
                      { text: "Optimize experience for mobile web", tag: "BILLING", tagColor: "#0052CC", id: "NUC-344" },
                      { text: "Onboard workout options (OWO)", tag: "ACCOUNTS", tagColor: "#36B37E", id: "NUC-360" }
                    ]},
                    { title: "IN PROGRESS", count: 6, items: [
                      { text: "Fast trip search", tag: "ACCOUNTS", tagColor: "#36B37E", id: "NUC-342", bg: "#2B2714" },
                      { text: "Affiliate links integration - frontend", tag: "BILLING", tagColor: "#0052CC", id: "NUC-335" }
                    ]},
                    { title: "IN REVIEW", count: 5, items: [
                      { text: "Revise and streamline booking flow", tag: "ACCOUNTS", tagColor: "#36B37E", id: "NUC-387" },
                      { text: "Travel suggestion experiments", tag: "ACCOUNTS", tagColor: "#36B37E", id: "NUC-356" }
                    ]},
                  ].map((col, cIdx) => (
                    <div key={cIdx} style={{ flex: 1, background: "#1D2125", borderRadius: 6, padding: "12px 8px" }}>
                       <div style={{ color: "#8A94A5", fontSize: 11, fontWeight: 700, marginBottom: 12, paddingLeft: 8 }}>
                         {col.title} <span style={{ background: "#2C333A", padding: "2px 6px", borderRadius: 12, marginLeft: 6 }}>{col.count}</span>
                       </div>
                       {col.items.map((item, iIdx) => (
                         <div key={iIdx} style={{ background: item.bg || "#22272B", padding: 12, borderRadius: 3, marginBottom: 8, border: "1px solid #333", boxShadow: "0 1px 2px rgba(0,0,0,0.2)" }}>
                            <div style={{ color: "#DFE1E6", fontSize: 13, fontWeight: 500, marginBottom: 12, lineHeight: 1.4 }}>{item.text}</div>
                            <div style={{ display: "inline-block", background: item.tagColor, color: "#172B4D", fontSize: 10, fontWeight: 700, padding: "2px 4px", borderRadius: 3, marginBottom: 12 }}>{item.tag}</div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                               <span style={{ color: "#8A94A5", fontSize: 12, fontWeight: 500 }}>☑ {item.id}</span>
                               <div style={{ display: "flex", gap: 4 }}>
                                 <div style={{ width: 16, height: 16, borderRadius: "50%", background: "#FF5630" }} />
                               </div>
                            </div>
                         </div>
                       ))}
                    </div>
                  ))}
               </div>
            </div>
         </div>
      </section>

      {/* Footer / CTA */}
      <section style={{ background: "#0A1E42", padding: "80px 24px", textAlign: "center", borderTop: "1px solid #253858" }}>
         <h2 style={{ fontSize: 32, fontWeight: 700, color: "#fff", marginBottom: 24 }}>Ready to get started?</h2>
         <Link href="/register" style={{
            display: "inline-block", background: atlassianBlue, color: "#fff",
            fontWeight: 600, fontSize: 16, padding: "12px 24px", borderRadius: 3, textDecoration: "none"
          }}>
            Get it free
          </Link>
      </section>
    </div>
  );
}
