import { TabsContent } from "@/components/ui/tabs";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";

export default function CompetitorsTab({ company }: any) {
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
    const cleaned = rawSection.replace(/\*/g, ""); // remove all asterisks
    return cleaned;
  }

  // Example usage
  const competitorData =
    company?.company_name === "Sia Analytics"
      ? extractBetweenMarkers(
          normalizedText,
          "# **Competitor Analysis",
          "Final Investment Recommendation"
        )
      : company?.company_name === "Naario"
      ? extractBetweenMarkers(
          normalizedText,
          "*Competitor Analysis",
          "*Final Recommendation"
        )
      : extractBetweenMarkers(
          normalizedText,
          "*Competitor Analysis",
          "Conclusion & Recommendation"
        );
  return (
    <TabsContent value="competitors">
      <article className="prose max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
          {competitorData}
        </ReactMarkdown>
      </article>
    </TabsContent>
  );
}