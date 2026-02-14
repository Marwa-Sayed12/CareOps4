import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, MessageSquare, FileText, Package, ArrowRight, CheckCircle2, Zap, BarChart3, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const Nav = () => {
  const [open, setOpen] = useState(false);
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-primary tracking-tight">CareOps</Link>
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
          <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
          <a href="#contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</a>
          <Link to="/get-started">
            <Button size="sm">Get Started</Button>
          </Link>
        </div>
        <button className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <div className="md:hidden bg-background border-b border-border px-6 py-4 flex flex-col gap-3">
          <a href="#features" className="text-sm text-muted-foreground" onClick={() => setOpen(false)}>Features</a>
          <a href="#how-it-works" className="text-sm text-muted-foreground" onClick={() => setOpen(false)}>How It Works</a>
          <a href="#contact" className="text-sm text-muted-foreground" onClick={() => setOpen(false)}>Contact</a>
          <Link to="/get-started" onClick={() => setOpen(false)}>
            <Button size="sm" className="w-full">Get Started</Button>
          </Link>
        </div>
      )}
    </nav>
  );
};

const Hero = () => (
  <section className="pt-32 pb-20 section-padding">
    <div className="max-w-7xl mx-auto text-center">
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
        <span className="inline-block px-4 py-1.5 rounded-full bg-secondary text-secondary-foreground text-xs font-medium mb-6">
          Unified Operations Platform
        </span>
      </motion.div>
      <motion.h1 initial="hidden" animate="visible" variants={fadeUp} custom={1}
        className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground max-w-4xl mx-auto leading-[1.1]">
        Run Your Entire Business From{" "}
        <span className="text-primary">One Dashboard</span>
      </motion.h1>
      <motion.p initial="hidden" animate="visible" variants={fadeUp} custom={2}
        className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
        Bookings, inbox, forms, automation, and inventory — all connected in one place. Built for clinics and service businesses.
      </motion.p>
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3}
        className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
        <Link to="/get-started">
          <Button size="lg" className="text-base px-8 gap-2">
            Get Started <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
        <a href="#how-it-works">
          <Button variant="outline" size="lg" className="text-base px-8">
            See How It Works
          </Button>
        </a>
      </motion.div>
    </div>
  </section>
);

const problemItems = [
  { icon: BarChart3, label: "One tool for leads" },
  { icon: Calendar, label: "One tool for bookings" },
  { icon: FileText, label: "One tool for forms" },
  { icon: MessageSquare, label: "One tool for messages" },
];

const ProblemSolution = () => (
  <section id="features" className="section-padding bg-muted/50">
    <div className="max-w-7xl mx-auto">
      <div className="grid md:grid-cols-2 gap-16">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
          <span className="text-xs font-semibold uppercase tracking-widest text-destructive">The Problem</span>
          <h2 className="text-3xl font-bold mt-3 mb-6 text-foreground">Too Many Disconnected Tools</h2>
          <div className="space-y-4">
            {problemItems.map((item, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-lg bg-background border border-border">
                <item.icon className="h-5 w-5 text-muted-foreground" />
                <span className="text-foreground">{item.label}</span>
              </div>
            ))}
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-center">
              <span className="text-destructive font-semibold">Result: Chaos & missed follow-ups</span>
            </div>
          </div>
        </motion.div>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}>
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">The Solution</span>
          <h2 className="text-3xl font-bold mt-3 mb-6 text-foreground">One Unified System</h2>
          <div className="space-y-4">
            {["One unified system for everything", "Clear visibility across operations", "Automated workflows & reminders", "No missed follow-ups ever"].map((text, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-lg bg-background border border-primary/20">
                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="text-foreground">{text}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

const steps = [
  { num: "01", title: "Set up your workspace", desc: "Create your business profile, add services, and configure availability in minutes." },
  { num: "02", title: "Connect communication", desc: "Link your email and messaging channels for unified customer conversations." },
  { num: "03", title: "Go live & operate", desc: "Your booking links, forms, and automations are ready. Start serving customers." },
];

const HowItWorks = () => (
  <section id="how-it-works" className="section-padding">
    <div className="max-w-7xl mx-auto text-center">
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
        <span className="text-xs font-semibold uppercase tracking-widest text-primary">How It Works</span>
        <h2 className="text-3xl md:text-4xl font-bold mt-3 mb-12 text-foreground">Up and Running in 3 Steps</h2>
      </motion.div>
      <div className="grid md:grid-cols-3 gap-8">
        {steps.map((step, i) => (
          <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
            className="p-8 rounded-2xl bg-card border border-border text-left">
            <span className="text-4xl font-bold text-primary/20">{step.num}</span>
            <h3 className="text-lg font-semibold mt-4 mb-2 text-foreground">{step.title}</h3>
            <p className="text-sm text-muted-foreground">{step.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer id="contact" className="section-padding bg-foreground text-background">
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start gap-8">
        <div>
          <h3 className="text-xl font-bold mb-2">CareOps</h3>
          <p className="text-sm opacity-70 max-w-xs">Unified operations platform for service-based businesses.</p>
        </div>
        <div className="flex gap-12 text-sm opacity-70">
          <div className="flex flex-col gap-2">
            <a href="#features" className="hover:opacity-100 transition-opacity">Features</a>
            <a href="#how-it-works" className="hover:opacity-100 transition-opacity">How It Works</a>
          </div>
          <div className="flex flex-col gap-2">
            <Link to="/get-started" className="hover:opacity-100 transition-opacity">Get Started</Link>
            <a href="#contact" className="hover:opacity-100 transition-opacity">Contact</a>
          </div>
        </div>
      </div>
      <div className="mt-12 pt-6 border-t border-background/10 text-xs opacity-50 text-center">
        CareOps Hackathon Prototype — Built for demonstration purposes only.
      </div>
    </div>
  </footer>
);

const Index = () => (
  <>
    <Nav />
    <Hero />
    <ProblemSolution />
    <HowItWorks />
    <Footer />
  </>
);

export default Index;
