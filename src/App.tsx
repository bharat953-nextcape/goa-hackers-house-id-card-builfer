import { useState, useRef, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { toJpeg } from 'html-to-image';
import heic2any from 'heic2any';
import { Upload, Download, Twitter, RefreshCw, Loader2, X, Rotate3D } from 'lucide-react';
import QRCode from 'react-qr-code';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from './utils/cropImage';
import { CursorSprinkler } from './components/CursorSprinkler';

const BUILDER_TITLES = [
  "10x Copy-Paster",
  "Based Builder",
  "Vim Enthusiast",
  "Shipoor",
  "Terminal Dweller",
  "Midnight Coder",
  "Full-Stack Sorcerer",
  "Bug Bounty Hunter",
  "Prompt Engineer",
  "Design Engineer",
  "Web3 Wizard",
  "React Maxi",
  "Pixel Pusher",
  "Code Artisan",
  "Deployer of Doom",
  "Hackathon Hero",
  "Open Source Contributor",
  "CSS Wizard",
  "Backend Boss",
  "Frontend Magician",
  "Database Whisperer",
  "Cloud Architect",
  "AI Whisperer",
  "Rustacean",
  "Solidity Savant",
  "DevOps Guru",
  "Agile Acrobat"
];

// Premium 2D Graphics (Using high-res Native Emojis with drop shadows to look like 2D stickers)
const PremiumGraphic = ({ emoji, className }: { emoji: string, className?: string }) => (
  <div 
    className={`absolute select-none pointer-events-none ${className}`}
    style={{ filter: 'drop-shadow(0px 15px 15px rgba(0,0,0,0.5))' }}
  >
    <span className="leading-none">{emoji}</span>
  </div>
);

export default function App() {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [tempPhotoUrl, setTempPhotoUrl] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [name, setName] = useState<string>('');
  const [role, setRole] = useState<string>('');
  const [title, setTitle] = useState<string>(BUILDER_TITLES[0]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  
  
  const [isFlipped, setIsFlipped] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      let processableFile = file;
      
      // Convert HEIC if needed
      if (file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif')) {
        const converted = await heic2any({
          blob: file,
          toType: 'image/jpeg',
          quality: 0.8
        });
        processableFile = Array.isArray(converted) ? converted[0] : converted;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setTempPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(processableFile as Blob);
    } catch (error) {
      console.error("Error processing image", error);
      alert("Failed to process image. Try a standard JPG or PNG.");
    } finally {
      setIsProcessing(false);
    }
  };

  const onCropComplete = (croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleConfirmCrop = async () => {
    if (!tempPhotoUrl || !croppedAreaPixels) return;
    try {
      const croppedImage = await getCroppedImg(tempPhotoUrl, croppedAreaPixels);
      setPhotoUrl(croppedImage);
      setTempPhotoUrl(null);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      
      // Auto-scroll down on mobile/tablet devices
      if (window.innerWidth < 1024) {
        setTimeout(() => {
          document.getElementById('id-card-preview')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
      }
    } catch (e) {
      console.error(e);
      alert("Failed to crop image.");
    }
  };

  const handleRandomizeTitle = () => {
    const currentIndex = BUILDER_TITLES.indexOf(title);
    let nextIndex = currentIndex;
    while (nextIndex === currentIndex) {
      nextIndex = Math.floor(Math.random() * BUILDER_TITLES.length);
    }
    setTitle(BUILDER_TITLES[nextIndex]);
  };

  const downloadImage = async () => {
    if (!cardRef.current) return;
    
    try {
      setIsProcessing(true);
      // Small delay to ensure fonts/images are rendered
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Safari workaround: call once to warm up the cache
      try {
        await toJpeg(cardRef.current, { quality: 0.1, pixelRatio: 1 });
      } catch (e) { /* ignore */ }

      const dataUrl = await toJpeg(cardRef.current, {
        quality: 1.0,
        pixelRatio: 3,
        backgroundColor: '#0c5933',
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left'
        }
      });
      
      const link = document.createElement('a');
      link.download = `hh-goa-2026-${name.toLowerCase().replace(/\s+/g, '-') || 'id'}.jpg`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return dataUrl;
    } catch (err) {
      console.error('Error generating image', err);
      alert('Failed to generate image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const shareToX = async () => {
    // Generate and download first, then open X
    await downloadImage();
    
    const text = encodeURIComponent(`I'm building at Hacker House Goa 2026! 🌴💻\n\n#FrameInGoa @247pmstudio`);
    const xUrl = `https://twitter.com/intent/tweet?text=${text}`;
    
    // Open X intent in new tab
    window.open(xUrl, '_blank');
    
    // Alert user to attach the downloaded image
    setTimeout(() => {
      alert("Your ID card has been downloaded! Don't forget to attach it to your tweet.");
    }, 500);
  };

  const backCard = (
    <div className="w-[420px] h-[580px] md:w-[440px] md:h-[600px] rounded-[32px] shadow-[0_30px_70px_rgba(0,0,0,0.85)] relative overflow-hidden -mt-4 border-[6px] border-black flex flex-col justify-between pt-16 p-8 bg-[url('https://i.ibb.co/6JN3Lg8q/270dada5-8d44-4afd-a060-78cc270afcb1.png')] bg-cover bg-center">
      <div className="absolute inset-0 bg-[#0c5933]/60 mix-blend-multiply pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-72 h-72 bg-[#117643] rounded-full blur-[80px] -mr-20 -mt-20 opacity-60"></div>
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-pink-500/25 rounded-full blur-[100px] -ml-20 -mb-20"></div>
      <div className="relative z-10 flex flex-col items-center w-full h-full justify-between">
        <div className="text-center w-full mt-2">
          <h2 className="font-['Oswald'] text-4xl md:text-5xl font-black text-[#FFD700] tracking-tight uppercase mb-1 drop-shadow-md">
            Hacker House
          </h2>
          <p className="font-['Space_Mono'] text-white text-xs md:text-sm font-bold tracking-widest uppercase opacity-90">
            Official Access Pass
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-2xl border-4 border-black">
          <QRCode value="https://example.com/hackerhouse-goa" size={150} />
        </div>

        <div className="text-center w-full space-y-4 font-['Space_Mono'] text-[#FFD700] text-xs md:text-sm font-bold tracking-widest uppercase">
          <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-[#FFD700]/50 to-transparent"></div>
          <div className="space-y-1.5 text-white">
            <p>Venue: <span className="text-[#FFD700]">Goa, India</span></p>
            <p>Dates: <span className="text-[#FFD700]">Oct 28-31, 2026</span></p>
          </div>
          <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-[#FFD700]/50 to-transparent"></div>
        </div>
      </div>
    </div>
  );

  const frontCard = (
    <div className="w-[420px] h-[580px] md:w-[440px] md:h-[600px] rounded-[32px] shadow-[0_30px_70px_rgba(0,0,0,0.85)] relative overflow-hidden -mt-4 border-[6px] border-black flex flex-col justify-between bg-[url('https://i.ibb.co/6JN3Lg8q/270dada5-8d44-4afd-a060-78cc270afcb1.png')] bg-cover bg-center">
      <div className="absolute inset-0 bg-[#0c5933]/60 mix-blend-multiply pointer-events-none"></div>
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-90">
        <PremiumGraphic emoji="🛟" className="text-8xl -bottom-8 -right-6" />
        <PremiumGraphic emoji="🥥" className="text-7xl top-12 -left-4 opacity-90" />
        <PremiumGraphic emoji="👒" className="text-7xl top-44 -right-2 opacity-90" />
        <PremiumGraphic emoji="🦀" className="text-6xl bottom-24 left-4" />
        <PremiumGraphic emoji="🏖️" className="text-8xl top-[58%] -right-8 opacity-80" />
      </div>

      <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-16 h-4 bg-black rounded-full border border-white/20 shadow-inner z-30"></div>

      <div className="absolute top-0 right-0 w-72 h-72 bg-[#117643] rounded-full blur-[80px] -mr-20 -mt-20 opacity-60"></div>
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-pink-500/25 rounded-full blur-[100px] -ml-20 -mb-20"></div>

      {/* Card Header */}
      <div className="pt-16 px-6 pb-2 relative z-10 text-center">
        <div className="relative inline-block w-full">
          <h2 className="font-['Oswald'] text-[3.8rem] md:text-[4.2rem] font-black text-[#FFD700] tracking-tighter uppercase transform scale-y-125 leading-[0.82] drop-shadow-md">
            Hacker<br />House
          </h2>
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[38%] font-['Noto_Sans_Devanagari'] text-6xl md:text-7xl text-[#FF007F] font-black italic drop-shadow-[0_4px_16px_rgba(255,0,127,0.9)] rotate-[-6deg]">
            गोवा
          </span>
        </div>
      </div>

      {/* Date & Location Bar */}
      <div className="w-full flex justify-between items-center px-6 py-2 z-10 border-y-2 border-black font-['Space_Mono'] text-[#0c5933] text-xs font-extrabold tracking-widest uppercase bg-[#FFD700] shadow-md">
        <span>Goa, India</span>
        <span>28-31 Oct '26</span>
      </div>

      {/* Photo & Bio Section */}
      <div className="flex-1 flex flex-col items-center justify-center p-5 z-10 w-full relative">
        <div className="relative w-44 h-44 md:w-48 md:h-48 mb-8 mt-1">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#FFD700] to-pink-500 blur-md opacity-70"></div>
          <div className="relative w-full h-full rounded-2xl overflow-hidden border-4 border-black bg-black/60 shadow-2xl">
            {photoUrl ? (
              <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#FFD700]/50 font-['Space_Mono'] text-sm font-bold text-center p-4 border-2 border-dashed border-[#FFD700]/40 m-2 rounded-xl" style={{ width: 'calc(100% - 16px)', height: 'calc(100% - 16px)' }}>
                UPLOAD<br/>PHOTO
              </div>
            )}
          </div>
          
          <div className="absolute -bottom-6 z-20 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#FF007F] text-white px-5 py-2 rounded-full text-xs font-extrabold tracking-widest uppercase font-['Space_Mono'] shadow-xl border-2 border-black">
            {title}
          </div>
        </div>

        <div className="text-center w-full mt-8 space-y-1">
          <h3 className="font-['Oswald'] text-[2.2rem] md:text-[2.6rem] font-black text-white leading-tight uppercase tracking-wide drop-shadow-lg overflow-hidden text-ellipsis whitespace-nowrap px-4">
            {name || "YOUR NAME"}
          </h3>
          <p className="font-['Space_Mono'] text-[#FFD700] text-xs md:text-sm font-bold tracking-widest uppercase opacity-95 overflow-hidden text-ellipsis whitespace-nowrap px-4 drop-shadow">
            {role || "YOUR ROLE / STACK"}
          </p>
        </div>
      </div>

      {/* Card Footer */}
      <div className="pb-4 px-6 flex justify-between items-end z-10 font-['Space_Mono'] text-xs font-bold text-white/80 tracking-widest uppercase">
        <span>2:47 PM STUDIO</span>
        <span className="text-[#FFD700]">#FrameInGoa</span>
      </div>
    </div>
  );

  return (
    <>
      <AnimatePresence>
        {showIntro && (
          <motion.div
            key="intro"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed inset-0 z-50 flex flex-col text-[#FFD700] overflow-y-auto select-none bg-[url('https://i.ibb.co/6JN3Lg8q/270dada5-8d44-4afd-a060-78cc270afcb1.png')] bg-cover bg-center bg-no-repeat"
          >
            <div className="min-h-full w-full flex flex-col bg-[#0c5933]/60 backdrop-blur-[2px]">
            {/* Header */}
            <div className="flex justify-between items-start p-6 md:p-12 relative z-10">
              <motion.div 
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="font-['Space_Mono'] font-bold text-xl md:text-2xl leading-tight"
              >
                2:47<span className="text-sm align-top">PM</span><br/>STUDIO
              </motion.div>
              
              <motion.div 
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex items-center gap-6 font-['Space_Mono'] uppercase tracking-widest text-sm"
              >
                <a 
                  href="https://hhgoa.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden md:inline text-white hover:text-[#FFD700] cursor-pointer transition-colors"
                >
                  CHECK HYPE
                </a>
                <button 
                  onClick={() => setShowIntro(false)}
                  className="bg-[#FFD700] text-[#0c5933] font-bold px-6 py-2 border-2 border-dashed border-[#FF007F] shadow-[0_0_15px_rgba(255,215,0,0.5)] hover:bg-white hover:text-black hover:border-black transition-all"
                >
                  MAKE ID
                </button>
              </motion.div>
            </div>

            {/* Center Hanging ID Card */}
            <div className="flex-1 flex items-start justify-center relative w-full h-full max-w-7xl mx-auto pt-2 md:pt-6 overflow-visible">
              <motion.div 
                initial={{ y: -800, rotateZ: 15 }}
                animate={{ y: 0, rotateZ: 0 }}
                transition={{ type: "spring", damping: 12, stiffness: 50 }}
                className="relative text-center w-full flex justify-center origin-top select-none"
              >
                {/* Hanging Intro Card Container */}
                <div 
                  className="flex flex-col items-center relative z-20 drop-shadow-2xl cursor-pointer group" 
                  onClick={() => setShowIntro(false)}
                >
                  {/* Strap */}
                  <div className="w-12 md:w-16 h-[25vh] md:h-[35vh] bg-[#FF007F] absolute bottom-full mb-[-15px] rounded-t-sm bg-gradient-to-t from-pink-800 to-[#FF007F] border-x border-pink-900 shadow-inner overflow-hidden origin-bottom">
                     <div className="w-full h-full opacity-20 bg-[repeating-linear-gradient(45deg,transparent,transparent_2px,#000_2px,#000_4px)]"></div>
                  </div>
                  {/* Clip */}
                  <div className="w-10 md:w-12 h-8 md:h-10 bg-gradient-to-b from-zinc-300 via-zinc-400 to-zinc-500 rounded-t-lg border-x border-t border-zinc-200 shadow-inner relative z-10 flex justify-center pt-1.5">
                     <div className="w-5 md:w-6 h-1 md:h-1.5 bg-zinc-200/60 rounded-full shadow-inner"></div>
                  </div>
                  <div className="w-6 md:w-8 h-6 md:h-8 bg-gradient-to-b from-zinc-400 to-zinc-600 rounded-b-xl shadow-[0_10px_20px_rgba(0,0,0,0.5)] -mt-1 md:-mt-2 z-30 flex justify-center items-end pb-1 md:pb-1.5 border-b border-zinc-400">
                     <div className="w-3 md:w-4 h-2 md:h-3 border-2 border-zinc-800/40 rounded-b-lg border-t-0 shadow-sm"></div>
                  </div>

                  {/* Intro Card */}
                  <div className="w-[300px] md:w-[420px] h-[450px] md:h-[600px] bg-[#0c5933] rounded-2xl shadow-[0_40px_80px_rgba(0,0,0,0.7)] relative overflow-hidden -mt-3 md:-mt-4 border border-[#FFD700]/30 flex flex-col group-hover:border-[#FFD700] transition-colors duration-500"
                       style={{ backgroundColor: '#0c5933' }}>
                    
                    {/* Hole punch */}
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 md:w-14 h-2.5 md:h-3.5 bg-zinc-900 rounded-full border border-white/10 shadow-[inset_0_4px_6px_rgba(0,0,0,0.6)] z-20"></div>

                    {/* Background Gradients */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#117643] rounded-full blur-[80px] -mr-20 -mt-20 opacity-50"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500/20 rounded-full blur-[100px] -ml-20 -mb-20"></div>
                    <div className="absolute inset-0 pointer-events-none opacity-20 z-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPHBhdGggZD0iTTAgMEw4IDhaTTAgOEw4IDBaIiBzdHJva2U9IiMwMDAiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz4KPC9zdmc+')] mix-blend-overlay"></div>

                    <div className="pt-14 md:pt-20 px-6 pb-2 relative z-10 text-center">
                      <div className="relative inline-block w-full">
                        <motion.h2 
                          initial={{ opacity: 0, scale: 0.8, y: 30 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          transition={{ delay: 0.3, duration: 0.6, type: "spring", damping: 15 }}
                          className="font-['Oswald'] text-[3.8rem] md:text-[5.8rem] font-bold text-[#FFD700] tracking-tighter uppercase transform scale-y-[1.3] leading-[0.85]"
                        >
                          HACKER<br />HOUSE
                        </motion.h2>

                        <motion.span 
                          initial={{ opacity: 0, scale: 3.2, rotate: -35, filter: "blur(12px)" }}
                          animate={{ opacity: 1, scale: 1, rotate: -10, filter: "blur(0px)" }}
                          transition={{ delay: 0.8, type: "spring", stiffness: 220, damping: 12 }}
                          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[20%] font-['Noto_Sans_Devanagari'] text-6xl md:text-8xl text-[#FF007F] font-black italic drop-shadow-[0_10px_25px_rgba(255,0,127,0.9)] pointer-events-none select-none"
                        >
                          गोवा
                        </motion.span>
                      </div>
                    </div>

                    <motion.div 
                      initial={{ opacity: 0, y: 30, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: 1.2, type: "spring", stiffness: 120, damping: 14 }}
                      className="flex-1 flex items-center justify-center p-6 relative z-10 w-full mt-2 md:mt-8"
                    >
                       <button 
                         onClick={(e) => { e.stopPropagation(); setShowIntro(false); }}
                         className="bg-[#FFD700] text-[#0c5933] font-['Space_Mono'] font-bold uppercase tracking-widest px-6 md:px-10 py-4 md:py-5 text-sm md:text-base border-2 border-[#FF007F] shadow-[0_10px_30px_rgba(255,215,0,0.5)] group-hover:bg-white group-hover:text-black group-hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 w-[90%] mx-auto rounded-xl"
                       >
                         <span>Make Your ID Card</span>
                         <span className="group-hover:translate-x-1 transition-transform">→</span>
                       </button>
                    </motion.div>

                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.4 }}
                      className="absolute bottom-6 md:bottom-8 left-0 w-full px-8 flex justify-between items-end z-10 font-['Space_Mono'] text-[10px] md:text-xs text-[#FFD700]/80 tracking-widest uppercase"
                    >
                      <span>Goa, India</span>
                      <span>Oct 28-31 '26</span>
                    </motion.div>

                  </div>
                </div>
              </motion.div>
            </div>

            {/* Footer */}
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex justify-between items-end p-6 md:p-12 font-['Space_Mono'] uppercase tracking-widest text-xs md:text-sm relative z-10"
            >
              <div>GOA, INDIA <span className="text-[#FF007F] mx-2">•</span> 28 - 31 OCT 2026</div>
              <div className="hidden sm:block">2:47 PM STUDIO</div>
            </motion.div>
            </div>
          </motion.div>
        )}
        
        {tempPhotoUrl && (
          <div className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-4">
            <div className="relative w-full max-w-lg h-[60vh] bg-black rounded-xl overflow-hidden mb-6">
              <Cropper
                image={tempPhotoUrl}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            <div className="w-full max-w-lg space-y-4 px-4">
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                aria-labelledby="Zoom"
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full accent-[#FF007F]"
              />
              <div className="flex gap-4">
                <button 
                  onClick={() => setTempPhotoUrl(null)}
                  className="flex-1 bg-zinc-800 text-white font-bold py-3 rounded-xl uppercase tracking-widest text-sm hover:bg-zinc-700 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirmCrop}
                  className="flex-1 bg-[#FFD700] text-black font-bold py-3 rounded-xl uppercase tracking-widest text-sm hover:bg-white transition-colors"
                >
                  Confirm Crop
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {!showIntro && (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="min-h-screen bg-[url('https://i.ibb.co/6JN3Lg8q/270dada5-8d44-4afd-a060-78cc270afcb1.png')] bg-cover bg-center bg-fixed text-[#FFD700] font-['Space_Mono'] selection:bg-[#FF007F] selection:text-white pb-20 relative overflow-hidden"
      >
      <div className="min-h-screen w-full bg-[#0c5933]/75 backdrop-blur-[3px]">
      
      {/* Header */}
      <header className="border-b border-[#0a4829] bg-[#0c5933]/90 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold tracking-tighter text-[#FFD700] font-['Playfair_Display']">
              HH GOA 2026
            </span>
            <span className="bg-[#FF007F] text-white text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
              ID Generator
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 lg:py-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
          
          {/* Left Column: Controls */}
          <div className="lg:col-span-5 space-y-8 relative z-20">
            <div>
              <h1 className="text-4xl font-black mb-2 font-['Oswald'] tracking-tight text-[#FFD700] uppercase">Build Your ID</h1>
              <p className="text-green-100/90 text-sm">Upload your photo and generate your official Hacker House Goa 2026 digital badge.</p>
            </div>

            <div className="space-y-6 bg-[#0a4829]/90 border border-[#FFD700]/30 p-6 rounded-2xl shadow-2xl backdrop-blur-md">
              
              {/* Photo Upload */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-widest text-[#FFD700]">Profile Photo</label>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[#FFD700]/30 rounded-xl hover:border-[#FFD700] hover:bg-white/5 transition-colors cursor-pointer overflow-hidden group bg-black/30">
                  {isProcessing ? (
                    <div className="flex flex-col items-center text-[#FFD700]">
                      <RefreshCw className="w-6 h-6 animate-spin mb-2" />
                      <span className="text-sm">Processing image...</span>
                    </div>
                  ) : photoUrl ? (
                    <div className="relative w-full h-full">
                      <img src={photoUrl} alt="Preview" className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="bg-[#FF007F] text-white px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 backdrop-blur-sm shadow-xl uppercase">
                          <Upload className="w-4 h-4" /> Change Photo
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-[#FFD700]/70 group-hover:text-[#FFD700] transition-colors">
                      <Upload className="w-8 h-8 mb-2" />
                      <span className="text-sm font-bold uppercase">Click to upload</span>
                      <span className="text-xs text-[#FFD700]/50 mt-1">JPG, PNG, or HEIC</span>
                    </div>
                  )}
                  <input type="file" className="hidden" accept="image/jpeg, image/png, image/heic" onChange={handleFileUpload} />
                </label>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="name" className="block text-xs font-bold uppercase tracking-widest text-[#FFD700]">Name</label>
                  <input 
                    id="name"
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Satoshi Nakamoto"
                    className="w-full bg-black/40 border border-[#FFD700]/30 rounded-xl px-4 py-3 text-white placeholder-[#FFD700]/30 focus:outline-none focus:border-[#FF007F] focus:ring-1 focus:ring-[#FF007F] transition-all"
                    maxLength={20}
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label htmlFor="role" className="block text-xs font-bold uppercase tracking-widest text-[#FFD700]">Stack / Role</label>
                  <input 
                    id="role"
                    type="text" 
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="Full-Stack / Rust / Sol"
                    className="w-full bg-black/40 border border-[#FFD700]/30 rounded-xl px-4 py-3 text-white placeholder-[#FFD700]/30 focus:outline-none focus:border-[#FF007F] focus:ring-1 focus:ring-[#FF007F] transition-all"
                    maxLength={30}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-widest text-[#FFD700]">
                    Builder Title
                  </label>
                  <select 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-black/40 border border-[#FFD700]/30 rounded-xl px-4 py-3 text-[#FFD700]/90 focus:outline-none focus:border-[#FF007F] focus:ring-1 focus:ring-[#FF007F] transition-all  cursor-pointer"
                  >
                    {BUILDER_TITLES.map((t) => (
                      <option key={t} value={t} className="bg-[#0c5933] text-white">
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

            </div>
          </div>

          {/* Right Column: Preview & Output */}
          <div id="id-card-preview" className="lg:col-span-7 flex flex-col items-center lg:items-start mt-48 lg:mt-0 relative z-10">
            <div className="sticky top-24 w-full flex flex-col items-center lg:items-start">
              
              {/* Card Canvas Area */}
              <div className="w-full flex justify-center lg:justify-start mb-6 rounded-2xl" style={{ perspective: '1200px' }}>
                <div className="transform scale-[0.7] sm:scale-[0.85] md:scale-100 origin-top relative z-10 w-full flex justify-center md:justify-start">
                  <motion.div
                    initial={{ y: -400, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: "spring", damping: 15, stiffness: 80 }}
                  >
                    <motion.div 
                      className="w-[450px] h-[670px] select-none relative cursor-pointer"
                      onClick={() => setIsFlipped(!isFlipped)}
                      animate={{ rotateY: isFlipped ? 180 : 0 }}
                      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                      style={{ transformStyle: 'preserve-3d' }}
                    >
                    {/* Front Face (includes Lanyard and FrontCard) */}
                    <div 
                      className="absolute inset-0 w-[450px] h-[670px] bg-transparent flex flex-col items-center justify-center overflow-visible"
                      style={{ backfaceVisibility: 'hidden' }}
                    >
                      <div className="relative z-10 flex flex-col items-center">
                        <div className="flex flex-col items-center relative z-20 drop-shadow-2xl">
                          <div className="w-16 h-48 bg-[#FF007F] absolute bottom-full mb-[-15px] rounded-t-sm bg-gradient-to-t from-pink-800 to-[#FF007F] border-x border-pink-900 shadow-inner overflow-hidden">
                             <div className="w-full h-full opacity-20 bg-[repeating-linear-gradient(45deg,transparent,transparent_2px,#000_2px,#000_4px)]"></div>
                             <div className="absolute inset-0 flex flex-col items-center justify-end pb-4 space-y-4">
                                <span className="text-white/60 font-bold tracking-widest text-[10px] -rotate-90 whitespace-nowrap font-['Space_Mono']">HH GOA 2026</span>
                                <span className="text-white/60 font-bold tracking-widest text-[10px] -rotate-90 whitespace-nowrap font-['Space_Mono'] mt-12">HH GOA 2026</span>
                             </div>
                          </div>
                          <div className="w-12 h-10 bg-gradient-to-b from-zinc-300 via-zinc-400 to-zinc-500 rounded-t-lg border-x border-t border-zinc-200 shadow-inner relative z-10 flex justify-center pt-1.5">
                             <div className="w-6 h-1.5 bg-zinc-200/60 rounded-full shadow-inner"></div>
                          </div>
                          <div className="w-8 h-8 bg-gradient-to-b from-zinc-400 to-zinc-600 rounded-b-xl shadow-[0_10px_20px_rgba(0,0,0,0.5)] -mt-2 z-30 flex justify-center items-end pb-1.5 border-b border-zinc-400">
                             <div className="w-4 h-3 border-2 border-zinc-800/40 rounded-b-lg border-t-0 shadow-sm"></div>
                          </div>
                        </div>
                        {frontCard}
                      </div>
                    </div>

                    {/* Back Face (includes Lanyard and BackCard) */}
                    <div 
                      className="absolute inset-0 w-[450px] h-[670px] bg-transparent flex flex-col items-center justify-center overflow-visible"
                      style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                    >
                      <div className="relative z-10 flex flex-col items-center">
                        <div className="flex flex-col items-center relative z-20 drop-shadow-2xl">
                          <div className="w-16 h-48 bg-[#FF007F] absolute bottom-full mb-[-15px] rounded-t-sm bg-gradient-to-t from-pink-800 to-[#FF007F] border-x border-pink-900 shadow-inner overflow-hidden">
                             <div className="w-full h-full opacity-20 bg-[repeating-linear-gradient(45deg,transparent,transparent_2px,#000_2px,#000_4px)]"></div>
                             <div className="absolute inset-0 flex flex-col items-center justify-end pb-4 space-y-4">
                                <span className="text-white/60 font-bold tracking-widest text-[10px] -rotate-90 whitespace-nowrap font-['Space_Mono']">HH GOA 2026</span>
                                <span className="text-white/60 font-bold tracking-widest text-[10px] -rotate-90 whitespace-nowrap font-['Space_Mono'] mt-12">HH GOA 2026</span>
                             </div>
                          </div>
                          <div className="w-12 h-10 bg-gradient-to-b from-zinc-300 via-zinc-400 to-zinc-500 rounded-t-lg border-x border-t border-zinc-200 shadow-inner relative z-10 flex justify-center pt-1.5">
                             <div className="w-6 h-1.5 bg-zinc-200/60 rounded-full shadow-inner"></div>
                          </div>
                          <div className="w-8 h-8 bg-gradient-to-b from-zinc-400 to-zinc-600 rounded-b-xl shadow-[0_10px_20px_rgba(0,0,0,0.5)] -mt-2 z-30 flex justify-center items-end pb-1.5 border-b border-zinc-400">
                             <div className="w-4 h-3 border-2 border-zinc-800/40 rounded-b-lg border-t-0 shadow-sm"></div>
                          </div>
                        </div>
                        {backCard}
                      </div>
                    </div>
                  </motion.div>
                  </motion.div>
                </div>
              </div>

              {/* Hidden 2D Export Card for clean screenshots without 3D transforms */}
              <div className="absolute top-[-9999px] left-[-9999px] pointer-events-none -z-50">
                <div ref={cardRef} className="w-[450px] h-[670px] bg-transparent flex flex-col items-center justify-center relative overflow-visible">
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="flex flex-col items-center relative z-20 drop-shadow-2xl">
                      <div className="w-16 h-48 bg-[#FF007F] absolute bottom-full mb-[-15px] rounded-t-sm bg-gradient-to-t from-pink-800 to-[#FF007F] border-x border-pink-900 shadow-inner overflow-hidden">
                         <div className="w-full h-full opacity-20 bg-[repeating-linear-gradient(45deg,transparent,transparent_2px,#000_2px,#000_4px)]"></div>
                         <div className="absolute inset-0 flex flex-col items-center justify-end pb-4 space-y-4">
                            <span className="text-white/60 font-bold tracking-widest text-[10px] -rotate-90 whitespace-nowrap font-['Space_Mono']">HH GOA 2026</span>
                            <span className="text-white/60 font-bold tracking-widest text-[10px] -rotate-90 whitespace-nowrap font-['Space_Mono'] mt-12">HH GOA 2026</span>
                         </div>
                      </div>
                      <div className="w-12 h-10 bg-gradient-to-b from-zinc-300 via-zinc-400 to-zinc-500 rounded-t-lg border-x border-t border-zinc-200 shadow-inner relative z-10 flex justify-center pt-1.5">
                         <div className="w-6 h-1.5 bg-zinc-200/60 rounded-full shadow-inner"></div>
                      </div>
                      <div className="w-8 h-8 bg-gradient-to-b from-zinc-400 to-zinc-600 rounded-b-xl shadow-[0_10px_20px_rgba(0,0,0,0.5)] -mt-2 z-30 flex justify-center items-end pb-1.5 border-b border-zinc-400">
                         <div className="w-4 h-3 border-2 border-zinc-800/40 rounded-b-lg border-t-0 shadow-sm"></div>
                      </div>
                    </div>
                    {frontCard}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 w-full max-w-[450px]">
                <button 
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="w-full bg-black/60 text-[#FFD700] hover:bg-black/90 font-bold uppercase tracking-widest py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 border border-[#FFD700]/30 shadow-lg"
                >
                  <Rotate3D className="w-5 h-5" />
                  {isFlipped ? "Show Front Side" : "Flip to Back Side"}
                </button>
                <div className="flex gap-3 w-full">
                  <button 
                    onClick={downloadImage}
                  disabled={!photoUrl || isProcessing}
                  className="flex-1 bg-[#FFD700] text-[#0c5933] hover:bg-white disabled:bg-black/40 disabled:text-white/30 font-bold uppercase tracking-widest py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 border border-[#FFD700]/50 disabled:border-transparent shadow-lg"
                >
                  {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                  {isProcessing ? 'Processing...' : 'Download ID'}
                </button>
                <button 
                  onClick={shareToX}
                  disabled={!photoUrl || isProcessing}
                  className="flex-1 bg-black text-[#FFD700] hover:bg-black/80 disabled:bg-black/40 disabled:text-white/30 font-bold uppercase tracking-widest py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 border border-[#FFD700]/50 disabled:border-transparent shadow-lg"
                >
                  <Twitter className="w-5 h-5" />
                  Share to X
                </button>
              </div>
              {!photoUrl && (
                <p className="text-center text-xs text-[#FFD700]/70 mt-3 font-bold uppercase tracking-widest w-full max-w-[450px]">Upload a photo to unlock actions</p>
              )}
            </div>
            </div>
          </div>
        </div>
      </main>
    </div>
    </motion.div>
    )}
    <CursorSprinkler />
    </>
  );
}
