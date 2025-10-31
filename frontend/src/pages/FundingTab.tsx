import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { Tooltip } from "@/components/ui/tooltip";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

const fundAllocation = [
    { category: "Product Development", value: 30 },
    { category: "Sales & Marketing", value: 60 },
    { category: "Operations & Misc", value: 10 },
  ];

  // Line chart: Financial Projections
  const financialProjection = [
    { year: "2025-26", revenue: 0.5, cost: 0.4 },
    { year: "2026-27", revenue: 1.8, cost: 1.2 },
    { year: "2027-28", revenue: 15, cost: 4 },
    { year: "2028-29", revenue: 90, cost: 30 },
    { year: "2029-30", revenue: 110, cost: 50 },
  ];

export default function FundingTab() {
  return (
    <TabsContent value="funding"
      className="overflow-y-auto max-h-[80vh] mt-3 space-y-3">
      <div className="space-y-6">
        <Card className="p-4 bg-gray-50 border border-gray-200">
          {/* Funding Summary */}
          <CardContent className="text-sm text-gray-700 space-y-1">
            <p>
              <strong>Funding Ask:</strong> ₹5 Crores (Seed Stage)
            </p>
            <p>
              <strong>Funding History:</strong> Bootstrapped + US$75K (2024
              Crowdfunding) + $80.7K (2025 VC Round)
            </p>
            <p>
              <strong>Financial Health:</strong> FY 23-24 Revenue ₹4.16L | Net
              Profit ₹5,518
            </p>
            <p>
              <strong>Stage:</strong> Early Seed | Minimal revenue growth phase
            </p>
          </CardContent>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Use of Funds */}
        <Card className="p-3 border border-gray-200 shadow-sm">
          <CardHeader className="pb-1">
            <CardTitle className="text-sm font-semibold">
              Use of Funds
            </CardTitle>
          </CardHeader>
          <CardContent className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={fundAllocation}
                  dataKey="value"
                  outerRadius={70}
                >
                  <Cell fill="#6366f1" />
                  <Cell fill="#22c55e" />
                  <Cell fill="#f59e0b" />
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Financial Projections */}
        <Card className="p-3 border border-gray-200 shadow-sm">
          <CardHeader className="pb-1">
            <CardTitle className="text-sm font-semibold">
              Financial Projections
            </CardTitle>
          </CardHeader>
          <CardContent className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={financialProjection}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#16a34a"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="cost"
                  stroke="#ef4444"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Funding Timeline */}
        <Card className="p-3 border border-gray-200 shadow-sm">
          <CardHeader className="pb-1">
            <CardTitle className="text-sm font-semibold">
              Funding Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                barCategoryGap="20%"
                data={[
                  { date: "Mar 2024", amount: 75 },
                  { date: "Jan 2025", amount: 80.7 },
                ]}
              >
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip
                  {...({
                    formatter: (value: number) => `$${value}K`,
                  } as any)}
                />{" "}
                <Bar dataKey="amount" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
        </Card>
      </div>
    </TabsContent>
  );
}
