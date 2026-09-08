"use client";
import { useState } from "react";
import { BookOpen, MessageCircle, PlayCircle, ChevronDown, ChevronRight, Search, ExternalLink, FileText } from "lucide-react";
import clsx from "clsx";
import { useToast } from "@/components/Toast";

const FAQS = [
  { q: "How do I connect my data source?",     a: "Go to Settings → Integrations and click 'Connect'. Orbit supports Slack, Google Analytics, Stripe, Mixpanel, PagerDuty, and Segment. Each connector walks you through OAuth or API key setup." },
  { q: "How often does the dashboard refresh?", a: "The dashboard auto-refreshes every 60 seconds. You can trigger a manual refresh with the ↺ button in the header, or change the interval in Settings → Preferences → Refresh Rate." },
  { q: "Can I export data to CSV?",             a: "Yes. Click the 'Export' button in the header to download the current view as a CSV file containing date, revenue, users, sessions and conversions." },
  { q: "How do I set up alert thresholds?",     a: "Navigate to the Alerts tab → Alert Rules → Add. Define a rule name, trigger condition, and notification channel (Email, Slack, or PagerDuty)." },
  { q: "Can I invite team members?",            a: "Yes — go to Settings → Team and click 'Invite Member'. Assign a role: Admin, Editor, or Viewer. Members can be removed or have their role changed at any time." },
  { q: "What currencies are supported?",        a: "Orbit supports any currency. Your workspace is currently set to ETB (Ethiopian Birr). To change it, go to Settings → Preferences → Currency." },
  { q: "How do I schedule a report?",           a: "Go to Reports → Scheduled Reports → New Schedule. Choose a report type, frequency (daily/weekly/monthly), and the system will auto-generate and deliver it." },
  { q: "Is my data persisted between sessions?",a: "The current demo uses an in-memory store — data resets on server restart. A production deployment would connect a database (PostgreSQL, MongoDB, etc.) for full persistence." },
];

const DOCS = [
  { title: "Quick Start Guide",        category: "Getting Started", icon: PlayCircle, time: "5 min"  },
  { title: "Connecting Data Sources",  category: "Integrations",   icon: FileText,   time: "8 min"  },
  { title: "Building Custom Charts",   category: "Charts",         icon: BookOpen,   time: "10 min" },
  { title: "Alert Configuration",      category: "Alerts",         icon: FileText,   time: "6 min"  },
  { title: "Team & Permissions",       category: "Settings",       icon: BookOpen,   time: "4 min"  },
  { title: "API Reference",            category: "Developer",      icon: FileText,   time: "15 min" },
];

const LINKS = [
  { label: "Documentation",   href: "https://github.com/gitab01/Orbit-Analytics-Dashboard" },
  { label: "GitHub Repo",     href: "https://github.com/gitab01/Orbit-Analytics-Dashboard" },
  { label: "Changelog",       href: "https://github.com/gitab01/Orbit-Analytics-Dashboard/commits/main" },
  { label: "Report a Bug",    href: "https://github.com/gitab01/Orbit-Analytics-Dashboard/issues" },
  { label: "Feature Request", href: "https://github.com/gitab01/Orbit-Analytics-Dashboard/issues" },
];

export default function HelpTab() {
  const { toast } = useToast();
  const [openFaq,  setOpenFaq]  = useState<number | null>(null);
  const [search,   setSearch]   = useState("");
  const [message,  setMessage]  = useState("");
  const [sending,  setSending]  = useState(false);

  const filteredFaqs = FAQS.filter(f =>
    f.q.toLowerCase().includes(search.toLowerCase()) ||
    f.a.toLowerCase().includes(search.toLowerCase())
  );

  const handleSend = async () => {
    if (!message.trim()) { toast("error", "Please enter a message"); return; }
    setSending(true);
    try {
      const res  = await fetch("/api/support", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message }) });
      const data = await res.json();
      if (res.ok) {
        toast("success", `Message sent! Your ticket ID is ${data.ticketId}`);
        setMessage("");
      } else {
        toast("error", data.error ?? "Failed to send message");
      }
    } catch {
      toast("error", "Network error — please try again");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Hero search */}
      <div className="bg-gradient-to-br from-brand-500/10 via-gray-900 to-gray-900 border border-brand-500/20 rounded-xl p-8 text-center">
        <h2 className="text-xl font-bold text-white mb-2">How can we help?</h2>
        <p className="text-sm text-gray-400 mb-5">Search our documentation and FAQs</p>
        <div className="relative max-w-md mx-auto">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input type="text" placeholder="Search help articles…" value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30" />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* FAQ */}
        <div className="xl:col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Frequently Asked Questions</h3>
          <div className="space-y-2">
            {filteredFaqs.length === 0 && <p className="text-sm text-gray-500 text-center py-8">No results for "{search}"</p>}
            {filteredFaqs.map((faq, i) => (
              <div key={i} className="border border-gray-800 rounded-lg overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-800/40 transition-colors">
                  <span className="text-sm font-medium text-white pr-4">{faq.q}</span>
                  {openFaq === i ? <ChevronDown size={15} className="text-brand-400 flex-shrink-0" /> : <ChevronRight size={15} className="text-gray-500 flex-shrink-0" />}
                </button>
                {openFaq === i && (
                  <div className="px-4 pb-4 border-t border-gray-800/70">
                    <p className="text-sm text-gray-400 leading-relaxed pt-3">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">

          {/* Contact form — wired to /api/support */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <MessageCircle size={16} className="text-brand-400" />
              <h3 className="text-sm font-semibold text-white">Contact Support</h3>
            </div>
            <textarea rows={4} placeholder="Describe your issue or question…" value={message}
              onChange={e => setMessage(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-brand-500 resize-none mb-3" />
            <button onClick={handleSend} disabled={sending}
              className="w-full py-2.5 bg-brand-500 text-white text-sm font-medium rounded-lg hover:bg-brand-600 transition-colors disabled:opacity-60">
              {sending ? "Sending…" : "Send Message"}
            </button>
            <p className="text-xs text-gray-600 mt-2 text-center">Avg. response: ~2 hours</p>
          </div>

          {/* Quick links — real URLs */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-3">Quick Links</h3>
            <div className="space-y-1">
              {LINKS.map(link => (
                <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-800 text-sm text-gray-400 hover:text-white transition-colors group">
                  {link.label}
                  <ExternalLink size={12} className="text-gray-600 group-hover:text-gray-400" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Docs grid */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Documentation</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {DOCS.map(({ title, category, icon: Icon, time }) => (
            <button key={title}
              className="flex items-start gap-3 p-4 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:bg-gray-800 hover:border-gray-600 text-left transition-all group">
              <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon size={14} className="text-brand-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white group-hover:text-brand-300 transition-colors">{title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{category} · {time} read</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
