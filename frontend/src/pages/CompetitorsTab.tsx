import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { Tooltip } from "@/components/ui/tooltip";
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  ResponsiveContainer,
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
  indianCompetitors,
  globalCompetitors,
  chartData,
}: CompetitorsTabProps) {
  return (
    <TabsContent value="competitors">
      {/* Existing Competitor UI */}
        <Card className="max-h-[600px] overflow-y-auto">
          <CardHeader>
            <div className="font-semibold">Indian Competitors</div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 border">Company</th>
                    <th className="p-2 border">Founded</th>
                    <th className="p-2 border">HQ</th>
                    <th className="p-2 border">Total Raised ($M)</th>
                    <th className="p-2 border">Offerings</th>
                    <th className="p-2 border">Target Market</th>
                    <th className="p-2 border">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {indianCompetitors.map((c, i) => (
                    <tr key={i} className="border-t">
                      <td className="p-2 text-blue-600 underline">
                        <a href={c.url} target="_blank">
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

          <CardHeader>
            <div className="font-semibold">Global Competitors</div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 border">Company</th>
                    <th className="p-2 border">Founded</th>
                    <th className="p-2 border">HQ</th>
                    <th className="p-2 border">Total Raised ($M)</th>
                    <th className="p-2 border">Offerings</th>
                    <th className="p-2 border">Target Market</th>
                    <th className="p-2 border">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {globalCompetitors.map((c, i) => (
                    <tr key={i} className="border-t">
                      <td className="p-2 text-blue-600 underline">
                        <a href={c.url} target="_blank">
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

          {/* <Card> */}
          <CardHeader className="pb-1">
            <div className="font-semibold text-sm">Total Raised Comparison</div>
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
                <YAxis type="category" dataKey="name" width={80} />
                <Tooltip
                  {...({
                    formatter: (value: number) => `$${value}M`,
                  } as any)}
                />{" "}
                <Legend />
                <Bar dataKey="raised">
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.region === "Indian" ? "#6366f1" : "#22c55e"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
    </TabsContent>
  );
}
