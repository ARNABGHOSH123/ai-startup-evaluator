import { ShieldCheck, Flame, TrendingUp, AlertTriangle, ScanLine } from "lucide-react";

const SWOT_ICONS: any = {
  strengths: <TrendingUp className="text-green-600 h-5 w-5" />,
  weaknesses: <AlertTriangle className="text-yellow-500 h-5 w-5" />,
  opportunities: <ShieldCheck className="text-blue-600 h-5 w-5" />,
  threats: <Flame className="text-red-600 h-5 w-5" />,
};

export const SwotAnalysis = ({ data }: any) => (
  <section className="mt-8">
    <h3 className="text-xl font-semibold text-gray-700 flex items-center gap-2 mb-4">
      <ScanLine className="text-purple-600" /> SWOT Analysis
    </h3>

    <div className="grid md:grid-cols-2 gap-4">
      {Object.entries(data).map(([k, v]: any) => (
        <div key={k} className="p-5 border rounded-xl bg-white shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            {SWOT_ICONS[k]}
            <h4 className="text-md font-semibold uppercase">{k}</h4>
          </div>
          <p className="text-sm text-gray-700 whitespace-pre-line">{v}</p>
        </div>
      ))}
    </div>
  </section>
);
