import {
  Carousel,
  CarouselContent,
  CarouselItem,
  useCarousel,
} from "@/components/ui/carousel";
import * as React from "react";
import { ArrowRight } from "lucide-react";

const StepDots = () => {
  const { api } = useCarousel();
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [slidesCount, setSlidesCount] = React.useState(0);

  React.useEffect(() => {
    if (!api) return;
    const update = () => setSelectedIndex(api.selectedScrollSnap());
    setSlidesCount(api.scrollSnapList().length);
    api.on("select", update);
    api.on("reInit", update);
    return () => {
      api.off("select", update);
      api.off("reInit", update);
    };
  }, [api]);

  if (!slidesCount) return null;

  return (
    <div className="flex justify-center mt-4 space-x-2">
      {Array.from({ length: slidesCount }).map((_, idx) => (
        <button
          key={idx}
          onClick={() => api?.scrollTo(idx)}
          className={`h-3 w-3 rounded-full transition-all ${
            idx === selectedIndex ? "bg-indigo-600" : "bg-gray-300"
          }`}
          aria-label={`Go to step ${idx + 1}`}
        />
      ))}
    </div>
  );
};

export default function StepsCarousel() {
  const steps = [
    {
      title: "Pitch Deck (AI)",
      desc: "AI reads and extracts startup information from pitch decks — team, market, and traction — creating structured insights automatically.",
      link: "https://example.com/pitchdeck-ai",
    //   buttonName: 'Pitch as Founder',
      svg: (
        <svg
          viewBox="0 0 64 64"
          className="w-20 h-20 mx-auto mb-4 text-indigo-600"
        >
          <rect
            x="8"
            y="8"
            width="48"
            height="36"
            rx="4"
            fill="currentColor"
            opacity="0.2"
          />
          <rect
            x="8"
            y="8"
            width="48"
            height="36"
            rx="4"
            stroke="currentColor"
            strokeWidth="2"
          />
          <circle cx="20" cy="26" r="3" fill="currentColor" />
          <path d="M26 26h20" stroke="currentColor" strokeWidth="2" />
        </svg>
      ),
    },
    {
      title: "Evaluation (AI)",
      desc: "Multi-agent evaluation system analyzes market size, traction, and defensibility to produce investment-grade insights.",
      link: "https://example.com/evaluation",
      svg: (
        <svg
          viewBox="0 0 64 64"
          className="w-20 h-20 mx-auto mb-4 text-indigo-600"
        >
          <path
            d="M12 40h8v12h-8zM28 28h8v24h-8zM44 16h8v36h-8z"
            fill="currentColor"
          />
        </svg>
      ),
    },
    {
      title: "Founder Call",
      desc: "AI conducts real-time voice conversations with founders, dynamically adjusting questions based on responses.",
      link: "https://example.com/founder-call",
      svg: (
        <svg
          viewBox="0 0 64 64"
          className="w-20 h-20 mx-auto mb-4 text-indigo-600"
        >
          <circle
            cx="32"
            cy="20"
            r="10"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M16 52c2-10 28-10 32 0"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
        </svg>
      ),
    },
    {
      title: "Q&A",
      desc: "Transcribed and structured Q&A data helps refine the startup’s narrative, filling gaps identified by evaluation models.",
      link: "https://example.com/qa",
      svg: (
        <svg
          viewBox="0 0 64 64"
          className="w-20 h-20 mx-auto mb-4 text-indigo-600"
        >
          <rect
            x="8"
            y="8"
            width="48"
            height="32"
            rx="4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path d="M16 24h32M16 32h20" stroke="currentColor" strokeWidth="2" />
        </svg>
      ),
    },
    {
      title: "Memo Refinement",
      desc: "The AI iteratively improves investment memos using feedback loops and Q&A insights.",
      link: "https://example.com/memo-refinement",
      svg: (
        <svg
          viewBox="0 0 64 64"
          className="w-20 h-20 mx-auto mb-4 text-indigo-600"
        >
          <path
            d="M16 12h32v40H16z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M24 20h16M24 28h16M24 36h10"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      ),
    },
    {
      title: "Investor Feedback",
      desc: "Investors review memos and provide structured feedback — automatically summarized by AI.",
      link: "https://example.com/investor-feedback",
      svg: (
        <svg
          viewBox="0 0 64 64"
          className="w-20 h-20 mx-auto mb-4 text-indigo-600"
        >
          <path
            d="M12 20h40v28H12z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path d="M16 24h32M16 32h20" stroke="currentColor" strokeWidth="2" />
        </svg>
      ),
    },
    {
      title: "Founder Notification",
      desc: "Founders receive intelligent notifications summarizing investor decisions with transparency.",
      link: "https://example.com/founder-notification",
      svg: (
        <svg
          viewBox="0 0 64 64"
          className="w-20 h-20 mx-auto mb-4 text-indigo-600"
        >
          <path
            d="M12 20l20 12 20-12v24H12z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-white to-gray-50 text-center">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
        Welcome to <span className="text-indigo-600">GenaVentureStartup</span>{" "}
        an AI-Powered{" "}
        <span className="text-indigo-600">Investment Lifecycle</span>
      </h1>
      <p className="text-lg md:text-xl text-gray-600 max-w-2xl mb-6">
        Each stage is driven by intelligent agents designed to streamline
        founder–investor engagement.
      </p>

        <div className="max-w-xl">
          <Carousel opts={{ loop: false }}>
            <CarouselContent className="-ml-1 md:-ml-3">
              {steps.map((step, idx) => (
                <CarouselItem key={idx} className="pl-2 md:pl-4 basis-full">
                  <div className="flex flex-col items-center justify-center text-center space-y-2 p-4 bg-indigo-50 rounded-2xl">
                      {step.svg}
                    <h2 className="text-2xl font-semibold text-gray-900">
                      {step.title}
                    </h2>
                    <p className="text-gray-700 leading-relaxed max-w-lg">
                      {step.desc}
                    </p>
                    <a
                      href={step.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center text-indigo-600 font-medium hover:text-indigo-700 transition-all"
                    >
                      Learn More <ArrowRight className="ml-2 w-4 h-4" />
                    </a>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <StepDots />
          </Carousel>
        </div>
    </div>
  );
}
