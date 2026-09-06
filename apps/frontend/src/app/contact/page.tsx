'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import { ChevronDown } from 'lucide-react';

const EVENT_TYPES   = ['Birthday', 'Anniversary', 'Wedding', 'Baby Shower', 'Corporate', 'Festive / Seasonal', 'Other'];
const CAKE_SIZES    = ['500g (serves 4–6)', '1kg (serves 8–12)', '1.5kg (serves 12–18)', '2kg (serves 18–24)', 'Custom / Not sure'];
const DIETARY_PREFS = ['Whole Wheat', 'Vegan', 'Gluten Free', 'Sugar Free', 'No preference'];
const FLAVOURS      = ['Chocolate', 'Vanilla / White Chocolate', 'Pistachio', 'Citrus / Lemon', 'Fruity / Berry', 'Coffee / Mocha', 'Liquor-infused', 'Open to suggestions'];
const BUDGETS       = ['Under ₹1,500', '₹1,500 – ₹3,000', '₹3,000 – ₹5,000', '₹5,000+', 'Not sure yet'];

interface FormState {
  name: string;
  email: string;
  phone: string;
  eventType: string;
  eventDate: string;
  cakeSize: string;
  dietary: string;
  flavour: string;
  budget: string;
  message: string;
}

function SelectField({
  id,
  label,
  options,
  value,
  onChange,
}: {
  id: string;
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="font-poppins text-[9px] uppercase tracking-widest text-[#86162f]/50">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none bg-white border border-[#86162f]/20 px-4 py-3.5 font-poppins text-sm text-gray-700 focus:outline-none focus:border-[#86162f]/60 transition-colors pr-10"
        >
          <option value="" disabled>Select…</option>
          {options.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
        <ChevronDown
          size={14}
          aria-hidden="true"
          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#86162f]/40 pointer-events-none"
        />
      </div>
    </div>
  );
}

const EMPTY: FormState = {
  name: '', email: '', phone: '', eventType: '', eventDate: '',
  cakeSize: '', dietary: '', flavour: '', budget: '', message: '',
};

export default function ContactPage() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function set(field: keyof FormState) {
    return (value: string) => setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    // Simulate submission — wire to backend/email service when ready
    await new Promise((r) => globalThis.setTimeout(r, 1200));
    setSubmitting(false);
    setSubmitted(true);
  }

  return (
    <main className="min-h-screen bg-white">
      <Navigation />

      <div className="mt-16 md:mt-20" />

      {/* Hero */}
      <section className="py-14 md:py-20 text-center px-6">
        <p className="font-poppins text-[10px] uppercase tracking-[0.45em] text-[#f8aeb2] mb-4">
          Custom cake orders
        </p>
        <h1 className="font-seasons text-[#86162f] text-3xl md:text-5xl leading-tight mb-5">
          Let&apos;s Create Something Special
        </h1>
        <p className="font-poppins text-sm text-gray-500 leading-relaxed max-w-md mx-auto">
          Fill in the form below and we&apos;ll be in touch within 24 hours to discuss your order.
        </p>
      </section>

      <div className="max-w-screen-lg mx-auto px-6 sm:px-10 md:px-16 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16 items-start">

          {/* ── Form ─────────────────────────────────────────────── */}
          <div className="lg:col-span-2">
            {submitted ? (
              <div className="py-20 text-center">
                <div className="w-10 h-px bg-[#f8aeb2] mx-auto mb-6" />
                <h2 className="font-seasons text-[#86162f] text-4xl mb-4">Thank You</h2>
                <p className="font-poppins text-sm text-gray-500 leading-relaxed mb-8 max-w-sm mx-auto">
                  We&apos;ve received your request and will be in touch within 24 hours to begin planning your cake.
                </p>
                <button
                  onClick={() => { setForm(EMPTY); setSubmitted(false); }}
                  className="font-poppins text-[10px] uppercase tracking-widest text-[#86162f] border-b border-[#86162f]/30 hover:border-[#86162f] transition-colors pb-0.5"
                >
                  Submit another enquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">

                {/* Personal details */}
                <p className="font-poppins text-[9px] uppercase tracking-[0.4em] text-[#86162f]/40 mb-1">About You</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="name" className="font-poppins text-[9px] uppercase tracking-widest text-[#86162f]/50">Full Name</label>
                    <input
                      id="name"
                      required
                      type="text"
                      placeholder="Full Name"
                      value={form.name}
                      onChange={(e) => set('name')(e.target.value)}
                      className="border border-[#86162f]/20 px-4 py-3.5 font-poppins text-sm text-gray-700 focus:outline-none focus:border-[#86162f]/60 transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="email" className="font-poppins text-[9px] uppercase tracking-widest text-[#86162f]/50">Email Address</label>
                    <input
                      id="email"
                      required
                      type="email"
                      placeholder="Email Address"
                      value={form.email}
                      onChange={(e) => set('email')(e.target.value)}
                      className="border border-[#86162f]/20 px-4 py-3.5 font-poppins text-sm text-gray-700 focus:outline-none focus:border-[#86162f]/60 transition-colors"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="phone" className="font-poppins text-[9px] uppercase tracking-widest text-[#86162f]/50">Phone Number</label>
                  <input
                    id="phone"
                    type="tel"
                    placeholder="Phone Number"
                    value={form.phone}
                    onChange={(e) => set('phone')(e.target.value)}
                    className="border border-[#86162f]/20 px-4 py-3.5 font-poppins text-sm text-gray-700 focus:outline-none focus:border-[#86162f]/60 transition-colors"
                  />
                </div>

                <div className="w-full h-px bg-[#86162f]/8 my-2" />

                {/* Event details */}
                <p className="font-poppins text-[9px] uppercase tracking-[0.4em] text-[#86162f]/40 mb-1">Your Event</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <SelectField id="eventType" label="Event Type" options={EVENT_TYPES} value={form.eventType} onChange={set('eventType')} />
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="eventDate" className="font-poppins text-[9px] uppercase tracking-widest text-[#86162f]/50">Event Date</label>
                    <input
                      id="eventDate"
                      type="date"
                      value={form.eventDate}
                      onChange={(e) => set('eventDate')(e.target.value)}
                      className="border border-[#86162f]/20 px-4 py-3.5 font-poppins text-sm text-gray-400 focus:outline-none focus:border-[#86162f]/60 transition-colors"
                    />
                  </div>
                </div>

                <div className="w-full h-px bg-[#86162f]/8 my-2" />

                {/* Cake preferences */}
                <p className="font-poppins text-[9px] uppercase tracking-[0.4em] text-[#86162f]/40 mb-1">Your Cake</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <SelectField id="cakeSize" label="Cake Size / Serves" options={CAKE_SIZES} value={form.cakeSize} onChange={set('cakeSize')} />
                  <SelectField id="dietary" label="Dietary Preference" options={DIETARY_PREFS} value={form.dietary} onChange={set('dietary')} />
                  <SelectField id="flavour" label="Flavour Direction" options={FLAVOURS} value={form.flavour} onChange={set('flavour')} />
                  <SelectField id="budget" label="Budget Range" options={BUDGETS} value={form.budget} onChange={set('budget')} />
                </div>

                <div className="w-full h-px bg-[#86162f]/8 my-2" />

                {/* Message */}
                <p className="font-poppins text-[9px] uppercase tracking-[0.4em] text-[#86162f]/40 mb-1">Anything else?</p>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="message" className="font-poppins text-[9px] uppercase tracking-widest text-[#86162f]/50">Additional Notes</label>
                  <textarea
                    id="message"
                    rows={5}
                    placeholder="Tell us about your vision — flavour combinations, design ideas, allergens, or anything else we should know."
                    value={form.message}
                    onChange={(e) => set('message')(e.target.value)}
                    className="border border-[#86162f]/20 px-4 py-3.5 font-poppins text-sm text-gray-700 focus:outline-none focus:border-[#86162f]/60 transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-2 w-full py-4 bg-[#86162f] text-white font-poppins text-[10px] uppercase tracking-widest hover:bg-[#a82043] transition-colors disabled:opacity-60"
                >
                  {submitting ? 'Sending…' : 'Send Enquiry'}
                </button>
              </form>
            )}
          </div>

          {/* ── Sidebar ───────────────────────────────────────────── */}
          <aside className="flex flex-col gap-8 lg:pt-8">
            <div>
              <p className="font-poppins text-[9px] uppercase tracking-[0.4em] text-[#f8aeb2] mb-3">Email</p>
              <a href="mailto:hello@lafete365.com" className="font-poppins text-sm text-[#86162f] hover:opacity-70 transition-opacity">
                hello@lafete365.com
              </a>
            </div>
            <div>
              <p className="font-poppins text-[9px] uppercase tracking-[0.4em] text-[#f8aeb2] mb-3">Phone</p>
              <a href="tel:+919867281799" className="font-poppins text-sm text-[#86162f] hover:opacity-70 transition-opacity">
                +91 98672 81799
              </a>
            </div>
            <div>
              <p className="font-poppins text-[9px] uppercase tracking-[0.4em] text-[#f8aeb2] mb-3">Location</p>
              <p className="font-poppins text-sm text-[#86162f]">Mumbai, India</p>
            </div>
            <div className="w-full h-px bg-[#86162f]/10" />
            <div>
              <p className="font-poppins text-[9px] uppercase tracking-[0.4em] text-[#86162f]/40 mb-3">Lead Time</p>
              <p className="font-poppins text-xs text-gray-500 leading-relaxed">
                Custom cakes require a minimum of <strong className="text-[#86162f]">48–72 hours</strong> notice. For weddings and large orders, please enquire at least 2 weeks in advance.
              </p>
            </div>
            <div>
              <p className="font-poppins text-[9px] uppercase tracking-[0.4em] text-[#86162f]/40 mb-3">Delivery</p>
              <p className="font-poppins text-xs text-gray-500 leading-relaxed">
                We currently deliver across Mumbai. Delivery charges apply based on your location.
              </p>
            </div>
            <Link
              href="/celebrate"
              className="font-poppins text-[10px] uppercase tracking-widest text-[#86162f]/50 hover:text-[#86162f] transition-colors border-b border-[#86162f]/20 pb-0.5 w-fit"
            >
              ← Back to Celebrate
            </Link>
          </aside>

        </div>
      </div>

      {/* Footer strip */}
      <div className="py-6 border-t border-[#86162f]/10 text-center">
        <p className="font-poppins text-[10px] uppercase tracking-widest text-[#86162f]/30">
          © 2026 La Fête 365 · Mumbai
        </p>
      </div>
    </main>
  );
}
