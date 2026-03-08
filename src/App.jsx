import { useState, useEffect, useRef } from "react";

const TEMPLATES = {
  minimal: {
    name: "Minimal",
    bg: "bg-white",
    text: "text-gray-900",
    accent: "border-l-4",
    cardClass: "rounded-2xl shadow-lg",
  },
  bold: {
    name: "Bold",
    bg: "bg-gradient-to-br from-gray-900 to-gray-700",
    text: "text-white",
    accent: "border-b-4",
    cardClass: "rounded-3xl shadow-2xl",
  },
  elegant: {
    name: "Elegant",
    bg: "bg-gradient-to-br from-slate-50 to-stone-100",
    text: "text-gray-800",
    accent: "border-t-4",
    cardClass: "rounded-xl shadow-md",
  },
};

const COLORS = [
  { name: "Indigo", value: "#4F46E5", tw: "border-indigo-600", bg: "bg-indigo-600", ring: "ring-indigo-600" },
  { name: "Emerald", value: "#059669", tw: "border-emerald-600", bg: "bg-emerald-600", ring: "ring-emerald-600" },
  { name: "Rose", value: "#E11D48", tw: "border-rose-600", bg: "bg-rose-600", ring: "ring-rose-600" },
  { name: "Amber", value: "#D97706", tw: "border-amber-600", bg: "bg-amber-600", ring: "ring-amber-600" },
  { name: "Cyan", value: "#0891B2", tw: "border-cyan-600", bg: "bg-cyan-600", ring: "ring-cyan-600" },
  { name: "Violet", value: "#7C3AED", tw: "border-violet-600", bg: "bg-violet-600", ring: "ring-violet-600" },
];

const SAMPLE_CONTACTS = [
  { id: 1, name: "Sarah Chen", email: "sarah@techventures.sg", company: "TechVentures SG", phone: "+65 8000 1234", note: "Met at TechCrunch Disrupt — interested in API partnerships", tags: ["investor", "singapore"], capturedAt: "2 hours ago", viewed: true, trust: { score: 94, companyReg: "TechVentures Pte Ltd (UEN 201912345A)", regStatus: "Active", incDate: "Mar 2019", addressMatch: true, linkedinMatch: true, emailDomainMatch: true, employees: "50-200" } },
  { id: 2, name: "Marcus Tan", email: "marcus@grab.com", company: "Grab Holdings", phone: "+65 8234 5678", note: "Product lead, discussed enterprise card deployment", tags: ["enterprise", "product"], capturedAt: "1 day ago", viewed: true, trust: { score: 98, companyReg: "Grab Holdings Inc (NASDAQ: GRAB)", regStatus: "Active — Public", incDate: "Jun 2012", addressMatch: true, linkedinMatch: true, emailDomainMatch: true, employees: "10,000+" } },
  { id: 3, name: "Yuki Tanaka", email: "yuki@softbank.jp", company: "SoftBank Vision Fund", phone: "+81 90 1234 5678", note: "Junior partner, follow up about seed round", tags: ["investor", "japan"], capturedAt: "2 days ago", viewed: false, trust: { score: 87, companyReg: "SB Investment Advisers (UK) Ltd", regStatus: "Active", incDate: "Oct 2016", addressMatch: true, linkedinMatch: false, emailDomainMatch: true, employees: "500+" } },
  { id: 4, name: "Priya Sharma", email: "priya@flipkart.com", company: "Flipkart", phone: "+91 98765 43210", note: "VP Engineering — wants team cards for 200 people", tags: ["enterprise", "india"], capturedAt: "3 days ago", viewed: false, trust: { score: 96, companyReg: "Flipkart Internet Private Limited (CIN U51109KA2012PTC066107)", regStatus: "Active", incDate: "Sep 2012", addressMatch: true, linkedinMatch: true, emailDomainMatch: true, employees: "30,000+" } },
  { id: 5, name: "Alex Wong", email: "alex@stripe.com", company: "Stripe APAC", phone: "+65 9876 5432", note: "Discussed payment integration for premium tier", tags: ["partnership", "payments"], capturedAt: "5 days ago", viewed: true, trust: { score: 42, companyReg: "Not found in SG registry", regStatus: "Unverified", incDate: "N/A", addressMatch: false, linkedinMatch: true, emailDomainMatch: true, employees: "N/A" } },
];

const AI_FOLLOWUPS = {
  casual: [
    "Hey {name}! Great chatting at the event — loved hearing about what you're building at {company}. Want to grab coffee sometime this week and continue the conversation?",
    "Hi {name}, it was awesome meeting you! I've been thinking about what you said about {topic} — I think there's a real opportunity there. Let's connect soon!",
  ],
  professional: [
    "Dear {name},\n\nIt was a pleasure meeting you at the conference. I was particularly interested in your perspective on {topic}.\n\nI'd love to schedule a brief call this week to explore potential synergies between our organizations. Would Tuesday or Thursday work for you?\n\nBest regards",
    "Hi {name},\n\nThank you for taking the time to connect. Your work at {company} is impressive, and I see strong alignment with what we're building.\n\nI'll send over a brief overview of our platform. Perhaps we could schedule a 20-minute call to discuss further?\n\nWarm regards",
  ],
  sales: [
    "Hi {name},\n\nGreat connecting at the event! Based on our conversation about {topic}, I think our platform could help {company} solve exactly that challenge.\n\nI've put together a quick 2-minute demo — would you have time this week for a walkthrough? I think you'll see the value immediately.\n\nLooking forward to it!",
    "Hey {name}!\n\nFollowing up from our chat — you mentioned {company} is looking at digital card solutions for the team. We've helped similar companies cut networking costs by 80% while capturing 3x more leads.\n\nCan I send you a case study? I think the results will speak for themselves.\n\nCheers",
  ],
};

// QR Code component using Canvas API
function QRCode({ value, size = 200 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !value) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const modules = generateQR(value);
    const moduleCount = modules.length;
    const cellSize = size / moduleCount;

    canvas.width = size;
    canvas.height = size;
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, size, size);

    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        if (modules[row][col]) {
          ctx.fillStyle = "#1a1a2e";
          const x = col * cellSize;
          const y = row * cellSize;
          ctx.beginPath();
          ctx.roundRect(x + 0.5, y + 0.5, cellSize - 1, cellSize - 1, cellSize * 0.2);
          ctx.fill();
        }
      }
    }
  }, [value, size]);

  return <canvas ref={canvasRef} style={{ width: size, height: size }} />;
}

function generateQR(data) {
  const size = 25;
  const grid = Array.from({ length: size }, () => Array(size).fill(false));
  const addFinderPattern = (r, c) => {
    for (let i = -1; i <= 7; i++) for (let j = -1; j <= 7; j++) {
      const ri = r + i, ci = c + j;
      if (ri < 0 || ri >= size || ci < 0 || ci >= size) continue;
      grid[ri][ci] = (i >= 0 && i <= 6 && (j === 0 || j === 6)) ||
        (j >= 0 && j <= 6 && (i === 0 || i === 6)) ||
        (i >= 2 && i <= 4 && j >= 2 && j <= 4);
    }
  };
  addFinderPattern(0, 0);
  addFinderPattern(0, size - 7);
  addFinderPattern(size - 7, 0);

  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    hash = ((hash << 5) - hash + data.charCodeAt(i)) | 0;
  }
  const rng = (seed) => { seed = (seed * 16807) % 2147483647; return seed; };
  let seed = Math.abs(hash) || 1;
  for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) {
    if (!grid[r][c] && r > 8 && c > 8) {
      seed = rng(seed);
      grid[r][c] = seed % 3 === 0;
    }
    if ((r === 6 || c === 6) && r < size - 7 && c < size - 7) {
      grid[r][c] = (r + c) % 2 === 0;
    }
  }
  return grid;
}

// Icons
const Icons = {
  Mail: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>,
  Phone: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
  Globe: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>,
  LinkedIn: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>,
  QR: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16v.01"/><path d="M16 12h1"/><path d="M21 12v.01"/><path d="M12 21v-1"/></svg>,
  Share: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" x2="12" y1="2" y2="15"/></svg>,
  User: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Sparkles: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>,
  Chart: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>,
  Copy: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>,
  Check: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>,
  Eye: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>,
  ArrowRight: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>,
  WhatsApp: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>,
};

// Card Preview Component
function CardPreview({ card, template, color, compact = false }) {
  const t = TEMPLATES[template];
  const c = COLORS.find((cl) => cl.value === color) || COLORS[0];
  const initials = card.fullName ? card.fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "YN";

  return (
    <div className={`${t.cardClass} overflow-hidden ${t.bg} ${t.text} ${t.accent} ${c.tw}`} style={{ borderColor: color }}>
      <div className={compact ? "p-5" : "p-8"}>
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0" style={{ backgroundColor: color }}>
            {initials}
          </div>
          <div className="min-w-0">
            <h2 className={`font-bold ${compact ? "text-lg" : "text-2xl"} leading-tight`}>{card.fullName || "Your Name"}</h2>
            <p className="opacity-70 text-sm mt-0.5">{card.title || "Your Title"}</p>
            <p className="font-medium text-sm" style={{ color }}>{card.company || "Company"}</p>
          </div>
        </div>

        {card.bio && <p className={`mt-4 opacity-60 text-sm leading-relaxed ${compact ? "line-clamp-2" : ""}`}>{card.bio}</p>}

        <div className={`${compact ? "mt-4" : "mt-6"} space-y-2`}>
          {card.email && (
            <div className="flex items-center gap-3 text-sm">
              <span className="opacity-40"><Icons.Mail /></span>
              <span>{card.email}</span>
            </div>
          )}
          {card.phone && (
            <div className="flex items-center gap-3 text-sm">
              <span className="opacity-40"><Icons.Phone /></span>
              <span>{card.phone}</span>
            </div>
          )}
          {card.website && (
            <div className="flex items-center gap-3 text-sm">
              <span className="opacity-40"><Icons.Globe /></span>
              <span>{card.website}</span>
            </div>
          )}
          {card.linkedin && (
            <div className="flex items-center gap-3 text-sm">
              <span className="opacity-40"><Icons.LinkedIn /></span>
              <span>{card.linkedin}</span>
            </div>
          )}
        </div>

        {!compact && (
          <div className="mt-6 flex gap-2">
            <button className="flex-1 py-2.5 rounded-xl text-white text-sm font-medium flex items-center justify-center gap-2 transition-transform hover:scale-[1.02]" style={{ backgroundColor: color }}>
              <Icons.User /> Save Contact
            </button>
            <button className="px-4 py-2.5 rounded-xl border text-sm font-medium flex items-center justify-center gap-2 transition-transform hover:scale-[1.02]" style={{ borderColor: color, color }}>
              <Icons.Share />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Main App
export default function DigitalNamecardMVP() {
  const [activeTab, setActiveTab] = useState("card");
  const [card, setCard] = useState({
    fullName: "Alex Tan",
    title: "Founder & CEO",
    company: "NODA",
    email: "hello@noda.asia",
    phone: "+65 8000 1234",
    website: "noda.asia",
    linkedin: "linkedin.com/in/alextan",
    bio: "NODA — Nodes of Digital Agents. Every connection is verified, intelligent, and working for you.",
  });
  const [template, setTemplate] = useState("bold");
  const [color, setColor] = useState(COLORS[0].value);
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [followUpTone, setFollowUpTone] = useState("professional");
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [followUpCopied, setFollowUpCopied] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [showExchange, setShowExchange] = useState(false);
  const [exchangeForm, setExchangeForm] = useState({ name: "", email: "", phone: "", note: "" });
  const [exchangeSubmitted, setExchangeSubmitted] = useState(false);

  const slug = card.fullName ? card.fullName.toLowerCase().replace(/\s+/g, "-") : "your-name";
  const shareUrl = `noda.asia/c/${slug}`;

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const generateFollowUp = (contact) => {
    setAiGenerating(true);
    setShowFollowUp(false);
    setTimeout(() => {
      setAiGenerating(false);
      setShowFollowUp(true);
    }, 1500);
  };

  const getFollowUpMessage = (contact) => {
    const msgs = AI_FOLLOWUPS[followUpTone];
    const msg = msgs[Math.floor(Math.random() * msgs.length)];
    const topic = contact.note.split("—")[1]?.trim() || "the digital transformation space";
    return msg.replace("{name}", contact.name.split(" ")[0]).replace("{company}", contact.company).replace("{topic}", topic);
  };

  const tabs = [
    { id: "card", label: "My Card", icon: <Icons.User /> },
    { id: "contacts", label: "Contacts", icon: <Icons.Mail /> },
    { id: "analytics", label: "Analytics", icon: <Icons.Chart /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center">
                <span className="text-white text-xs font-bold">N</span>
              </div>
              <span className="font-bold text-lg text-gray-900">NODA</span>
              <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium ml-1">Nodes of Digital Agents</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">JL</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setSelectedContact(null); setShowFollowUp(false); }}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.icon}
                {tab.label}
                {tab.id === "contacts" && (
                  <span className="bg-indigo-100 text-indigo-700 text-xs px-1.5 py-0.5 rounded-full">{SAMPLE_CONTACTS.length}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* CARD TAB */}
        {activeTab === "card" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Editor */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Card Details</h3>
                <div className="space-y-3">
                  {[
                    { key: "fullName", label: "Full Name", placeholder: "Alex Tan" },
                    { key: "title", label: "Title", placeholder: "Founder & CEO" },
                    { key: "company", label: "Company", placeholder: "NODA" },
                    { key: "email", label: "Email", placeholder: "hello@noda.asia" },
                    { key: "phone", label: "Phone", placeholder: "+65 8000 1234" },
                    { key: "website", label: "Website", placeholder: "noda.asia" },
                    { key: "linkedin", label: "LinkedIn", placeholder: "linkedin.com/in/alextan" },
                  ].map((field) => (
                    <div key={field.key}>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{field.label}</label>
                      <input
                        type="text"
                        value={card[field.key]}
                        onChange={(e) => setCard({ ...card, [field.key]: e.target.value })}
                        placeholder={field.placeholder}
                        className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                  ))}
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Bio</label>
                    <textarea
                      value={card.bio}
                      onChange={(e) => setCard({ ...card, bio: e.target.value })}
                      rows={3}
                      className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Template & Color */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Design</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Template</label>
                    <div className="flex gap-2 mt-2">
                      {Object.entries(TEMPLATES).map(([key, t]) => (
                        <button
                          key={key}
                          onClick={() => setTemplate(key)}
                          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border-2 transition-all ${
                            template === key
                              ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                              : "border-gray-200 text-gray-600 hover:border-gray-300"
                          }`}
                        >
                          {t.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Accent Color</label>
                    <div className="flex gap-2 mt-2">
                      {COLORS.map((c) => (
                        <button
                          key={c.value}
                          onClick={() => setColor(c.value)}
                          className={`w-10 h-10 rounded-full transition-transform hover:scale-110 ${
                            color === c.value ? "ring-2 ring-offset-2 scale-110" : ""
                          }`}
                          style={{ backgroundColor: c.value, ringColor: c.value }}
                          title={c.name}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">Live Preview</h3>
                  <div className="flex gap-2">
                    <button onClick={() => setShowQR(!showQR)} className="flex items-center gap-1.5 text-sm text-indigo-600 font-medium hover:text-indigo-700">
                      <Icons.QR /> {showQR ? "Hide QR" : "Show QR"}
                    </button>
                  </div>
                </div>
                <CardPreview card={card} template={template} color={color} />
              </div>

              {/* QR & Share */}
              {showQR && (
                <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center">
                  <h3 className="font-semibold text-gray-900 mb-4">Share Your Card</h3>
                  <div className="inline-block p-4 bg-white rounded-2xl shadow-inner border border-gray-100">
                    <QRCode value={shareUrl} size={200} />
                  </div>
                  <p className="text-sm text-gray-500 mt-3">Scan to view card</p>

                  <div className="mt-4 flex items-center gap-2 bg-gray-50 rounded-xl p-2">
                    <div className="flex-1 text-sm text-gray-600 font-mono truncate px-2">{shareUrl}</div>
                    <button
                      onClick={handleCopy}
                      className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-medium flex items-center gap-1.5 hover:bg-indigo-700 transition-colors"
                    >
                      {copied ? <><Icons.Check /> Copied!</> : <><Icons.Copy /> Copy</>}
                    </button>
                  </div>

                  <div className="mt-4 flex justify-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl text-sm font-medium hover:bg-green-600 transition-colors">
                      <Icons.WhatsApp /> WhatsApp
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl text-sm font-medium hover:bg-blue-600 transition-colors">
                      <Icons.LinkedIn /> LinkedIn
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors">
                      <Icons.Mail /> Email
                    </button>
                  </div>
                </div>
              )}

              {/* Simulate Exchange */}
              <div className="bg-gradient-to-r from-indigo-50 to-violet-50 rounded-2xl border border-indigo-100 p-6">
                <h3 className="font-semibold text-gray-900 mb-1">Try the Card Exchange</h3>
                <p className="text-sm text-gray-500 mb-4">See what recipients experience when they view your card</p>
                <button
                  onClick={() => { setShowExchange(true); setExchangeSubmitted(false); }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors"
                >
                  <Icons.ArrowRight /> Simulate Card Exchange
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Exchange Modal */}
        {showExchange && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowExchange(false)}>
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="p-6">
                <div className="text-center mb-4">
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Digital Card from</p>
                </div>
                <CardPreview card={card} template={template} color={color} compact />

                {!exchangeSubmitted ? (
                  <div className="mt-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Icons.Sparkles />
                      <h3 className="font-semibold text-gray-900">Share your info back</h3>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">So {card.fullName?.split(" ")[0] || "they"} can stay in touch</p>
                    <div className="space-y-3">
                      <input type="text" placeholder="Your name" value={exchangeForm.name} onChange={(e) => setExchangeForm({ ...exchangeForm, name: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                      <input type="email" placeholder="Email" value={exchangeForm.email} onChange={(e) => setExchangeForm({ ...exchangeForm, email: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                      <input type="tel" placeholder="Phone (optional)" value={exchangeForm.phone} onChange={(e) => setExchangeForm({ ...exchangeForm, phone: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                      <textarea placeholder="How did we meet? (optional)" value={exchangeForm.note} onChange={(e) => setExchangeForm({ ...exchangeForm, note: e.target.value })} rows={2} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
                      <button onClick={() => setExchangeSubmitted(true)} className="w-full py-2.5 rounded-xl text-white text-sm font-medium transition-transform hover:scale-[1.02]" style={{ backgroundColor: color }}>
                        Connect with {card.fullName?.split(" ")[0] || "them"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-6 text-center py-8">
                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <h3 className="font-bold text-lg text-gray-900">Connected!</h3>
                    <p className="text-sm text-gray-500 mt-1">{card.fullName?.split(" ")[0]} will receive your info and follow up soon.</p>
                    <button onClick={() => setShowExchange(false)} className="mt-4 text-sm text-indigo-600 font-medium">Close</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* CONTACTS TAB */}
        {activeTab === "contacts" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className={selectedContact ? "lg:col-span-1" : "lg:col-span-3"}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Contacts</h2>
                <span className="text-sm text-gray-500">{SAMPLE_CONTACTS.length} captured</span>
              </div>
              <div className="space-y-2">
                {SAMPLE_CONTACTS.map((contact) => (
                  <button
                    key={contact.id}
                    onClick={() => { setSelectedContact(contact); setShowFollowUp(false); setAiGenerating(false); }}
                    className={`w-full text-left bg-white rounded-xl border p-4 transition-all hover:shadow-md ${
                      selectedContact?.id === contact.id ? "border-indigo-300 shadow-md ring-1 ring-indigo-100" : "border-gray-200"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-sm font-bold">
                          {contact.name.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 text-sm">{contact.name}</h4>
                          <p className="text-xs text-gray-500">{contact.company}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {contact.trust && (
                          <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${
                            contact.trust.score >= 80 ? "bg-green-100 text-green-700" :
                            contact.trust.score >= 50 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                          }`}>{contact.trust.score}</span>
                        )}
                        {!contact.viewed && <span className="w-2 h-2 rounded-full bg-indigo-600" />}
                        <span className="text-xs text-gray-400">{contact.capturedAt}</span>
                      </div>
                    </div>
                    {!selectedContact && (
                      <p className="text-xs text-gray-500 mt-2 line-clamp-1">{contact.note}</p>
                    )}
                    <div className="flex gap-1.5 mt-2">
                      {contact.tags.map((tag) => (
                        <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{tag}</span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Contact Detail */}
            {selectedContact && (
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-lg font-bold">
                        {selectedContact.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">{selectedContact.name}</h2>
                        <p className="text-sm text-gray-500">{selectedContact.company}</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">Captured {selectedContact.capturedAt}</span>
                  </div>

                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Icons.Mail /> {selectedContact.email}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Icons.Phone /> {selectedContact.phone}
                    </div>
                    <div className="flex gap-1.5">
                      {selectedContact.tags.map((tag) => (
                        <span key={tag} className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">{tag}</span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-600"><strong className="text-gray-900">Meeting notes:</strong> {selectedContact.note}</p>
                  </div>
                </div>

                {/* TrustCheck Verification */}
                {selectedContact.trust && (
                  <div className={`bg-white rounded-2xl border p-6 ${
                    selectedContact.trust.score >= 80 ? "border-green-200" :
                    selectedContact.trust.score >= 50 ? "border-amber-200" : "border-red-200"
                  }`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={
                          selectedContact.trust.score >= 80 ? "text-green-600" :
                          selectedContact.trust.score >= 50 ? "text-amber-600" : "text-red-600"
                        }><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                        <h3 className="font-semibold text-gray-900">TrustCheck</h3>
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">powered by NODA AI</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-2xl font-bold ${
                          selectedContact.trust.score >= 80 ? "text-green-600" :
                          selectedContact.trust.score >= 50 ? "text-amber-600" : "text-red-600"
                        }`}>{selectedContact.trust.score}</span>
                        <span className="text-xs text-gray-400">/100</span>
                      </div>
                    </div>

                    {/* Trust Score Bar */}
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-4">
                      <div className={`h-full rounded-full transition-all ${
                        selectedContact.trust.score >= 80 ? "bg-green-500" :
                        selectedContact.trust.score >= 50 ? "bg-amber-500" : "bg-red-500"
                      }`} style={{ width: `${selectedContact.trust.score}%` }} />
                    </div>

                    {/* Company Verification */}
                    <div className="space-y-2.5">
                      <div className="text-xs font-medium text-gray-400 uppercase tracking-wide">Company Verification</div>
                      <div className="flex items-start gap-2.5 text-sm">
                        <span className={selectedContact.trust.regStatus === "Unverified" ? "text-red-500 mt-0.5" : "text-green-500 mt-0.5"}>
                          {selectedContact.trust.regStatus === "Unverified" ? "✗" : "✓"}
                        </span>
                        <div>
                          <span className="text-gray-700 font-medium">Registry: </span>
                          <span className="text-gray-600">{selectedContact.trust.companyReg}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5 text-sm">
                        <span className="text-green-500">✓</span>
                        <span className="text-gray-700 font-medium">Status: </span>
                        <span className={`text-sm px-2 py-0.5 rounded-full ${
                          selectedContact.trust.regStatus.includes("Active") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}>{selectedContact.trust.regStatus}</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-sm">
                        <span className="text-green-500">✓</span>
                        <span className="text-gray-600">Incorporated: {selectedContact.trust.incDate}</span>
                      </div>
                      {selectedContact.trust.employees !== "N/A" && (
                        <div className="flex items-center gap-2.5 text-sm">
                          <span className="text-green-500">✓</span>
                          <span className="text-gray-600">Employees: {selectedContact.trust.employees}</span>
                        </div>
                      )}

                      <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mt-3 pt-3 border-t border-gray-100">Person Verification</div>
                      <div className="flex items-center gap-2.5 text-sm">
                        <span className={selectedContact.trust.linkedinMatch ? "text-green-500" : "text-amber-500"}>
                          {selectedContact.trust.linkedinMatch ? "✓" : "?"}
                        </span>
                        <span className="text-gray-600">
                          LinkedIn profile {selectedContact.trust.linkedinMatch ? "confirmed" : "not confirmed"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5 text-sm">
                        <span className={selectedContact.trust.emailDomainMatch ? "text-green-500" : "text-red-500"}>
                          {selectedContact.trust.emailDomainMatch ? "✓" : "✗"}
                        </span>
                        <span className="text-gray-600">
                          Email domain {selectedContact.trust.emailDomainMatch ? "matches company" : "does not match company"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5 text-sm">
                        <span className={selectedContact.trust.addressMatch ? "text-green-500" : "text-red-500"}>
                          {selectedContact.trust.addressMatch ? "✓" : "✗"}
                        </span>
                        <span className="text-gray-600">
                          Address {selectedContact.trust.addressMatch ? "matches registry" : "does not match registry"}
                        </span>
                      </div>
                    </div>

                    {selectedContact.trust.score < 60 && (
                      <div className="mt-4 p-3 bg-red-50 rounded-xl border border-red-100">
                        <p className="text-sm text-red-700 font-medium">Attention needed</p>
                        <p className="text-xs text-red-600 mt-1">Some details could not be verified. Exercise caution and verify independently before proceeding with business dealings.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* AI Follow-up */}
                <div className="bg-gradient-to-r from-violet-50 to-indigo-50 rounded-2xl border border-indigo-100 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Icons.Sparkles />
                    <h3 className="font-semibold text-gray-900">AI Follow-up Generator</h3>
                  </div>

                  <div className="flex gap-2 mb-4">
                    {["casual", "professional", "sales"].map((tone) => (
                      <button
                        key={tone}
                        onClick={() => { setFollowUpTone(tone); setShowFollowUp(false); }}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
                          followUpTone === tone
                            ? "bg-indigo-600 text-white"
                            : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        {tone}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => generateFollowUp(selectedContact)}
                    disabled={aiGenerating}
                    className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
                  >
                    <Icons.Sparkles />
                    {aiGenerating ? "Generating..." : "Generate Follow-up Message"}
                  </button>

                  {aiGenerating && (
                    <div className="mt-4 flex items-center gap-3">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                      <span className="text-sm text-gray-500">AI is crafting a personalized message...</span>
                    </div>
                  )}

                  {showFollowUp && (
                    <div className="mt-4 bg-white rounded-xl border border-gray-200 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-indigo-600 font-medium uppercase tracking-wide">AI Suggestion ({followUpTone})</span>
                        <button
                          onClick={() => { setFollowUpCopied(true); setTimeout(() => setFollowUpCopied(false), 2000); }}
                          className="text-xs text-indigo-600 flex items-center gap-1 font-medium"
                        >
                          {followUpCopied ? <><Icons.Check /> Copied!</> : <><Icons.Copy /> Copy</>}
                        </button>
                      </div>
                      <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{getFollowUpMessage(selectedContact)}</p>
                      <div className="mt-3 flex gap-2">
                        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs font-medium hover:bg-green-600">
                          <Icons.WhatsApp /> Send via WhatsApp
                        </button>
                        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-700 text-white rounded-lg text-xs font-medium hover:bg-gray-800">
                          <Icons.Mail /> Send via Email
                        </button>
                        <button onClick={() => generateFollowUp(selectedContact)} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-medium hover:bg-indigo-200">
                          <Icons.Sparkles /> Regenerate
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ANALYTICS TAB */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Analytics</h2>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Card Views", value: "1,247", change: "+23%", color: "text-indigo-600" },
                { label: "QR Scans", value: "384", change: "+18%", color: "text-emerald-600" },
                { label: "Contacts Captured", value: "89", change: "+31%", color: "text-violet-600" },
                { label: "Save Rate", value: "42%", change: "+5%", color: "text-amber-600" },
              ].map((stat) => (
                <div key={stat.label} className="bg-white rounded-2xl border border-gray-200 p-5">
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className={`text-3xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-green-600 mt-1">{stat.change} vs last week</p>
                </div>
              ))}
            </div>

            {/* Chart Placeholder */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Views Over Time</h3>
              <div className="flex items-end gap-1 h-40">
                {[35, 52, 41, 67, 89, 73, 95, 82, 110, 98, 125, 142, 118, 156].map((val, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full rounded-t-md bg-gradient-to-t from-indigo-600 to-indigo-400 transition-all hover:from-indigo-500 hover:to-indigo-300"
                      style={{ height: `${(val / 156) * 100}%` }}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-xs text-gray-400">2 weeks ago</span>
                <span className="text-xs text-gray-400">Today</span>
              </div>
            </div>

            {/* Top Sources */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Top Referral Sources</h3>
                <div className="space-y-3">
                  {[
                    { source: "QR Code Scan", count: 384, pct: 45 },
                    { source: "Direct Link", count: 267, pct: 31 },
                    { source: "WhatsApp Share", count: 132, pct: 15 },
                    { source: "Email Signature", count: 56, pct: 7 },
                    { source: "LinkedIn", count: 18, pct: 2 },
                  ].map((item) => (
                    <div key={item.source} className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-700">{item.source}</span>
                          <span className="text-gray-500">{item.count}</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${item.pct}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Device Breakdown</h3>
                <div className="space-y-3">
                  {[
                    { device: "iPhone", pct: 52, color: "bg-indigo-500" },
                    { device: "Android", pct: 31, color: "bg-emerald-500" },
                    { device: "Desktop", pct: 12, color: "bg-amber-500" },
                    { device: "iPad/Tablet", pct: 5, color: "bg-rose-500" },
                  ].map((item) => (
                    <div key={item.device} className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-700">{item.device}</span>
                          <span className="text-gray-500">{item.pct}%</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.pct}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Insights */}
            <div className="bg-gradient-to-r from-violet-50 to-indigo-50 rounded-2xl border border-indigo-100 p-6">
              <div className="flex items-center gap-2 mb-3">
                <Icons.Sparkles />
                <h3 className="font-semibold text-gray-900">AI Insights</h3>
              </div>
              <div className="space-y-3">
                <div className="bg-white rounded-xl p-4">
                  <p className="text-sm text-gray-700">Your card views spike on <strong>Tuesdays and Wednesdays</strong> — consider scheduling networking events earlier in the week for maximum follow-up engagement.</p>
                </div>
                <div className="bg-white rounded-xl p-4">
                  <p className="text-sm text-gray-700"><strong>3 contacts</strong> haven't been followed up in 7+ days. Sarah Chen, Yuki Tanaka, and Priya Sharma may need a nudge.</p>
                </div>
                <div className="bg-white rounded-xl p-4">
                  <p className="text-sm text-gray-700">Your <strong>save rate (42%)</strong> is above industry average (28%). The "Share info back" CTA is working well — keep it prominent.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        )}
      </div>
    </div>
  );
}
