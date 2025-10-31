"use client";
import React, { type ReactNode } from "react";
import {
  Building2,
  Handshake,
  GraduationCap,
  AlertTriangle,
} from "lucide-react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { TabsContent } from "@/components/ui/tabs";

/* --------------------------- Types --------------------------- */
interface CardData {
  icon: ReactNode;
  title: string;
  points: string[];
}

interface VectorData {
  color: string;
  title: string;
  text: string;
}

interface SwotData {
  color: string;
  title: string;
  points: string[];
}

interface RiskData {
  title: string;
  text: string;
  color: string;
}

type SectionType = "partnerships" | "fourVector" | "swot" | "risk";

interface Section {
  id: SectionType;
  title: string;
  data: CardData[] | VectorData[] | SwotData[] | RiskData[];
}

/* --------------------------- Data (Dynamic) --------------------------- */
const sections: Section[] = [
  {
    id: "partnerships",
    title: "Partnerships & Alliances",
    data: [
      {
        icon: <Building2 className="text-blue-500 w-6 h-6" />,
        title: "Startup Ecosystem",
        points: [
          "Part of Microsoft for Startups program.",
          "Incubated at NSRCEL, IIM Bangalore.",
        ],
      },
      {
        icon: <Handshake className="text-green-500 w-6 h-6" />,
        title: "Go-to-Market Partners",
        points: [
          "Partnering with BOSCH, N Data Services, and others.",
          "Focus on warm client introductions and joint GTM.",
        ],
      },
      {
        icon: <GraduationCap className="text-purple-500 w-6 h-6" />,
        title: "Academic Partnership",
        points: [
          "Collaborated with VR Siddhartha Engineering College (VRSEC).",
          "Provides students & faculty access to Sia platform.",
        ],
      },
    ],
  },
  {
    id: "fourVector",
    title: "Four-Vector Analysis",
    data: [
      {
        color: "blue",
        title: "Product",
        text: "Agentic AI for Data Analytics platform enabling conversational, democratized insights. Automates ML, deploys in 2-3 weeks, insights under 5 mins.",
      },
      {
        color: "green",
        title: "Market",
        text: "Targeting $300B global analytics market; Agentic AI projected to grow 43% CAGR. Strong readiness (80% of Indian firms exploring agents).",
      },
      {
        color: "purple",
        title: "Team",
        text: "Founders from Bosch with 10 patents; prior startup experience. Based in Bengaluru, leveraging local AI talent.",
      },
      {
        color: "amber",
        title: "Financials",
        text: "Raising ₹5 Cr seed. Current rev ₹4.16L. Forecasts ~$90M FY29. High ACV ($150k–$300k), long sales cycle risk (9–12 months).",
      },
    ],
  },
  {
    id: "swot",
    title: "SWOT Analysis",
    data: [
      {
        color: "green",
        title: "Strengths",
        points: [
          "Strong technical founding team from Bosch.",
          "10 jointly owned patents.",
          "Enterprise clients and pilots validate traction.",
          "High-growth Agentic AI market.",
        ],
      },
      {
        color: "red",
        title: "Weaknesses",
        points: [
          "Limited public presence & testimonials.",
          "Long 9–12 month sales cycle.",
          "Undefined customer acquisition cost metrics.",
        ],
      },
      {
        color: "blue",
        title: "Opportunities",
        points: [
          "Rapid AI adoption in India (80% enterprises).",
          "Addresses 90% AI project failure rate.",
          "Global expansion and aggressive marketing push.",
        ],
      },
      {
        color: "yellow",
        title: "Threats",
        points: [
          "Competition from Palantir, IBM, Domo.",
          "Data privacy & security concerns (92% execs).",
          "Talent competition in Bengaluru AI market.",
        ],
      },
    ],
  },
  {
    id: "risk",
    title: "Risk Assessment",
    data: [
      {
        title: "Market Risk",
        color: "red",
        text: "Faces heavy competition from large players like IBM, Palantir, and Domo with established enterprise ties.",
      },
      {
        title: "Sales Cycle Risk",
        color: "orange",
        text: "Long 9–12 month cycle can delay revenue and strain cash flow during early stages.",
      },
      {
        title: "Adoption Risk",
        color: "yellow",
        text: "Enterprise AI adoption hindered by unclear ROI and data security issues.",
      },
      {
        title: "Metric Risk",
        color: "blue",
        text: "Inconsistent definition of CAC vs LTV may hinder accurate performance tracking.",
      },
    ],
  },
];

/* --------------------------- Style Map --------------------------- */
const colorMap: Record<string, string> = {
  blue: "border-blue-500 text-blue-700",
  green: "border-green-500 text-green-700",
  red: "border-red-500 text-red-700",
  yellow: "border-yellow-400 text-yellow-700",
  purple: "border-purple-500 text-purple-700",
  amber: "border-amber-500 text-amber-700",
  orange: "border-orange-500 text-orange-700",
};

/* --------------------------- Reusable Components --------------------------- */
const Card: React.FC<CardData> = ({ icon, title, points }) => (
  <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-gray-300 hover:shadow-lg transition">
    <div className="flex items-center mb-3 space-x-2">
      {icon}
      <h3 className="font-semibold text-gray-800">{title}</h3>
    </div>
    <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
      {points.map((p, i) => (
        <li key={i}>{p}</li>
      ))}
    </ul>
  </div>
);

const VectorCard: React.FC<VectorData> = ({ color, title, text }) => (
  <div className={`bg-white p-6 rounded-2xl shadow-md border-l-4 ${colorMap[color]}`}>
    <h4 className="font-semibold text-gray-800 mb-2">{title}</h4>
    <p className="text-gray-700 text-sm">{text}</p>
  </div>
);

const SwotCard: React.FC<SwotData> = ({ color, title, points }) => (
  <div className={`bg-white p-6 rounded-2xl shadow-md border-l-4 ${colorMap[color]}`}>
    <h4 className="font-semibold mb-2 capitalize">{title}</h4>
    <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
      {points.map((p, i) => (
        <li key={i}>{p}</li>
      ))}
    </ul>
  </div>
);

const RiskCard: React.FC<RiskData> = ({ title, text, color }) => (
  <div className={`bg-white rounded-2xl shadow-md p-6 border-l-4 ${colorMap[color]}`}>
    <div className="flex items-center gap-2 mb-2">
      <AlertTriangle className={`w-5 h-5 ${colorMap[color].split(" ")[1]}`} />
      <h4 className="font-semibold text-gray-800">{title}</h4>
    </div>
    <p className="text-gray-700 text-sm">{text}</p>
  </div>
);

/* --------------------------- Renderer --------------------------- */
const renderSectionContent = (section: Section) => {
  switch (section.id) {
    case "partnerships":
      return (
        <div className="grid md:grid-cols-3 gap-6 mt-4">
          {(section.data as CardData[]).map((item, idx) => (
            <Card key={idx} {...item} />
          ))}
        </div>
      );

    case "fourVector":
      return (
        <div className="grid md:grid-cols-2 gap-6 mt-4">
          {(section.data as VectorData[]).map((item, idx) => (
            <VectorCard key={idx} {...item} />
          ))}
        </div>
      );

    case "swot":
      return (
        <div className="grid md:grid-cols-2 gap-6 mt-4">
          {(section.data as SwotData[]).map((item, idx) => (
            <SwotCard key={idx} {...item} />
          ))}
        </div>
      );

    case "risk":
      return (
        <div className="space-y-4 mt-4">
          {(section.data as RiskData[]).map((item, idx) => (
            <RiskCard key={idx} {...item} />
          ))}
        </div>
      );

    default:
      return null;
  }
};

/* --------------------------- Main Component --------------------------- */
export default function PartnershipsAndAnalysis() {
  return (
    <TabsContent value="partnership">
      <div className="p-6 bg-gray-50 min-h-screen">
        <Accordion type="multiple" className="space-y-4">
          {sections.map((section) => (
            <AccordionItem
              key={section.id}
              value={section.id}
              className="bg-white rounded-2xl shadow-md p-4 border border-gray-200"
            >
              <AccordionTrigger className="text-lg font-semibold text-blue-700">
                {section.title}
              </AccordionTrigger>
              <AccordionContent>{renderSectionContent(section)}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </TabsContent>
  );
}
