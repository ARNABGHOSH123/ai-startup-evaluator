import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { Handshake } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
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

const colors = [
  { bg: "bg-blue-100", text: "text-blue-700" },
  { bg: "bg-green-100", text: "text-green-700" },
  { bg: "bg-yellow-100", text: "text-yellow-700" },
  { bg: "bg-purple-100", text: "text-purple-700" },
  { bg: "bg-pink-100", text: "text-pink-700" },
  { bg: "bg-orange-100", text: "text-orange-700" },
];

export default function BussinessModel({ company }: any) {
  const bussinessModelData = company?.business_model?.business_model;
  const partnershipData =
    company?.partnerships_and_strategic_analysis
      ?.partnerships_and_strategic_analysis;

  return (
    <TabsContent value="businessmodel">
      <div className="grid grid-cols-4 gap-4">
        <Card className="rounded-lg border col-span-3 border-border hover:border-primary bg-background">
          <span className="flex flex-row items-center justify-between">
            <CardHeader className="flex flex-row space-x-2 items-center -mt-3 -ml-2">
              <CardTitle className="text-lg flex space-x-2">
                <h3 className="flex flex-row space-x-2 items-center -ml-2">
                  <Handshake className="text-blue-500 p-1 rounded-sm bg-blue-100" />
                  <span className="font-semibold">Key Partnership</span>
                </h3>{" "}
              </CardTitle>
            </CardHeader>
          </span>
          <CardContent className="space-y-6">
            {(bussinessModelData?.key_partnerships?.distribution_partners ||
              partnershipData?.partnerships_and_alliance
                ?.distribution_partners) && (
              <div className="flex flex-col space-y-2">
                <h3 className="text-sm text-cardborder flex flex-row space-x-2 items-center -ml-2">
                  <span className="font-semibold">Distribution Partners</span>
                </h3>
                {bussinessModelData?.key_partnerships
                  ?.distribution_partners && (
                  <div className="text-xs text-foreground leading-relaxed -mt-4">
                    <article className="max-w-none space-y-2">
                      <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                        {
                          bussinessModelData?.key_partnerships
                            ?.distribution_partners
                        }
                      </ReactMarkdown>
                    </article>
                  </div>
                )}
              </div>
            )}
            {(bussinessModelData?.key_partnerships?.strategic_alliances ||
              partnershipData?.partnerships_and_alliance
                ?.strategic_alliances) && (
              <div className="flex flex-col space-y-2">
                <h3 className="text-sm text-cardborder flex flex-row space-x-2 items-center -ml-2">
                  <span className="font-semibold">Strategic Alliances</span>
                </h3>
                {bussinessModelData?.key_partnerships?.strategic_alliances && (
                  <div className="text-xs text-foreground leading-relaxed -mt-4">
                    <article className="max-w-none space-y-2">
                      <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                        {
                          bussinessModelData?.key_partnerships
                            ?.strategic_alliances
                        }
                      </ReactMarkdown>
                    </article>
                  </div>
                )}
              </div>
            )}
            {(bussinessModelData?.key_partnerships?.supplier_relationships ||
              partnershipData?.partnerships_and_alliance
                ?.supplier_relationships) && (
              <div className="flex flex-col space-y-2">
                <h3 className="text-sm text-cardborder flex flex-row space-x-2 items-center -ml-2">
                  <span className="font-semibold">Supplier Relationships</span>
                </h3>
                {bussinessModelData?.key_partnerships
                  ?.supplier_relationships && (
                  <div className="text-xs text-foreground leading-relaxed -mt-4">
                    <article className="max-w-none space-y-2">
                      <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                        {
                          bussinessModelData?.key_partnerships
                            ?.supplier_relationships
                        }
                      </ReactMarkdown>
                    </article>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-y-4">
          {bussinessModelData?.go_to_market_strategy && (
            <Card className="shadow-sm border rounded-lg">
              <CardHeader>
                <CardTitle className="text-sm">Go-To Market Strategy</CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <Accordion type="single" collapsible className="w-full">
                  {(
                    Object.entries as (
                      o: Record<string, string>
                    ) => [string, string][]
                  )(bussinessModelData?.go_to_market_strategy).map(
                    ([key, value], index) => {
                      const formattedKey = key
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (c) => c.toUpperCase());

                      const color =
                        colors[(colors.length - 1 - index) % colors.length]; // cycle through colors

                      return (
                        <AccordionItem
                          key={key}
                          value={key}
                          className="rounded-lg border border-border mb-2"
                        >
                          <AccordionTrigger
                            className={`text-sm font-medium px-3 py-2 rounded-lg ${color.bg} ${color.text}`}
                          >
                            {formattedKey}
                          </AccordionTrigger>

                          <AccordionContent className="px-3 py-2">
                            <div className="text-sm leading-relaxed whitespace-pre-line text-foreground">
                              <article className="max-w-none text-xs">
                                <ReactMarkdown
                                  remarkPlugins={[remarkGfm, remarkBreaks]}
                                >
                                  {value}
                                </ReactMarkdown>
                              </article>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      );
                    }
                  )}
                </Accordion>
              </CardContent>
            </Card>
          )}

          {bussinessModelData?.revenue_model && (
            <Card className="shadow-sm border rounded-lg">
              <CardHeader>
                <CardTitle className="text-sm">Revenue Model</CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <Accordion type="single" collapsible className="w-full">
                  {(
                    Object.entries as (
                      o: Record<string, string>
                    ) => [string, string][]
                  )(bussinessModelData?.revenue_model).map(
                    ([key, value], index) => {
                      const formattedKey = key
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (c) => c.toUpperCase());

                      const color = colors[index % colors.length]; // cycle through colors

                      return (
                        <AccordionItem
                          key={key}
                          value={key}
                          className="rounded-lg border border-border mb-2"
                        >
                          <AccordionTrigger
                            className={`text-sm font-medium px-3 py-2 rounded-lg ${color.bg} ${color.text}`}
                          >
                            {formattedKey}
                          </AccordionTrigger>

                          <AccordionContent className="px-3 py-2">
                            <div className="text-sm leading-relaxed whitespace-pre-line text-foreground">
                              <article className="max-w-none text-xs">
                                <ReactMarkdown
                                  remarkPlugins={[remarkGfm, remarkBreaks]}
                                >
                                  {value}
                                </ReactMarkdown>
                              </article>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      );
                    }
                  )}
                </Accordion>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </TabsContent>
  );
}
