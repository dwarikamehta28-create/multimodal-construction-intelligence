
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Bell,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  ClipboardList,
  CloudSun,
  DollarSign,
  Download,
  HardHat,
  LayoutDashboard,
  MapPin,
  Menu,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  TrendingUp,
  Wallet,
  X,
 ImagePlus,
  LoaderCircle,

} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import "./Dashboard.css";


const progressData = [
  { month: "May", planned: 18, actual: 15 },
  { month: "Jun", planned: 30, actual: 26 },
  { month: "Jul", planned: 43, actual: 39 },
  { month: "Aug", planned: 57, actual: 48 },
  { month: "Sep", planned: 72, actual: 63 },
  { month: "Oct", planned: 86, actual: 76 },
  { month: "Nov", planned: 100, actual: 91 },
];

const projects = [
  { name: "Riverside Residences", type: "Residential", location: "Indore, MP", progress: 76, status: "On track", budget: "₹2.4 Cr" },
  { name: "Northgate Commercial Hub", type: "Commercial", location: "Bhopal, MP", progress: 48, status: "At risk", budget: "₹4.8 Cr" },
  { name: "Greenfield Community", type: "Infrastructure", location: "Ujjain, MP", progress: 91, status: "On track", budget: "₹1.6 Cr" },
];

const activities = [
  { icon: ClipboardList, title: "Progress report updated", detail: "Riverside Residences · 76% complete", time: "24 min ago", tone: "green" },
  { icon: CircleAlert, title: "Site observation needs review", detail: "Northgate Commercial Hub · Safety", time: "1 hr ago", tone: "orange" },
  { icon: CheckCircle2, title: "Milestone marked complete", detail: "Greenfield Community · Phase 3", time: "3 hrs ago", tone: "blue" },
];

function Dashboard() {
  const [activeTab, setActiveTab] = useState("Overview");
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [showNewProject, setShowNewProject] = useState(false);
  const [projectList, setProjectList] = useState(projects);
  const [projectName, setProjectName] = useState("");
  const [projectLocation, setProjectLocation] = useState("");
  const [notice, setNotice] = useState("");
  
  const [selectedImage, setSelectedImage] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState("");
  
  
  function handleImageChange(event) {
    const file = event.target.files?.[0];

    setAnalysisResult(null);
    setAnalysisError("");

    if (!file) {
      setSelectedImage(null);
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setSelectedImage(null);
      setAnalysisError("Please upload a JPG, PNG, or WebP image.");
      event.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setSelectedImage(null);
      setAnalysisError("Image size must not exceed 10 MB.");
      event.target.value = "";
      return;
    }

    setSelectedImage(file);
  }

  
  async function analyzeImage() {
    if (!selectedImage) {
      setAnalysisError("Please select an image first.");
      return;
    }

    setAnalysisLoading(true);
    setAnalysisError("");
    setAnalysisResult(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedImage);

      const response = await fetch("http://127.0.0.1:8000/analyze/image", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string" &&
data.detail.includes("403")
  ? "AI analysis is temporarily unavailable because the model provider denied access. Please check the API project permissions or contact the provider."
  : typeof data.detail === "string" &&
    data.detail.includes("503")
    ? "AI analysis is not configured. Please check the backend API key."
    : "Image analysis failed. Please try again or check the backend.",
        );
      }

      setAnalysisResult(data);
    } catch (error) {
      setAnalysisError(
        error.message ||
          "Could not connect to the backend. Make sure the API is running.",
      );
    } finally {
      setAnalysisLoading(false);
    }
  }




  const filteredProjects = projectList.filter((project) =>
    `${project.name} ${project.location} ${project.type}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  function addProject(event) {
    event.preventDefault();
    if (!projectName.trim() || !projectLocation.trim()) return;
    setProjectList((current) => [
      ...current,
      {
        name: projectName.trim(),
        type: "New project",
        location: projectLocation.trim(),
        progress: 0,
        status: "Planning",
        budget: "Not set",
      },
    ]);
    setProjectName("");
    setProjectLocation("");
    setShowNewProject(false);
    setActiveTab("Projects");
    setNotice("Project added to this demo workspace.");
  }

  function exportReport() {
    const header = ["Project", "Type", "Location", "Progress", "Status", "Budget"];
    const rows = projectList.map((p) => [
      p.name, p.type, p.location, `${p.progress}%`, p.status, p.budget,
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "buildwise-project-report.csv";
    link.click();
    URL.revokeObjectURL(url);
    setNotice("Project report exported.");
  }

 
const navItems = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Projects", icon: Building2 },
  { label: "Site Safety", icon: ShieldCheck },
  { label: "Crack Analysis", icon: Activity },
  { label: "Project Planning", icon: CalendarDays },
  { label: "Property Valuation", icon: DollarSign },
  { label: "AI Assistant", icon: HardHat },
  { label: "Weather Advisory", icon: CloudSun },
  { label: "Knowledge Hub", icon: ClipboardList },
  { label: "Reports", icon: TrendingUp },
];


  return (
    <main className="dashboard-shell">
      <aside className={`dashboard-sidebar ${menuOpen ? "sidebar-open" : ""}`}>
        <Link className="dashboard-brand" to="/">
          <span className="wordmark-icon"><Building2 size={21} /></span>
          <span>buildwise<span className="wordmark-ai">.ai</span><small>PROJECT INTELLIGENCE</small></span>
          <button
            className="sidebar-close"
            aria-label="Close navigation"
            onClick={(event) => { event.preventDefault(); setMenuOpen(false); }}
          >
            <X size={18} />
          </button>
        </Link>

        <div className="sidebar-workspace">
          <span className="workspace-avatar">BW</span>
          <span><strong>BuildWise Studio</strong><small>Demo workspace</small></span>
          <ChevronDown size={15} />
        </div>

        <span className="sidebar-label">WORKSPACE</span>
        <nav className="dashboard-nav">
          {navItems.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className={activeTab === label ? "dashboard-nav-item active" : "dashboard-nav-item"}
              onClick={() => { setActiveTab(label); setMenuOpen(false); setNotice(""); }}
            >
              <Icon size={18} strokeWidth={1.8} />
              {label}
              {label === "Site intelligence" && <span className="nav-count">1</span>}
            </button>
          ))}
        </nav>

        <span className="sidebar-label sidebar-tools-label">PREFERENCES</span>
        <button className="dashboard-nav-item" onClick={() => setNotice("Settings are a UI preview in this demo.")}>
          <Settings size={18} strokeWidth={1.8} /> Settings
        </button>

        <div className="sidebar-bottom">
          <div className="sidebar-help-icon"><CloudSun size={19} /></div>
          <strong>Everything in view.</strong>
          <p>Your project information, organised in one place.</p>
          <Link to="/">Back to website <ArrowUpRight size={14} /></Link>
          <div className="sidebar-profile">
            <div className="profile-avatar">DM</div>
            <span><strong>Demo Manager</strong><small>Project administrator</small></span>
            <button aria-label="Profile information" onClick={() => setNotice("Demo profile — no account is signed in.")}>···</button>
          </div>
        </div>
      </aside>

      {menuOpen && <button className="sidebar-backdrop" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}

      <section className="dashboard-main">
        <header className="dashboard-topbar">
          <button className="dashboard-menu-button" aria-label="Open navigation" onClick={() => setMenuOpen(true)}>
            <Menu size={21} />
          </button>
          <div className="dashboard-breadcrumb">Workspace <span>/</span> <strong>{activeTab}</strong></div>
          <div className="dashboard-top-actions">
            <label className="dashboard-search">
              <Search size={17} />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search projects..." />
              <kbd>⌘ K</kbd>
            </label>
            <button className="dashboard-icon-button" aria-label="Notifications" onClick={() => setNotice("You are viewing sample notifications.")}>
              <Bell size={18} /><span />
            </button>
            <div className="top-profile">DM</div>
          </div>
        </header>

        <div className="dashboard-content">
          {notice && (
            <div className="dashboard-notice">
              <span>{notice}</span>
              <button onClick={() => setNotice("")} aria-label="Dismiss message"><X size={16} /></button>
            </div>
          )}

          <div className="dashboard-heading-row">
            <div>
              <div className="dashboard-date"><CalendarDays size={15} /> PROJECT PORTFOLIO · 25 OCT 2026</div>
              <h1>{activeTab === "Overview" ? "Good morning, Manager" : activeTab}</h1>
              <p>
                {activeTab === "Overview"
                  ? "Here’s what’s happening across your construction portfolio."
                  : `Review your ${activeTab.toLowerCase()} in the BuildWise demo workspace.`}
              </p>
            </div>
            <div className="dashboard-heading-actions">
              <button className="dashboard-secondary-button" onClick={exportReport}><Download size={16} /> Export report</button>
              <button className="dashboard-primary-button" onClick={() => setShowNewProject(true)}><Plus size={17} /> New project</button>
            </div>
          </div>

          {activeTab === "Overview" && (
            <>
              <div className="dashboard-welcome">
                <div className="welcome-copy">
                  <span className="welcome-eyebrow"><Activity size={15} /> YOUR PORTFOLIO AT A GLANCE</span>
                  <h2>Better visibility.<br /><span>Better project decisions.</span></h2>
                  <p>Monitor progress, identify attention areas, and keep project information connected.</p>
                  <button onClick={() => setActiveTab("Projects")} className="welcome-link">Explore your projects <ArrowRight size={16} /></button>
                </div>
                <div className="welcome-art">
                  <div className="art-circle art-circle-one" />
                  <div className="art-circle art-circle-two" />
                  <div className="art-building">
                    <div className="building-roof" />
                    <div className="building-floor"><i /><i /><i /></div>
                    <div className="building-floor"><i /><i /><i /></div>
                    <div className="building-floor"><i /><i /><i /></div>
                    <div className="building-base" />
                  </div>
                  <div className="art-status"><CheckCircle2 size={15} /> Progress overview</div>
                </div>
              </div>

              <div className="dashboard-stats">
                <article className="stat-card">
                  <div className="stat-top"><span>Active projects</span><span className="stat-icon green"><Building2 size={18} /></span></div>
                  <div className="stat-value">{projectList.length.toString().padStart(2, "0")}</div>
                  <div className="stat-foot"><span className="stat-positive"><ArrowUpRight size={14} /> Portfolio</span> <span>sample projects</span></div>
                </article>
                <article className="stat-card">
                  <div className="stat-top"><span>Average progress</span><span className="stat-icon blue"><TrendingUp size={18} /></span></div>
                  <div className="stat-value">{Math.round(projectList.reduce((sum, p) => sum + p.progress, 0) / Math.max(projectList.length, 1))}%</div>
                  <div className="stat-foot"><span className="stat-neutral"><Activity size={14} /> Live demo data</span></div>
                </article>
                <article className="stat-card">
                  <div className="stat-top"><span>Site observations</span><span className="stat-icon orange"><HardHat size={18} /></span></div>
                  <div className="stat-value">04</div>
                  <div className="stat-foot"><span className="stat-warning"><CircleAlert size={14} /> 1 needs review</span></div>
                </article>
                <article className="stat-card">
                  <div className="stat-top"><span>Portfolio budget</span><span className="stat-icon purple"><Wallet size={18} /></span></div>
                  <div className="stat-value stat-currency">₹8.8 Cr</div>
                  <div className="stat-foot"><span className="stat-neutral"><DollarSign size={14} /> Sample figures</span></div>
                </article>
              </div>

              <div className="dashboard-chart-grid">
                <section className="dashboard-panel progress-panel">
                  <div className="panel-heading">
                    <div><h3>Construction progress</h3><p>Planned versus actual delivery</p></div>
                    <button className="panel-filter" onClick={() => setNotice("Showing sample progress data for May–November 2026.")}>This period <ChevronDown size={14} /></button>
                  </div>
                  <div className="chart-legend"><span><i className="legend-planned" /> Planned</span><span><i className="legend-actual" /> Actual</span></div>
                  <div className="progress-chart">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={progressData} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="actualFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3d7658" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#3d7658" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid stroke="#edf0eb" strokeDasharray="4 5" vertical={false} />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#89928b", fontSize: 11 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: "#89928b", fontSize: 11 }} tickFormatter={(value) => `${value}%`} />
                        <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e8ece5", fontSize: 12 }} formatter={(value) => [`${value}%`]} />
                        <Area type="monotone" dataKey="planned" stroke="#b5bdb5" strokeWidth={2} strokeDasharray="5 5" fill="transparent" name="Planned" />
                        <Area type="monotone" dataKey="actual" stroke="#3d7658" strokeWidth={2.5} fill="url(#actualFill)" name="Actual" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="chart-footnote"><span><span className="chart-footnote-dot" /> Data shown is illustrative</span><span>Updated for demo</span></div>
                </section>

                <section className="dashboard-panel attention-panel">
                  <div className="panel-heading"><div><h3>Needs attention</h3><p>Items to review across the portfolio</p></div><span className="attention-count">02</span></div>
                  <div className="attention-item">
                    <span className="attention-icon orange"><ShieldCheck size={17} /></span>
                    <div><strong>Safety observation</strong><p>Northgate Commercial Hub</p><span className="attention-tag">Review recommended</span></div>
                    <ArrowRight size={16} />
                  </div>
                  <div className="attention-item">
                    <span className="attention-icon blue"><CalendarDays size={17} /></span>
                    <div><strong>Schedule checkpoint</strong><p>Riverside Residences</p><span className="attention-tag neutral-tag">Upcoming milestone</span></div>
                    <ArrowRight size={16} />
                  </div>
                  <button className="attention-footer" onClick={() => setActiveTab("Site intelligence")}>View site intelligence <ArrowRight size={15} /></button>
                </section>
              </div>
            </>
          )}

          {(activeTab === "Overview" || activeTab === "Projects") && (
            <section className="dashboard-panel projects-panel">
              <div className="panel-heading">
                <div><h3>{activeTab === "Overview" ? "Project portfolio" : "All projects"}</h3><p>Progress and status across your current projects</p></div>
                <button className="text-action" onClick={() => setActiveTab("Projects")}> {activeTab === "Overview" ? "View all projects" : "Portfolio overview"} <ArrowRight size={15} /></button>
              </div>
              <div className="project-table-wrap">
                <table className="project-table">
                  <thead><tr><th>PROJECT</th><th>LOCATION</th><th>PROGRESS</th><th>STATUS</th><th>BUDGET</th></tr></thead>
                  <tbody>
                    {filteredProjects.map((project) => (
                      <tr key={`${project.name}-${project.location}`}>
                        <td><div className="project-name-cell"><span className="project-mini-icon"><Building2 size={17} /></span><span><strong>{project.name}</strong><small>{project.type}</small></span></div></td>
                        <td><span className="project-location"><MapPin size={14} />{project.location}</span></td>
                        <td><div className="project-progress-cell"><div className="mini-progress"><span style={{ width: `${project.progress}%` }} /></div><span>{project.progress}%</span></div></td>
                        <td><span className={`project-status ${project.status === "At risk" ? "status-risk" : project.status === "Planning" ? "status-planning" : "status-track"}`}><i />{project.status}</span></td>
                        <td className="budget-cell">{project.budget}</td>
                      </tr>
                    ))}
                    {filteredProjects.length === 0 && <tr><td colSpan="5" className="empty-projects">No matching projects found.</td></tr>}
                  </tbody>
                </table>
              </div>
              <div className="table-footer"><span>Showing {filteredProjects.length} of {projectList.length} projects</span><span>Illustrative demo portfolio</span></div>
            </section>
          )}

          {activeTab === "Site intelligence" && (
            <section className="dashboard-panel detail-panel">
              <div className="panel-heading"><div><h3>Site intelligence</h3><p>Review site observations and image-analysis readiness.</p></div><span className="attention-count">01</span></div>
              <div className="site-review-card">
                <span className="attention-icon orange"><ShieldCheck size={20} /></span>
                <div><strong>Northgate Commercial Hub</strong><p>Sample safety observation awaiting human review.</p><span className="project-status status-risk"><i /> Review recommended</span></div>
              </div>
              <p className="site-safety-note">Image-based AI analysis depends on an active model API configuration. This dashboard uses illustrative records and does not provide certified safety or structural assessments.</p>
              <button className="dashboard-primary-button" onClick={() => setNotice("Image analysis is available through the backend API when its model API access is configured.")}> <ShieldCheck size={16} /> Check analysis setup</button>
            </section>
          )}

          
          {[
            {
              name: "Site Safety",
              title: "Construction site safety",
              description: "Review visible site hazards and recommended precautions.",
              items: [
  "Upload a site photo for analysis",
  "Review detected hazards and severity",
  "View recommendations and limitations",
],
            },
            {
              name: "Crack Analysis",
              title: "Crack inspection workspace",
              description: "Organise visual observations of suspected cracks for further review.",
              items: ["Upload a wall or structure photo", "Record crack observations", "Identify when a professional inspection is needed"],
            },
            {
              name: "Project Planning",
              title: "Project planning",
              description: "A planning workspace for milestones, estimates and delivery tracking.",
              items: ["Define project milestones", "Review estimated material requirements", "Track planned versus actual progress"],
            },
            {
              name: "Property Valuation",
              title: "Property valuation",
              description: "Explore indicative property estimates using project and location inputs.",
              items: ["Enter property area and location", "Review estimated construction costs", "Compare assumptions and estimates"],
            },
            {
              name: "AI Assistant",
              title: "Construction AI assistant",
              description: "A dedicated place for construction-related questions and guidance.",
              items: ["Ask construction planning questions", "Understand common building terminology", "Review answers before acting on them"],
            },
            {
              name: "Weather Advisory",
              title: "Site weather advisory",
              description: "Review weather considerations relevant to outdoor construction work.",
              items: ["Check conditions before outdoor work", "Review rain and heat precautions", "Plan weather-sensitive activities"],
            },
            {
              name: "Knowledge Hub",
              title: "Construction knowledge hub",
              description: "A structured reference area for construction practices and project guidance.",
              items: ["Browse construction topics", "Review site safety guidance", "Organise useful project references"],
            },
          ].filter((module) => activeTab === module.name).map((module) => (
            <section className="dashboard-panel detail-panel" key={module.name}>
              <div className="panel-heading">
                <div>
                  <h3>{module.title}</h3>
                  <p>{module.description}</p>
                </div>
                  <span className="attention-count">DEMO</span>
              </div>

             {module.name === "Site Safety" ? (
  <div className="site-upload-workspace">
    <label className="site-upload-dropzone" htmlFor="site-image-upload">
      <ImagePlus size={30} />
      <strong>
        {selectedImage
          ? selectedImage.name
          : "Upload a construction site photo"}
      </strong>
      <span>JPG, PNG or WebP · Maximum 10 MB</span>
    </label>

    <input
      id="site-image-upload"
      type="file"
      accept="image/jpeg,image/png,image/webp"
      onChange={handleImageChange}
      hidden
    />

    {selectedImage && (
      <div className="site-image-preview">
        <img
          src={URL.createObjectURL(selectedImage)}
          alt="Selected construction site"
        />
        <button
          type="button"
          onClick={() => {
            setSelectedImage(null);
            setAnalysisResult(null);
            setAnalysisError("");
          }}
        >
          Remove image
        </button>
      </div>
    )}

    <button
      type="button"
      className="dashboard-primary-button"
      onClick={analyzeImage}
      disabled={!selectedImage || analysisLoading}
    >
      {analysisLoading ? (
        <>
          <LoaderCircle size={17} />
          Analyzing image...
        </>
      ) : (
        <>
          <ShieldCheck size={17} />
          Analyze photo
        </>
      )}
    </button>

    {analysisError && (
      <p className="site-analysis-error" role="alert">
        {analysisError}
      </p>
    )}

    {analysisResult && (
      <div className="site-analysis-result">
        <h4>Analysis summary</h4>
        <p>{analysisResult.summary}</p>

        <h4>Detected hazards</h4>
        {analysisResult.hazards?.length ? (
          analysisResult.hazards.map((hazard, index) => (
            <div className="site-review-card" key={index}>
              <div>
                <strong>{hazard.hazard_type}</strong>
                <p>{hazard.description}</p>
                <p>
                  <b>Severity:</b> {hazard.severity}
                </p>
                <p>
                  <b>Recommended action:</b>{" "}
                  {hazard.recommended_action}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p>No hazards were returned by the model.</p>
        )}

        {analysisResult.recommendations?.length > 0 && (
          <>
            <h4>Recommendations</h4>
            <ul>
              {analysisResult.recommendations.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </>
        )}

        {analysisResult.limitations?.length > 0 && (
          <>
            <h4>Limitations</h4>
            <ul>
              {analysisResult.limitations.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </>
        )}
      </div>
    )}

    <p className="site-safety-note">
      AI-generated observations are preliminary and do not replace
      a qualified construction safety or structural inspection.
    </p>
  </div>
) : (
  <div className="module-action-list">
    {module.items.map((item) => (
      <div className="site-review-card" key={item}>
        <span className="attention-icon green">
          <CheckCircle2 size={19} />
        </span>
        <div>
          <strong>{item}</strong>
          <p>
            Available as a planned workflow in this demo workspace.
          </p>
        </div>
      </div>
    ))}
  </div>
)}
               
                      

              <p className="site-safety-note">
                This workspace includes image upload and backend integration.
AI results require valid access to the configured model provider.
Weather data and valuation calculations are demo features and
are not connected to live data sources. Never use this demo
as a substitute for professional safety advice.
              </p>
            </section>
          ))}


          {activeTab === "Reports" && (
            <section className="dashboard-panel detail-panel">
              <div className="panel-heading"><div><h3>Project reports</h3><p>Export the current project portfolio as a CSV file.</p></div><Download size={20} /></div>
              <div className="report-export-card"><div className="report-file-icon"><ClipboardList size={24} /></div><div><strong>Project portfolio report</strong><p>Project names, locations, progress, status and budget</p></div><button className="dashboard-primary-button" onClick={exportReport}><Download size={16} /> Export CSV</button></div>
              <p className="site-safety-note">Report values are illustrative demo data. New projects added in this session are included in the export.</p>
            </section>
          )}

          <footer className="dashboard-footer">
            <span>© 2026 BuildWise AI</span>
            <span><span className="footer-status-dot" /> Demo workspace · Sample data</span>
            <span>Built for clearer construction decisions</span>
          </footer>
        </div>
      </section>

      {showNewProject && (
        <div className="project-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowNewProject(false); }}>
          <form className="project-modal" onSubmit={addProject}>
            <div className="project-modal-heading">
              <div><span className="section-label">PROJECT PORTFOLIO</span><h2>Add a project</h2><p>Create a project in this demo session.</p></div>
              <button type="button" className="dashboard-icon-button" aria-label="Close modal" onClick={() => setShowNewProject(false)}><X size={18} /></button>
            </div>
            <label htmlFor="new-project-name">Project name</label>
            <input id="new-project-name" value={projectName} onChange={(event) => setProjectName(event.target.value)} placeholder="e.g. Central Business Park" required />
            <label htmlFor="new-project-location">Project location</label>
            <input id="new-project-location" value={projectLocation} onChange={(event) => setProjectLocation(event.target.value)} placeholder="City, state" required />
            <div className="project-modal-actions">
              <button type="button" className="dashboard-secondary-button" onClick={() => setShowNewProject(false)}>Cancel</button>
              <button type="submit" className="dashboard-primary-button"><Plus size={16} /> Add project</button>
            </div>
            <p className="modal-disclaimer">Saved in browser memory for this session only.</p>
          </form>
        </div>
      )}
    </main>
  );
}

export default Dashboard;
