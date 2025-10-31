import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import {
  Users,
  Building2,
  LineChart,
  Award,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import React from "react";

type TractionCard = {
  id: string;
  title: string;
  icon: keyof typeof ICONS;
  color: string; // Tailwind color name (e.g. 'indigo', 'emerald', 'blue')
  colSpan?: string; // For responsive layouts (e.g. "col-span-2")
  sections: Array<
    | { type: "text"; content: string }
    | { type: "list"; items: string[] }
    | { type: "grid"; items: string[] }
    | { type: "highlight"; content: string }
  >;
};

// ✅ Icon mapping
const ICONS: Record<string, LucideIcon> = {
  Users,
  Award,
  TrendingUp,
  BarChart3,
  LineChart,
  Building2,
};

// ✅ JSON-based content
const tractionData: TractionCard[] = [
  {
    id: "customers",
    title: "Customer Base",
    icon: "Users",
    color: "indigo",
    sections: [
      { type: "text", content: "<b>Booked:</b> Bosch, Abha Hospital (KSA), Al Borg Diagnostics, IDBI Bank, Rice University." },
      { type: "text", content: "<b>Pilots:</b> Mercedes-Benz, Infoline, eSunScope, SEG AUTOMOTIVE, ZELIOT, CHARA." },
      { type: "text", content: "<b>Pipeline:</b> Vetrina, Saudi Telecom, Sobha Group, Accolade, HDFCergo, Pfizer, Maruti Suzuki, Tata Elxsi." },
    ],
  },
  {
    id: "recognitions",
    title: "Recognitions & Product Milestones",
    icon: "Award",
    color: "emerald",
    sections: [
      {
        type: "list",
        items: [
          "Winners of <b>E-LEVATE 2023</b>",
          "Incubated at <b>NSRCEL IIMB</b>",
          "Selected by <b>Microsoft for Startups</b>",
        ],
      },
      {
        type: "text",
        content:
          "<b>Product v1 deployed in 2024.</b> Actively onboarding new customers and signups.",
      },
    ],
  },
  {
    id: "financial",
    title: "Financial Traction",
    icon: "TrendingUp",
    color: "purple",
    sections: [
      { type: "text", content: "<b>Expected Revenue (FY 25-26):</b> $400k" },
      { type: "text", content: "<b>Reported FY 23-24 Revenue:</b> ₹4.16L (Datastride Analytics Pvt. Ltd.)" },
      {
        type: "highlight",
        content:
          "Continuous growth with early enterprise traction and multi-sector pilots.",
      },
    ],
  },
  {
    id: "impact",
    title: "Impact & Efficiency Metrics",
    icon: "BarChart3",
    color: "blue",
    colSpan: "col-span-2",
    sections: [
      {
        type: "grid",
        items: [
          "<b>Time to Insights:</b> &lt; 5 min (90% faster)",
          "<b>Data Volume:</b> 100 GB (10x Increase)",
          "<b>Budget Saved:</b> 4x Cost Reduction",
          "<b>Deployment Time:</b> 2–3 Weeks (80% faster)",
        ],
      },
    ],
  },
  {
    id: "kpis",
    title: "Business KPIs",
    icon: "LineChart",
    color: "orange",
    sections: [
      { type: "text", content: "<b>CAS:</b> $3k/mo → Target $10k by EOY" },
      { type: "text", content: "<b>ACV:</b> $150k – $300k" },
      { type: "text", content: "<b>LTV:</b> $1M+" },
      { type: "text", content: "<b>Sales Cycle:</b> 9–12 months" },
    ],
  },
  {
    id: "caseStudy",
    title: "Case Study: Abha Hospitals",
    icon: "Building2",
    color: "pink",
    colSpan: "col-span-3",
    sections: [
      { type: "text", content: "<b>Client:</b> 2,000+ Employees | $50M+ Revenue" },
      {
        type: "text",
        content:
          "<b>Contract:</b> 80 → 400 subscriptions in 2 years | $60/user/month + $20k setup → <b>Total Value:</b> $98k/year",
      },
      {
        type: "grid",
        items: [
          "Unified patient data & historical insights",
          "Org performance & finance analytics",
          "Reduced diagnosis time & faster data access",
          "MVP feedback rated “phenomenal” by co-founder",
        ],
      },
    ],
  },
];

export default function TractionTab() {
  return (
    <TabsContent value="traction">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
        {tractionData.map((card) => {
          const Icon = ICONS[card.icon];
          return (
            <Card
              key={card.id}
              className={`${card.colSpan || "col-span-1"} border-l-4 border-${card.color}-500 bg-${card.color}-50/40`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 text-${card.color}-600`} />
                  <CardTitle
                    className={`text-sm font-semibold text-${card.color}-700`}
                  >
                    {card.title}
                  </CardTitle>
                </div>
              </CardHeader>

              <CardContent className="text-xs text-gray-700 space-y-2">
                {card.sections.map((section, i) => {
                  if (section.type === "text")
                    return (
                      <p
                        key={i}
                        dangerouslySetInnerHTML={{ __html: section.content }}
                      />
                    );

                  if (section.type === "list")
                    return (
                      <ul
                        key={i}
                        className="list-disc ml-4 space-y-1"
                        dangerouslySetInnerHTML={{
                          __html: section.items.map((x) => `<li>${x}</li>`).join(""),
                        }}
                      />
                    );

                  if (section.type === "grid")
                    return (
                      <div
                        key={i}
                        className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] bg-white p-2 rounded-md shadow-sm"
                        dangerouslySetInnerHTML={{
                          __html: section.items
                            .map((x) => `<p>${x}</p>`)
                            .join(""),
                        }}
                      />
                    );

                  if (section.type === "highlight")
                    return (
                      <div
                        key={i}
                        className={`bg-${card.color}-100 text-${card.color}-800 text-[11px] p-2 rounded-md`}
                        dangerouslySetInnerHTML={{ __html: section.content }}
                      />
                    );

                  return null;
                })}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </TabsContent>
  );
}
