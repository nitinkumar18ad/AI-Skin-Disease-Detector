import { useState } from "react";
import {
  FiActivity,
  FiAlertTriangle,
  FiArrowRight,
  FiCheckCircle,
  FiCircle,
  FiClock,
  FiDroplet,
  FiImage,
  FiMenu,
  FiSearch,
  FiShield,
  FiStar,
  FiUploadCloud,
  FiX,
} from "react-icons/fi";
import { MdOutlineHealthAndSafety } from "react-icons/md";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Conditions", href: "#conditions" },
  { label: "Diagnosis", href: "#diagnosis", accent: true },
  { label: "Contact", href: "#contact" },
];

const features = [
  {
    title: "Clinical-style flow",
    description: "A focused upload experience that guides users from image selection to result.",
  },
  {
    title: "Privacy minded",
    description: "Your image stays inside your local app flow instead of jumping across tools.",
  },
  {
    title: "Confidence aware",
    description: "Low-confidence predictions are surfaced clearly instead of pretending certainty.",
  },
  {
    title: "Ready for extension",
    description: "The React UI is now structured for reports, history, doctor referrals, and more.",
  },
];

const conditions = [
  {
    title: "Acne",
    description: "Common condition causing pimples, clogged pores, and oily skin.",
    icon: FiActivity,
  },
  {
    title: "Eczema",
    description: "Inflammatory condition that often leads to dry, itchy, red skin.",
    icon: FiDroplet,
  },
  {
    title: "Psoriasis",
    description: "Rapid skin cell buildup that causes scaly and uncomfortable patches.",
    icon: FiShield,
  },
  {
    title: "Ringworm",
    description: "Fungal infection that appears as a circular rash with irritation.",
    icon: FiCircle,
  },
  {
    title: "Melanoma",
    description: "A serious skin cancer where early detection can make a major difference.",
    icon: FiAlertTriangle,
    danger: true,
  },
];

const scanSteps = [
  {
    title: "Upload",
    description: "Choose a clear lesion image with even lighting and minimal blur.",
    icon: FiUploadCloud,
  },
  {
    title: "Analyze",
    description: "SkinAI preprocesses the image and runs the trained classifier.",
    icon: FiSearch,
  },
  {
    title: "Review",
    description: "See the prediction, confidence score, and whether the result is low confidence.",
    icon: FiStar,
  },
];

const initialFormState = {
  name: "",
  email: "",
  message: "",
};

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [formData, setFormData] = useState(initialFormState);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [diagnosis, setDiagnosis] = useState(null);
  const [diagnosisError, setDiagnosisError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const year = new Date().getFullYear();
  const confidencePercent = diagnosis ? Math.round(diagnosis.confidence * 100) : 0;

  const closeMenu = () => setMenuOpen(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    window.alert("Thanks for reaching out. This form is now ready to connect to a backend.");
    setFormData(initialFormState);
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
    setDiagnosis(null);
    setDiagnosisError("");

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
      return;
    }

    setPreviewUrl("");
  };

  const handleDiagnosisSubmit = async (event) => {
    event.preventDefault();

    if (!selectedFile) {
      setDiagnosis(null);
      setDiagnosisError("Please choose a skin image before running a diagnosis.");
      return;
    }

    const requestData = new FormData();
    requestData.append("image", selectedFile);

    setIsSubmitting(true);
    setDiagnosis(null);
    setDiagnosisError("");

    try {
      const response = await fetch("/api/predict", {
        method: "POST",
        body: requestData,
      });

      const rawBody = await response.text();
      let payload = null;

      if (rawBody) {
        try {
          payload = JSON.parse(rawBody);
        } catch {
          throw new Error("Server returned an invalid response. Restart the backend and try again.");
        }
      }

      if (!response.ok) {
        throw new Error(payload?.error || `Prediction failed with status ${response.status}.`);
      }

      if (!payload) {
        throw new Error("Server returned an empty response. Restart the backend and try again.");
      }

      setDiagnosis(payload);
    } catch (error) {
      setDiagnosisError(error.message || "Prediction failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-shell">
      <div className="background-orb orb-one" aria-hidden="true" />
      <div className="background-orb orb-two" aria-hidden="true" />
      <div className="background-grid" aria-hidden="true" />

      <header className="site-header">
        <div className="container nav-row">
          <a className="brand" href="#home" onClick={closeMenu}>
            <MdOutlineHealthAndSafety className="brand-icon" />
            <span>SkinAI</span>
          </a>

          <button
            className="menu-toggle"
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <FiX /> : <FiMenu />}
          </button>

          <nav className={`nav-links ${menuOpen ? "nav-links-open" : ""}`}>
            {navLinks.map((link) => (
              <a
                key={link.label}
                className={link.accent ? "nav-link nav-link-accent" : "nav-link"}
                href={link.href}
                onClick={closeMenu}
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main>
        <section className="hero-section" id="home">
          <div className="container hero-grid">
            <div className="hero-copy">
              <p className="eyebrow">AI-Powered Dermatology</p>
              <h1>Make skin screening feel clearer, calmer, and more actionable.</h1>
              <p className="hero-text">
                SkinAI combines a trained lesion classifier with a guided interface that helps
                users upload, review, and understand results without bouncing between separate
                tools or clunky pages.
              </p>

              <div className="hero-actions">
                <a className="primary-button" href="#diagnosis">
                  Start Smart Scan
                  <FiArrowRight />
                </a>
                <a className="secondary-button" href="#about">
                  See How It Works
                </a>
              </div>

              <div className="hero-stats">
                <div className="stat-card">
                  <strong>7</strong>
                  <span>lesion classes</span>
                </div>
                <div className="stat-card">
                  <strong>Single Port</strong>
                  <span>frontend + backend</span>
                </div>
                <div className="stat-card">
                  <strong>Confidence-aware</strong>
                  <span>safer result framing</span>
                </div>
              </div>
            </div>

            <div className="hero-visual">
              <div className="hero-showcase">
                <div className="hero-panel hero-panel-main">
                  <img
                    src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1400&q=80"
                    alt="Medical technology illustration"
                  />
                  <div className="floating-note">
                    <span>Live Model Support</span>
                    <strong>Confidence-aware results</strong>
                  </div>
                </div>

                <div className="insight-card insight-card-top">
                  <FiClock />
                  <div>
                    <span>Fast review</span>
                    <strong>Upload to result in one flow</strong>
                  </div>
                </div>

                <div className="insight-card insight-card-bottom">
                  <FiStar />
                  <div>
                    <span>Designed for trust</span>
                    <strong>Clear status, preview, and confidence</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="info-section" id="about">
          <div className="container split-grid">
            <div className="image-card image-card-tall">
              <img
                src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1400&q=80"
                alt="Dermatology consultation"
              />
            </div>

            <div className="section-copy">
              <p className="section-tag">About SkinAI</p>
              <h2>Built to make skin screening approachable, informative, and visually reassuring.</h2>
              <p>
                Developed by students from <strong>JSS Academy of Technical Education</strong>,
                SkinAI now pairs your trained model with a richer React interface that feels
                less like a demo page and more like a real health product.
              </p>
              <div className="feature-grid">
                {features.map((feature) => (
                  <div className="feature-item feature-card" key={feature.title}>
                    <FiCheckCircle />
                    <div>
                      <strong>{feature.title}</strong>
                      <span>{feature.description}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="conditions-section" id="conditions">
          <div className="container">
            <div className="section-heading">
              <p className="section-tag">Common Conditions</p>
              <h2>Explore a few skin concerns SkinAI helps users understand earlier.</h2>
            </div>

            <div className="conditions-grid">
              {conditions.map((condition) => {
                const Icon = condition.icon;
                return (
                  <article
                    key={condition.title}
                    className={`condition-card ${condition.danger ? "condition-card-danger" : ""}`}
                  >
                    <div className="condition-icon">
                      <Icon />
                    </div>
                    <h3>{condition.title}</h3>
                    <p>{condition.description}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="diagnosis-section" id="diagnosis">
          <div className="container">
            <div className="section-heading diagnosis-heading">
              <p className="section-tag">Interactive Diagnosis</p>
              <h2>A smoother scan experience with live preview, upload guidance, and clearer results.</h2>
            </div>

            <div className="scan-steps">
              {scanSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div className="step-card" key={step.title}>
                    <div className="step-badge">{index + 1}</div>
                    <Icon className="step-icon" />
                    <strong>{step.title}</strong>
                    <span>{step.description}</span>
                  </div>
                );
              })}
            </div>

            <div className="diagnosis-grid">
              <div className="diagnosis-panel">
                <div className="diagnosis-panel-header">
                  <div>
                    <p className="panel-label">Model Scan</p>
                    <h3>Upload a lesion image</h3>
                  </div>
                  <div className="live-chip">
                    <FiStar />
                    <span>Single-server flow</span>
                  </div>
                </div>

                <form className="diagnosis-form" onSubmit={handleDiagnosisSubmit}>
                  <label className={`upload-box ${selectedFile ? "upload-box-active" : ""}`} htmlFor="diagnosis-image">
                    <FiImage />
                    <div>
                      <strong>{selectedFile ? selectedFile.name : "Choose a JPG or PNG image"}</strong>
                      <span>Use a clear, well-lit image for a more reliable result.</span>
                    </div>
                  </label>
                  <input
                    id="diagnosis-image"
                    className="file-input"
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    onChange={handleFileChange}
                  />

                  <button className="primary-button full-width" type="submit" disabled={isSubmitting}>
                    <FiSearch />
                    {isSubmitting ? "Analyzing..." : "Run Diagnosis"}
                  </button>
                </form>

                {diagnosisError ? <p className="status-message status-error">{diagnosisError}</p> : null}

                {diagnosis ? (
                  <div className={`result-card ${diagnosis.belowThreshold ? "result-card-warning" : "result-card-success"}`}>
                    <div className="result-topline">
                      <p className="result-label">
                        {diagnosis.belowThreshold ? "Low-confidence result" : "Prediction"}
                      </p>
                      <span className="confidence-pill">{confidencePercent}% confidence</span>
                    </div>

                    <h3>{diagnosis.prediction}</h3>
                    <p className="result-description">
                      {diagnosis.belowThreshold
                        ? "The model confidence is below the threshold, so this result should be treated cautiously."
                        : "The model returned a confident class prediction for the uploaded image."}
                    </p>

                    <div className="confidence-meter">
                      <div className="confidence-meter-track">
                        <div
                          className="confidence-meter-fill"
                          style={{ width: `${confidencePercent}%` }}
                        />
                      </div>
                      <div className="confidence-scale">
                        <span>0%</span>
                        <span>Confidence</span>
                        <span>100%</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="result-card result-card-empty">
                    <p className="result-label">Awaiting Scan</p>
                    <h3>No result yet</h3>
                    <p className="result-description">
                      Upload an image and start the scan to see the prediction and confidence here.
                    </p>
                  </div>
                )}
              </div>

              <div className="preview-panel">
                <div className="preview-panel-header">
                  <div>
                    <p className="panel-label">Preview</p>
                    <h3>Image workspace</h3>
                  </div>
                </div>

                {previewUrl ? (
                  <div className="preview-stage">
                    <img className="preview-image" src={previewUrl} alt="Selected skin lesion preview" />
                    <div className="preview-overlay">
                      <div className="preview-overlay-card">
                        <FiCheckCircle />
                        <span>Image loaded and ready for analysis</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="preview-placeholder">
                    <FiImage />
                    <strong>Drop in a lesion image</strong>
                    <p>Your selected image preview will appear here before the model runs.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="contact-section" id="contact">
          <div className="container contact-grid">
            <div className="contact-panel">
              <p className="section-tag">Contact Us</p>
              <h2>Have feedback, questions, or plans to extend the platform?</h2>
              <p>
                The UI is now structured so you can grow it into appointment booking,
                doctor referrals, result history, or follow-up recommendation flows.
              </p>

              <form className="contact-form" onSubmit={handleSubmit}>
                <input
                  className="form-input"
                  name="name"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={handleChange}
                />
                <input
                  className="form-input"
                  name="email"
                  type="email"
                  placeholder="Your Email"
                  value={formData.email}
                  onChange={handleChange}
                />
                <textarea
                  className="form-input form-textarea"
                  name="message"
                  placeholder="Message"
                  value={formData.message}
                  onChange={handleChange}
                />
                <button className="primary-button full-width" type="submit">
                  Send Message
                </button>
              </form>
            </div>

            <div className="map-panel">
              <iframe
                title="JSS Academy of Technical Education location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d9249.830642220888!2d77.50072640228481!3d12.902917198105028!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae15a006e15e11%3A0xa3427875cea82218!2sJSS%20Academy%20Of%20Technical%20Education!5e0!3m2!1sen!2sin"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container footer-grid">
          <div>
            <a className="brand footer-brand" href="#home">
              <MdOutlineHealthAndSafety className="brand-icon" />
              <span>SkinAI</span>
            </a>
            <p>
              Empowering earlier awareness with AI-driven skin health support and a calmer
              first step toward care.
            </p>
          </div>

          <div>
            <h3>Quick Links</h3>
            <div className="footer-links">
              <a href="#home">Home</a>
              <a href="#about">About</a>
              <a href="#diagnosis">Diagnosis</a>
            </div>
          </div>

          <div>
            <h3>Contact</h3>
            <p>Bengaluru, India</p>
            <p>skinai@jssateb.ac.in</p>
          </div>
        </div>

        <div className="container footer-bottom">
          <p>&copy; {year} SkinAI | JSSATEB Students</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
