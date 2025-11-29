import { Gauge, Lightbulb, Target, Layers } from "lucide-react";

const ICONS: any = {
  strategic_fit: <Target className="h-5 w-5 text-blue-600" />,
  capability_fit: <Layers className="h-5 w-5 text-green-600" />,
  synergy_potential: <Lightbulb className="h-5 w-5 text-amber-500" />,
  partnership_risk: <Gauge className="h-5 w-5 text-red-500" />,
};

export const FourVectorAnalysis = ({ data }: any) => (
  <section className="mt-8">
    <div className="flex items-center gap-2 mb-4">
      <Gauge className="text-blue-600" />
      <h3 className="text-xl font-semibold text-gray-700">Four Vector Analysis</h3>
    </div>

    <div className="grid md:grid-cols-2 gap-5">
      {Object.entries(data).map(([key, value]: any) => (
        <div
          key={key}
          className="p-5 border rounded-xl bg-white shadow-sm hover:shadow-md transition space-y-3"
        >
          <div className="flex items-center gap-2">
            {ICONS[key]}
            <h4 className="text-md font-semibold capitalize text-blue-700">
              {key.replace(/_/g, " ")}
            </h4>
          </div>

          <div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Score</span>
              <span>{value.score}%</span>
            </div>

            <div className="w-full bg-gray-200 h-2 rounded-full mt-1">
              <div
                className="h-2 bg-blue-600 rounded-full"
                style={{ width: `${value.score}%` }}
              />
            </div>
          </div>

          <p className="text-sm text-gray-700">{value.detail}</p>
        </div>
      ))}
    </div>
  </section>
);
