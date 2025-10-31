import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import {
  Users,
  Building2,
  LineChart,
  Award,
  TrendingUp,
  BarChart3,
} from "lucide-react";

export default function Traction() {
  return (
    <TabsContent value="traction">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
        {/* Customer Overview */}
        <Card className="col-span-1 border-l-4 border-indigo-500 bg-indigo-50/40">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              <CardTitle className="text-sm font-semibold text-indigo-700">
                Customer Base
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-xs text-gray-700 space-y-2">
            <p>
              <b>Booked:</b> Bosch, Abha Hospital (KSA), Al Borg Diagnostics, IDBI Bank, Rice University.
            </p>
            <p>
              <b>Pilots:</b> Mercedes-Benz, Infoline, eSunScope, SEG AUTOMOTIVE, ZELIOT, CHARA.
            </p>
            <p>
              <b>Pipeline:</b> Vetrina, Saudi Telecom, Sobha Group, Accolade, HDFCergo, Pfizer, Maruti Suzuki, Tata Elxsi.
            </p>
          </CardContent>
        </Card>

        {/* Recognitions & Product Milestones */}
        <Card className="col-span-1 border-l-4 border-emerald-500 bg-emerald-50/40">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-600" />
              <CardTitle className="text-sm font-semibold text-emerald-700">
                Recognitions & Product Milestones
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-xs text-gray-700 space-y-2">
            <ul className="list-disc ml-4 space-y-1">
              <li>Winners of <b>E-LEVATE 2023</b></li>
              <li>Incubated at <b>NSRCEL IIMB</b></li>
              <li>Selected by <b>Microsoft for Startups</b></li>
            </ul>
            <div className="pt-2 border-t border-gray-200">
              <p>
                <b>Product v1 deployed in 2024.</b> Actively onboarding new customers and signups.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Financial Traction */}
        <Card className="col-span-1 border-l-4 border-purple-500 bg-purple-50/40">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-600" />
              <CardTitle className="text-sm font-semibold text-purple-700">
                Financial Traction
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-xs text-gray-700 space-y-2">
            <p>
              <b>Expected Revenue (FY 25-26):</b> $400k
            </p>
            <p>
              <b>Reported FY 23-24 Revenue:</b> ₹4.16L (Datastride Analytics Pvt. Ltd.)
            </p>
            <div className="bg-purple-100 text-purple-800 text-[11px] p-2 rounded-md">
              Continuous growth with early enterprise traction and multi-sector pilots.
            </div>
          </CardContent>
        </Card>

        {/* Impact Metrics */}
        <Card className="col-span-2 border-l-4 border-blue-500 bg-blue-50/40">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              <CardTitle className="text-sm font-semibold text-blue-700">
                Impact & Efficiency Metrics
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-xs text-gray-700 grid grid-cols-2 md:grid-cols-4 gap-2">
            <div className="bg-white rounded-md p-2 shadow-sm">
              <p className="font-semibold text-blue-700">Time to Insights</p>
              <p>&lt; 5 min (90% faster)</p>
            </div>
            <div className="bg-white rounded-md p-2 shadow-sm">
              <p className="font-semibold text-blue-700">Data Volume</p>
              <p>100 GB (10x Increase)</p>
            </div>
            <div className="bg-white rounded-md p-2 shadow-sm">
              <p className="font-semibold text-blue-700">Budget Saved</p>
              <p>4x Cost Reduction</p>
            </div>
            <div className="bg-white rounded-md p-2 shadow-sm">
              <p className="font-semibold text-blue-700">Deployment Time</p>
              <p>2-3 Weeks (80% faster)</p>
            </div>
          </CardContent>
        </Card>

        {/* Business KPIs */}
        <Card className="col-span-1 border-l-4 border-orange-500 bg-orange-50/40">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <LineChart className="w-4 h-4 text-orange-600" />
              <CardTitle className="text-sm font-semibold text-orange-700">
                Business KPIs
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-xs text-gray-700 space-y-2">
            <p><b>CAS:</b> $3k/mo → Target $10k by EOY</p>
            <p><b>ACV:</b> $150k – $300k</p>
            <p><b>LTV:</b> $1M+</p>
            <p><b>Sales Cycle:</b> 9–12 months</p>
          </CardContent>
        </Card>

        {/* Case Study */}
        <Card className="col-span-3 border-l-4 border-pink-500 bg-pink-50/40">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-pink-600" />
              <CardTitle className="text-sm font-semibold text-pink-700">
                Case Study: Abha Hospitals
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-xs text-gray-700 space-y-2">
            <p>
              <b>Client:</b> 2,000+ Employees | $50M+ Revenue
            </p>
            <p>
              <b>Contract:</b> 80 → 400 subscriptions in 2 years | $60/user/month + $20k setup  
              → <b>Total Value:</b> $98k/year
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] bg-white p-2 rounded-md shadow-sm">
              <p>Unified patient data & historical insights</p>
              <p>Org performance & finance analytics</p>
              <p>Reduced diagnosis time & faster data access</p>
              <p>MVP feedback rated “phenomenal” by co-founder</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </TabsContent>
  );
}
