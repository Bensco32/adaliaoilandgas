"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send } from "lucide-react";

type Msg = { role: "user" | "assistant"; content: string };

const quick = [
  "What services does Adalia offer?",
  "Tell me about your drilling services.",
  "Do you offer crude oil lifting?",
  "Do you supply LPG, CNG and LNG?",
  "What is your approach to safety?",
  "What makes Adalia different?",
  "How can I become a business partner?",
  "How can I contact your company?"
];

export function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "Welcome to Adalia Oil and Gas Ltd. I'm the official Adalia virtual assistant, here to answer questions using information published on this website.\n\nWhat would you like to know about our services, divisions, safety commitments or partnerships?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showLead, setShowLead] = useState(false);
  const [leadStatus, setLeadStatus] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, open, loading]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || loading) return;
    const next: Msg[] = [...messages, { role: "user", content }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: next }) });
      const data = await res.json();
      const reply = data.reply || data.error || "I apologize, but I could not process that request. Please contact our team for assistance.";
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "I’m having trouble connecting right now. Please try again or contact our team directly via the Contact page." }]);
    } finally {
      setLoading(false);
    }
  }

  async function submitLead(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!consent) { setLeadStatus("Please provide consent before submitting your information."); return; }
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setLeadStatus("Submitting...");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, subject: "Quotation / Partnership enquiry via Chatbot", message: `Lead captured via ADALIA AI ASSISTANT. Enquiry: ${data.enquiry || ""}` })
      });
      if (!res.ok) throw new Error();
      setLeadStatus("Thank you. Our team will review your enquiry and respond.");
      form.reset();
      setConsent(false);
    } catch {
      setLeadStatus("We could not submit your details right now. Please use the Contact page.");
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gold-500 text-navy-900 shadow-lg hover:bg-gold-400"
        aria-label="Open ADALIA AI ASSISTANT"
      >
        <MessageCircle className="h-7 w-7" />
      </button>

      {open && (
        <div className="fixed bottom-5 right-5 z-50 flex h-[560px] max-h-[80vh] w-[360px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between bg-navy-900 px-4 py-3 text-white">
            <div>
              <div className="font-semibold">ADALIA AI ASSISTANT</div>
              <div className="text-xs text-gold-300">Online • Here to help</div>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close chat"><X className="h-5 w-5" /></button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-3 text-sm">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 leading-relaxed ${m.role === "user" ? "bg-gold-500 text-navy-900" : "bg-slate-100 text-slate-800"}`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-slate-500">
                <span className="h-2 w-2 animate-pulse rounded-full bg-gold-500" />
                Searching Adalia's knowledge base…
              </div>
            )}
            <div className="flex flex-wrap gap-2 pt-1">
              {quick.map((q) => (
                <button key={q} onClick={() => send(q)} className="rounded-full border border-slate-300 px-2.5 py-1 text-xs text-navy-900 hover:border-gold-500 hover:text-gold-700">
                  {q}
                </button>
              ))}
            </div>

            <div className="rounded-lg border border-gold-500/30 bg-gold-50 p-3">
              <button className="text-left text-xs font-semibold text-navy-900 underline" onClick={() => setShowLead(!showLead)}>
                Request a quotation or partnership discussion (share your details)
              </button>
              {showLead && (
                <form onSubmit={submitLead} className="mt-2 space-y-2 text-xs">
                  <p className="text-slate-600">Privacy notice: By submitting, you consent to Adalia Oil and Gas Ltd collecting and using the information provided to respond to your enquiry. We handle your information responsibly and only for business communication purposes.</p>
                  <input name="fullName" required placeholder="Full name" className="w-full rounded border px-2 py-1" />
                  <input name="email" type="email" required placeholder="Email" className="w-full rounded border px-2 py-1" />
                  <input name="companyName" placeholder="Company" className="w-full rounded border px-2 py-1" />
                  <input name="enquiry" placeholder="Your enquiry" className="w-full rounded border px-2 py-1" />
                  <input name="division" defaultValue="General Business Enquiry" className="hidden" />
                  <label className="flex items-start gap-2"><input type="checkbox" checked={consent} onChange={(e)=>setConsent(e.target.checked)} /><span>I consent to the collection and use of my information for this enquiry.</span></label>
                  <button type="submit" className="rounded bg-navy-900 px-3 py-1 font-semibold text-white">Submit</button>
                  {leadStatus && <p className="text-slate-700">{leadStatus}</p>}
                </form>
              )}
            </div>

            <div className="text-center text-xs text-slate-500">
              Prefer a person? <a href="/contact" className="font-medium text-gold-700 underline">Contact our team</a>
            </div>
            <div ref={endRef} />
          </div>

          <form
            className="flex gap-2 border-t p-2"
            onSubmit={(e) => { e.preventDefault(); send(input); }}
          >
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type your question..." className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-gold-500 focus:outline-none" aria-label="Message" />
            <button type="submit" disabled={loading} className="rounded-md bg-navy-900 px-3 text-white hover:bg-navy-800 disabled:opacity-50" aria-label="Send"><Send className="h-4 w-4" /></button>
          </form>
        </div>
      )}
    </>
  );
}
