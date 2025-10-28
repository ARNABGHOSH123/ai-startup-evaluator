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

const tamData = [{ name: "Data Analytics", value: 300, fill: "#22c55e" }];
const somData = [
  { year: 2024, value: 5 },
  { year: 2030, value: 60 },
  { year: 2034, value: 200 },
];

export default function Overview() {
  return (
    <TabsContent value="overview" className="space-y-4 p-4">
      {/* Problem Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="border-l-4 border-red-500 bg-red-50/40">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="text-red-600" />
              <CardTitle className="text-lg font-semibold text-red-700">
                Problem: The AI Crisis
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-gray-700 text-sm space-y-2">
            <p>
              90% of AI projects fail due to centralized, fragile data teams
              causing operational bottlenecks.
            </p>
            <ul className="list-disc ml-5 space-y-1">
              <li>High cost of analytics</li>
              <li>Manual data dependency</li>
              <li>Fragmented pipelines</li>
              <li>Talent shortages</li>
              <li>Security risks</li>
            </ul>
            <p className="text-gray-600 mt-2 italic">
              ➤ 68% of data remains unused in silos, and 76% of decisions still
              rely on spreadsheets.
            </p>
          </CardContent>
        </Card>

        {/* Solution Section */}
        <Card className="border-l-4 border-green-500 bg-green-50/40">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Bot className="text-green-600" />
              <CardTitle className="text-lg font-semibold text-green-700">
                Solution: Sia - Agentic AI for Data Analytics
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-gray-700 text-sm space-y-2">
            <p>
              Sia democratizes analytics with a chat-based interface that acts
              like a full data team for every employee.
            </p>
            <p>
              It connects fragmented systems, contextualizes insights, and
              removes technical bottlenecks for rapid, scalable decision-making.
            </p>
            <div className="mt-3 text-sm bg-green-100 text-green-800 p-2 rounded-md">
              <strong>Impact:</strong> Enables self-serve analytics, faster
              insights, and reduced dependency on data experts.
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <Card className="border-l-4 border-blue-500 bg-blue-50/40">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Zap className="text-blue-600" />
              <CardTitle className="text-lg font-semibold text-blue-700">
                Key Capabilities
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              <Feature icon={<Cpu />} title="Recommender Engine" />
              <Feature icon={<BarChart3 />} title="Auto Visualizations" />
              <Feature icon={<Database />} title="Data Quality Reports" />
              <Feature icon={<Shield />} title="Security & Governance" />
              <Feature icon={<Zap />} title="No-code Model Builder" />
              <Feature icon={<Bot />} title="Instant Insights" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Market & Technology Accordions */}
      <Accordion type="single" collapsible className="space-y-3">
        {/* Market Accordion */}
        <AccordionItem value="market">
          <AccordionTrigger className="text-lg font-semibold text-purple-700">
            Market Size & Position
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Insight Cards */}
              <div className="flex flex-col gap-3">
                <Card className="border-l-4 border-indigo-500 shadow-sm">
                  <CardHeader className="pb-1">
                    <CardTitle className="text-indigo-700 text-base">
                      109 Active Startups
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-gray-600 text-xs">
                    Indicative of early but competitive landscape.
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-green-500 shadow-sm">
                  <CardHeader className="pb-1">
                    <CardTitle className="text-green-700 text-base">
                      Rapid Innovation Cycles
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-gray-600 text-xs">
                    High opportunity for differentiation and category
                    leadership.
                  </CardContent>
                </Card>
              </div>

              {/* TAM */}
              <Card className="p-6 bg-gray-50 border border-gray-200 flex flex-col justify-center items-center">
                {" "}
                <div className="font-semibold text-center mb-4">
                  {" "}
                  Total Addressable Market (TAM){" "}
                </div>{" "}
                <div className="flex items-center justify-center w-full h-52 relative">
                  <ResponsiveContainer width="80%" height="100%">
                    <RadialBarChart
                      cx="50%"
                      cy="50%"
                      innerRadius="70%"
                      outerRadius="90%"
                      barSize={18}
                      data={tamData}
                      startAngle={180}
                      endAngle={-180}
                    >
                      <RadialBar
                        dataKey="value"
                        background
                        cornerRadius={10}
                        fill="#22c55e"
                      />
                      <RechartsTooltip formatter={(v) => `$${v}B`} />
                    </RadialBarChart>
                  </ResponsiveContainer>
                  <div className="absolute text-center">
                    {" "}
                    <h3 className="text-2xl font-semibold">$300B</h3>{" "}
                    <p className="text-sm text-gray-500">13% CAGR</p>{" "}
                  </div>{" "}
                </div>{" "}
              </Card>

              {/* SOM */}
              <div className="bg-gray-50 border rounded-lg p-4">
                <div className="font-medium mb-2">
                  Serviceable Obtainable Market (SOM)
                </div>
                <div className="w-full h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={somData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                      <XAxis dataKey="year" />
                      <YAxis />
                      <RechartsTooltip formatter={(v) => `$${v}B`} />
                      <Legend />
                      <Bar dataKey="value" fill="#6366f1" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-xs text-gray-600 mt-2 text-center">
                  Projected from $5B → $200B by 2034{" "}
                  <span className="text-green-600 font-semibold">
                    (43% CAGR)
                  </span>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Technology Accordion */}
        <AccordionItem value="technology">
          <AccordionTrigger className="text-lg font-semibold text-yellow-700">
            Technology & Innovation
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Stack */}
              <div className="bg-white shadow rounded-lg p-4 border-l-4 border-blue-500">
                <h3 className="text-base font-semibold text-gray-800 mb-2">
                  Technology Stack
                </h3>
                <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                  <li>Agentic AI with multi-agent architecture.</li>
                  <li>Automates ML lifecycle and feature engineering.</li>
                  <li>Integrates with multiple data sources.</li>
                  <li>Built for scalability and real-time analytics.</li>
                </ul>
              </div>

              {/* R&D */}
              <div className="bg-white shadow rounded-lg p-4 border-l-4 border-purple-500">
                <h3 className="text-base font-semibold text-gray-800 mb-2">
                  Innovation & R&D
                </h3>
                <p className="text-gray-700 text-sm">
                  Co-founders <strong>Divya Krishna R</strong> and{" "}
                  <strong>Sumalata Kamat</strong> jointly hold
                  <strong> 10 patents</strong> from prior work at Bosch,
                  highlighting deep R&D expertise.
                </p>
              </div>

              {/* Vision */}
              <div className="bg-white shadow rounded-lg p-4 border-l-4 border-green-500">
                <h3 className="text-base font-semibold text-gray-800 mb-2">
                  Vision & USP
                </h3>
                <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                  <li>Vision: Make AI/ML accessible to every business.</li>
                  <li>USP: Chat-based interface for non-technical users.</li>
                  <li>Rapid deployment (2–3 weeks) & insights in &lt;5 min.</li>
                  <li>4× reduction in analytics costs.</li>
                </ul>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
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
