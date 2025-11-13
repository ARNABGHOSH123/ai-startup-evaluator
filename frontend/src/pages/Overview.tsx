import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import {
  AlertTriangle,
  Bot,
  Zap,
  Database,
  Shield,
  Cpu,
  BarChart3,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
  Legend,
  RadialBarChart,
  RadialBar,
} from "recharts";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

type InsightSection = {
  type: "insights";
  cards: {
    title: string;
    desc: string;
    borderColor: string;
    textColor: string;
  }[];
};

type ChartSection = {
  type: "chart";
  title: string;
  chartType: "radialBar" | "bar";
  value?: string;
  subValue?: string;
  projection?: string;
  fill: string;
  data: any[];
};

type InfoSection = {
  type: "info";
  borderColor: string;
  title: string;
  items: string[];
};

type TextSection = {
  type: "text";
  borderColor: string;
  title: string;
  content: string;
};

type Section = InsightSection | ChartSection | InfoSection | TextSection;

export type AccordionData = {
  id: string;
  title: string;
  color: string;
  sections: Section[];
};

// const tamData = [{ name: "Data Analytics", value: 300, fill: "#22c55e" }];
// const somData = [
//   { year: 2024, value: 5 },
//   { year: 2030, value: 60 },
//   { year: 2034, value: 200 },
// ];

export default function Overview({ company }: any) {
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
  const problemData =
    extractBetweenMarkers(normalizedText, "*Problem", "*Solution") ||
    extractBetweenMarkers(normalizedText, "The Problem", "The Solution");
  const solutionData = extractBetweenMarkers(
    normalizedText,
    "The Solution",
    "4"
  );
  const technologyData = extractBetweenMarkers(
    normalizedText,
    "*Technology Stack",
    "*Partnerships and Alliances"
  );
  const innovationData = extractBetweenMarkers(
    normalizedText,
    "*Innovation",
    "*Marketing Strategy"
  );
  const visionData = extractBetweenMarkers(normalizedText, "*Vision", ".");

  const tam = extractBetweenMarkers(normalizedText, "*TAM", "Billion").replace(
    /:\s*(?=[₹$]?\d+)/g,
    ""
  );
  const overviewData = [
    {
      id: "problem",
      borderColor: "border-red-500",
      bgColor: "bg-red-50/40",
      icon: <AlertTriangle className="text-red-600" />,
      titleColor: "text-red-700",
      title: "Problem",
      description: problemData,
      features: [],
    },
    {
      id: "solution",
      borderColor: "border-green-500",
      bgColor: "bg-green-50/40",
      icon: <Bot className="text-green-600" />,
      titleColor: "text-green-700",
      title: "Solution",
      description: solutionData,
      features: [],
    },
    // {
    //   id: "features",
    //   borderColor: "border-blue-500",
    //   bgColor: "bg-blue-50/40",
    //   icon: <Zap className="text-blue-600" />,
    //   titleColor: "text-blue-700",
    //   title: "Key Capabilities",
    //   description: "",
    //   points: [],
    //   impact: "",
    //   footer: "",
    //   features: [
    //     { icon: <Cpu />, title: "Recommender Engine" },
    //     { icon: <BarChart3 />, title: "Auto Visualizations" },
    //     { icon: <Database />, title: "Data Quality Reports" },
    //     { icon: <Shield />, title: "Security & Governance" },
    //     { icon: <Zap />, title: "No-code Model Builder" },
    //     { icon: <Bot />, title: "Instant Insights" },
    //   ],
    // },
  ];

  const accordionData: AccordionData[] = [
    {
      id: "market",
      title: "Market Size & Position",
      color: "text-purple-700",
      sections: [
        {
          type: "insights",
          cards: [
            {
              title: "109 Active Startups",
              desc: "Indicative of early but competitive landscape.",
              borderColor: "border-indigo-500",
              textColor: "text-indigo-700",
            },
            {
              title: "Rapid Innovation Cycles",
              desc: "High opportunity for differentiation and category leadership.",
              borderColor: "border-green-500",
              textColor: "text-green-700",
            },
          ],
        },
        {
          type: "chart",
          title: "Total Addressable Market (TAM)",
          chartType: "radialBar",
          value: `${tam}B`,
          subValue: "13% CAGR",
          fill: "#22c55e",
          data: [{ name: "TAM", value: 300 }],
        },
        {
          type: "chart",
          title: "Serviceable Obtainable Market (SOM)",
          chartType: "bar",
          projection: "Projected from $5B → $200B by 2034 (43% CAGR)",
          fill: "#6366f1",
          data: [
            { year: "2024", value: 5 },
            { year: "2026", value: 20 },
            { year: "2028", value: 80 },
            { year: "2030", value: 150 },
            { year: "2034", value: 200 },
          ],
        },
      ],
    },
    technologyData
      ? {
          id: "technology",
          title: "Technology & Innovation",
          color: "text-yellow-700",
          sections: [
            {
              type: "text",
              borderColor: "border-blue-500",
              title: "Technology Stack",
              content: technologyData,
              items: [],
            },
            {
              type: "text",
              borderColor: "border-purple-500",
              title: "Innovation & R&D",
              content: innovationData,
            },
            {
              type: "text",
              borderColor: "border-green-500",
              title: "Vision & USP",
              content: visionData,
            },
          ],
        }
      : null,
  ].filter(Boolean) as AccordionData[];

  return (
    <TabsContent value="overview" className="space-y-4 p-4">
      {/* Problem Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {overviewData?.length > 0 &&
          overviewData?.map((card) => (
            <Card
              key={card?.id}
              className={`border-l-4 ${card?.borderColor} ${card?.bgColor}`}
            >
              <CardHeader className="pb-2">
                <div className={`flex items-center gap-2 ${card?.titleColor}`}>
                  {card?.icon}
                  <CardTitle
                    className={`text-lg font-semibold ${card?.titleColor}`}
                  >
                    {card?.title}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-gray-700 text-sm space-y-2">
                {card?.description && <p>{card?.description}</p>}
                {/* this needs to be uncommented when the jsons are implemented in api  */}
                {/*{card?.points && (
                  <ul className="list-disc ml-5 space-y-1">
                    {card?.points.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                )}
                {card?.footer && (
                  <p className="text-gray-600 mt-2 italic">{card?.footer}</p>
                )}

                {card?.impact && (
                  <div className="mt-3 text-sm bg-green-100 text-green-800 p-2 rounded-md">
                    <strong>Impact:</strong> {card?.impact}
                  </div>
                )}

                {card?.features && (
                  <div className="grid grid-cols-2 gap-2">
                    {card?.features?.map((feature) => (
                      <Feature
                        key={feature?.title}
                        icon={feature?.icon}
                        title={feature?.title}
                      />
                    ))}
                  </div>
                )}*/}
              </CardContent>
            </Card>
          ))}
      </div>

      {/* Market & Technology Accordions */}
      {company?.company_name === "Sia Analytics" && (
        <Accordion type="single" collapsible className="space-y-3">
          {accordionData?.map((accordion) => (
            <AccordionItem key={accordion.id} value={accordion.id}>
              <AccordionTrigger
                className={`text-lg font-semibold ${accordion.color}`}
              >
                {accordion.title}
              </AccordionTrigger>

              <AccordionContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {accordion.sections.map((section, index) => {
                    if (section.type === "insights") {
                      return (
                        <div key={index} className="flex flex-col gap-3">
                          {section.cards.map((card, i) => (
                            <Card
                              key={i}
                              className={`border-l-4 ${card.borderColor} shadow-sm`}
                            >
                              <CardHeader className="pb-1">
                                <CardTitle
                                  className={`${card?.textColor} text-base`}
                                >
                                  {card.title}
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="text-gray-600 text-xs">
                                {card.desc}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      );
                    }

                    if (
                      section.type === "chart" &&
                      section.chartType === "radialBar"
                    ) {
                      return (
                        <Card
                          key={index}
                          className="p-6 bg-gray-50 border border-gray-200 flex flex-col justify-center items-center"
                        >
                          <div className="font-semibold text-center mb-4">
                            {section.title}
                          </div>
                          <div className="flex items-center justify-center w-full h-52 relative">
                            <ResponsiveContainer width="80%" height="100%">
                              <RadialBarChart
                                cx="50%"
                                cy="50%"
                                innerRadius="70%"
                                outerRadius="90%"
                                barSize={18}
                                data={section.data}
                                startAngle={180}
                                endAngle={-180}
                              >
                                <RadialBar
                                  dataKey="value"
                                  background
                                  cornerRadius={10}
                                  fill={section.fill}
                                />
                                <RechartsTooltip formatter={(v) => `$${v}B`} />
                              </RadialBarChart>
                            </ResponsiveContainer>
                            <div className="absolute text-center">
                              <h3 className="text-2xl font-semibold">
                                {section.value}
                              </h3>
                              {/* <p className="text-sm text-gray-500">{section.subValue}</p> */}
                            </div>
                          </div>
                        </Card>
                      );
                    }

                    if (
                      section.type === "chart" &&
                      section.chartType === "bar"
                    ) {
                      return (
                        <div
                          key={index}
                          className="bg-gray-50 border rounded-lg p-4"
                        >
                          <div className="font-medium mb-2">
                            {section.title}
                          </div>
                          <div className="w-full h-56">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={section.data}>
                                <CartesianGrid
                                  strokeDasharray="3 3"
                                  stroke="#f3f4f6"
                                />
                                <XAxis dataKey="year" />
                                <YAxis />
                                <RechartsTooltip formatter={(v) => `$${v}B`} />
                                <Legend />
                                <Bar dataKey="value" fill={section.fill} />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                          <div className="text-xs text-gray-600 mt-2 text-center">
                            {section.projection}
                          </div>
                        </div>
                      );
                    }

                    if (section.type === "info") {
                      return (
                        <Card
                          key={index}
                          className={`border-l-4 ${section.borderColor} shadow-sm`}
                        >
                          <CardHeader>
                            <CardTitle className="text-base">
                              {section.title}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="text-gray-700 text-sm">
                            <ul className="list-disc ml-5 space-y-1">
                              {section?.items?.map((item, i) => (
                                <li key={i}>{item}</li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      );
                    }

                    if (section.type === "text") {
                      return (
                        <Card
                          key={index}
                          className={`border-l-4 ${section.borderColor} shadow-sm`}
                        >
                          <CardHeader>
                            <CardTitle className="text-base">
                              {section.title}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="text-gray-700 text-sm">
                            {section.content}
                          </CardContent>
                        </Card>
                      );
                    }

                    return null;
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </TabsContent>
  );
}

// Feature Subcomponent
function Feature({ icon, title }: { icon: JSX.Element; title: string }) {
  return (
    <div className="flex items-center gap-2 bg-white p-2 rounded-md shadow-sm hover:shadow transition">
      <div className="text-blue-600">{icon}</div>
      <p className="text-xs font-medium text-gray-700">{title}</p>
    </div>
  );
}
