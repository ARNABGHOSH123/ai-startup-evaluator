import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Competitor = {
  name: string;
  founded: number;
  hq: string;
  raised: number;
  offerings: string;
  market: string;
  description: string;
  url: string;
  region?: string;
};

type CompetitorData = {
  name: string;
  raised: number;
  region: string;
};

type CompetitorsTabProps = {
  indianCompetitors: Competitor[];
  globalCompetitors: Competitor[];
  chartData: CompetitorData[];
};

export default function CompetitorsTab({
  indianCompetitors = [],
  globalCompetitors = [],
  chartData = [],
}: CompetitorsTabProps) {
  const sections = [
    { title: "Indian Competitors", competitors: indianCompetitors },
    { title: "Global Competitors", competitors: globalCompetitors },
  ];

  const hasAnyData =
    indianCompetitors.length > 0 ||
    globalCompetitors.length > 0 ||
    chartData.length > 0;

  if (!hasAnyData) {
    return (
      <TabsContent value="competitors">
        <div className="p-6 text-center text-gray-500 text-sm">
          No competitor data available.
        </div>
      </TabsContent>
    );
  }

  return (
    <TabsContent value="competitors">
      <Card className="max-h-[600px] overflow-y-auto border border-gray-200 shadow-sm">
        {/* ✅ Dynamic Sections */}
        {sections.map(
          (section, idx) =>
            section.competitors.length > 0 && (
              <div key={idx}>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">
                    {section.title}
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border border-gray-200">
                      <thead className="bg-gray-100 text-gray-700">
                        <tr>
                          {[
                            "Company",
                            "Founded",
                            "HQ",
                            "Total Raised ($M)",
                            "Offerings",
                            "Target Market",
                            "Description",
                          ].map((header, i) => (
                            <th
                              key={i}
                              className="p-2 border text-left font-medium"
                            >
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {section.competitors.map((c, i) => (
                          <tr
                            key={i}
                            className="border-t hover:bg-gray-50 transition-colors"
                          >
                            <td className="p-2 text-blue-600 underline">
                              <a
                                href={c.url}
                                target="_blank"
                                rel="noreferrer"
                                className="hover:text-blue-800"
                              >
                                {c.name}
                              </a>
                            </td>
                            <td className="p-2">{c.founded}</td>
                            <td className="p-2">{c.hq}</td>
                            <td className="p-2">{c.raised}</td>
                            <td className="p-2">{c.offerings}</td>
                            <td className="p-2">{c.market}</td>
                            <td className="p-2">{c.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </div>
            )
        )}

        {/* ✅ Chart (only if data exists) */}
        {chartData.length > 0 && (
          <>
            <CardHeader className="pb-1">
              <CardTitle className="text-sm font-semibold">
                Total Raised Comparison
              </CardTitle>
            </CardHeader>

            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{ top: 5, right: 10, left: 50, bottom: 5 }}
                  barCategoryGap="20%"
                >
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={100} />
                  <Tooltip formatter={(value: number) => `$${value}M`} />
                  <Legend />
                  <Bar dataKey="raised">
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.region === "Indian" ? "#6366f1" : "#22c55e"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </>
        )}
      </Card>
    </TabsContent>
  );
}
