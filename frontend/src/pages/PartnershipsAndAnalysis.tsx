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

interface CardProps {
  icon: ReactNode;
  title: string;
  points: string[];
}

interface VectorCardProps {
  color: string;
  title: string;
  text: string;
}

interface SwotCardProps {
  color: string;
  title: string;
  points: string;
}

interface RiskCardProps {
  title: string;
  text: string;
  color: string;
}

export default function PartnershipsAndAnalysis({ company }: { company: any }) {
  
   const bigString = company?.extract_benchmark_agent_response || "";

  // Normalize escape sequences like \n → actual newlines
  const normalizedText = bigString.replace(/\\n/g, "\n");

  function extractBetweenMarkers(
    text: string,
    start: string,
    end: string
  ): string {
    const startIndex = text.indexOf(start);
    if (startIndex === -1) return "";

    const endIndex = text.indexOf(end, startIndex + start.length);
    const rawSection =
      endIndex === -1
        ? text.slice(startIndex + start.length)
        : text.slice(startIndex + start.length, endIndex);

    // Clean markdown characters like **, *, _, etc.
    const cleaned = rawSection
      .replace(/\*/g, "") // remove all asterisks
      .replace(/_/g, "") // remove underscores if any
      .replace(/\s+/g, " ") // normalize multiple spaces
      .replace(/\#/g, "") // remove all asterisks
      .trim();

    return cleaned;
  }

  // Example usage
  const strength = extractBetweenMarkers(
    normalizedText,
    "Strengths",
    "Weaknesses"
  )

  const weakness = extractBetweenMarkers(
    normalizedText,
    "Weaknesses",
    "Opportunities"
  )

   const opportunities = extractBetweenMarkers(
    normalizedText,
    "*Opportunities",
    "Threats"
  );

  const threats = extractBetweenMarkers(
    normalizedText,
    "Threats",
    "##"
  )

  return (
    <TabsContent value="partnership">
    <div className="p-6 bg-gray-50 min-h-screen">
      <Accordion type="multiple" className="space-y-4">
        {/* Partnerships & Alliances */}
        {company?.company_name === "Sia Analytics" && <AccordionItem value="partnerships" className="bg-white rounded-2xl shadow-md p-4 border border-gray-200">
          <AccordionTrigger className="text-lg font-semibold text-blue-700">
            Partnerships & Alliances
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid md:grid-cols-3 gap-6 mt-4">
              <Card
                icon={<Building2 className="text-blue-500 w-6 h-6" />}
                title="Startup Ecosystem"
                points={[
                  "Part of Microsoft for Startups program.",
                  "Incubated at NSRCEL, IIM Bangalore.",
                ]}
              />
              <Card
                icon={<Handshake className="text-green-500 w-6 h-6" />}
                title="Go-to-Market Partners"
                points={[
                  "Partnering with BOSCH, N Data Services, and others.",
                  "Focus on warm client introductions and joint GTM.",
                ]}
              />
              <Card
                icon={<GraduationCap className="text-purple-500 w-6 h-6" />}
                title="Academic Partnership"
                points={[
                  "Collaborated with VR Siddhartha Engineering College (VRSEC).",
                  "Provides students & faculty access to Sia platform.",
                ]}
              />
            </div>
          </AccordionContent>
        </AccordionItem>}

        {/* Four-Vector Analysis */}
        {company?.company_name === "Sia Analytics" && <AccordionItem value="fourvector" className="bg-white rounded-2xl shadow-md p-4 border border-gray-200">
          <AccordionTrigger className="text-lg font-semibold text-blue-700">
            Four-Vector Analysis
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid md:grid-cols-2 gap-6 mt-4">
              <VectorCard
                color="blue"
                title="Product"
                text="Agentic AI for Data Analytics platform enabling conversational, democratized insights. Automates ML, deploys in 2-3 weeks, insights under 5 mins."
              />
              <VectorCard
                color="green"
                title="Market"
                text="Targeting $300B global analytics market; Agentic AI projected to grow 43% CAGR. Strong readiness (80% of Indian firms exploring agents)."
              />
              <VectorCard
                color="purple"
                title="Team"
                text="Founders from Bosch with 10 patents; prior startup experience. Based in Bengaluru, leveraging local AI talent."
              />
              <VectorCard
                color="amber"
                title="Financials"
                text="Raising ₹5 Cr seed. Current rev ₹4.16L. Forecasts ~$90M FY29. High ACV ($150k–$300k), long sales cycle risk (9–12 months)."
              />
            </div>
          </AccordionContent>
        </AccordionItem>}

        {/* SWOT Analysis */}
        <AccordionItem value="swot" className="bg-white rounded-2xl shadow-md p-4 border border-gray-200">
          <AccordionTrigger className="text-lg font-semibold text-blue-700">
            SWOT Analysis
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid md:grid-cols-2 gap-6 mt-4">
              <SwotCard
                color="green"
                title="Strengths"
                points={strength}
              />
              <SwotCard
                color="red"
                title="Weaknesses"
                points={
                  weakness
                }
              />
              <SwotCard
                color="blue"
                title="Opportunities"
                points={opportunities}
              />
              <SwotCard
                color="yellow"
                title="Threats"
                points={threats}
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Risk Assessment */}
        <AccordionItem value="risk" className="bg-white rounded-2xl shadow-md p-4 border border-gray-200">
          <AccordionTrigger className="text-lg font-semibold text-blue-700">
            Risk Assessment
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 mt-4">
              {company?.company_name !== 'Naario' && <RiskCard
                title="Market Risk"
                color="red"
                text={company?.company_name === 'Sia Analytics' ? "Faces heavy competition from large players like IBM, Palantir, and Domo with established enterprise ties." : "Overestimation of the market's willingness to adopt a higher annual spend per pet (₹14,000), given that 90% of the market currently does not spend this amount."}
              />}
              {company?.company_name !== 'Naario' && <RiskCard
                title="Sales Cycle Risk"
                color="orange"
                text={company?.company_name === 'Sia Analytics' ? "Long 9–12 month cycle can delay revenue and strain cash flow during early stages." : `Operational challenges in scaling the "hub and spoke" model, including managing complex logistics for home visits, ensuring timely hospital support, and maintaining equipment and medical inventory across multiple mobile units and hospitals.`}
              />}
              {company?.company_name !== 'Naario' && <RiskCard
                title={company?.company_name === 'Sia Analytics' ? "Adoption Risk" : "Operational Risk"}
                color="yellow"
                text={company?.company_name === 'Sia Analytics' ? "Enterprise AI adoption hindered by unclear ROI and data security issues." : "Inconsistent service quality during home visits due to reliance on individual doctors and paravets, potentially leading to negative customer experiences and churn, as suggested by the mixed reviews on Justdial."}
              />}
              {company?.company_name === 'Sia Analytics' && <RiskCard
                title="Metric Risk"
                color="blue"
                text="Inconsistent definition of CAC vs LTV may hinder accurate performance tracking."
              />}
              {company?.company_name === 'Naario' && <RiskCard
                title="Execution Risk"
                color="blue"
                text="The community-driven distribution model is a key differentiator but also a significant execution risk. Scaling the network of women micro-distributors while maintaining motivation, training, and brand consistency will be a major challenge."
              />}
              {company?.company_name === 'Naario' && <RiskCard
                title="Competitive Risk"
                color="yellow"
                text="The market is crowded with well-funded startups and FMCG giants that possess extensive distribution networks, large marketing budgets, and strong brand recognition. Naario could struggle to capture market share against these incumbents."
              />}
              {company?.company_name === 'Naario' && <RiskCard
                title="Financial Risk"
                color="orange"
                text="The company's financial projections indicate a negative EBITDA of -3% for FY 2025-26. This highlights a continued reliance on external capital to fund growth. Failure to manage the burn rate or secure future funding rounds could jeopardize operations."
              />}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
    </TabsContent>
  );
}

/* 🔹 Reusable Components */
const colorMap: Record<string, string> = {
  blue: "border-blue-500 text-blue-700",
  green: "border-green-500 text-green-700",
  red: "border-red-500 text-red-700",
  yellow: "border-yellow-400 text-yellow-700",
  purple: "border-purple-500 text-purple-700",
  amber: "border-amber-500 text-amber-700",
  orange: "border-orange-500 text-orange-700",
};

const Card: React.FC<CardProps> = ({ icon, title, points }) => (
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

const VectorCard: React.FC<VectorCardProps> = ({ color, title, text }) => (
  <div
    className={`bg-white p-6 rounded-2xl shadow-md border-l-4 ${
      colorMap[color]
    }`}
  >
    <h4 className="font-semibold text-gray-800 mb-2">{title}</h4>
    <p className="text-gray-700 text-sm">{text}</p>
  </div>
);

const SwotCard: React.FC<SwotCardProps> = ({ color, title, points }) => (
  <div
    className={`bg-white p-6 rounded-2xl shadow-md border-l-4 ${
      colorMap[color]
    }`}
  >
    <h4 className="font-semibold mb-2 capitalize">{title}</h4>
    <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
      {points}
    </ul>
  </div>
);

const RiskCard: React.FC<RiskCardProps> = ({ title, text, color }) => (
  <div
    className={`bg-white rounded-2xl shadow-md p-6 border-l-4 ${
      colorMap[color]
    }`}
  >
    <div className="flex items-center gap-2 mb-2">
      <AlertTriangle className={`w-5 h-5 ${colorMap[color].split(" ")[1]}`} />
      <h4 className="font-semibold text-gray-800">{title}</h4>
    </div>
    <p className="text-gray-700 text-sm">{text}</p>
  </div>
);
