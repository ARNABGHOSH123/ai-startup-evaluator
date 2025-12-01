import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";

interface RiskData {
  financial_risks: string;
  market_risks: string;
  operational_risks: string;
  sales_cycle_risks: string;
}

export default function RiskAssessment({ data }: { data: RiskData }) {
  const sections = [
    {
      id: "financial",
      title: "Financial Risks",
      body: data.financial_risks,
      color: "text-green-600",
    },
    {
      id: "market",
      title: "Market Risks",
      body: data.market_risks,
      color: "text-red-600",
    },
    {
      id: "operational",
      title: "Operational Risks",
      body: data.operational_risks,
      color: "text-blue-600",
    },
    {
      id: "sales",
      title: "Sales Cycle Risks",
      body: data.sales_cycle_risks,
      color: "text-yellow-600",
    },
  ] as const;

  return (
    <Card className="rounded-lg border border-border hover:border-primary bg-background mt-4">
      <CardHeader>
        <CardTitle className="text-sm">Risk Assessment</CardTitle>
      </CardHeader>
      <CardContent className="-mt-6">
        <Accordion type="single" collapsible className="space-y-2">
          {sections.map((s) => (
            <AccordionItem key={s.id} value={s.id}>
              <AccordionTrigger
                className={`flex items-center justify-start w-full ${s.color} text-sm`}
              >
                {s.title}
              </AccordionTrigger>
              <AccordionContent className="text-xs px-0">
                <article className="max-w-none text-xs">
                  <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                    {s.body}
                  </ReactMarkdown>
                </article>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
