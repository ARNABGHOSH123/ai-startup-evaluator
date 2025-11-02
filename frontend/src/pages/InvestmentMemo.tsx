import { useEffect, useMemo, useState } from "react";
import { PhoneCallIcon, Star, TrendingUp } from "lucide-react";
import { TabsContent } from "@/components/ui/tabs";

interface Clarification {
  question: string;
  response: string;
}

export default function InvestmentRecommendation() {
  const [clarifications, setClarifications] = useState<Clarification[]>([]);
  const [loadingClarifications, setLoadingClarifications] = useState(false);
  const [errorClarifications, setErrorClarifications] = useState<string | null>(
    null
  );

  useEffect(() => {
    const fetchClarifications = async () => {
      setLoadingClarifications(true);
      try {
        const response = await fetch(
          `${
            import.meta.env.VITE_CLOUD_RUN_SERVICE_URL
          }/fetch_audio_agent_clarifications/abcde`,
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
    intro: string;
    sections: TextBlock[];
  }

  const investmentData: InvestmentOverviewData = {
    intro:
      "Sia presents a high-risk, high-reward investment opportunity backed by a strong technical founding team and early traction with enterprise clients.",
    sections: [
      {
        type: "summary",
        title: "Summary",
        color: "green",
        paragraphs: [
          "The founding team’s deep Bosch background and IP portfolio make Sia a standout in the emerging Agentic AI space. Early traction with enterprise clients such as Bosch and Mercedes-Benz strengthens market validation. While risks such as a 9–12 month sales cycle, cash flow challenges, and competition from larger players remain, the growth potential in this high-CAGR market is significant.",
          "The company’s use of funds—60% for sales and marketing—signals a clear focus on scaling validated traction. The investment thesis is grounded in strong leadership, IP-backed innovation, and large market potential.",
        ],
      },
      {
        type: "verdict",
        title: "Investment Verdict",
        color: "blue",
        icon: <TrendingUp className="w-5 h-5 text-blue-600" />,
        paragraphs: [
          "Despite high risks typical of the seed stage, Sia’s strong team, IP ownership, and early enterprise traction make it an attractive investment candidate. With the right execution and focus on enterprise sales scaling, it holds potential for substantial returns.",
        ],
      },
      {
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
      },
    ],
  };

  /* --------------------------- Rating Data --------------------------- */
  const [data, setData] = useState([
    {
      category: "Market Potential",
      rating: 3,
      observation: "Large TAM with moderate competition",
    },
    {
      category: "Product Strength",
      rating: 4,
      observation: "Strong IP and differentiation",
    },
    {
      category: "Team Capability",
      rating: 2,
      observation: "Good core team but limited scaling experience",
    },
    {
      category: "Financial Stability",
      rating: 3,
      observation: "Reasonable runway, early-stage revenue",
    },
    {
      category: "Risk Profile",
      rating: 4,
      observation: "Moderate risk due to early-stage market bets",
    },
  ]);

  const colorMap: Record<string, string> = {
    green: "border-green-500 text-green-700",
    blue: "border-blue-500 text-blue-700",
    red: "border-red-500 text-red-700",
    purple: "border-purple-500 text-purple-700",
  };

  /* --------------------------- Computations --------------------------- */
  const averageRating = useMemo(() => {
    const total = data.reduce((sum, item) => sum + item.rating, 0);
    return total / data.length;
  }, [data]);

  const progressPercentage = (averageRating / 5) * 100;

  const handleRatingChange = (index: number, rating: number) => {
    setData((prevData) =>
      prevData.map((item, i) => (i === index ? { ...item, rating } : item))
    );
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

  /* --------------------------- JSX --------------------------- */
  return (
    <TabsContent value="investmentMemo">
      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* LEFT SIDE */}
        <div className="lg:col-span-2 space-y-6">
          {/* Summary + Verdict Sections */}
          {dynamicSections
            .filter((sec) => sec.title !== "Smart Call Insights")
            .map((sec, idx) => (
              <div
                key={idx}
                className={`bg-white border-l-4 rounded-2xl shadow p-6 ${
                  colorMap[sec.color]
                }`}
              >
                <h3
                  className={`text-lg font-semibold mb-3 flex items-center gap-2 ${
                    colorMap[sec.color].split(" ")[1]
                  }`}
                >
                  {sec.icon && sec.icon}
                  {sec.title}
                </h3>
                {sec.paragraphs.map((text, i) => (
                  <p
                    key={i}
                    className="text-gray-700 text-sm leading-normal mb-4 last:mb-0"
                  >
                    {text}
                  </p>
                ))}
              </div>
            ))}

          {/* AI CALL INSIGHTS SECTION BELOW */}
          {dynamicSections
            .filter((sec) => sec.title === "Smart Call Insights")
            .map((sec, idx) => (
              <div
                key={idx}
                className={`bg-white border-l-4 rounded-2xl shadow p-6 ${
                  colorMap[sec.color]
                }`}
              >
                <h3
                  className={`text-lg font-semibold mb-3 flex items-center gap-2 ${
                    colorMap[sec.color].split(" ")[1]
                  }`}
                >
                  {sec.icon && sec.icon}
                  {sec.title}
                </h3>
                {sec.paragraphs.map((text, i) => (
                  <div
                    key={i}
                    className="text-gray-700 text-sm leading-normal mb-4 last:mb-0"
                  >
                    {text}
                  </div>
                ))}
              </div>
            ))}
        </div>

        {/* RIGHT SIDE — WEIGHTAGE + RISK-REWARD */}
        <div className="col-span-1 space-y-6">
          {/* Weightage (Key Evaluation Metrics) */}
          <div className="bg-white border-l-4 border-yellow-400 rounded-2xl shadow p-6">
            <h3 className="text-lg font-semibold text-yellow-700 mb-4">
              Key Evaluation Metrics
            </h3>

            <div className="space-y-4">
              {data.map((item, index) => (
                <div
                  key={index}
                  className="flex flex-col border-b border-gray-100 pb-3 last:border-b-0"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">
                      {item.category}
                    </span>
                    <div className="flex cursor-pointer">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          onClick={() => handleRatingChange(index, i + 1)}
                          className={`w-5 h-5 transition-all ${
                            i < item.rating
                              ? "text-yellow-500 fill-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">
                    {item.observation}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 📊 Risk-Reward Indicator */}
          <div className="bg-white rounded-2xl shadow p-6 border-l-4 border-blue-400">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">
              Risk-Reward Profile
            </h4>
            <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
              <div
                className="h-3 rounded-full bg-gradient-to-r from-red-400 via-yellow-400 to-green-500 transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
                title="Dynamic Risk-Reward Indicator"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1 text-right">
              Low → High Risk & Reward ({averageRating.toFixed(1)} / 5)
            </p>
          </div>
        </div>
      </div>
    </TabsContent>
  );
}
