import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { PhoneCallIcon, Star } from "lucide-react";
import { TabsContent } from "@/components/ui/tabs";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";

interface Clarification {
  question: string;
  response: string;
}

export default function InvestmentRecommendation({ company }: any) {
  const [clarifications, setClarifications] = useState<Clarification[]>([]);
  const [loadingClarifications, setLoadingClarifications] = useState(false);
  const [errorClarifications, setErrorClarifications] = useState<string | null>(
    null
  );

  const params = useParams();
  const companyId = params.companyId;

  useEffect(() => {
    const fetchClarifications = async () => {
      setLoadingClarifications(true);
      try {
        const response = await fetch(
          `${
            import.meta.env.VITE_CLOUD_RUN_SERVICE_URL
          }/fetch_audio_agent_clarifications/${companyId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const clarData = await response.json();
        setClarifications(clarData.clarifications || []);
      } catch (err: any) {
        console.error("Error fetching clarifications:", err);
        setErrorClarifications("Failed to load AI call insights");
      } finally {
        setLoadingClarifications(false);
      }
    };
    fetchClarifications();
  }, []);
  /* --------------------------- Dynamic Text Data --------------------------- */
  type SectionType = "summary" | "verdict";

  interface TextBlock {
    type: SectionType;
    title: string;
    color: string;
    icon?: React.ReactNode;
    paragraphs: (string | React.ReactNode)[]; // ✅ allow both strings & JSX
  }

  interface InvestmentOverviewData {
    sections: TextBlock[];
  }

  const investmentData: InvestmentOverviewData = {
    sections: [
      !errorClarifications && clarifications.length > 0
        ? {
            type: "summary",
            title: "Smart Call Insights",
            color: "purple",
            icon: <PhoneCallIcon className="w-5 h-5 text-purple-600" />,
            paragraphs: loadingClarifications
              ? ["Loading voice agent clarifications..."]
              : errorClarifications
              ? [errorClarifications]
              : clarifications.length > 0
              ? clarifications.map((item, idx) => (
                  <div key={idx} className="mb-2">
                    <p className="font-semibold text-purple-700">
                      Q{idx + 1}. {item.question}
                    </p>
                    <p className="text-gray-700">A: {item.response}</p>
                  </div>
                ))
              : ["No clarifications available for this company."],
          }
        : null,
    ].filter(Boolean) as TextBlock[],
  };

  const dynamicSections = investmentData.sections.map((sec) => {
    if (sec.title === "Smart Call Insights") {
      return {
        ...sec,
        paragraphs: loadingClarifications
          ? ["Loading voice agent clarifications..."]
          : errorClarifications
          ? [errorClarifications]
          : clarifications.length > 0
          ? clarifications.map((item, idx) => (
              <div key={idx} className="mb-2">
                <p className="font-semibold text-purple-700">
                  Q{idx + 1}. {item.question}
                </p>
                <p className="text-gray-700">A: {item.response}</p>
              </div>
            ))
          : ["No clarifications available for this company."],
      };
    }
    return sec;
  });

  return (
    <TabsContent value="investmentMemo">
      <div className="space-y-10">
        {/* ------------------- Investment Summary (Horizontal Band) ------------------- */}
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
          <h2 className="text-xl font-semibold text-indigo-700 mb-3 flex items-center gap-2">
            <Star className="w-5 h-5 text-indigo-600" />
            Investment Summary
          </h2>

          <article className="text-sm text-gray-700 leading-relaxed">
            <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
              {
                company?.investment_recommendation?.investment_recommendation
                  ?.investment_recommendation_summary
              }
            </ReactMarkdown>
          </article>
        </div>

        {/* ------------------- AI Call Insights (Timeline Layout) ------------------- */}
        {dynamicSections
          .filter((sec) => sec.title === "Smart Call Insights")
          .map((sec, idx) => (
            <div key={idx}>
              <h2 className="text-xl font-semibold text-purple-700 flex items-center gap-2 mb-4">
                <PhoneCallIcon className="w-5 h-5 text-purple-600" />
                Smart Call Insights
              </h2>

              {/* Timeline container */}
              <div className="relative border-l-2 border-purple-300 ml-4 pl-6 space-y-8">
                {loadingClarifications && (
                  <p className="text-sm text-gray-600">
                    Loading voice agent clarifications...
                  </p>
                )}

                {errorClarifications && (
                  <p className="text-sm text-red-600">{errorClarifications}</p>
                )}

                {!loadingClarifications &&
                  !errorClarifications &&
                  clarifications?.map((item, i) => (
                    <div
                      key={i}
                      className="relative group transition-all duration-300"
                    >
                      {/* Dot */}
                      <div className="absolute -left-9 w-4 h-4 bg-purple-500 rounded-full border-4 border-white shadow"></div>

                      {/* Timeline card */}
                      <div className="bg-white border border-purple-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-all">
                        <p className="font-semibold text-purple-700 text-sm mb-1">
                          Q{i + 1}. {item.question}
                        </p>

                        <p className="text-gray-700 text-sm leading-relaxed">
                          {item.response}
                        </p>
                      </div>
                    </div>
                  ))}

                {clarifications.length === 0 &&
                  !loadingClarifications &&
                  !errorClarifications && (
                    <p className="text-sm text-gray-600">
                      No clarifications available for this company.
                    </p>
                  )}
              </div>
            </div>
          ))}
      </div>
    </TabsContent>
  );
}
