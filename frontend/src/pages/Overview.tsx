import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import {
  AlertTriangle,
  Bot,
  Zap,
  Cpu,
  Brain,
  Microscope,
  BarChart2Icon,
} from "lucide-react";

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

export default function Overview({ company }: any) {
  const overviewData = company?.overview?.overview;

  return (
    <TabsContent value="overview">
      <div className="grid grid-cols-4 gap-4">
        <Card className="rounded-lg border col-span-3 border-border hover:border-primary bg-background">
          <span className="flex flex-row items-center justify-between">
            <CardHeader className="flex flex-row space-x-2 items-center -mt-3 -ml-2">
              <CardTitle className="text-lg">
                {overviewData?.market_size_and_position?.tag_line}
              </CardTitle>
            </CardHeader>
          </span>
          <CardContent className="space-y-6">
            {overviewData?.technology_and_innovation?.vision_and_USP && (
              <div className="flex flex-col space-y-2">
                <h3 className="text-sm text-cardborder flex flex-row space-x-2 items-center -ml-2">
                  <Brain className="p-1 rounded-sm bg-cardborderlight" />
                  <span className="font-semibold">Vision</span>
                </h3>
                <p className="text-xs text-foreground leading-relaxed -mt-4">
                  {overviewData?.technology_and_innovation?.vision_and_USP}
                </p>
              </div>
            )}
            {overviewData?.problem_statement && (
              <div className="flex flex-col space-y-2">
                <h3 className="text-sm text-cardorange flex flex-row space-x-2 items-center -ml-2">
                  <AlertTriangle className="p-1 rounded-sm bg-cardorangelight" />
                  <span className="font-semibold">Problem</span>
                </h3>

                <p className="text-xs text-foreground leading-relaxed">
                  {overviewData?.problem_statement}
                </p>
              </div>
            )}
            {overviewData?.problem_statement && (
              <div className="flex flex-col space-y-2">
                <h3 className="text-sm text-cardgreen flex flex-row space-x-2 items-center -ml-2">
                  <Bot className="p-1 rounded-sm bg-cardgreenlight" />
                  <span className="font-semibold">Solution</span>
                </h3>

                <p className="text-xs text-foreground leading-relaxed">
                  {overviewData?.solution}
                </p>
              </div>
            )}
            {overviewData?.technology_and_innovation
              ?.innovation_and_R_and_D && (
              <div className="flex flex-col space-y-2">
                <h3 className="text-sm flex flex-row space-x-2 items-center -ml-2 text-yellow-600">
                  <Microscope className="p-1 rounded-sm bg-yellow-100" />
                  <span className="font-semibold">Innovation</span>
                </h3>

                <p className="text-xs text-foreground leading-relaxed">
                  {
                    overviewData?.technology_and_innovation
                      ?.innovation_and_R_and_D
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-y-4">
          {overviewData?.market_size_and_position?.innovation_cycle_status && (
            <Card className="rounded-lg border border-border hover:border-primary bg-background">
              <span className="flex flex-row items-center justify-between"></span>
              <CardContent className="space-y-6 p-4">
                <div className="flex flex-col space-y-2">
                  <h3 className="text-sm flex flex-row space-x-2 items-center -ml-2 text-blue-600">
                    <Zap className="p-1 rounded-sm bg-blue-100" />
                    <span className="font-semibold">
                      {
                        overviewData?.market_size_and_position
                          ?.innovation_cycle_status?.status
                      }
                    </span>
                  </h3>
                  <p className="text-xs text-foreground leading-relaxed">
                    {
                      overviewData?.market_size_and_position
                        ?.innovation_cycle_status?.reasoning
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
          {overviewData?.market_size_and_position?.competitors_summary
            ?.number_of_competitors && (
            <Card className="rounded-lg border border-border hover:border-primary bg-background">
              <span className="flex flex-row items-center justify-between"></span>
              <CardContent className="space-y-6 p-4">
                <div className="flex flex-col space-y-2">
                  <h3 className="text-sm flex flex-row space-x-2 items-center -ml-2 text-teal-600">
                    <BarChart2Icon className="p-1 rounded-sm bg-teal-100" />
                    <span className="font-semibold">Competitors Summary</span>
                  </h3>
                  {overviewData?.market_size_and_position?.competitors_summary
                    ?.number_of_competitors && (
                    <span className="text-xs text-muted-foreground">
                      {
                        overviewData?.market_size_and_position
                          ?.competitors_summary?.number_of_competitors
                      }{" "}
                      Competitors
                    </span>
                  )}
                  <p className="text-xs text-foreground leading-relaxed">
                    {
                      overviewData?.market_size_and_position
                        ?.competitors_summary?.summary
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
          {overviewData?.technology_and_innovation?.technology_stack_used && (
            <Card className="rounded-lg border border-border hover:border-primary bg-background">
              <span className="flex flex-row items-center justify-between"></span>
              <CardContent className="space-y-6 p-4">
                <div className="flex flex-col space-y-2">
                  <h3 className="text-sm flex flex-row space-x-2 items-center -ml-2 text-pink-600">
                    <Cpu className="p-1 rounded-sm bg-pink-100" />
                    <span className="font-semibold">Technology & Stack</span>
                  </h3>
                  <p className="text-xs text-foreground leading-relaxed">
                    {
                      overviewData?.technology_and_innovation
                        ?.technology_stack_used
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </TabsContent>
  );
}
