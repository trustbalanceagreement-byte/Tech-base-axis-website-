"use client";

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

const SQRT_5000 = Math.sqrt(5000);

export interface TestimonialItem {
  tempId: number;
  testimonial: string;
  by: string;
  imgSrc: string;
  rating?: number;
}

export const INITIAL_TESTIMONIALS: TestimonialItem[] = [
  {
    tempId: 0,
    testimonial: "Bikram re-architected our entire distributed core in 3 weeks. P99 latency dropped by 74% on day one.",
    by: "Marcus Vance, CTO at NexusScale",
    imgSrc: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
    rating: 5
  },
  {
    tempId: 1,
    testimonial: "I'm confident our enterprise infrastructure is bulletproof with Tech Base Axis. Truly elite engineering.",
    by: "Danial K., VP of Engineering at SecureData",
    imgSrc: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
    rating: 5
  },
  {
    tempId: 2,
    testimonial: "We were losing days wrestling with pipeline bottlenecks. Bikram's systems scaled seamlessly to 4M+ daily events.",
    by: "Stephanie Ross, COO at InnovateCo",
    imgSrc: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80",
    rating: 5
  },
  {
    tempId: 3,
    testimonial: "Tech Base Axis makes scaling for high-throughput traffic seamless. Can't recommend Bikram enough!",
    by: "Marie Laurent, Product Lead at Horizon FinTech",
    imgSrc: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80",
    rating: 5
  },
  {
    tempId: 4,
    testimonial: "If I could give 11 stars, I'd give 12. Uncompromising attention to architectural precision.",
    by: "Andre Chen, Head of Engineering at CreativeFlow",
    imgSrc: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80",
    rating: 5
  },
  {
    tempId: 5,
    testimonial: "The generative AI reasoning pipeline Bikram architected cut our operational manual review time by 85%.",
    by: "Jeremy Patel, AI Director at Cognition Labs",
    imgSrc: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=300&q=80",
    rating: 5
  },
  {
    tempId: 6,
    testimonial: "Took some convincing to revamp our legacy monolith, but now that we're on Bikram's stack, we'll never look back.",
    by: "Pamela Wright, VP Tech at RetailMatrix",
    imgSrc: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
    rating: 5
  },
  {
    tempId: 7,
    testimonial: "We saved ₹12,00,000 in monthly AWS egress costs within the first quarter thanks to his cache design.",
    by: "Daniel S., Principal Architect at DataStream",
    imgSrc: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80",
    rating: 5
  },
  {
    tempId: 8,
    testimonial: "Zero downtime during our Black Friday surge. Peak concurrency of 45,000 users without a single dropped packet.",
    by: "Fernando M., Founder at UserFirst",
    imgSrc: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80",
    rating: 5
  },
  {
    tempId: 9,
    testimonial: "I've hired dozen of contract architects; Bikram is in the top 0.1% for speed, rigor, and system clarity.",
    by: "Andy Miller, Series-A Founder at CloudMasters",
    imgSrc: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=300&q=80",
    rating: 5
  }
];

interface TestimonialCardProps {
  position: number;
  testimonial: TestimonialItem;
  handleMove: (steps: number) => void;
  cardSize: number;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ 
  position, 
  testimonial, 
  handleMove, 
  cardSize 
}) => {
  const isCenter = position === 0;

  return (
    <div
      onClick={() => handleMove(position)}
      className={cn(
        "absolute left-1/2 top-1/2 cursor-pointer border-2 p-5 sm:p-7 transition-all duration-500 ease-in-out select-none flex flex-col",
        isCenter 
          ? "z-10 bg-[#e61e2b] text-white border-[#e61e2b]" 
          : "z-0 bg-[#121216] text-neutral-300 border-neutral-800 hover:border-[#e61e2b]/50"
      )}
      style={{
        width: cardSize,
        height: cardSize,
        clipPath: `polygon(50px 0%, calc(100% - 50px) 0%, 100% 50px, 100% 100%, calc(100% - 50px) 100%, 50px 100%, 0 100%, 0 0)`,
        transform: `
          translate(-50%, -50%) 
          translateX(${(cardSize / 1.5) * position}px)
          translateY(${isCenter ? -65 : position % 2 ? 15 : -15}px)
          rotate(${isCenter ? 0 : position % 2 ? 2.5 : -2.5}deg)
        `,
        boxShadow: isCenter ? "0px 8px 0px 4px rgba(230,30,43,0.3)" : "0px 0px 0px 0px transparent"
      }}
    >
      <span
        className="absolute block origin-top-right rotate-45 bg-neutral-700"
        style={{
          right: -2,
          top: 48,
          width: SQRT_5000,
          height: 2
        }}
      />
      
      {/* Top row: Avatar & Stars */}
      <div className="flex items-center justify-between mb-3">
        <img
          src={testimonial.imgSrc}
          alt={`${testimonial.by.split(',')[0]}`}
          className="h-12 w-11 sm:h-14 sm:w-12 bg-neutral-900 object-cover object-top rounded-sm shadow-md shrink-0"
          style={{
            boxShadow: "3px 3px 0px rgba(0,0,0,0.6)"
          }}
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.by.split(',')[0] || 'Client')}&background=e61e2b&color=ffffff&bold=true`;
          }}
        />

        {/* 5-star rating */}
        <div className="flex items-center gap-0.5">
          {[...Array(testimonial.rating || 5)].map((_, idx) => (
            <Star 
              key={idx} 
              className={cn(
                "w-3.5 h-3.5",
                isCenter ? "fill-white text-white" : "fill-[#e61e2b] text-[#e61e2b]"
              )} 
            />
          ))}
        </div>
      </div>

      <h3 className={cn(
        "text-xs sm:text-sm md:text-base font-medium leading-snug line-clamp-4 flex-1",
        isCenter ? "text-white font-semibold" : "text-neutral-100"
      )}>
        "{testimonial.testimonial}"
      </h3>
      
      <p className={cn(
        "text-[11px] sm:text-xs italic font-mono pt-2 border-t border-white/20 mt-auto truncate",
        isCenter ? "text-white/90" : "text-neutral-400 border-neutral-800"
      )}>
        - {testimonial.by}
      </p>
    </div>
  );
};

interface StaggerTestimonialsProps {
  testimonials?: TestimonialItem[];
}

export const StaggerTestimonials: React.FC<StaggerTestimonialsProps> = ({
  testimonials: externalTestimonials
}) => {
  const [cardSize, setCardSize] = useState(365);
  const [testimonialsList, setTestimonialsList] = useState<TestimonialItem[]>(() => {
    if (externalTestimonials && externalTestimonials.length > 0) {
      return externalTestimonials;
    }
    try {
      const saved = localStorage.getItem('techbase_client_reviews');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return [...parsed, ...INITIAL_TESTIMONIALS];
        }
      }
    } catch {
      // fallback
    }
    return INITIAL_TESTIMONIALS;
  });

  useEffect(() => {
    if (externalTestimonials && externalTestimonials.length > 0) {
      setTestimonialsList(externalTestimonials);
    }
  }, [externalTestimonials]);

  const handleMove = (steps: number) => {
    const newList = [...testimonialsList];
    if (steps > 0) {
      for (let i = steps; i > 0; i--) {
        const item = newList.shift();
        if (!item) return;
        newList.push({ ...item, tempId: Math.random() });
      }
    } else {
      for (let i = steps; i < 0; i++) {
        const item = newList.pop();
        if (!item) return;
        newList.unshift({ ...item, tempId: Math.random() });
      }
    }
    setTestimonialsList(newList);
  };

  const [isPaused, setIsPaused] = useState(false);

  // Automatic shuffle: automatically rotate cards every 3.5 seconds
  useEffect(() => {
    if (isPaused || testimonialsList.length <= 1) return;

    const autoTimer = setInterval(() => {
      handleMove(1);
    }, 3500);

    return () => clearInterval(autoTimer);
  }, [isPaused, testimonialsList]);

  useEffect(() => {
    const updateSize = () => {
      const { matches } = window.matchMedia("(min-width: 640px)");
      setCardSize(matches ? 365 : 280);
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
      className="relative w-full overflow-hidden bg-[#0a0a0c]/60 rounded-2xl border border-neutral-800/80"
      style={{ height: 580 }}
    >
      {testimonialsList.map((testimonial, index) => {
        const position = testimonialsList.length % 2
          ? index - (testimonialsList.length + 1) / 2
          : index - testimonialsList.length / 2;
        return (
          <TestimonialCard
            key={testimonial.tempId}
            testimonial={testimonial}
            handleMove={handleMove}
            position={position}
            cardSize={cardSize}
          />
        );
      })}
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-3 z-20">
        <button
          onClick={() => handleMove(-1)}
          className={cn(
            "flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center text-2xl transition-all rounded-xl cursor-pointer",
            "bg-[#121216] border-2 border-neutral-800 text-white hover:bg-[#e61e2b] hover:border-[#e61e2b]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e61e2b]"
          )}
          aria-label="Previous testimonial"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        <button
          onClick={() => handleMove(1)}
          className={cn(
            "flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center text-2xl transition-all rounded-xl cursor-pointer",
            "bg-[#121216] border-2 border-neutral-800 text-white hover:bg-[#e61e2b] hover:border-[#e61e2b]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e61e2b]"
          )}
          aria-label="Next testimonial"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>
    </div>
  );
};
