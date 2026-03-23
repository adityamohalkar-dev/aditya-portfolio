"use client";
import Image from "next/image";
import { useEffect, useRef } from "react";

export default function Home() {
  const globeRef = useRef<HTMLCanvasElement>(null);
  const bgRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = bgRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const setSize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    setSize();
    window.addEventListener("resize", setSize);
    const particles: { x: number; y: number; vx: number; vy: number; r: number; alpha: number }[] = [];
    for (let i = 0; i < 100; i++) {
      particles.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25, r: Math.random() * 1.5 + 0.3, alpha: Math.random() * 0.35 + 0.08 });
    }
    let raf: number;
    function draw() {
      const w = canvas!.width; const h = canvas!.height;
      ctx!.clearRect(0, 0, w, h);
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x; const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 140) { ctx!.beginPath(); ctx!.moveTo(particles[i].x, particles[i].y); ctx!.lineTo(particles[j].x, particles[j].y); ctx!.strokeStyle = `rgba(110,231,183,${0.05 * (1 - dist / 140)})`; ctx!.lineWidth = 0.4; ctx!.stroke(); }
        }
      }
      particles.forEach((p) => { ctx!.beginPath(); ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx!.fillStyle = `rgba(110,231,183,${p.alpha})`; ctx!.fill(); p.x += p.vx; p.y += p.vy; if (p.x < 0 || p.x > w) p.vx *= -1; if (p.y < 0 || p.y > h) p.vy *= -1; });
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", setSize); };
  }, []);

  useEffect(() => {
    const canvas = globeRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let W = (canvas.width = canvas.offsetWidth); let H = (canvas.height = canvas.offsetHeight);
    const resize = () => { W = canvas.width = canvas.offsetWidth; H = canvas.height = canvas.offsetHeight; };
    window.addEventListener("resize", resize);
    const cx = W * 0.72, cy = H * 0.5, R = Math.min(W, H) * 0.32;
    let rot = 0;
    const dots: { lat: number; lng: number }[] = [];
    for (let i = 0; i < 180; i++) dots.push({ lat: (Math.random() - 0.5) * Math.PI, lng: Math.random() * Math.PI * 2 });
    const arcs: { from: number; to: number; progress: number; speed: number }[] = [];
    for (let i = 0; i < 18; i++) arcs.push({ from: Math.floor(Math.random() * dots.length), to: Math.floor(Math.random() * dots.length), progress: Math.random(), speed: 0.002 + Math.random() * 0.003 });
    const proj = (lat: number, lng: number, r: number) => ({ x: cx + R * Math.cos(lat) * Math.sin(lng + r), y: cy - R * Math.sin(lat), z: R * Math.cos(lat) * Math.cos(lng + r) });
    let raf: number;
    function draw() {
      ctx!.clearRect(0, 0, W, H); ctx!.strokeStyle = "rgba(110,231,183,0.06)"; ctx!.lineWidth = 0.5;
      for (let lat = -80; lat <= 80; lat += 20) { ctx!.beginPath(); let f = true; for (let lng = 0; lng <= 360; lng += 3) { const p = proj(lat * Math.PI / 180, lng * Math.PI / 180, rot); if (p.z < 0) { f = true; continue; } f ? (ctx!.moveTo(p.x, p.y), f = false) : ctx!.lineTo(p.x, p.y); } ctx!.stroke(); }
      for (let lng = 0; lng < 360; lng += 20) { ctx!.beginPath(); let f = true; for (let lat = -90; lat <= 90; lat += 3) { const p = proj(lat * Math.PI / 180, lng * Math.PI / 180, rot); if (p.z < 0) { f = true; continue; } f ? (ctx!.moveTo(p.x, p.y), f = false) : ctx!.lineTo(p.x, p.y); } ctx!.stroke(); }
      dots.forEach(d => { const p = proj(d.lat, d.lng, rot); if (p.z < 0) return; ctx!.beginPath(); ctx!.arc(p.x, p.y, 1.5, 0, Math.PI * 2); ctx!.fillStyle = `rgba(110,231,183,${(p.z / R * 0.8 + 0.2) * 0.7})`; ctx!.fill(); });
      arcs.forEach(arc => {
        const steps = 40, pts = [];
        for (let i = 0; i <= steps; i++) { const t = i / steps; pts.push(proj(dots[arc.from].lat + (dots[arc.to].lat - dots[arc.from].lat) * t, dots[arc.from].lng + (dots[arc.to].lng - dots[arc.from].lng) * t, rot)); }
        const ei = Math.floor(arc.progress * steps);
        ctx!.beginPath(); let f = true;
        for (let i = 0; i <= ei && i < pts.length; i++) { const p = pts[i]; if (p.z < 0) { f = true; continue; } f ? (ctx!.moveTo(p.x, p.y), f = false) : ctx!.lineTo(p.x, p.y); }
        ctx!.strokeStyle = "rgba(110,231,183,0.35)"; ctx!.lineWidth = 0.8; ctx!.stroke();
        if (ei < pts.length && pts[ei].z > 0) { ctx!.beginPath(); ctx!.arc(pts[ei].x, pts[ei].y, 2.5, 0, Math.PI * 2); ctx!.fillStyle = "rgba(110,231,183,0.9)"; ctx!.fill(); }
        arc.progress += arc.speed;
        if (arc.progress > 1) { arc.progress = 0; arc.from = Math.floor(Math.random() * dots.length); arc.to = Math.floor(Math.random() * dots.length); }
      });
      rot += 0.003; raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);

  return (
    <main className="bg-[#060A12] text-[#F1F5F9] min-h-screen font-sans relative">
      <canvas ref={bgRef} className="fixed inset-0 w-full h-full pointer-events-none z-0" />

      <nav className="fixed top-0 left-0 right-0 z-50 px-10 py-4 flex justify-between items-center bg-[#060A12]/80 backdrop-blur-xl border-b border-white/5">
        <span className="font-bold text-xl bg-gradient-to-r from-emerald-400 to-sky-400 bg-clip-text text-transparent">AM.</span>
        <div className="flex gap-8 text-sm text-slate-400">
          <a href="#about" className="hover:text-white transition-colors">About</a>
          <a href="#projects" className="hover:text-white transition-colors">Projects</a>
          <a href="#skills" className="hover:text-white transition-colors">Skills</a>
          <a href="#contact" className="hover:text-white transition-colors">Contact</a>
        </div>
        <a href="http://www.fiverr.com/s/2KRZwdX" target="_blank" rel="noopener noreferrer"
          className="bg-gradient-to-r from-emerald-400 to-green-400 text-[#060A12] px-4 py-2 rounded-lg text-sm font-bold hover:-translate-y-0.5 transition-transform">
          Hire Me →
        </a>
      </nav>

      <section className="min-h-screen flex flex-col justify-center px-10 pt-24 pb-12 relative overflow-hidden z-10">
        <canvas ref={globeRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.85 }} />
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 px-4 py-1.5 rounded-full text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Available for freelance work
          </div>
          <h1 className="text-6xl font-extrabold leading-none tracking-tight mb-6">
            Full Stack Developer<br />
            <span className="bg-gradient-to-r from-emerald-400 via-sky-400 to-violet-400 bg-clip-text text-transparent">&amp; SaaS Builder.</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-xl leading-relaxed mb-8">
            I craft <strong className="text-white">fast, scalable web applications</strong> that clients love. Based in <strong className="text-white">Beed, Maharashtra</strong> — delivering world-class digital products.
          </p>
          <div className="flex gap-3">
            <a href="#projects" className="bg-gradient-to-r from-emerald-400 to-green-400 text-[#060A12] px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-emerald-400/20 hover:-translate-y-1 transition-transform">View My Work →</a>
            <a href="#contact" className="border border-white/10 text-white px-6 py-3 rounded-xl font-medium text-sm hover:border-emerald-400/40 hover:text-emerald-400 transition-all">Let&apos;s Talk</a>
          </div>
          <div className="flex gap-12 mt-14 pt-8 border-t border-white/5">
            {[["3+","Projects Delivered"],["100%","Client Satisfaction"],["18","Years Old"],["∞","Passion for Code"]].map(([n,l])=>(
              <div key={l}><div className="text-3xl font-extrabold text-white">{n}</div><div className="text-xs text-slate-500 mt-0.5">{l}</div></div>
            ))}
          </div>
        </div>
      </section>

      <div className="h-px bg-white/5 max-w-5xl mx-auto relative z-10" />

      <section id="about" className="max-w-5xl mx-auto px-10 py-16 relative z-10">
        <div className="grid grid-cols-[280px_1fr] gap-14 items-center">
          <div className="relative w-[280px] h-[280px]">
            {/* Spinning ring */}
            <div className="absolute inset-0 rounded-full p-[3px]" style={{background:"conic-gradient(from 0deg,#6EE7B7,#38BDF8,#A78BFA,#6EE7B7)",animation:"spin 8s linear infinite"}}>
              <div className="w-full h-full rounded-full bg-[#060A12]" />
            </div>
            {/* Photo */}
            <div className="relative w-[280px] h-[280px] rounded-full overflow-hidden border-4 border-[#060A12]">
              <Image src="/aditya.jpg" alt="Aditya Mohalkar" fill className="object-cover object-top" />
            </div>
            {/* Badge 1 — Next.js Dev */}
            <div className="absolute -top-3 -left-6 bg-[#0A0F1C] border border-white/10 rounded-xl px-3 py-2 flex items-center gap-2 text-xs font-medium shadow-xl z-10"
              style={{animation:"badgeBounce1 3s ease-in-out infinite"}}>
              ⚡ Next.js Dev
            </div>
            {/* Badge 2 — Available Now */}
            <div className="absolute -bottom-3 -right-6 bg-[#0A0F1C] border border-white/10 rounded-xl px-3 py-2 flex items-center gap-2 text-xs font-medium shadow-xl z-10"
              style={{animation:"badgeBounce2 4s ease-in-out infinite"}}>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />Available Now
            </div>
          </div>
          <div>
            <p className="text-xs font-mono text-emerald-400 tracking-widest uppercase mb-2">About Me</p>
            <h2 className="text-4xl font-extrabold tracking-tight leading-tight mb-4">Building the future,<br />one app at a time.</h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-3">I&apos;m Aditya Mohalkar, an 18-year-old Full Stack Developer from Beed, Maharashtra. I specialize in building production-ready SaaS platforms and web apps that are fast, scalable, and beautiful.</p>
            <p className="text-slate-400 text-sm leading-relaxed mb-5">My focus is on delivering exceptional value — when you work with me, you get a product that drives real business results. Every line I write is built to perform.</p>
            <div className="flex flex-wrap gap-2">
              {["Next.js","React","TypeScript","Tailwind CSS","Supabase","Node.js"].map(t=>(
                <span key={t} className="bg-emerald-400/5 border border-emerald-400/15 text-emerald-400 px-3 py-1 rounded-full text-xs font-mono">{t}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="h-px bg-white/5 max-w-5xl mx-auto relative z-10" />

      <section id="projects" className="max-w-5xl mx-auto px-10 py-16 relative z-10">
        <p className="text-xs font-mono text-emerald-400 tracking-widest uppercase mb-2">Work</p>
        <h2 className="text-4xl font-extrabold tracking-tight mb-2">What I&apos;ve Built</h2>
        <p className="text-slate-400 text-sm mb-8">Every project is crafted with precision, performance, and real business impact.</p>
        <div className="grid grid-cols-3 gap-4">
          {[
            {icon:"📊",name:"FinTrack Pro",desc:"Finance dashboard SaaS with real-time analytics, budget tracking, and AI-powered insights.",tags:["Next.js","TypeScript","Supabase","Tailwind"],color:"emerald",demo:"https://fintrack-pro-brown.vercel.app",github:"https://github.com/adityamohalkar-dev"},
            {icon:"🛒",name:"ShopFlow",desc:"Full-featured e-commerce platform with Stripe payments, order tracking, and admin dashboard.",tags:["Next.js","Stripe","Supabase","Tailwind"],color:"sky",demo:"https://shopflow-ecru.vercel.app",github:"https://github.com/adityamohalkar-dev"},
            {icon:"✅",name:"TaskMind",desc:"Smart project management app with team collaboration, task automation and analytics.",tags:["React","Node.js","TypeScript","Tailwind"],color:"violet",demo:"https://taskmind-cyan.vercel.app",github:"https://github.com/adityamohalkar-dev"},
          ].map(p=>(
            <div key={p.name} className="bg-white/[0.025] border border-white/[0.06] rounded-2xl p-6 hover:border-emerald-400/20 hover:-translate-y-1 transition-all">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-4 ${p.color==="emerald"?"bg-emerald-400/10 border border-emerald-400/15":p.color==="sky"?"bg-sky-400/10 border border-sky-400/15":"bg-violet-400/10 border border-violet-400/15"}`}>{p.icon}</div>
              <h3 className="font-bold text-base mb-2">{p.name}</h3>
              <p className="text-slate-400 text-xs leading-relaxed mb-3">{p.desc}</p>
              <div className="flex flex-wrap gap-1 mb-4">{p.tags.map(t=><span key={t} className="bg-[#0F1628] text-slate-500 px-2 py-0.5 rounded text-[10px] font-mono">{t}</span>)}</div>
              <div className="flex gap-3">
                <a href={p.demo} target="_blank" rel="noopener noreferrer" className="text-emerald-400 text-xs font-medium hover:opacity-70 transition-opacity">My Work →</a>
                <a href={p.github} target="_blank" rel="noopener noreferrer" className="text-slate-400 text-xs font-medium hover:text-white transition-colors">GitHub</a>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="h-px bg-white/5 max-w-5xl mx-auto relative z-10" />

      <section id="skills" className="max-w-5xl mx-auto px-10 py-16 relative z-10">
        <p className="text-xs font-mono text-emerald-400 tracking-widest uppercase mb-2">Skills</p>
        <h2 className="text-4xl font-extrabold tracking-tight mb-2">Tech Stack</h2>
        <p className="text-slate-400 text-sm mb-8">Tools I use to build world-class products.</p>
        <div className="grid grid-cols-4 gap-3">
          {[
            {n:"Next.js",l:"Advanced",c:"g"},{n:"React",l:"Advanced",c:"g"},
            {n:"TypeScript",l:"Advanced",c:"b"},{n:"Tailwind CSS",l:"Advanced",c:"g"},
            {n:"Supabase",l:"Intermediate",c:"b"},{n:"Node.js",l:"Intermediate",c:"p"},
            {n:"Vercel",l:"Advanced",c:"b"},{n:"Git & GitHub",l:"Intermediate",c:"p"},
          ].map(s=>(
            <div key={s.n} className="flex justify-between items-center bg-white/[0.025] border border-white/[0.06] rounded-xl px-4 py-3 hover:border-emerald-400/20 transition-all">
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${s.c==="g"?"bg-emerald-400":s.c==="b"?"bg-sky-400":"bg-violet-400"}`} />
                <span className="text-sm font-medium">{s.n}</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500 bg-[#0F1628] px-2 py-0.5 rounded">{s.l}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="h-px bg-white/5 max-w-5xl mx-auto relative z-10" />

      <section id="contact" className="max-w-5xl mx-auto px-10 py-16 relative z-10">
        <div className="bg-[#0F1628]/80 backdrop-blur-sm border border-white/[0.06] rounded-3xl p-14 text-center relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-emerald-400/5 blur-3xl pointer-events-none" />
          <p className="text-xs font-mono text-emerald-400 tracking-widest uppercase mb-3 relative z-10">Contact</p>
          <h2 className="text-4xl font-extrabold tracking-tight mb-3 relative z-10">Ready to build something extraordinary?</h2>
          <p className="text-slate-400 text-sm max-w-md mx-auto mb-8 leading-relaxed relative z-10">Let&apos;s create a product that makes your clients feel like they got a million-dollar deal for a fraction of the price.</p>
          <div className="flex justify-center gap-3 flex-wrap relative z-10">
            <a href="http://www.fiverr.com/s/2KRZwdX" target="_blank" rel="noopener noreferrer"
              className="bg-gradient-to-r from-emerald-400 to-green-400 text-[#060A12] px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-emerald-400/20 hover:-translate-y-0.5 transition-transform">
              Hire me on Fiverr →
            </a>
            <a href="https://mail.google.com/mail/?view=cm&to=adityamohalkar51@gmail.com" target="_blank" rel="noopener noreferrer"
              className="border border-white/10 text-slate-400 px-5 py-2.5 rounded-xl text-sm hover:border-emerald-400/30 hover:text-white transition-all">
              ✉ Email
            </a>
            <a href="https://wa.me/918010840851" target="_blank" rel="noopener noreferrer"
              className="border border-white/10 text-slate-400 px-5 py-2.5 rounded-xl text-sm hover:border-emerald-400/30 hover:text-white transition-all">
              💬 WhatsApp
            </a>
            <a href="https://github.com/adityamohalkar-dev" target="_blank" rel="noopener noreferrer"
              className="border border-white/10 text-slate-400 px-5 py-2.5 rounded-xl text-sm hover:border-emerald-400/30 hover:text-white transition-all">
              ⌨ GitHub
            </a>
          </div>
        </div>
      </section>

      <footer className="text-center py-6 text-slate-600 text-xs font-mono border-t border-white/5 relative z-10">
        Designed &amp; Built by Aditya Mohalkar — Beed, Maharashtra © 2026
      </footer>

      <style jsx global>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes badgeBounce1 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes badgeBounce2 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
      `}</style>

    </main>
  );
}