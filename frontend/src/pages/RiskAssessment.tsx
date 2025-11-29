import { AlertTriangle } from "lucide-react";

export const RiskAssessment = ({ data }: any) => (
  <section className="mt-8">
    <h3 className="text-xl font-semibold text-gray-700 flex items-center gap-2 mb-4">
      <AlertTriangle className="text-red-600" /> Risk Assessment
    </h3>

    <div className="space-y-3">
      {Object.values(data).map((text: any, i: number) => (
        <div
          key={i}
          className="p-4 border rounded-xl bg-white shadow-sm flex gap-3"
        >
          <AlertTriangle className="h-5 w-5 text-red-600 mt-1" />
          <p className="text-sm text-gray-700">{text}</p>
        </div>
      ))}
    </div>
  </section>
);
