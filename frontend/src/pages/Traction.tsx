import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";

export default function Traction({ company }: any) {
  
  const colors = [
    { bg: "bg-blue-100", text: "text-blue-700" },
    { bg: "bg-green-100", text: "text-green-700" },
    { bg: "bg-yellow-100", text: "text-yellow-700" },
    { bg: "bg-purple-100", text: "text-purple-700" },
    { bg: "bg-pink-100", text: "text-pink-700" },
    { bg: "bg-orange-100", text: "text-orange-700" },
  ];

  const tractionData = company?.traction?.traction;

  return (
    <TabsContent value="traction">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
        {tractionData?.market_validation_and_adoption_signals && (
          <Card className="shadow-sm border rounded-lg">
            <CardHeader>
              <CardTitle className="text-sm">
                Market Validation & Adoption
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <Accordion type="single" collapsible className="w-full">
                {(
                  Object?.entries as (
                    o: Record<string, string>
                  ) => [string, string][]
                )(tractionData?.market_validation_and_adoption_signals).map(
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
                          <p className="text-sm leading-relaxed whitespace-pre-line text-foreground">
                            <article className="max-w-none text-xs">
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm, remarkBreaks]}
                              >
                                {value}
                              </ReactMarkdown>
                            </article>
                          </p>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  }
                )}
              </Accordion>
            </CardContent>
          </Card>
        )}
        {company?.business_model?.business_model?.cost_structure && (
          <Card className="shadow-sm border rounded-lg">
            <CardHeader>
              <CardTitle className="text-sm">Cost Structure</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Accordion type="single" collapsible className="w-full">
                {(
                  Object?.entries as (
                    o: Record<string, string>
                  ) => [string, string][]
                )(company?.business_model?.business_model?.cost_structure).map(
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
                          <p className="text-sm leading-relaxed whitespace-pre-line text-foreground">
                            <article className="max-w-none text-xs">
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm, remarkBreaks]}
                              >
                                {value}
                              </ReactMarkdown>
                            </article>
                          </p>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  }
                )}
              </Accordion>
            </CardContent>
          </Card>
        )}
        {tractionData?.product_engagement_and_retention_metrics && (
          <Card className="shadow-sm border rounded-lg">
            <CardHeader>
              <CardTitle className="text-sm">
                Product Engagement & Retention Metrics
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <Accordion type="single" collapsible className="w-full">
                {(
                  Object?.entries as (
                    o: Record<string, string>
                  ) => [string, string][]
                )(tractionData?.product_engagement_and_retention_metrics).map(
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
                          <p className="text-sm leading-relaxed whitespace-pre-line text-foreground">
                            <article className="max-w-none text-xs">
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm, remarkBreaks]}
                              >
                                {value}
                              </ReactMarkdown>
                            </article>
                          </p>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  }
                )}
              </Accordion>
            </CardContent>
          </Card>
        )}
         {tractionData?.customer_acquisition_and_growth_metrics && (
          <Card className="shadow-sm border rounded-lg">
            <CardHeader>
              <CardTitle className="text-sm">Growth Metrics</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <Accordion type="single" collapsible className="w-full">
                {(
                  Object?.entries as (
                    o: Record<string, string>
                  ) => [string, string][]
                )(tractionData?.customer_acquisition_and_growth_metrics).map(
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
                          <p className="text-sm leading-relaxed whitespace-pre-line text-foreground">
                            <article className="max-w-none text-xs">
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm, remarkBreaks]}
                              >
                                {value}
                              </ReactMarkdown>
                            </article>
                          </p>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  }
                )}
              </Accordion>
            </CardContent>
          </Card>
        )}
        {tractionData?.revenue_and_financial_metrics && (
          <Card className="shadow-sm border rounded-lg">
            <CardHeader>
              <CardTitle className="text-sm">
                Revenue & Financial Metrics
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <Accordion type="single" collapsible className="w-full">
                {(
                  Object?.entries as (
                    o: Record<string, string>
                  ) => [string, string][]
                )(tractionData?.revenue_and_financial_metrics).map(
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
                          <p className="text-sm leading-relaxed whitespace-pre-line text-foreground">
                            <article className="max-w-none text-xs">
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm, remarkBreaks]}
                              >
                                {value}
                              </ReactMarkdown>
                            </article>
                          </p>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  }
                )}
              </Accordion>
            </CardContent>
          </Card>
        )}
        {tractionData?.stage_specific_focus_areas && (
          <Card className="shadow-sm border rounded-lg">
            <CardHeader>
              <CardTitle className="text-sm">
                Stage Specific Focus Areas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {tractionData?.stage_specific_focus_areas?.map((stage: any) => (
                <article className="max-w-none text-xs">
                  <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                    {stage}
                  </ReactMarkdown>
                </article>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </TabsContent>
  );
}
