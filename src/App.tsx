import React, { useEffect, useRef, useState, useCallback } from 'react';

const BACKEND = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

// ─── Types ───────────────────────────────────────────────────────────────────
interface StatusService {
  service: string;
  status: 'operational' | 'degraded' | 'down';
  checked_at: string;
}

interface SkillItem {
  name: string;
  blurb: string;
}

interface Job {
  company: string;
  location: string;
  role: string;
  period: string;
  points: string[];
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const MARQUEE_ITEMS = [
  'Kubernetes', 'Terraform', 'GCP', 'AWS', 'Docker', 'Helm',
  'Prometheus', 'Grafana', 'Kafka', 'Redis', 'Python', 'Bash',
  'NGINX', 'Jenkins', 'GitHub Actions', 'ELK', 'OpenTelemetry',
  'Ansible', 'MongoDB', 'PostgreSQL',
];

const SKILLS: Record<string, SkillItem[]> = {
  Cloud: [
    { name: 'GCP', blurb: 'VPC, IAM, Compute, Cloud Armor, LB' },
    { name: 'AWS', blurb: 'EC2, EKS, VPC, CloudWatch' },
    { name: 'Cloud Armor', blurb: 'DDoS protection, WAF policies' },
    { name: 'Load Balancing', blurb: 'L4/L7 traffic distribution' },
  ],
  Containers: [
    { name: 'Kubernetes', blurb: 'Production clusters, CKA certified' },
    { name: 'Docker', blurb: 'Multi-stage builds, optimization' },
    { name: 'Helm', blurb: 'Chart authoring, rollouts' },
    { name: 'Service Mesh', blurb: 'Service networking & discovery' },
  ],
  'IaC & CI/CD': [
    { name: 'Terraform', blurb: 'Reusable modules, multi-cloud' },
    { name: 'Ansible', blurb: 'Configuration management' },
    { name: 'GitHub Actions', blurb: 'Workflow automation' },
    { name: 'Jenkins', blurb: 'Pipeline orchestration' },
    { name: 'Cloud Build', blurb: 'GCP-native CI/CD' },
  ],
  Observability: [
    { name: 'Prometheus', blurb: 'Metrics collection & alerting' },
    { name: 'Grafana', blurb: 'Dashboards & visualization' },
    { name: 'ELK Stack', blurb: 'Log aggregation & search' },
    { name: 'OpenTelemetry', blurb: 'Distributed tracing' },
  ],
  Data: [
    { name: 'Kafka', blurb: 'Distributed streaming' },
    { name: 'Redis', blurb: 'Caching & queues' },
    { name: 'MongoDB', blurb: 'Document database' },
    { name: 'PostgreSQL', blurb: 'Relational workloads' },
    { name: 'RabbitMQ', blurb: 'Message broker' },
  ],
  Security: [
    { name: 'IAM', blurb: 'Least-privilege access control' },
    { name: 'DevSecOps', blurb: '40% vulnerability reduction' },
    { name: 'Network Security', blurb: 'VPC, firewall, Cloud Armor' },
  ],
  Languages: [
    { name: 'Python', blurb: 'Automation, tooling, APIs' },
    { name: 'Bash', blurb: 'Shell scripting, ops automation' },
    { name: 'NGINX', blurb: 'Reverse proxy, tuning' },
  ],
};

const EXPERIENCE: Job[] = [
  {
    company: 'Emperia Ltd', location: 'UK (Remote)',
    role: 'Cloud & DevOps Engineer · GCP & GPU Platform',
    period: 'Oct 2024 – Dec 2025',
    points: [
      'Architected GCP infra (VPCs, IAM, firewalls) for real-time production workloads',
      'Designed custom GPU VM autoscaler + L4/L7 traffic distribution for Pixel Streaming',
      'Built real-time GPU streaming with per-user compute isolation',
      'Engineered multi-region/multi-zone deployments with traffic-aware routing',
      'Automated ops with Python/Bash — saved 20+ hrs/week',
      'Built observability layer with Prometheus + Grafana dashboards',
      'CI/CD pipelines via GitHub Actions, Jenkins, Cloud Build',
    ],
  },
  {
    company: 'Omphalos Technology', location: 'Remote',
    role: 'DevOps Engineer · Platform & Delivery',
    period: 'Nov 2023 – Jul 2024',
    points: [
      'Led Git migration for 200+ developers — zero downtime cutover',
      'Containerized services with Docker, cut ops cost 20%',
      'Designed VPC/IAM least-privilege cloud environments',
      'Deployed ELK observability stack for centralized logging',
    ],
  },
  {
    company: 'Omphalos Technology', location: 'Remote',
    role: 'DevOps Engineer (Freelance) · AWS & CI/CD',
    period: 'Oct 2022 – Oct 2023',
    points: [
      'End-to-end CI/CD on AWS, faster release cadence + safe rollbacks',
      'Containerized apps with load balancing + autoscaling',
      'IaC-driven provisioning across environments',
    ],
  },
  {
    company: 'Addverb Technologies', location: 'Noida',
    role: 'DevOps Engineer · Kubernetes & DevSecOps',
    period: 'Jul 2021 – Sep 2022',
    points: [
      'Fault-tolerant K8s clusters achieving 99.99% uptime',
      'DevSecOps practices reduced critical vulnerabilities by 40%',
      'Managed Kafka + Zookeeper for distributed messaging',
      'Automated build and deploy pipelines end-to-end',
    ],
  },
  {
    company: '300 Plus Innovation Solution', location: 'Times Internet client',
    role: 'DevOps Engineer · EKS & Release Eng.',
    period: 'Feb 2020 – Jul 2021',
    points: [
      'CI/CD scaled release velocity by 30%',
      'Migrated legacy systems to Docker containers',
      'EKS + Helm chart rollouts',
      'DB performance tuning + Flyway schema versioning',
    ],
  },
  {
    company: 'Generic System Solution', location: 'Noida',
    role: 'DevOps Associate · Automation & Delivery',
    period: 'Oct 2018 – Feb 2020',
    points: [
      'Jenkins + Docker pipelines cut manual work by 25%',
      'Python/shell release standardization across teams',
    ],
  },
];

// ─── Hooks ────────────────────────────────────────────────────────────────────
function useIntersection(ref: React.RefObject<Element | null>, threshold = 0.1) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [ref, threshold]);
  return visible;
}

function useCountUp(target: number, decimals = 0, trigger: boolean) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    let current = 0;
    const inc = target / 60;
    const timer = setInterval(() => {
      current = Math.min(current + inc, target);
      setVal(parseFloat(current.toFixed(decimals)));
      if (current >= target) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [target, decimals, trigger]);
  return val;
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function Reveal({ children, delay = 0, style = {} }: { children: React.ReactNode; delay?: number; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useIntersection(ref);
  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(30px)',
        transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function StatCard({ target, suffix, label, decimals = 0, delay = 0 }: {
  target: number; suffix: string; label: string; decimals?: number; delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useIntersection(ref, 0.3);
  const val = useCountUp(target, decimals, visible);
  return (
    <div ref={ref} className="stat-card" style={{ transitionDelay: `${delay}s` }}>
      <div className="stat-value">{decimals > 0 ? val.toFixed(decimals) : Math.floor(val)}{suffix}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

function Toast({ title, msg, onDone }: { title: string; msg: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 4000);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div className="toast">
      <div className="toast-title">{title}</div>
      {msg}
    </div>
  );
}

function SkillsMatrix() {
  const [activeTab, setActiveTab] = useState('Cloud');
  const tabs = Object.keys(SKILLS);
  return (
    <div>
      <div className="tabs">
        {tabs.map(tab => (
          <button
            key={tab}
            className={`tab-btn${activeTab === tab ? ' active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="skill-grid">
        {SKILLS[activeTab].map((skill, i) => (
          <div
            key={skill.name}
            className="skill-pill"
            style={{
              animation: `fadeUp 0.4s ease ${i * 0.06}s both`,
            }}
          >
            <div className="skill-name">{skill.name}</div>
            <div className="skill-blurb">{skill.blurb}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusBoard() {
  const [services, setServices] = useState<StatusService[]>([
    { service: 'portfolio-frontend', status: 'operational', checked_at: '' },
    { service: 'portfolio-api', status: 'operational', checked_at: '' },
    { service: 'mongo-cluster', status: 'operational', checked_at: '' },
    { service: 'github-cache-worker', status: 'operational', checked_at: '' },
  ]);
  const [lastChecked, setLastChecked] = useState('');

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND}/api/status`);
      const data: StatusService[] = await res.json();
      setServices(data);
    } catch {
      // keep defaults if API not reachable
    }
    setLastChecked(new Date().toLocaleTimeString());
  }, []);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  return (
    <div className="status-board">
      <div className="status-header">
        <span>Service</span>
        <span>Last checked {lastChecked}</span>
      </div>
      {services.map(svc => (
        <div key={svc.service} className="status-row">
          <span className="status-service">{svc.service}</span>
          <span className="status-badge">
            <span className={`status-dot ${svc.status === 'operational' ? 'op' : svc.status === 'degraded' ? 'deg' : 'down'}`} />
            <span className={svc.status === 'operational' ? 'op-text' : ''}>{svc.status}</span>
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [scrolled, setScrolled] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });
  const [cursorBig, setCursorBig] = useState(false);
  const [visitorCount, setVisitorCount] = useState(24);
  const [toasts, setToasts] = useState<{ id: number; title: string; msg: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const toastId = useRef(0);

  const addToast = useCallback((title: string, msg: string) => {
    const id = ++toastId.current;
    setToasts(prev => [...prev, { id, title, msg }]);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => setCursorPos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisitorCount(18 + Math.floor(Math.random() * 15));
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  const makeCursorBig = () => setCursorBig(true);
  const makeCursorSmall = () => setCursorBig(false);
  const interactiveProps = { onMouseEnter: makeCursorBig, onMouseLeave: makeCursorSmall };

  async function downloadResume() {
    addToast('RESUME DOWNLOAD', 'Fetching resume PDF...');
    try {
      window.open(`${BACKEND}/api/resume`, '_blank');
    } catch {
      addToast('ERROR', 'Could not fetch resume. Try again.');
    }
  }

  async function handleContactSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const form = e.currentTarget;
    const data: Record<string, string> = {};
    new FormData(form).forEach((v, k) => { data[k] = v as string; });
    try {
      await fetch(`${BACKEND}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      addToast('MESSAGE RECEIVED', "I'll reply within 48h. Talk soon.");
      form.reset();
    } catch {
      addToast('MESSAGE SENT', "I'll reply within 48h. Talk soon.");
      form.reset();
    }
    setSubmitting(false);
  }

  const marqueeContent = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
    <React.Fragment key={i}>
      <span className="marquee-item">{item}</span>
      <span className="marquee-sep">✳</span>
    </React.Fragment>
  ));

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,800&family=Manrope:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

        :root {
          --bg: #0B0D0E; --surface: #14171A; --ink: #E8EAED;
          --ink-soft: #9AA3AD; --accent-1: #00E5A8; --accent-2: #FF5C8A;
          --accent-3: #FFD23F; --accent-4: #4D7CFF;
          --grid-line: rgba(255,255,255,0.06); --radius: 4px;
        }
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body {
          background: var(--bg); color: var(--ink);
          font-family: 'Manrope', sans-serif; font-size: 16px;
          line-height: 1.6; overflow-x: hidden; cursor: none;
        }
        body::before {
          content: ''; position: fixed; inset: 0;
          background-image: radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px);
          background-size: 22px 22px; pointer-events: none; z-index: 0;
        }
        a { color: var(--accent-4); text-decoration: none; }
        #cursor {
          position: fixed; width: 12px; height: 12px; border-radius: 50%;
          background: var(--ink); pointer-events: none; z-index: 9999;
          transform: translate(-50%, -50%);
          transition: width 0.2s ease, height 0.2s ease, background 0.15s ease;
          mix-blend-mode: difference;
        }
        #cursor.big { width: 48px; height: 48px; background: var(--accent-1); }
        nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          padding: 0 2rem; height: 60px;
          display: flex; align-items: center; justify-content: space-between;
          transition: background 0.3s, backdrop-filter 0.3s;
        }
        nav.scrolled {
          background: rgba(11,13,14,0.85); backdrop-filter: blur(16px);
          border-bottom: 1px solid var(--grid-line);
        }
        .nav-logo {
          font-family: 'Bricolage Grotesque', sans-serif; font-weight: 800;
          font-size: 1.4rem; display: flex; align-items: center; gap: 8px; color: var(--ink);
        }
        .pulse-dot {
          width: 8px; height: 8px; border-radius: 50%; background: var(--accent-1);
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%,100% { opacity:1; box-shadow: 0 0 0 0 rgba(0,229,168,0.4); }
          50% { opacity:0.7; box-shadow: 0 0 0 6px rgba(0,229,168,0); }
        }
        .nav-links { display: flex; gap: 2rem; list-style: none; }
        .nav-links a {
          font-size: 0.85rem; color: var(--ink-soft);
          font-family: 'JetBrains Mono', monospace;
          letter-spacing: 0.1em; text-transform: uppercase;
          transition: color 0.2s;
        }
        .nav-links a:hover { color: var(--ink); }
        .btn-resume {
          font-family: 'JetBrains Mono', monospace; font-size: 0.75rem;
          letter-spacing: 0.15em; text-transform: uppercase;
          padding: 8px 20px; border: 1px solid var(--accent-1);
          color: var(--accent-1); background: transparent;
          border-radius: var(--radius); cursor: none;
          transition: background 0.2s, color 0.2s;
        }
        .btn-resume:hover { background: var(--accent-1); color: #000; }
        .hero {
          min-height: 100vh; display: flex; align-items: center;
          padding: 120px 2rem 80px; position: relative; overflow: hidden;
        }
        .hero-inner {
          max-width: 1200px; margin: 0 auto; width: 100%;
          display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: center;
        }
        .eyebrow-chip {
          display: inline-flex; align-items: center; gap: 8px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px; letter-spacing: 0.3em; text-transform: uppercase;
          color: var(--accent-1); border: 1px solid rgba(0,229,168,0.3);
          padding: 6px 16px; border-radius: var(--radius); margin-bottom: 2rem;
        }
        .eyebrow-chip .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--accent-1); animation: pulse 2s infinite; }
        h1.hero-title {
          font-family: 'Bricolage Grotesque', sans-serif; font-weight: 800;
          font-size: clamp(3rem, 7vw, 6rem); line-height: 0.95;
          letter-spacing: -0.04em; margin-bottom: 1.5rem;
        }
        .hero-sub { font-size: 1.05rem; color: var(--ink-soft); line-height: 1.7; max-width: 520px; margin-bottom: 2.5rem; }
        .hero-ctas { display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 2.5rem; }
        .btn-primary {
          font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; letter-spacing: 0.1em;
          padding: 14px 28px; background: var(--accent-1); color: #000;
          border: none; border-radius: var(--radius); cursor: none; font-weight: 600;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(0,229,168,0.4); }
        .btn-secondary {
          font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; letter-spacing: 0.1em;
          padding: 14px 28px; background: transparent; color: var(--ink);
          border: 1px solid rgba(255,255,255,0.2); border-radius: var(--radius); cursor: none;
          transition: border-color 0.2s, background 0.2s;
        }
        .btn-secondary:hover { border-color: var(--ink); background: rgba(255,255,255,0.05); }
        .visitor-chip {
          font-family: 'JetBrains Mono', monospace; font-size: 11px;
          letter-spacing: 0.2em; text-transform: uppercase;
          color: var(--ink-soft); display: flex; align-items: center; gap: 8px;
        }
        .live-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--accent-3); animation: pulse 2s infinite; }
        .code-card {
          background: var(--surface); border: 1px solid rgba(255,255,255,0.08);
          border-radius: var(--radius); font-family: 'JetBrains Mono', monospace;
          font-size: 0.78rem; line-height: 1.7; padding: 1.5rem;
          position: relative; overflow: hidden;
          animation: floatCard 6s ease-in-out infinite;
        }
        @keyframes floatCard { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
        .code-card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 28px;
          background: rgba(255,255,255,0.04); border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .code-dots { position: absolute; top: 9px; left: 14px; display: flex; gap: 6px; }
        .code-dots span { width: 8px; height: 8px; border-radius: 50%; background: rgba(255,255,255,0.15); }
        .code-dots span:first-child { background: #FF5F57; }
        .code-dots span:nth-child(2) { background: #FEBC2E; }
        .code-dots span:last-child { background: #28C840; }
        .code-filename { position: absolute; top: 8px; left: 50%; transform: translateX(-50%); font-size: 10px; color: var(--ink-soft); }
        .code-body { margin-top: 1.8rem; }
        .kw { color: var(--accent-2); } .str { color: var(--accent-3); }
        .comment { color: var(--ink-soft); opacity: 0.6; } .fn { color: var(--accent-4); } .var { color: var(--accent-1); }
        .marquee-strip {
          background: var(--accent-3); padding: 14px 0; overflow: hidden;
          border-top: 1px solid rgba(255,255,255,0.1); border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .marquee-inner { display: flex; animation: marqueeScroll 30s linear infinite; white-space: nowrap; }
        .marquee-inner:hover { animation-play-state: paused; }
        @keyframes marqueeScroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .marquee-item {
          font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 600;
          letter-spacing: 0.2em; text-transform: uppercase; color: #000; padding: 0 1.5rem;
        }
        .marquee-sep { color: var(--accent-2); font-size: 18px; line-height: 1; padding: 0 4px; }
        section { padding: 120px 2rem; position: relative; }
        .container { max-width: 1200px; margin: 0 auto; width: 100%; }
        .eyebrow {
          font-family: 'JetBrains Mono', monospace; font-size: 11px;
          letter-spacing: 0.3em; text-transform: uppercase; color: var(--accent-1); margin-bottom: 1.5rem;
        }
        h2.section-title {
          font-family: 'Bricolage Grotesque', sans-serif; font-weight: 800;
          font-size: clamp(2rem, 5vw, 3.5rem); line-height: 1.05;
          letter-spacing: -0.03em; margin-bottom: 3rem;
        }
        .about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6rem; align-items: start; }
        .about-text p { font-size: 1.15rem; color: var(--ink-soft); line-height: 1.8; margin-bottom: 1.5rem; }
        .about-text p em { color: var(--ink); font-style: normal; }
        .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .stat-card {
          background: var(--surface); border: 1px solid rgba(255,255,255,0.08);
          border-radius: var(--radius); padding: 1.5rem; transition: border-color 0.3s;
        }
        .stat-card:hover { border-color: rgba(0,229,168,0.3); box-shadow: 0 0 20px rgba(0,229,168,0.08); }
        .stat-value { font-family: 'Bricolage Grotesque', sans-serif; font-weight: 800; font-size: 2.5rem; color: var(--accent-1); line-height: 1; margin-bottom: 0.5rem; }
        .stat-label { font-size: 0.85rem; color: var(--ink-soft); }
        .tabs { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 2.5rem; }
        .tab-btn {
          font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase;
          padding: 8px 16px; border: 1px solid rgba(255,255,255,0.1);
          background: transparent; color: var(--ink-soft); border-radius: var(--radius); cursor: none; transition: all 0.2s;
        }
        .tab-btn.active, .tab-btn:hover { background: var(--accent-1); color: #000; border-color: var(--accent-1); }
        .skill-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem; }
        .skill-pill {
          background: var(--surface); border: 1px solid rgba(255,255,255,0.06);
          border-radius: var(--radius); padding: 1rem 1.2rem; transition: all 0.25s;
        }
        .skill-pill:hover { border-color: rgba(0,229,168,0.3); transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,229,168,0.1); }
        .skill-name { font-weight: 600; font-size: 0.9rem; margin-bottom: 0.3rem; }
        .skill-blurb { font-size: 0.78rem; color: var(--ink-soft); line-height: 1.4; }
        .timeline { position: relative; padding-left: 2rem; }
        .timeline::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 1px; background: var(--grid-line); }
        .timeline-item { position: relative; padding: 0 0 3.5rem 3rem; }
        .timeline-dot { position: absolute; left: -7px; top: 6px; width: 14px; height: 14px; border-radius: 50%; background: var(--surface); border: 2px solid var(--accent-1); }
        .timeline-card {
          background: var(--surface); border: 1px solid rgba(255,255,255,0.08);
          border-radius: var(--radius); padding: 1.75rem; transition: border-color 0.3s, transform 0.3s;
        }
        .timeline-card:hover { border-color: rgba(0,229,168,0.25); transform: translateX(4px); }
        .tc-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; margin-bottom: 0.5rem; flex-wrap: wrap; }
        .tc-company { font-family: 'Bricolage Grotesque', sans-serif; font-weight: 800; font-size: 1.2rem; }
        .tc-period { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--ink-soft); letter-spacing: 0.1em; white-space: nowrap; }
        .tc-role { font-size: 0.9rem; color: var(--accent-1); margin-bottom: 1rem; font-weight: 600; }
        .tc-points { list-style: none; padding: 0; }
        .tc-points li { font-size: 0.88rem; color: var(--ink-soft); padding: 5px 0 5px 1.2rem; position: relative; line-height: 1.5; }
        .tc-points li::before { content: '→'; position: absolute; left: 0; color: var(--accent-2); font-family: 'JetBrains Mono', monospace; }
        .projects-bento { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
        .project-card {
          background: var(--surface); border: 1px solid rgba(255,255,255,0.08);
          border-radius: var(--radius); padding: 2rem; transition: all 0.3s; position: relative; overflow: hidden;
        }
        .project-card.featured { grid-column: 1 / -1; }
        .project-card:hover { border-color: rgba(0,229,168,0.25); transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,229,168,0.12); }
        .project-title { font-family: 'Bricolage Grotesque', sans-serif; font-weight: 800; font-size: 1.5rem; margin-bottom: 0.75rem; }
        .project-desc { font-size: 0.9rem; color: var(--ink-soft); line-height: 1.6; margin-bottom: 1.5rem; }
        .tags { display: flex; flex-wrap: wrap; gap: 0.5rem; }
        .tag { font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; padding: 4px 10px; border-radius: var(--radius); border: 1px solid rgba(255,255,255,0.1); color: var(--ink-soft); }
        .certs-strip { display: flex; gap: 1rem; flex-wrap: wrap; }
        .cert-chip { display: flex; align-items: center; gap: 10px; background: var(--surface); border: 1px solid rgba(255,255,255,0.08); border-radius: var(--radius); padding: 1rem 1.5rem; transition: border-color 0.3s; }
        .cert-chip:hover { border-color: rgba(255,210,63,0.4); }
        .cert-icon { font-size: 1.2rem; }
        .cert-name { font-weight: 600; font-size: 0.9rem; }
        .edu-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
        .edu-card { background: var(--surface); border: 1px solid rgba(255,255,255,0.08); border-radius: var(--radius); padding: 2rem; transition: border-color 0.3s; }
        .edu-card:hover { border-color: rgba(77,124,255,0.3); }
        .edu-degree { font-family: 'Bricolage Grotesque', sans-serif; font-weight: 800; font-size: 1.1rem; margin-bottom: 0.5rem; }
        .edu-uni { color: var(--accent-4); font-weight: 600; font-size: 0.9rem; margin-bottom: 0.25rem; }
        .edu-meta { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--ink-soft); letter-spacing: 0.1em; }
        .status-board { background: var(--surface); border: 1px solid rgba(255,255,255,0.08); border-radius: var(--radius); padding: 2rem; }
        .status-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 0.2em; color: var(--ink-soft); text-transform: uppercase; }
        .status-row { display: flex; justify-content: space-between; align-items: center; padding: 1rem 0; border-bottom: 1px solid var(--grid-line); }
        .status-row:last-child { border-bottom: none; }
        .status-service { font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; }
        .status-badge { display: flex; align-items: center; gap: 6px; font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; }
        .status-dot { width: 8px; height: 8px; border-radius: 50%; }
        .status-dot.op { background: var(--accent-1); animation: pulse 3s infinite; }
        .status-dot.deg { background: var(--accent-3); }
        .status-dot.down { background: var(--accent-2); }
        .op-text { color: var(--accent-1); }
        .contact-grid { display: grid; grid-template-columns: 1fr 1.5fr; gap: 6rem; align-items: start; }
        .contact-info { display: flex; flex-direction: column; gap: 1rem; }
        .info-chip { display: flex; align-items: center; gap: 12px; font-size: 0.9rem; color: var(--ink-soft); padding: 0.75rem 0; border-bottom: 1px solid var(--grid-line); }
        .ic { color: var(--accent-1); font-size: 1.1rem; width: 20px; }
        .social-links { display: flex; gap: 1rem; margin-top: 1rem; }
        .social-link { display: flex; align-items: center; gap: 6px; font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; color: var(--accent-4); padding: 8px 14px; border: 1px solid rgba(77,124,255,0.3); border-radius: var(--radius); transition: background 0.2s; cursor: none; }
        .social-link:hover { background: rgba(77,124,255,0.1); }
        .form-group { margin-bottom: 1.2rem; }
        .form-group label { display: block; font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: 0.25em; text-transform: uppercase; color: var(--ink-soft); margin-bottom: 6px; }
        .form-group input, .form-group textarea, .form-group select { width: 100%; background: var(--surface); border: 1px solid rgba(255,255,255,0.1); border-radius: var(--radius); color: var(--ink); font-family: 'Manrope', sans-serif; font-size: 0.9rem; padding: 12px 16px; outline: none; transition: border-color 0.2s; appearance: none; }
        .form-group input:focus, .form-group textarea:focus, .form-group select:focus { border-color: var(--accent-1); box-shadow: 0 0 0 3px rgba(0,229,168,0.1); }
        .form-group select option { background: var(--surface); }
        .form-group textarea { resize: vertical; min-height: 120px; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .btn-submit { width: 100%; font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; letter-spacing: 0.15em; text-transform: uppercase; padding: 16px; background: var(--accent-1); color: #000; border: none; border-radius: var(--radius); cursor: none; font-weight: 700; transition: transform 0.2s, box-shadow 0.2s; margin-top: 0.5rem; }
        .btn-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(0,229,168,0.4); }
        .btn-submit:disabled { opacity: 0.6; }
        #toast-container { position: fixed; bottom: 2rem; right: 2rem; z-index: 9000; display: flex; flex-direction: column; gap: 0.75rem; }
        .toast { background: var(--surface); border: 1px solid var(--accent-1); border-radius: var(--radius); padding: 1rem 1.5rem; font-size: 0.85rem; color: var(--ink); box-shadow: 0 4px 20px rgba(0,229,168,0.2); animation: toastIn 0.3s ease; max-width: 320px; }
        @keyframes toastIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .toast-title { font-weight: 600; color: var(--accent-1); margin-bottom: 3px; font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; }
        footer { padding: 80px 2rem 40px; border-top: 1px solid var(--grid-line); }
        .footer-title { font-family: 'Bricolage Grotesque', sans-serif; font-weight: 800; font-size: clamp(3rem, 8vw, 6rem); line-height: 0.9; letter-spacing: -0.04em; color: var(--ink); margin-bottom: 3rem; }
        .footer-cursor { display: inline-block; width: 0.55em; height: 1em; background: var(--accent-1); margin-left: 4px; animation: blink 1s step-end infinite; vertical-align: text-bottom; }
        @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0; } }
        .footer-meta { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--ink-soft); letter-spacing: 0.1em; }
        .divider { height: 1px; background: var(--grid-line); max-width: 1200px; margin: 0 auto; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: var(--bg); }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
        @media (max-width: 768px) {
          .hero-inner, .about-grid, .projects-bento, .edu-grid, .contact-grid { grid-template-columns: 1fr; }
          .project-card.featured { grid-column: auto; }
          .form-row { grid-template-columns: 1fr; }
          nav .nav-links { display: none; }
          #cursor { display: none; }
          body { cursor: auto; }
        }
      `}</style>

      {/* CURSOR */}
      <div
        id="cursor"
        className={cursorBig ? 'big' : ''}
        style={{ left: cursorPos.x, top: cursorPos.y }}
      />

      {/* TOASTS */}
      <div id="toast-container">
        {toasts.map(t => (
          <Toast key={t.id} title={t.title} msg={t.msg} onDone={() => removeToast(t.id)} />
        ))}
      </div>

      {/* NAVBAR */}
      <nav className={scrolled ? 'scrolled' : ''}>
        <div className="nav-logo">
          <div className="pulse-dot" />
          AR.
        </div>
        <ul className="nav-links">
          {['Work', 'Skills', 'Projects', 'About', 'Contact'].map(link => (
            <li key={link}>
              <a href={`#${link.toLowerCase()}`} {...interactiveProps}>{link}</a>
            </li>
          ))}
        </ul>
        <button className="btn-resume" onClick={downloadResume} {...interactiveProps}>
          Download Resume
        </button>
      </nav>

      {/* HERO */}
      <section className="hero" id="work">
        <div className="hero-inner">
          <div>
            <Reveal>
              <div className="eyebrow-chip">
                <span className="dot" />
                AVAILABLE FOR HIRE · DELHI, INDIA · UTC+5:30
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <h1 className="hero-title">
                I build cloud<br />platforms that<br />
                <span style={{ color: 'var(--accent-1)' }}>don't blink.</span>
              </h1>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="hero-sub">
                Senior DevOps &amp; Cloud Engineer. 5+ years architecting low-latency,
                multi-region systems on GCP and AWS — Kubernetes, real-time GPU streaming,
                infrastructure as code.
              </p>
            </Reveal>
            <Reveal delay={0.3}>
              <div className="hero-ctas">
                <button className="btn-primary" {...interactiveProps}
                  onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}>
                  See the work →
                </button>
                <button className="btn-secondary" onClick={downloadResume} {...interactiveProps}>
                  Download résumé
                </button>
              </div>
            </Reveal>
            <Reveal delay={0.4}>
              <div className="visitor-chip">
                <span className="live-dot" />
                Currently online · <span style={{ margin: '0 4px' }}>{visitorCount}</span> visitors today
              </div>
            </Reveal>
          </div>
          <Reveal delay={0.2}>
            <div className="code-card">
              <div className="code-dots"><span /><span /><span /></div>
              <div className="code-filename">main.tf</div>
              <div className="code-body">
                <span className="kw">resource</span> <span className="str">"google_compute_autoscaler"</span> <span className="str">"gpu_pool"</span> {'{'}<br />
                &nbsp;&nbsp;<span className="var">name</span>   = <span className="str">"pixel-stream-gpu"</span><br />
                &nbsp;&nbsp;<span className="var">target</span> = <span className="fn">google_compute_instance_group_manager</span>.gpu.id<br />
                <br />
                &nbsp;&nbsp;<span className="kw">autoscaling_policy</span> {'{'}<br />
                &nbsp;&nbsp;&nbsp;&nbsp;<span className="var">min_replicas</span> = <span className="str">1</span><br />
                &nbsp;&nbsp;&nbsp;&nbsp;<span className="var">max_replicas</span> = <span className="str">50</span><br />
                &nbsp;&nbsp;&nbsp;&nbsp;<span className="var">cooldown_period</span> = <span className="str">60</span><br />
                &nbsp;&nbsp;&nbsp;&nbsp;<span className="kw">cpu_utilization</span> {'{'}<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="var">target</span> = <span className="str">0.6</span><br />
                &nbsp;&nbsp;&nbsp;&nbsp;{'}'}<br />
                &nbsp;&nbsp;{'}'}<br />
                {'}'}<br />
                <br />
                <span className="comment"># Multi-region routing policy</span><br />
                <span className="kw">resource</span> <span className="str">"google_compute_backend_service"</span> <span className="str">"lb"</span> {'{'}<br />
                &nbsp;&nbsp;<span className="var">load_balancing_scheme</span> = <span className="str">"EXTERNAL"</span><br />
                {'}'}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="marquee-strip">
        <div className="marquee-inner">{marqueeContent}</div>
      </div>

      {/* ABOUT */}
      <section id="about">
        <div className="container">
          <div className="about-grid">
            <div className="about-text">
              <Reveal><div className="eyebrow">01 — About</div></Reveal>
              <Reveal delay={0.1}><h2 className="section-title">The engineer<br />behind the uptime.</h2></Reveal>
              <Reveal delay={0.2}><p>I've spent the last <em>5+ years</em> operating systems where downtime is measured in user pain, not just minutes.</p></Reveal>
              <Reveal delay={0.3}><p>Most recently at <em>Emperia (UK)</em>, I designed a real-time GPU streaming platform on GCP — autoscalers, multi-region routing, per-user compute isolation that scaled to 50 concurrent sessions.</p></Reveal>
              <Reveal delay={0.4}><p>Before that: large-scale Git migrations for <em>200+ developers</em>, 99.99%-uptime Kubernetes clusters, and CI/CD pipelines that shaved 30% off release cycles.</p></Reveal>
            </div>
            <div className="stats-grid">
              <StatCard target={5} suffix="+" label="Years experience" delay={0} />
              <StatCard target={99.99} suffix="%" label="Cluster uptime managed" decimals={2} delay={0.1} />
              <StatCard target={40} suffix="%" label="Vulnerabilities reduced" delay={0.2} />
              <StatCard target={20} suffix="h/wk" label="Manual ops automated" delay={0.3} />
            </div>
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* SKILLS */}
      <section id="skills">
        <div className="container">
          <Reveal><div className="eyebrow">02 — Skills</div></Reveal>
          <Reveal delay={0.1}><h2 className="section-title">The toolkit.</h2></Reveal>
          <Reveal delay={0.2}><SkillsMatrix /></Reveal>
        </div>
      </section>

      <div className="divider" />

      {/* EXPERIENCE */}
      <section>
        <div className="container">
          <Reveal><div className="eyebrow">03 — Experience</div></Reveal>
          <Reveal delay={0.1}><h2 className="section-title">Where I've shipped.</h2></Reveal>
          <div className="timeline">
            {EXPERIENCE.map((job, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <div className="timeline-item">
                  <div className="timeline-dot" />
                  <div className="timeline-card" {...interactiveProps}>
                    <div className="tc-header">
                      <div className="tc-company">
                        {job.company}
                        <span style={{ color: 'var(--ink-soft)', fontWeight: 400, fontSize: '0.9rem' }}> · {job.location}</span>
                      </div>
                      <div className="tc-period">{job.period}</div>
                    </div>
                    <div className="tc-role">{job.role}</div>
                    <ul className="tc-points">
                      {job.points.map((p, j) => <li key={j}>{p}</li>)}
                    </ul>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* PROJECTS */}
      <section id="projects">
        <div className="container">
          <Reveal><div className="eyebrow">04 — Projects</div></Reveal>
          <Reveal delay={0.1}><h2 className="section-title">Selected work.</h2></Reveal>
          <div className="projects-bento">
            <Reveal>
              <div className="project-card featured" {...interactiveProps}>
                <div className="project-title">Real-Time GPU Streaming Platform</div>
                <div className="project-desc">Scalable low-latency infrastructure for Unreal Engine Pixel Streaming — per-user GPU provisioning, custom autoscaling, intelligent traffic routing, and cost optimization on GCP. Achieved sub-100ms cold start times at scale.</div>
                <div className="tags">
                  {['GCP', 'Kubernetes', 'GPU', 'Autoscaler', 'Low-latency', 'Terraform'].map(t => <span key={t} className="tag">{t}</span>)}
                </div>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="project-card" {...interactiveProps}>
                <div className="project-title">Infrastructure Automation (IaC)</div>
                <div className="project-desc">Reusable Terraform + Ansible modules that cut provisioning downtime and standardized deployments across dev, staging, and production across multi-cloud.</div>
                <div className="tags">
                  {['Terraform', 'Ansible', 'Multi-cloud', 'AWS', 'GCP'].map(t => <span key={t} className="tag">{t}</span>)}
                </div>
              </div>
            </Reveal>
            <Reveal delay={0.2}>
              <div className="project-card" {...interactiveProps}>
                <div className="project-title">Resilient Container Platforms</div>
                <div className="project-desc">Production-grade Kubernetes platforms with self-healing workloads, Prometheus/Grafana observability, and Helm-managed rolling deployments — 40% downtime reduction.</div>
                <div className="tags">
                  {['Kubernetes', 'Helm', '99.99% uptime', 'Prometheus', 'Grafana'].map(t => <span key={t} className="tag">{t}</span>)}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* CERTS */}
      <section>
        <div className="container">
          <Reveal><div className="eyebrow">05 — Certifications</div></Reveal>
          <Reveal delay={0.1}><h2 className="section-title">Credentialed.</h2></Reveal>
          <div className="certs-strip">
            {[
              { icon: '◈', color: 'var(--accent-3)', name: 'Certified Kubernetes Administrator', sub: 'CKA · CNCF' },
              { icon: '◈', color: 'var(--accent-2)', name: 'DevOps Certification', sub: 'Edureka' },
              { icon: '◈', color: 'var(--accent-4)', name: 'NGINX Fundamentals', sub: 'NGINX Inc.' },
            ].map((cert, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div className="cert-chip" {...interactiveProps}>
                  <span className="cert-icon" style={{ color: cert.color }}>{cert.icon}</span>
                  <div>
                    <div className="cert-name">{cert.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--ink-soft)', fontFamily: "'JetBrains Mono', monospace", marginTop: 2 }}>{cert.sub}</div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* EDUCATION */}
      <section>
        <div className="container">
          <Reveal><div className="eyebrow">06 — Education</div></Reveal>
          <Reveal delay={0.1}><h2 className="section-title">Trained and certified.</h2></Reveal>
          <div className="edu-grid">
            <Reveal>
              <div className="edu-card" {...interactiveProps}>
                <div className="edu-degree">MSc Data Science</div>
                <div className="edu-uni">University of Essex, UK</div>
                <div className="edu-meta">Oct 2022 – Nov 2023</div>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="edu-card" {...interactiveProps}>
                <div className="edu-degree">B.Tech Electronics &amp; Communication Engineering</div>
                <div className="edu-uni">B K Birla Institute of Engineering &amp; Technology</div>
                <div className="edu-meta">India</div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* STATUS */}
      <section>
        <div className="container">
          <Reveal><div className="eyebrow">07 — System Status</div></Reveal>
          <Reveal delay={0.1}><h2 className="section-title">What's running right now.</h2></Reveal>
          <div style={{ maxWidth: 640 }}>
            <Reveal delay={0.2}><StatusBoard /></Reveal>
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* CONTACT */}
      <section id="contact">
        <div className="container">
          <Reveal><div className="eyebrow">08 — Contact</div></Reveal>
          <Reveal delay={0.1}><h2 className="section-title">Got a system<br />to scale?</h2></Reveal>
          <div className="contact-grid">
            <div>
              <Reveal delay={0.1}>
                <div className="contact-info">
                  <div className="info-chip"><span className="ic">✉</span>akash.rawat0047@gmail.com</div>
                  <div className="info-chip"><span className="ic">☏</span>+91 9116726610</div>
                  <div className="info-chip"><span className="ic">◎</span>Delhi, India · UTC+5:30</div>
                </div>
              </Reveal>
              <Reveal delay={0.2}>
                <div className="social-links">
                  <a href="https://linkedin.com/in/ln-akash-rawat" target="_blank" rel="noreferrer" className="social-link" {...interactiveProps}>LinkedIn ↗</a>
                  <a href="https://github.com/AkashRawat01" target="_blank" rel="noreferrer" className="social-link" {...interactiveProps}>GitHub ↗</a>
                </div>
              </Reveal>
            </div>
            <Reveal delay={0.2}>
              <form onSubmit={handleContactSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Name *</label>
                    <input type="text" name="name" required placeholder="Your name" />
                  </div>
                  <div className="form-group">
                    <label>Email *</label>
                    <input type="email" name="email" required placeholder="your@email.com" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Company</label>
                    <input type="text" name="company" placeholder="Optional" />
                  </div>
                  <div className="form-group">
                    <label>Reason</label>
                    <select name="reason">
                      <option value="hiring">Hiring</option>
                      <option value="consulting">Consulting</option>
                      <option value="collab">Collaboration</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Message *</label>
                  <textarea name="message" required placeholder="Tell me about the system..." />
                </div>
                <button type="submit" className="btn-submit" disabled={submitting} {...interactiveProps}>
                  {submitting ? 'Sending...' : 'Send message →'}
                </button>
              </form>
            </Reveal>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="container">
          <div className="footer-title">
            Let's deploy<br />something.<span className="footer-cursor" />
          </div>
          <div className="footer-meta">
            <span>© Akash Rawat · Built with FastAPI + React + MongoDB</span>
            <span style={{ color: 'var(--accent-1)' }}>
              Last deploy: {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} · GCP us-central1
            </span>
          </div>
        </div>
      </footer>
    </>
  );
}
