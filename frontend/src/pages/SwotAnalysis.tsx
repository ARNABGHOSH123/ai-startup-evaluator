import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, Bolt, Globe, Shield } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";

interface SwotData {
  strengths: string;
  weaknesses: string;
  opportunities: string;
  threats: string;
}

export default function SwotAnalysis({ data }: { data: SwotData }) {
  const sections = [
    { id: "strengths", title: "Strengths", body: data.strengths, color: "text-cardgreen", bgColor: "bg-cardgreenlight", icon: <Star size={14} /> },
    { id: "weaknesses", title: "Weaknesses", body: data.weaknesses, color: "text-cardorange", bgColor: "bg-cardorangelight", icon: <Bolt size={14} /> },
    { id: "opportunities", title: "Opportunities", body: data.opportunities, color: "text-blue-600", bgColor: "bg-blue-100", icon: <Globe size={14} /> },
    { id: "threats", title: "Threats", body: data.threats, color: "text-yellow-600", bgColor: "bg-yellow-100", icon: <Shield size={14}/> },
  ] as const;

  return (
    <Card className="rounded-lg border col-span-3 border-border hover:border-primary bg-background">
      <CardHeader>
        <CardTitle className="text-lg">SWOT Analysis</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 -mt-3">
        {sections.map((s) => (
          <div
            key={s.id}
            className="overflow-hidden border-b border-border last:border-b-0 py-2"
          >
            {/* Header with icon */}
            <div className={`flex items-center justify-start gap-1 mb-1 ${s.color}`}>
              <span className={`${s.bgColor} rounded-sm p-1`}>{s.icon}</span>
              <span className={`font-semibold text-sm`}>{s.title}</span>
            </div>

            {/* Content always visible */}
            <p className="text-xs">
            <article className="max-w-none space-y-2">
              <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                {s.body}
              </ReactMarkdown>
            </article>
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
