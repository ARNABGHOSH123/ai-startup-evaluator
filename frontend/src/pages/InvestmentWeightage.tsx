import { useState } from "react";
import { useParams } from "react-router-dom";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

ChartJS.register(ArcElement, Tooltip, Legend);

const ThesisConfig = ({ company }: any) => {
  const [weights, setWeights] = useState({
    market: 25,
    team: 25,
    financials: 25,
    product: 25,
  });
  type UpdatedData = Record<string, any>;
  const [updatedSummary, setUpdatedSummary] = useState<UpdatedData | null>(
    null
  );
  const [isLoadingCompDetails, setLoadingCompDetails] = useState(false);

  const params = useParams();
  const companyId = params.companyId;

  const total = Object.values(weights).reduce((a, b) => a + b, 0);

  const isValid = total === 100;

  const handleSubmit = async () => {
    try {
      setLoadingCompDetails(true);
      const payload = {
        investor_weightage_preferences: {
          team: weights.team.toString(),
          market: weights.market.toString(),
          product: weights.product.toString(),
          financials: weights.financials.toString(),
        },
        original_recommendation_score: `${company?.investment_recommendation?.investment_recommendation?.confidence_score}`,
        company_doc_id: companyId,
      };

      const response = await fetch(
        `${
          import.meta.env.VITE_CLOUD_RUN_SERVICE_URL
        }/fetch_weightage_agent_recommendations`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();
      setUpdatedSummary(result);
      setLoadingCompDetails(false);
    } catch (error) {
      console.error("Error saving weightage:", error);
      alert("Failed to save weightage.");
    }
  };

  return (
    <TabsContent value="thesis">
      <div className="bg-background p-4 space-y-4 rounded-lg shadow-lg border border-border">
        <div className="flex flex-col lg:flex-row justify-between items-center">
          {/* Header */}
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Investment Thesis Configuration
            </h2>
            <p className="text-neutral text-sm">
              Adjust weightages to evaluate growth potential and generate
              investor-ready recommendations.
            </p>
          </div>

          {/* Donut Chart */}
          <div className="relative w-20 h-20">
            <Doughnut
              data={{
                labels: Object.keys(weights).map(
                  (key) => key.charAt(0).toUpperCase() + key.slice(1)
                ),
                datasets: [
                  {
                    data: Object.values(weights),
                    backgroundColor: [
                      "#3b82f6",
                      "#22c55e",
                      "#a855f7",
                      "#f59e0b",
                      "#ef4444",
                    ],
                    borderWidth: 2,
                    borderColor: "#ffffff",
                    hoverOffset: 6,
                  },
                ],
              }}
              options={{
                cutout: "80%",
                plugins: { legend: { display: false } },
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-bold text-foreground">
                {total}%
              </span>
            </div>
          </div>
        </div>

        {/* Sliders */}
        <div className="grid md:grid-cols-2 gap-4 mt-6">
          {Object.entries(weights).map(([key, value]) => (
            <Card
              key={key}
              className="p-4 border-l-4 hover:shadow-md transition-all"
              style={{
                borderColor:
                  key === "product"
                    ? "#f87171"
                    : key === "market"
                    ? "#3b82f6"
                    : key === "team"
                    ? "#a855f7"
                    : key === "financials"
                    ? "#f59e0b"
                    : "#22c55e",
              }}
            >
              <div className="flex justify-between mb-2">
                <span className="font-medium capitalize text-foreground">
                  {key}
                </span>
                <span className="text-foreground text-sm">{value}</span>
              </div>
              <Slider
                defaultValue={[value]}
                max={100}
                step={5}
                onValueChange={(val) =>
                  setWeights((prev) => ({ ...prev, [key]: val[0] }))
                }
              />
            </Card>
          ))}
        </div>

        {/* Error Message */}
        {!isValid && (
          <p className="text-sm text-red-500 font-medium mt-4">
            <AlertTriangle />
            Please ensure total weight equals 100%. Current total: {total}%
          </p>
        )}

        {/* Submit Button */}
        <div className="flex justify-end mt-6">
          <Button disabled={!isValid} onClick={handleSubmit}>
            <span className="text-secondary font-semibold">
              Generate Recommended Deal Note
            </span>
          </Button>
        </div>
        <p className="text-xs text-gray-500 text-right mt-3 italic">
          Total selected weight must be exactly 100% to proceed.
        </p>
        <div className="mt-6">
          {isLoadingCompDetails ? (
            <div className="p-6 border rounded-lg bg-muted/30 animate-pulse">
              <p className="text-sm font-medium">
                Generating updated deal note…
              </p>
            </div>
          ) : updatedSummary ? (
            <Card className="rounded-lg border border-border hover:border-primary bg-background">
              <CardContent className="space-y-6 p-4">
                <div className="flex flex-col space-y-4">
                  <h3 className="font-semibold">Generated Deal Note Summary</h3>
                  <p className="text-xs text-foreground leading-relaxed">
                    {updatedSummary?.reasoning}
                  </p>
                  <div>
                    AI Generated Score:{" "}
                    {updatedSummary?.updated_recommendation_score}
                  </div>

                  <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                    {(
                      Object.entries as (
                        o: Record<string, string>
                      ) => [string, string][]
                    )(updatedSummary?.weightage_impact_explanation)?.map(
                      ([title, body]) => (
                        <div
                          key={title}
                          className="border rounded-lg p-4 shadow-sm bg-white min-h-[120px] flex flex-col"
                        >
                          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-2">
                            {title}
                          </h3>
                          <p className="text-sm text-neutral flex-1">{body}</p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </TabsContent>
  );
};

export default ThesisConfig;
