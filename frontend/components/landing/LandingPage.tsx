"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import {
  Flame,
  ChevronRight,
  Plug,
  Thermometer,
  Zap,
  Truck,
  Building2,
  HardHat,
  Check,
  ArrowRight,
  Menu,
  X,
} from "lucide-react"
import { useState } from "react"

// ── Animation Variants ──────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" as const } },
}

function AnimatedSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={fadeUp}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ── Data ────────────────────────────────────────────────────

const STEPS = [
  {
    icon: Plug,
    title: "Connect Your Tools",
    body: "Link EchoHeat to your existing truck tracking, building management, or construction apps. Takes less than 5 minutes.",
  },
  {
    icon: Thermometer,
    title: "We Watch the Heat",
    body: "EchoHeat reads real-time temperature data from street level \u2014 not from an airport 20 miles away. Accurate to 2 meters.",
  },
  {
    icon: Zap,
    title: "Automatic Protection",
    body: "When heat gets dangerous, EchoHeat acts instantly \u2014 cools your truck, adjusts your building, or alerts your workers. You do nothing.",
  },
]

const USE_CASES = [
  {
    icon: Truck,
    title: "Truck & Delivery",
    problem: "Your frozen cargo goes bad because the truck gets too hot during delivery.",
    solution: "Automatically pre-cools the truck and changes the route before the temperature spikes. Saves up to $150,000 per load.",
    roi: "14.6x return on investment",
  },
  {
    icon: HardHat,
    title: "Construction",
    problem: "Workers get heat stroke and the government fines you because you don\u2019t have proof of safety.",
    solution: "Automatically sends rest break alerts to supervisors and saves a legal record of every safety decision made on site.",
    roi: "11.6x return on investment",
  },
  {
    icon: Building2,
    title: "Building Managers",
    problem: "Your electricity bill skyrockets every summer because all air conditioners turn on at once.",
    solution: "Automatically pre-cools the building at night when electricity is cheap, so you never hit the expensive peak hours.",
    roi: "2.8x return on investment",
  },
]

const COMPARISON = [
  { without: "You check temperatures yourself every few hours", with_: "EchoHeat checks every 5 minutes automatically" },
  { without: "Someone has to act on every alert", with_: "EchoHeat acts instantly, no human needed" },
  { without: "Paper logs that get lost", with_: "Digital records saved forever, legally valid" },
  { without: "Damage happens first, you react after", with_: "Problems prevented before they cause damage" },
  { without: "Cost: Staff time + losses", with_: "Cost: Small monthly fee" },
]

const PRICING = [
  {
    name: "Construction Safety",
    price: "$499",
    period: "/ site / month",
    who: "Construction companies",
    popular: false,
    features: [
      "Real-time heat alerts for workers",
      "Automatic rest break notifications",
      "Legal compliance records",
      "Works with Procore",
    ],
  },
  {
    name: "Truck & Delivery",
    price: "$899",
    period: "/ depot / month",
    who: "Delivery & logistics companies",
    popular: true,
    features: [
      "Automatic truck pre-cooling",
      "Smart route adjustments",
      "Cargo temperature protection",
      "Works with Samsara & Geotab",
    ],
  },
  {
    name: "Buildings & Facilities",
    price: "$1,499",
    period: "/ building / month",
    who: "Commercial property managers",
    popular: false,
    features: [
      "Smart pre-cooling schedules",
      "Lower electricity bills",
      "Equipment protection",
      "Works with BACnet BMS",
    ],
  },
]

const STATS = [
  { value: "$150,000", label: "Saved per cargo incident prevented" },
  { value: "$160,000", label: "Maximum OSHA fine avoided" },
  { value: "83.8%", label: "Gross margin (we are profitable)" },
  { value: "< 24 hrs", label: "Time to set up and go live" },
]

// ── Component ───────────────────────────────────────────────

export function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#09090B] text-[#FAFAFA] font-sans">
      {/* ── NAVBAR ─────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between border-b border-[rgba(63,63,70,0.4)] bg-[#09090B]/80 px-6 sm:px-12 h-16 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Flame className="size-6 text-orange-500" />
          <span className="text-xl font-black text-white">
            Echo<span className="text-orange-500">Heat</span>
          </span>
        </div>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#how-it-works" className="text-sm text-[#A1A1AA] hover:text-white transition-colors">
            How It Works
          </a>
          <a href="#features" className="text-sm text-[#A1A1AA] hover:text-white transition-colors">
            Features
          </a>
          <a href="#pricing" className="text-sm text-[#A1A1AA] hover:text-white transition-colors">
            Pricing
          </a>
        </div>

        {/* CTA buttons */}
        <div className="flex items-center gap-3">
          <a href="/login" className="hidden sm:block text-sm text-[#A1A1AA] hover:text-white transition-colors px-4 py-2">
            Sign In
          </a>
          <a
            href="/signup"
            className="text-sm font-semibold px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white transition-all"
          >
            Get Started Free
          </a>
          {/* Mobile menu toggle */}
          <button
            className="md:hidden text-[#A1A1AA] hover:text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-[#09090B]/95 pt-20 px-6 md:hidden">
          <div className="flex flex-col gap-6">
            <a href="#how-it-works" className="text-lg text-[#A1A1AA] hover:text-white" onClick={() => setMobileMenuOpen(false)}>
              How It Works
            </a>
            <a href="#features" className="text-lg text-[#A1A1AA] hover:text-white" onClick={() => setMobileMenuOpen(false)}>
              Features
            </a>
            <a href="#pricing" className="text-lg text-[#A1A1AA] hover:text-white" onClick={() => setMobileMenuOpen(false)}>
              Pricing
            </a>
            <a href="/login" className="text-lg text-[#A1A1AA] hover:text-white" onClick={() => setMobileMenuOpen(false)}>
              Sign In
            </a>
          </div>
        </div>
      )}

      {/* ── HERO ───────────────────────────────────────────── */}
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-16">
        {/* Orange radial glow */}
        <div className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[800px] rounded-full bg-orange-500/8 blur-[120px]" />

        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="relative z-10 mx-auto max-w-4xl text-center"
        >
          <motion.h1
            variants={fadeUp}
            className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight leading-[1.1]"
          >
            Stop Losing Money
            <br />
            <span className="text-orange-500">to Heat.</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-[#A1A1AA] leading-relaxed"
          >
            EchoHeat automatically protects your trucks, buildings, and workers from extreme heat
            &mdash; before damage happens. No manual work required.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white hover:bg-orange-600 transition-all"
            >
              Start For Free <ChevronRight className="size-4" />
            </a>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 rounded-xl border border-[rgba(63,63,70,0.6)] px-6 py-3 text-sm font-medium text-[#A1A1AA] hover:text-white hover:border-[rgba(63,63,70,1)] transition-all"
            >
              See How It Works
            </a>
          </motion.div>

          <motion.div variants={fadeUp} className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-[#A1A1AA]">
            <span className="flex items-center gap-1"><Check className="size-3 text-orange-500" /> Used by 200+ companies</span>
            <span className="flex items-center gap-1"><Check className="size-3 text-orange-500" /> Saves $150,000+ per incident</span>
            <span className="flex items-center gap-1"><Check className="size-3 text-orange-500" /> Zero setup time</span>
          </motion.div>
        </motion.div>

        {/* Dashboard mockup */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="relative z-10 mx-auto mt-16 w-full max-w-4xl"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            {/* Browser chrome */}
            <div className="rounded-t-xl border border-b-0 border-[rgba(63,63,70,0.6)] bg-[#18181B] p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex gap-1.5">
                  <div className="size-2.5 rounded-full bg-[#3F3F46]" />
                  <div className="size-2.5 rounded-full bg-[#3F3F46]" />
                  <div className="size-2.5 rounded-full bg-[#3F3F46]" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="mx-auto max-w-md rounded-lg bg-[#27272A] px-3 py-1 text-center text-xs text-[#A1A1AA]">
                    echoheat.vercel.app/dashboard
                  </div>
                </div>
              </div>
              {/* Fake dashboard content */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                {["Avg WBGT", "Peak Demand", "OSHA Logs", "Fleet Uptime"].map((label) => (
                  <div key={label} className="rounded-lg bg-[#27272A] p-3">
                    <div className="text-[10px] text-[#A1A1AA]">{label}</div>
                    <div className="text-lg font-bold text-white mt-1">
                      {label === "Fleet Uptime" ? "99.2%" : label === "Avg WBGT" ? "34.2\u00B0C" : label === "Peak Demand" ? "780 kW" : "7"}
                    </div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="col-span-2 rounded-lg bg-[#27272A] p-4">
                  <div className="text-xs text-[#A1A1AA] mb-2">Thermal Alert Map</div>
                  <div className="h-24 sm:h-32 rounded bg-[#09090B] flex items-center justify-center relative overflow-hidden">
                    <div className="absolute top-[30%] left-[35%] size-12 rounded-full bg-orange-500/20 blur-xl" />
                    <div className="absolute top-[50%] left-[60%] size-8 rounded-full bg-yellow-500/20 blur-xl" />
                    <div className="text-xs text-[#A1A1AA]">Live Heat Corridors</div>
                  </div>
                </div>
                <div className="rounded-lg bg-[#27272A] p-4">
                  <div className="text-xs text-[#A1A1AA] mb-2">Active Alerts</div>
                  <div className="flex flex-col gap-2">
                    {["CRITICAL", "WARNING", "INFO"].map((s) => (
                      <div key={s} className="flex items-center gap-2 text-[10px]">
                        <span className={`size-1.5 rounded-full ${s === "CRITICAL" ? "bg-red-500" : s === "WARNING" ? "bg-yellow-500" : "bg-blue-500"}`} />
                        <span className="text-[#A1A1AA]">{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            {/* Browser bottom border + glow */}
            <div className="h-2 rounded-b-xl border border-t-0 border-[rgba(63,63,70,0.6)] bg-[#18181B]" />
          </motion.div>
          {/* Orange glow under mockup */}
          <div className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 h-16 w-3/4 rounded-full bg-orange-500/10 blur-2xl" />
        </motion.div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────── */}
      <section id="how-it-works" className="px-6 sm:px-12 py-24 sm:py-32">
        <AnimatedSection className="mx-auto max-w-5xl text-center">
          <h2 className="text-3xl sm:text-4xl font-black">How EchoHeat Works</h2>
          <p className="mt-3 text-[#A1A1AA]">Three simple steps. Fully automatic.</p>
        </AnimatedSection>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer}
          className="mx-auto mt-16 grid max-w-5xl gap-8 sm:grid-cols-3"
        >
          {STEPS.map((step, i) => (
            <motion.div key={i} variants={fadeUp} className="flex flex-col items-center text-center">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-500">
                <step.icon className="size-6" />
              </div>
              <div className="mt-4 text-xs font-semibold uppercase tracking-wider text-orange-500">
                Step {i + 1}
              </div>
              <h3 className="mt-2 text-lg font-bold">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#A1A1AA]">{step.body}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── USE CASES ──────────────────────────────────────── */}
      <section id="features" className="px-6 sm:px-12 py-24 sm:py-32 bg-[#18181B]/50">
        <AnimatedSection className="mx-auto max-w-6xl text-center">
          <h2 className="text-3xl sm:text-4xl font-black">Who Uses EchoHeat?</h2>
          <p className="mt-3 text-[#A1A1AA]">Built for three industries that lose the most to extreme heat.</p>
        </AnimatedSection>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer}
          className="mx-auto mt-16 grid max-w-6xl gap-6 sm:grid-cols-3"
        >
          {USE_CASES.map((uc, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              className="flex flex-col rounded-2xl border border-[rgba(63,63,70,0.6)] bg-[#18181B] p-6"
            >
              <div className="flex size-12 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500">
                <uc.icon className="size-6" />
              </div>
              <h3 className="mt-4 text-lg font-bold">{uc.title}</h3>

              <div className="mt-4">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-red-400">The Problem</span>
                <p className="mt-1 text-sm text-[#A1A1AA] leading-relaxed">{uc.problem}</p>
              </div>

              <div className="mt-4">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-green-400">What EchoHeat Does</span>
                <p className="mt-1 text-sm text-[#A1A1AA] leading-relaxed">{uc.solution}</p>
              </div>

              <div className="mt-auto pt-4">
                <span className="inline-block rounded-full bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-500">
                  {uc.roi}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── COMPARISON TABLE ───────────────────────────────── */}
      <section className="px-6 sm:px-12 py-24 sm:py-32">
        <AnimatedSection className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl sm:text-4xl font-black">EchoHeat vs. Doing It Manually</h2>
        </AnimatedSection>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeUp}
          className="mx-auto mt-12 max-w-4xl overflow-hidden rounded-2xl border border-[rgba(63,63,70,0.6)]"
        >
          {/* Header */}
          <div className="grid grid-cols-2 bg-[#18181B] text-sm font-semibold">
            <div className="px-6 py-4 text-[#A1A1AA]">Without EchoHeat</div>
            <div className="px-6 py-4 text-orange-500">With EchoHeat</div>
          </div>
          {/* Rows */}
          {COMPARISON.map((row, i) => (
            <div
              key={i}
              className={`grid grid-cols-2 text-sm ${i % 2 === 0 ? "bg-[#09090B]" : "bg-[#18181B]/50"}`}
            >
              <div className="px-6 py-4 text-[#A1A1AA] border-r border-[rgba(63,63,70,0.3)]">{row.without}</div>
              <div className="px-6 py-4 text-white">{row.with_}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ── PRICING ────────────────────────────────────────── */}
      <section id="pricing" className="px-6 sm:px-12 py-24 sm:py-32 bg-[#18181B]/50">
        <AnimatedSection className="mx-auto max-w-5xl text-center">
          <h2 className="text-3xl sm:text-4xl font-black">Simple, Honest Pricing</h2>
          <p className="mt-3 text-[#A1A1AA]">Pay only for what you need. Cancel anytime.</p>
        </AnimatedSection>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer}
          className="mx-auto mt-16 grid max-w-5xl gap-6 sm:grid-cols-3"
        >
          {PRICING.map((plan, i) => (
            <motion.div
              key={i}
              variants={scaleIn}
              whileHover={{ scale: 1.02 }}
              className={`relative flex flex-col rounded-2xl border p-6 ${
                plan.popular
                  ? "border-orange-500 bg-[#18181B]"
                  : "border-[rgba(63,63,70,0.6)] bg-[#18181B]"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-orange-500 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                  Most Popular
                </div>
              )}
              <h3 className="text-lg font-bold">{plan.name}</h3>
              <p className="mt-1 text-xs text-[#A1A1AA]">{plan.who}</p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-black">{plan.price}</span>
                <span className="text-sm text-[#A1A1AA]">{plan.period}</span>
              </div>
              <ul className="mt-6 flex flex-col gap-3 flex-1">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm text-[#A1A1AA]">
                    <Check className="mt-0.5 size-4 flex-shrink-0 text-orange-500" />
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href="/signup"
                className={`mt-6 block rounded-xl py-3 text-center text-sm font-semibold transition-all ${
                  plan.popular
                    ? "bg-orange-500 text-white hover:bg-orange-600"
                    : "border border-[rgba(63,63,70,0.6)] text-[#A1A1AA] hover:text-white hover:border-[rgba(63,63,70,1)]"
                }`}
              >
                Start Free Trial
              </a>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── STATS BAR ──────────────────────────────────────── */}
      <section className="px-6 sm:px-12 py-24 sm:py-32">
        <AnimatedSection className="mx-auto max-w-5xl">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {STATS.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl sm:text-3xl font-black text-orange-500">{stat.value}</div>
                <div className="mt-2 text-xs text-[#A1A1AA] leading-snug">{stat.label}</div>
              </div>
            ))}
          </div>
        </AnimatedSection>
      </section>

      {/* ── FINAL CTA ──────────────────────────────────────── */}
      <section className="px-6 sm:px-12 py-24 sm:py-32">
        <AnimatedSection className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl sm:text-4xl font-black">
            Ready to <span className="text-orange-500">Stop the Heat?</span>
          </h2>
          <p className="mt-4 text-[#A1A1AA]">
            Join 200+ companies already using EchoHeat to protect their assets, workers, and bottom line.
          </p>
          <a
            href="/signup"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-8 py-4 text-sm font-semibold text-white hover:bg-orange-600 transition-all"
          >
            Get Started For Free <ArrowRight className="size-4" />
          </a>
        </AnimatedSection>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────── */}
      <footer className="border-t border-[rgba(63,63,70,0.4)] bg-[#18181B] px-6 sm:px-12 py-12">
        <div className="mx-auto max-w-6xl grid grid-cols-1 gap-8 sm:grid-cols-3">
          {/* Left */}
          <div>
            <div className="flex items-center gap-2">
              <Flame className="size-5 text-orange-500" />
              <span className="text-lg font-black text-white">
                Echo<span className="text-orange-500">Heat</span>
              </span>
            </div>
            <p className="mt-3 text-xs text-[#A1A1AA] leading-relaxed">
              Autonomous Thermal Orchestration Engine
            </p>
            <p className="mt-1 text-xs text-[#A1A1AA]">
              Powered by FortyGuard API
            </p>
          </div>

          {/* Center */}
          <div className="flex flex-col gap-2 sm:items-center">
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-[#A1A1AA]">
              <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
              <a href="#features" className="hover:text-white transition-colors">Features</a>
              <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
              <a href="/login" className="hover:text-white transition-colors">Sign In</a>
              <a href="/signup" className="hover:text-white transition-colors">Get Started</a>
            </div>
          </div>

          {/* Right */}
          <div className="sm:text-right">
            <p className="text-xs text-[#A1A1AA]">&copy; 2024 EchoHeat. All rights reserved.</p>
            <div className="mt-2 flex gap-4 text-xs text-[#A1A1AA] sm:justify-end">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
