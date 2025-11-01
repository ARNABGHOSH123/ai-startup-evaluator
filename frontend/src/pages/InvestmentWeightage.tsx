import { useState } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";

const ThesisConfig = () => {
  const [weights, setWeights] = useState({
    market: 80,
    product: 60,
    team: 50,
    financials: 40,
    risk: 20,
  });

  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  const normalizedWeights = Object.fromEntries(
    Object.entries(weights).map(([k, v]) => [k, (v / total) * 100])
  );
  const totalScore = Math.round((total / 250) * 100);

  const getColor = (value: number) => {
    if (value < 50) return "#ef4444"; // red
    if (value < 75) return "#facc15"; // yellow
    return "#22c55e"; // green
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
      <div className="flex flex-col lg:flex-row justify-between items-center gap-6 mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            💡 Investment Thesis Configuration
          </h2>
          <p className="text-gray-600 text-sm">
            Adjust weightages to evaluate growth potential and generate
            investor-ready recommendations.
          </p>
        </div>

        <div className="w-28 h-28">
          <CircularProgressbar
            value={totalScore}
            text={`${totalScore}%`}
            styles={buildStyles({
              pathColor: getColor(totalScore),
              textColor: getColor(totalScore),
              trailColor: "#e5e7eb",
              textSize: "18px",
            })}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
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
              <span className="text-gray-600 text-sm">
                {Math.round(normalizedWeights[key])}%
              </span>
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
