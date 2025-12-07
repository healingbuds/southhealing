import ScrollAnimation from "@/components/ScrollAnimation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import cultivationImage from "@/assets/cultivation-contrast-hq.jpg";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const Cultivation = () => {
  const imageRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: imageRef,
    offset: ["start end", "end start"]
  });
  
  const imageY = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);
  
  return (
    <section className="bg-background py-12 sm:py-16 md:py-20 px-2">
      <div className="max-w-[1920px] mx-auto px-2">
        <ScrollAnimation>
          <div ref={imageRef} className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl group">
          <motion.img 
            style={{ y: imageY }}
            src={cultivationImage} 
            alt="Indoor cannabis cultivation facility with advanced lighting" 
            className="w-full h-[450px] sm:h-[400px] md:h-[500px] object-cover object-center transition-transform duration-700 group-hover:scale-105"
          />
          {/* Enhanced multi-layer gradient for maximum contrast */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#1A3C3A]/95 via-[#1A3C3A]/75 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A3C3A]/90 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-[#1A3C3A]/20" />
          
          <div className="absolute inset-0 flex flex-col justify-center px-4 sm:px-8 md:px-16">
            {/* Content card with backdrop */}
            <div className="bg-[#1A3C3A]/60 backdrop-blur-md rounded-2xl p-6 sm:p-8 md:p-10 max-w-3xl border border-white/10 shadow-2xl">
              <h2 className="font-pharma text-2xl sm:text-4xl md:text-5xl font-semibold text-white mb-3 sm:mb-6 tracking-tight leading-tight drop-shadow-lg">
                Production & Processing Excellence
              </h2>
              <p className="font-body text-white/95 text-xs sm:text-base md:text-lg leading-relaxed mb-4 sm:mb-8 drop-shadow-md">
                Our state-of-the-art facilities across South Africa and Portugal span more than 18,000 square metres dedicated to pharmaceutical-grade cannabis production, supporting our annual output of 60 tonnes. With access to diverse strains and genetics from our licensed partner network, we maintain rigorous oversight from seed selection through harvesting and processing. Each batch undergoes comprehensive testing, precise trimming, controlled drying and curing, and careful packaging to ensure consistent quality that meets stringent third-party standards.
              </p>
              <Link 
                to="/what-we-do" 
                className="font-body text-primary hover:text-white font-semibold text-sm sm:text-lg transition-all inline-flex items-center gap-2 group/link bg-primary/20 hover:bg-primary px-6 py-3 rounded-full border border-primary/50 hover:border-primary shadow-lg hover:shadow-primary/50"
              >
                Discover our production standards 
                <span className="transition-transform group-hover/link:translate-x-1">→</span>
              </Link>
            </div>
          </div>

          {/* Navigation arrows */}
          <div className="hidden sm:flex absolute bottom-8 right-8 gap-3 z-10">
            <button className="w-12 h-12 rounded-full border-2 border-white/40 hover:border-white hover:bg-white/20 flex items-center justify-center text-white transition-all backdrop-blur-sm hover:scale-110 shadow-lg">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button className="w-12 h-12 rounded-full border-2 border-white/40 hover:border-white hover:bg-white/20 flex items-center justify-center text-white transition-all backdrop-blur-sm hover:scale-110 shadow-lg">
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
          </div>
        </ScrollAnimation>
      </div>
    </section>
  );
};

export default Cultivation;
