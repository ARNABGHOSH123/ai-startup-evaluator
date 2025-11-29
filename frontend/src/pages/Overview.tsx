import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import {
  AlertTriangle,
  Bot,
  Zap,
  Database,
  Shield,
  Cpu,
  BarChart3,
  Brain,
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
  const overviewData = company?.overview?.overview;

  return (
    <TabsContent value="overview">
     <div className="grid grid-cols-4">
      <Card className="rounded-lg border col-span-3 border-border hover:border-primary bg-background">
          <span className="flex flex-row items-center justify-between">
            <CardHeader className="flex flex-row space-x-2 items-center -mt-3 -ml-2">
              <Brain className="p-1 rounded-sm bg-cardborderlight text-cardborder" />
              <CardTitle className="text-sm">{overviewData?.market_size_and_position?.tag_line}</CardTitle>
            </CardHeader>
            {/* <span
              className="text-xs hover:cursor-pointer text-primary -mt-2 mr-2 font-semibold bg-primary-foreground rounded-xl px-2"
              onClick={() => setViewFunding(true)}
            >
              View Details
            </span> */}
          </span>
          <CardContent className="space-y-6">
          {overviewData?.technology_and_innovation?.vision_and_USP && <p className="text-xs text-neutral leading-relaxed -mt-4">
            {overviewData?.technology_and_innovation?.vision_and_USP}
          </p>}
          {overviewData?.problem_statement && (
          <div className="flex flex-col space-y-2">
            <h3 className="text-sm flex flex-row space-x-2 items-center -ml-2">
              <AlertTriangle className="p-1 rounded-sm bg-cardorangelight text-cardorange"/><span className="font-semibold">Problem</span>
            </h3>

            <p className="text-xs text-muted-foreground leading-relaxed">
              {overviewData?.problem_statement}
            </p>
          </div>
        )}

        {overviewData?.problem_statement && (
          <div className="flex flex-col space-y-2">
            <h3 className="text-sm flex flex-row space-x-2 items-center -ml-2">
              <Cpu className="p-1 rounded-sm bg-cardgreenlight text-cardgreen"/><span className="font-semibold">Solution</span>
            </h3>

            <p className="text-xs text-muted-foreground leading-relaxed">
              {overviewData?.solution}
            </p>
          </div>
        )}
          </CardContent>

          <CardDescription>
            placeholder
          </CardDescription>
        </Card>
     </div>
    </TabsContent>
  );
}
