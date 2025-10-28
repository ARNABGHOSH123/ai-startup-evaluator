import React from "react";
import { Star, TrendingUp } from "lucide-react";
import { TabsContent } from "@/components/ui/tabs";

export default function InvestmentRecommendation() {
  const data = [
    { category: "Team", observation: "Deep Bosch experience; 10 patents", rating: 4 },
    { category: "Market", observation: "Fast-growing Agentic AI sector", rating: 5 },
    { category: "Traction", observation: "Bosch, Mercedes-Benz pilots", rating: 4 },
    { category: "Financials", observation: "Early stage, ambitious projections", rating: 2 },
    { category: "Risk", observation: "Long sales cycle, security concerns", rating: 1 },
  ];

  return (
    <TabsContent value="investmentMemo">
      <div className="p-6 bg-gray-50 min-h-screen">
        <p className="text-gray-600 mb-6">
          Sia presents a <strong>high-risk, high-reward</strong> investment
          opportunity backed by a strong technical founding team and early traction
          with enterprise clients.
        </p>

        {/* Grid Layout */}
        <div className="grid grid-cols-3 gap-6 items-start">
          {/* LEFT COLUMN */}
          <div className="col-span-2 space-y-6">
            {/* Summary Card */}
            <div className="bg-white border-l-4 border-green-500 rounded-2xl shadow p-6">
              <h3 className="text-lg font-semibold text-green-700 mb-3">
                Summary
              </h3>
              <p className="text-gray-700 text-sm leading-normal mb-4">
                The founding team’s deep Bosch background and IP portfolio make
                Sia a standout in the emerging <strong>Agentic AI</strong> space.
                Early traction with enterprise clients such as Bosch and
                Mercedes-Benz strengthens market validation. While risks such as
                a <strong>9–12 month sales cycle</strong>, <strong>cash flow
                challenges</strong>, and <strong>competition from larger
                players</strong> remain, the growth potential in this high-CAGR
                market is significant.
              </p>
              <p className="text-gray-700 text-sm leading-normal">
                The company’s use of funds—60% for sales and marketing—signals a
                clear focus on scaling validated traction. The investment thesis
                is grounded in strong leadership, IP-backed innovation, and
                large market potential.
              </p>
            </div>

            {/* Verdict Card */}
            <div className="bg-white border-l-4 border-blue-500 rounded-2xl shadow p-6">
              <h3 className="text-lg font-semibold text-blue-700 mb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" /> Investment Verdict
              </h3>
              <p className="text-gray-700 text-sm leading-normal">
                Despite high risks typical of the seed stage, Sia’s strong team,
                IP ownership, and early enterprise traction make it an{" "}
                <strong>attractive investment candidate</strong>. With the right
                execution and focus on enterprise sales scaling, it holds
                potential for substantial returns.
              </p>
            </div>
          </div>

          {/* Key Evaluation Metrics (Right Column) */}
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
                    <div className="flex">
                      {Array.from({ length: item.rating }).map((_, i) => (
                        <Star
                          key={i}
                          className="w-4 h-4 text-yellow-500 fill-yellow-400"
                        />
                      ))}
                      {Array.from({ length: 5 - item.rating }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-gray-300" />
                      ))}
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">
                    {item.observation}
                  </span>
                </div>
              ))}
            </div>

            {/* Risk-Reward Indicator */}
            <div className="mt-6">
              <h4 className="text-sm font-semibold text-gray-600 mb-2">
                Risk-Reward Profile
              </h4>
              <div className="w-full bg-gray-200 h-3 rounded-full">
                <div
                  className="h-3 rounded-full bg-gradient-to-r from-yellow-400 via-orange-500 to-green-500 w-3/4"
                  title="High risk, high reward"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1 text-right">
                High Risk → High Reward
              </p>
            </div>
          </div>
        </div>
      </div>
    </TabsContent>
  );
}
