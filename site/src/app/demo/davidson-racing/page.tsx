'use client';

import { useState } from 'react';

export default function DavidsonRacingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const services = [
    {
      title: 'Race Prep',
      description: 'Full mechanical preparation, safety inspections, and competition readiness checks. We ensure your machine is built to win.',
      icon: '🔧',
    },
    {
      title: 'Trackside Support',
      description: 'Professional pit crew support during race weekends. Real-time telemetry, quick repairs, and strategic guidance.',
      icon: '🏁',
    },
    {
      title: 'Driver Coaching',
      description: 'One-on-one instruction from experienced racers. Master racing lines, braking zones, and competitive techniques.',
      icon: '🎯',
    },
    {
      title: 'Vehicle Setup',
      description: 'Suspension tuning, alignment optimization, and track-specific configurations for maximum performance.',
      icon: '⚙️',
    },
  ];

  const galleryImages = [
    { id: 1, label: 'Victory Lane 2014' },
    { id: 2, label: 'Pit Crew Action' },
    { id: 3, label: 'Night Racing' },
    { id: 4, label: 'Team Strategy' },
    { id: 5, label: 'Podium Finish' },
    { id: 6, label: 'Track Day' },
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Custom Styles */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Russo+One&family=Rajdhani:wght@400;500;600;700&display=swap');
        
        .font-racing { font-family: 'Russo One', sans-serif; }
        .font-tech { font-family: 'Rajdhani', sans-serif; }
        
        .speed-lines {
          background: repeating-linear-gradient(
            -45deg,
            transparent,
            transparent 2px,
            rgba(227, 24, 55, 0.1) 2px,
            rgba(227, 24, 55, 0.1) 4px
          );
        }
        
        .diagonal-cut {
          clip-path: polygon(0 0, 100% 0, 100% calc(100% - 60px), 0 100%);
        }
        
        .diagonal-cut-reverse {
          clip-path: polygon(0 0, 100% 60px, 100% 100%, 0 100%);
        }
        
        .speedometer-logo {
          background: conic-gradient(
            from 180deg,
            #E31837 0deg,
            #E31837 90deg,
            #1a1a1a 90deg,
            #1a1a1a 180deg,
            #E31837 180deg,
            #E31837 270deg,
            #1a1a1a 270deg
          );
        }
        
        .red-glow {
          box-shadow: 0 0 40px rgba(227, 24, 55, 0.4), 0 0 80px rgba(227, 24, 55, 0.2);
        }
        
        .racing-stripe {
          background: linear-gradient(90deg, #E31837 0%, #E31837 33%, #fff 33%, #fff 66%, #E31837 66%);
        }
        
        @keyframes pulse-red {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        .animate-pulse-red {
          animation: pulse-red 2s ease-in-out infinite;
        }
        
        @keyframes slide-in {
          from { transform: translateX(-100px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        .animate-slide-in {
          animation: slide-in 0.6s ease-out forwards;
        }
        
        .carbon-fiber {
          background: 
            repeating-linear-gradient(
              45deg,
              #111 0px,
              #111 2px,
              #1a1a1a 2px,
              #1a1a1a 4px
            ),
            repeating-linear-gradient(
              -45deg,
              #111 0px,
              #111 2px,
              #1a1a1a 2px,
              #1a1a1a 4px
            );
        }
        
        .checkered-flag {
          background: 
            repeating-conic-gradient(
              #fff 0deg 90deg,
              #000 90deg 180deg
            );
          background-size: 20px 20px;
        }
      `}</style>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-sm border-b border-[#E31837]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-full speedometer-logo flex items-center justify-center red-glow">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-black flex items-center justify-center">
                  <span className="text-[#E31837] font-bold text-sm md:text-lg">DR</span>
                </div>
              </div>
              <div className="hidden sm:block">
                <h1 className="font-racing text-xl md:text-2xl tracking-wide">
                  <span className="text-white">DAVIDSON</span>
                  <span className="text-[#E31837]"> RACING</span>
                </h1>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#about" className="font-tech text-gray-300 hover:text-[#E31837] transition-colors font-semibold tracking-wide">About</a>
              <a href="#services" className="font-tech text-gray-300 hover:text-[#E31837] transition-colors font-semibold tracking-wide">Services</a>
              <a href="#gallery" className="font-tech text-gray-300 hover:text-[#E31837] transition-colors font-semibold tracking-wide">Gallery</a>
              <a href="#contact" className="font-tech bg-[#E31837] text-white px-6 py-2 font-bold tracking-wider hover:bg-red-700 transition-colors" style={{ clipPath: 'polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%)' }}>
                CONTACT
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden text-white p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-[#E31837]/30">
              <div className="flex flex-col gap-4">
                <a href="#about" className="font-tech text-gray-300 hover:text-[#E31837] transition-colors font-semibold tracking-wide" onClick={() => setMobileMenuOpen(false)}>About</a>
                <a href="#services" className="font-tech text-gray-300 hover:text-[#E31837] transition-colors font-semibold tracking-wide" onClick={() => setMobileMenuOpen(false)}>Services</a>
                <a href="#gallery" className="font-tech text-gray-300 hover:text-[#E31837] transition-colors font-semibold tracking-wide" onClick={() => setMobileMenuOpen(false)}>Gallery</a>
                <a href="#contact" className="font-tech text-[#E31837] font-bold tracking-wide" onClick={() => setMobileMenuOpen(false)}>Contact</a>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center diagonal-cut overflow-hidden">
        {/* Background with racing aesthetic */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black">
          {/* Speed lines overlay */}
          <div className="absolute inset-0 speed-lines opacity-50"></div>
          
          {/* Dramatic red accent */}
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#E31837]/20 to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-[#E31837]/10 to-transparent"></div>
          
          {/* Racing stripes */}
          <div className="absolute top-1/2 -translate-y-1/2 right-0 w-4 h-64 bg-[#E31837]"></div>
          <div className="absolute top-1/2 -translate-y-1/2 right-8 w-2 h-48 bg-white"></div>
          <div className="absolute top-1/2 -translate-y-1/2 right-14 w-1 h-32 bg-[#E31837]"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
          <div className="text-center">
            {/* Championship Badge */}
            <div className="inline-flex items-center gap-2 bg-[#E31837] px-6 py-2 mb-8 animate-pulse-red" style={{ clipPath: 'polygon(20px 0, 100% 0, calc(100% - 20px) 100%, 0 100%)' }}>
              <span className="text-2xl">🏆</span>
              <span className="font-racing text-lg md:text-xl tracking-wider">2014 NASA 25 HOUR CHAMPIONS</span>
            </div>

            {/* Main Title */}
            <h1 className="font-racing text-5xl sm:text-7xl md:text-8xl lg:text-9xl tracking-tight mb-6">
              <span className="text-white">DAVIDSON</span>
              <br />
              <span className="text-[#E31837] drop-shadow-[0_0_30px_rgba(227,24,55,0.5)]">RACING</span>
            </h1>

            {/* Location Badge */}
            <div className="flex items-center justify-center gap-2 mb-8">
              <div className="w-12 h-px bg-[#E31837]"></div>
              <span className="font-tech text-gray-400 text-lg tracking-[0.3em] uppercase">Sparks, Nevada</span>
              <div className="w-12 h-px bg-[#E31837]"></div>
            </div>

            {/* Tagline */}
            <p className="font-tech text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto mb-12 leading-relaxed">
              Championship-proven race preparation, trackside support, and driver development. 
              <span className="text-[#E31837] font-bold"> Built to win.</span>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a 
                href="#services" 
                className="group relative bg-[#E31837] text-white font-racing text-lg px-10 py-4 tracking-wider hover:bg-red-700 transition-all duration-300 red-glow"
                style={{ clipPath: 'polygon(15px 0, 100% 0, calc(100% - 15px) 100%, 0 100%)' }}
              >
                <span className="relative z-10">OUR SERVICES</span>
              </a>
              <a 
                href="#contact" 
                className="group border-2 border-white text-white font-racing text-lg px-10 py-4 tracking-wider hover:bg-white hover:text-black transition-all duration-300"
                style={{ clipPath: 'polygon(15px 0, 100% 0, calc(100% - 15px) 100%, 0 100%)' }}
              >
                GET IN TOUCH
              </a>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="font-tech text-sm text-gray-500 tracking-widest">SCROLL</span>
          <div className="w-6 h-10 border-2 border-gray-600 rounded-full flex items-start justify-center p-2">
            <div className="w-1.5 h-3 bg-[#E31837] rounded-full animate-bounce"></div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="relative py-24 md:py-32 carbon-fiber">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Image/Placeholder */}
            <div className="relative">
              <div className="aspect-[4/3] bg-gradient-to-br from-gray-800 to-gray-900 relative overflow-hidden" style={{ clipPath: 'polygon(0 0, 100% 30px, 100% 100%, 0 calc(100% - 30px))' }}>
                {/* Placeholder race car silhouette */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-8xl mb-4">🏎️</div>
                    <span className="font-tech text-gray-600 text-sm tracking-widest">RACE READY</span>
                  </div>
                </div>
                {/* Red accent overlay */}
                <div className="absolute bottom-0 left-0 right-0 h-2 bg-[#E31837]"></div>
              </div>
              {/* Floating badge */}
              <div className="absolute -bottom-6 -right-6 bg-[#E31837] p-6 red-glow">
                <span className="font-racing text-4xl">25</span>
                <span className="block font-tech text-sm tracking-wider">HOUR RACE</span>
              </div>
            </div>

            {/* Content */}
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-1 bg-[#E31837]"></div>
                <span className="font-tech text-[#E31837] tracking-[0.3em] uppercase font-bold">About Us</span>
              </div>
              
              <h2 className="font-racing text-4xl md:text-5xl lg:text-6xl mb-6">
                BUILT FOR <span className="text-[#E31837]">VICTORY</span>
              </h2>
              
              <p className="font-tech text-gray-400 text-lg leading-relaxed mb-6">
                Based in Sparks, Nevada, Davidson Racing has been setting the pace in endurance racing since we first hit the track. Our crowning achievement—the <span className="text-white font-bold">2014 NASA 25 Hour Championship</span>—wasn&apos;t just a win. It was proof of what happens when preparation meets determination.
              </p>
              
              <p className="font-tech text-gray-400 text-lg leading-relaxed mb-8">
                Led by owner <span className="text-white font-bold">Bob Davidson</span> with crew members <span className="text-white font-bold">PJ Losey</span> and <span className="text-white font-bold">Ron B</span>, our team brings decades of combined experience to every project. We don&apos;t just prepare cars—we build winners.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center p-4 border border-gray-800 hover:border-[#E31837] transition-colors">
                  <span className="font-racing text-3xl md:text-4xl text-[#E31837]">25+</span>
                  <span className="block font-tech text-sm text-gray-500 mt-1">Years Racing</span>
                </div>
                <div className="text-center p-4 border border-gray-800 hover:border-[#E31837] transition-colors">
                  <span className="font-racing text-3xl md:text-4xl text-[#E31837]">50+</span>
                  <span className="block font-tech text-sm text-gray-500 mt-1">Races Won</span>
                </div>
                <div className="text-center p-4 border border-gray-800 hover:border-[#E31837] transition-colors">
                  <span className="font-racing text-3xl md:text-4xl text-[#E31837]">100%</span>
                  <span className="block font-tech text-sm text-gray-500 mt-1">Commitment</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="relative py-24 md:py-32 bg-black diagonal-cut-reverse">
        {/* Background accents */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-[#E31837]/5 to-transparent"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="w-16 h-1 bg-[#E31837]"></div>
              <span className="font-tech text-[#E31837] tracking-[0.3em] uppercase font-bold">What We Do</span>
              <div className="w-16 h-1 bg-[#E31837]"></div>
            </div>
            <h2 className="font-racing text-4xl md:text-5xl lg:text-6xl">
              OUR <span className="text-[#E31837]">SERVICES</span>
            </h2>
          </div>

          {/* Services Grid */}
          <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
            {services.map((service, index) => (
              <div 
                key={index}
                className="group relative bg-gradient-to-br from-gray-900 to-black border border-gray-800 hover:border-[#E31837] transition-all duration-300 p-8 overflow-hidden"
                style={{ clipPath: 'polygon(0 0, calc(100% - 30px) 0, 100% 30px, 100% 100%, 0 100%)' }}
              >
                {/* Corner accent */}
                <div className="absolute top-0 right-0 w-0 h-0 border-l-[30px] border-l-transparent border-t-[30px] border-t-[#E31837] group-hover:border-t-red-600 transition-colors"></div>
                
                {/* Icon */}
                <div className="text-5xl mb-6">{service.icon}</div>
                
                {/* Content */}
                <h3 className="font-racing text-2xl mb-4 group-hover:text-[#E31837] transition-colors">
                  {service.title}
                </h3>
                <p className="font-tech text-gray-400 leading-relaxed">
                  {service.description}
                </p>

                {/* Hover line */}
                <div className="absolute bottom-0 left-0 w-0 h-1 bg-[#E31837] group-hover:w-full transition-all duration-500"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="relative py-24 md:py-32 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="w-16 h-1 bg-[#E31837]"></div>
              <span className="font-tech text-[#E31837] tracking-[0.3em] uppercase font-bold">Gallery</span>
              <div className="w-16 h-1 bg-[#E31837]"></div>
            </div>
            <h2 className="font-racing text-4xl md:text-5xl lg:text-6xl">
              RACE <span className="text-[#E31837]">MOMENTS</span>
            </h2>
          </div>

          {/* Gallery Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {galleryImages.map((image) => (
              <div 
                key={image.id}
                className="group relative aspect-square bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden cursor-pointer"
              >
                {/* Placeholder */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl md:text-6xl mb-2 opacity-30 group-hover:opacity-50 transition-opacity">📸</div>
                  </div>
                </div>
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <span className="font-tech text-sm tracking-wider text-white">{image.label}</span>
                  </div>
                </div>

                {/* Border effect */}
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-[#E31837] transition-colors duration-300"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="relative py-24 md:py-32 bg-black">
        {/* Background */}
        <div className="absolute inset-0 speed-lines opacity-30"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
            {/* Contact Info */}
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-1 bg-[#E31837]"></div>
                <span className="font-tech text-[#E31837] tracking-[0.3em] uppercase font-bold">Contact</span>
              </div>
              
              <h2 className="font-racing text-4xl md:text-5xl lg:text-6xl mb-8">
                LET&apos;S <span className="text-[#E31837]">RACE</span>
              </h2>
              
              <p className="font-tech text-gray-400 text-lg leading-relaxed mb-10">
                Ready to take your racing to the next level? Whether you need full race prep, trackside support, or just want to talk racing, we&apos;re here for you.
              </p>

              {/* Contact Details */}
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#E31837]/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">📍</span>
                  </div>
                  <div>
                    <h4 className="font-racing text-lg mb-1">Location</h4>
                    <p className="font-tech text-gray-400">1355 Greg Street<br />Sparks, NV</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#E31837]/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">📞</span>
                  </div>
                  <div>
                    <h4 className="font-racing text-lg mb-1">Phone</h4>
                    <a href="tel:7753580742" className="font-tech text-[#E31837] hover:text-red-400 transition-colors">(775) 358-0742</a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#E31837]/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">🏆</span>
                  </div>
                  <div>
                    <h4 className="font-racing text-lg mb-1">The Team</h4>
                    <p className="font-tech text-gray-400">Bob Davidson (Owner)<br />PJ Losey &amp; Ron B (Crew)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 p-8 lg:p-10" style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 40px), calc(100% - 40px) 100%, 0 100%)' }}>
              <h3 className="font-racing text-2xl mb-6">SEND A MESSAGE</h3>
              
              <form className="space-y-6">
                <div>
                  <label className="font-tech text-sm text-gray-400 tracking-wider block mb-2">NAME</label>
                  <input 
                    type="text" 
                    className="w-full bg-black border border-gray-700 focus:border-[#E31837] outline-none px-4 py-3 font-tech text-white transition-colors"
                    placeholder="Your Name"
                  />
                </div>
                
                <div>
                  <label className="font-tech text-sm text-gray-400 tracking-wider block mb-2">EMAIL</label>
                  <input 
                    type="email" 
                    className="w-full bg-black border border-gray-700 focus:border-[#E31837] outline-none px-4 py-3 font-tech text-white transition-colors"
                    placeholder="your@email.com"
                  />
                </div>
                
                <div>
                  <label className="font-tech text-sm text-gray-400 tracking-wider block mb-2">MESSAGE</label>
                  <textarea 
                    rows={4}
                    className="w-full bg-black border border-gray-700 focus:border-[#E31837] outline-none px-4 py-3 font-tech text-white transition-colors resize-none"
                    placeholder="Tell us about your project..."
                  ></textarea>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-[#E31837] text-white font-racing text-lg py-4 tracking-wider hover:bg-red-700 transition-colors red-glow"
                  style={{ clipPath: 'polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%)' }}
                >
                  SEND MESSAGE
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative bg-black border-t border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full speedometer-logo flex items-center justify-center">
                <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center">
                  <span className="text-[#E31837] font-bold text-xs">DR</span>
                </div>
              </div>
              <span className="font-racing text-lg">
                <span className="text-white">DAVIDSON</span>
                <span className="text-[#E31837]"> RACING</span>
              </span>
            </div>

            {/* Championship Badge */}
            <div className="flex items-center gap-2 text-gray-500">
              <span className="text-lg">🏆</span>
              <span className="font-tech text-sm tracking-wider">2014 NASA 25 HOUR CHAMPIONS</span>
            </div>

            {/* Copyright */}
            <div className="font-tech text-sm text-gray-600">
              © {new Date().getFullYear()} Davidson Racing. All rights reserved.
            </div>
          </div>

          {/* Racing stripe */}
          <div className="mt-8 h-1 w-full bg-gradient-to-r from-transparent via-[#E31837] to-transparent"></div>
        </div>
      </footer>
    </div>
  );
}
