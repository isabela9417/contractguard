import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  company?: string;
}

const testimonials: Testimonial[] = [
  {
    quote: "ContractGuard helped me identify a non-compete clause that would have prevented me from working in my industry for 2 years. The negotiation suggestions saved my career.",
    author: "Sarah M.",
    role: "Software Engineer",
    company: "Tech Startup"
  },
  {
    quote: "As a first-time renter, I was overwhelmed by legal jargon. ContractGuard broke down every clause in plain English and helped me negotiate better terms with my landlord.",
    author: "James T.",
    role: "Graduate Student",
    company: "University of California"
  },
  {
    quote: "I almost signed a freelance contract with an unlimited liability clause. ContractGuard caught it and suggested specific language changes. Worth every penny.",
    author: "Maria L.",
    role: "Freelance Designer",
    company: "Self-employed"
  },
  {
    quote: "Our HR team uses ContractGuard to review vendor contracts. It's like having a legal consultant available 24/7. We've saved thousands in potential legal fees.",
    author: "David K.",
    role: "HR Director",
    company: "Fortune 500 Company"
  },
  {
    quote: "The AI caught an automatic renewal clause buried in page 47 of my service agreement. That single catch saved my small business $15,000 annually.",
    author: "Rachel P.",
    role: "Small Business Owner",
    company: "Local Bakery Chain"
  },
  {
    quote: "I was about to sign an NDA that would have given my employer rights to all my side projects. ContractGuard's risk assessment made me reconsider and negotiate.",
    author: "Alex W.",
    role: "Product Manager",
    company: "Fintech Company"
  }
];

export function TestimonialCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [isAutoPlaying]);

  const goToPrevious = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const goToSlide = (index: number) => {
    setIsAutoPlaying(false);
    setCurrentIndex(index);
  };

  return (
    <section className="relative py-20 overflow-hidden bg-card/50">
      {/* Quote decorations */}
      <div className="absolute left-10 top-10 text-8xl font-serif text-primary/5 leading-none">
        <Quote className="h-24 w-24" />
      </div>
      <div className="absolute right-10 bottom-10 text-8xl font-serif text-primary/5 leading-none rotate-180">
        <Quote className="h-24 w-24" />
      </div>
      
      <div className="container relative z-10">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Trusted by Thousands
          </h2>
          <p className="mt-4 text-muted-foreground">
            See how ContractGuard has helped people protect their interests
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* Navigation Buttons */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 z-10 hidden md:flex"
            onClick={goToPrevious}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 z-10 hidden md:flex"
            onClick={goToNext}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>

          {/* Testimonial Content */}
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="w-full flex-shrink-0 px-4 md:px-12"
                >
                  <div className="text-center">
                    <blockquote className="font-serif text-xl md:text-2xl font-medium text-foreground leading-relaxed">
                      "{testimonial.quote}"
                    </blockquote>
                    <div className="mt-8">
                      <p className="font-semibold text-foreground text-lg">
                        {testimonial.author}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {testimonial.role}{testimonial.company ? ` • ${testimonial.company}` : ''}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-300",
                  index === currentIndex 
                    ? "bg-primary w-6" 
                    : "bg-primary/30 hover:bg-primary/50"
                )}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>

          {/* Mobile Navigation */}
          <div className="flex justify-center gap-4 mt-6 md:hidden">
            <Button variant="outline" size="sm" onClick={goToPrevious}>
              <ChevronLeft className="h-4 w-4 mr-1" /> Previous
            </Button>
            <Button variant="outline" size="sm" onClick={goToNext}>
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
