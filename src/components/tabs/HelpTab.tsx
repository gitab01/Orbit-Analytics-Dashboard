"use client";

import { useState } from "react";
import {
  BookOpen, MessageCircle, PlayCircle, ChevronDown,
  ChevronRight, Search, ExternalLink, Mail, FileText,
} from "lucide-react";
import clsx from "clsx";

const faqs = [
  {
    q: "How do I connect my data source?",
    a: "Go to Settings → Integrations and click 'Add Integration'. Orbit supports REST APIs, CSV uploads, Google Analytics, Mixpanel, Segment, and more. Each connector walks you through OAuth or API key setup.",
  },
  {
    q: "How often does the dashboard refresh?",
    a: "The dashboard auto-refreshes every 60 seconds by default. You can trigger a manual refresh using the ↺ button in the header, or change the interval in Settings → Preferences.",
  },
  {
    q: "Can I export data to CSV or PDF?",
    a: "Yes. Click the 'Export' button in the header to download the current view as CSV. Head to Reports for full PDF report generation with custom date ranges.",
  },
  {
    q: "How do I set up alert thresholds?",
    a: "Navigate to the Alerts tab → Alert Rules → Add Rule. Define a metric, threshold condition, and notification channel (Email, Slack, or PagerDuty).",
  },
  {
    q: "Can I invite team members?",
    a: "Yes — go to Settings → Team and click 'Invite Member'. You can assign roles: Admin, Editor, or Viewer. Admins can manage billing and integrations.",
  },
  {
    q: "What currencies are supported?",
    a: "Orbit supports any currency. Your workspace is currently set to ETB (Ethiopian Birr). To change it, go to Settings → Preferences → Currency.",
  },
];

const docs = [
  { title: "Quick Start Guide",       category: "Getting Started", icon: PlayCircle, time: "5 min" },
  { title: "Connecting Data Sources", category: "Integrations",    icon: FileText,   time: "8 min" },
  { title: "Building Custom Charts",  category: "Charts",          icon: BookOpen,   time: "10 min" },
  { title: "Alert Configuration",     category: "Alerts",          icon: FileText,   time: "6 min" },
  { title: "Team & Permissions",      category: "Settings",        icon: BookOpen,   time: "4 min" },
  { title: "API Reference",           category: "Developer",       icon: FileText,   time: "15 min" },
];

export default function HelpTab() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [messageSent, setMessageSent] = useState(false);
  const [message, setMessage] = useState("");

  const filteredFaqs = faqs.filter(
    (f) =>
      f.q.toLowerCase().includes(search.toLowerCase()) ||
      f.a.toLowerCase().includes(search.toLowerCase())
  );

  const handleSend = () => {
    if (!message.trim()) return;
    setMessageSent(true);
    setMessage("");
    setTimeout(() => setMessageSent(false), 4000);
  };

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Hero search */}
      <div className="bg-gradient-to-br from-brand-500/10 via-gray-900 to-gray-900 border border-brand-500/20 rounded-xl p-8 text-center">
        <h2 className="text-xl font-bold text-white mb-2">How can we help?</h2>
        <p className="text-sm text-gray-400 mb-5">Search our documentation, FAQs, and guides</p>
        <div className="relative max-w-md mx-auto">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search help articles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* FAQ */}
        <div className="xl:col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Frequently Asked Questions</h3>
          <div className="space-y-2">
            {filteredFaqs.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-8">No results found for "{search}"</p>
            )}
            {filteredFaqs.map((faq, i) => (
              <div
                key={i}
                className="border border-gray-800 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-800/40 transition-colors"
                >
                  <span className="text-sm font-medium text-white pr-4">{faq.q}</span>
                  {openFaq === i
                    ? <ChevronDown size={15} className="text-brand-400 flex-shrink-0" />
                    : <ChevronRight size={15} className="text-gray-500 flex-shrink-0" />
                  }
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

          {/* Contact support */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <MessageCircle size={16} className="text-brand-400" />
              <h3 className="text-sm font-semibold text-white">Contact Support</h3>
            </div>
            {messageSent ? (
              <div className="flex flex-col items-center py-4 text-center">
                <div className="w-10 h-10 rounded-full bg-brand-500/15 flex items-center justify-center mb-2">
                  <Mail size={18} className="text-brand-400" />
                </div>
                <p className="text-sm font-medium text-white">Message sent!</p>
                <p className="text-xs text-gray-500 mt-1">We'll get back to you within 24 hours.</p>
              </div>
            ) : (
              <>
                <textarea
                  rows={4}
                  placeholder="Describe your issue or question..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-brand-500 resize-none mb-3"
                />
                <button
                  onClick={handleSend}
                  className="w-full py-2.5 bg-brand-500 text-white text-sm font-medium rounded-lg hover:bg-brand-600 transition-colors"
                >
                  Send Message
                </button>
              </>
            )}
            <p className="text-xs text-gray-600 mt-3 text-center">Avg. response time: ~2 hours</p>
          </div>

          {/* Quick links */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-3">Quick Links</h3>
            <div className="space-y-2">
              {[
                { label: "Documentation",  href: "#" },
                { label: "API Reference",  href: "#" },
                { label: "Status Page",    href: "#" },
                { label: "Changelog",      href: "#" },
                { label: "Community Forum",href: "#" },
              ].map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-800 text-sm text-gray-400 hover:text-white transition-colors group"
                >
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
          {docs.map(({ title, category, icon: Icon, time }) => (
            <button
              key={title}
              className="flex items-start gap-3 p-4 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:bg-gray-800 hover:border-gray-600 text-left transition-all group"
            >
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
