import { useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";

ChartJS.register(ArcElement, Tooltip, Legend);

const ThesisConfig = () => {
  const [weights, setWeights] = useState({
    market: 80,
    product: 60,
    team: 50,
    financials: 40,
    risk: 20,
  });

  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  const totalScore = Math.round((total / 250) * 100);

  const getColor = (value: number) => {
    if (value < 50) return "#ef4444"; // red
    if (value < 75) return "#facc15"; // yellow
    return "#22c55e"; // green
  };

  // Donut chart data
  const data = {
    datasets: [
      {
        data: [totalScore, 100 - totalScore],
        backgroundColor: [getColor(totalScore), "#e5e7eb"],
        borderWidth: 0,
      },
    ],
  };

  const options = {
    cutout: "75%", // 👈 creates the donut hole
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
      <div className="flex flex-col lg:flex-row justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            Investment Thesis Configuration
          </h2>
          <p className="text-gray-600 text-sm">
            Adjust weightages to evaluate growth potential and generate
            investor-ready recommendations.
          </p>
        </div>

        {/* Donut Chart with Center Label */}
        {/* Donut Chart with Center Label */}
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
                    "#3b82f6", // market - blue
                    "#22c55e", // product - green
                    "#a855f7", // team - purple
                    "#f59e0b", // financials - amber
                    "#ef4444", // risk - red
                  ],
                  borderWidth: 2,
                  borderColor: "#ffffff",
                  hoverOffset: 6,
                },
              ],
            }}
            options={{
              cutout: "70%",
              plugins: {
                legend: {
                  display: false, // you can enable if you want labels
                },
                tooltip: {
                  callbacks: {
                    label: function (context: any) {
                      return `${context.label}: ${context.raw}`;
                    },
                  },
                },
              },
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-bold" style={{ color: "#111827" }}>
              {Math.round(
                (Object.values(weights).reduce((a, b) => a + b, 0) / 250) * 100
              )}
              %
            </span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mt-6">
        {Object.entries(weights).map(([key, value]) => (
          <Card
            key={key}
            className="p-4 border-l-4 hover:shadow-md transition-all"
            style={{
              borderColor:
                key === "risk"
                  ? "#f87171"
                  : key === "market"
                  ? "#3b82f6"
                  : key === "product"
                  ? "#22c55e"
                  : key === "team"
                  ? "#a855f7"
                  : "#f59e0b",
            }}
          >
            <div className="flex justify-between mb-2">
              <span className="font-medium capitalize text-gray-800">
                {key}
              </span>
              <span className="text-gray-600 text-sm">{value}</span>
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

      <p className="text-xs text-gray-500 text-right mt-3 italic">
        Total normalized weight: 100% (based on your adjustments)
      </p>
    </div>
  );
};

export default ThesisConfig;
