import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import {
  Briefcase,
  Users,
  Rocket,
  DollarSign,
  Target,
  Globe,
  BarChart3,
  Building2,
  Handshake,
} from "lucide-react";

export default function BusinessModel() {
  return (
    <TabsContent value="businessModel">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
        {/* Revenue Model */}
        <Card className="border-l-4 border-indigo-500 bg-indigo-50/40 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Briefcase className="text-indigo-600 w-4 h-4" />
              <CardTitle className="text-sm font-semibold text-indigo-700">
                Revenue Model
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-xs text-gray-700 space-y-2">
            <p>
              <b>Type:</b> Enterprise Sales Model — high-ticket B2B SaaS deals.
            </p>
            <p>
              <b>Focus:</b> Subscription-based revenue with optional onboarding/setup fees.
            </p>
            <div className="bg-indigo-100 text-indigo-800 text-[11px] p-2 rounded-md">
              Designed for scalability across large enterprise accounts.
            </div>
          </CardContent>
        </Card>

        {/* Target Customer Profile */}
        <Card className="border-l-4 border-emerald-500 bg-emerald-50/40 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Target className="text-emerald-600 w-4 h-4" />
              <CardTitle className="text-sm font-semibold text-emerald-700">
                Target Customer Profile
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-xs text-gray-700 space-y-2">
            <p>Medium to Large Enterprises</p>
            <p>Focus on data-heavy industries such as Manufacturing, BFSI, and Healthcare.</p>
            <p>Buyers: Data Heads, CIOs, and Business Analytics Leaders.</p>
            <div className="bg-emerald-100 text-emerald-800 text-[11px] p-2 rounded-md">
              Customers seeking automation, scalability, and data democratization.
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card className="border-l-4 border-purple-500 bg-purple-50/40 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <DollarSign className="text-purple-600 w-4 h-4" />
              <CardTitle className="text-sm font-semibold text-purple-700">
                Pricing
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-xs text-gray-700 space-y-2">
            <p>
              <b>Subscription:</b> $60 per user/month
            </p>
            <p>
              <b>Setup Cost:</b> One-time fee of $20,000
            </p>
            <div className="bg-purple-100 text-purple-800 text-[11px] p-2 rounded-md">
              Flexible enterprise pricing model with scalable user tiers.
            </div>
          </CardContent>
        </Card>

        {/* Go-to-Market Strategy */}
        <Card className="col-span-3 border-l-4 border-blue-500 bg-blue-50/40 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Rocket className="text-blue-600 w-4 h-4" />
              <CardTitle className="text-sm font-semibold text-blue-700">
                Go-to-Market (GTM) Strategy
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-xs text-gray-700 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="bg-white p-3 rounded-md shadow-sm">
              <Handshake className="w-4 h-4 text-blue-500 inline-block mr-1" />
              <b>Partner Channels</b>
              <p className="mt-1 text-gray-600">
                Partnerships with data companies like N Data Services, PROPEL/ATHON, pN, BOSCH, and RAVRC for warm introductions.
              </p>
            </div>

            <div className="bg-white p-3 rounded-md shadow-sm">
              <Globe className="w-4 h-4 text-blue-500 inline-block mr-1" />
              <b>Community Building</b>
              <p className="mt-1 text-gray-600">
                Hosting webinars, data community events, and thought leadership campaigns.
              </p>
            </div>

            <div className="bg-white p-3 rounded-md shadow-sm">
              <BarChart3 className="w-4 h-4 text-blue-500 inline-block mr-1" />
              <b>Sectoral Use Cases</b>
              <p className="mt-1 text-gray-600">
                Creating vertical-specific solutions and running innovation challenges.
              </p>
            </div>

            <div className="bg-white p-3 rounded-md shadow-sm">
              <Rocket className="w-4 h-4 text-blue-500 inline-block mr-1" />
              <b>Digital Marketing</b>
              <p className="mt-1 text-gray-600">
                Strategic digital ads, SEO, and influencer collaborations to drive awareness.
              </p>
            </div>

            <div className="bg-white p-3 rounded-md shadow-sm">
              <Building2 className="w-4 h-4 text-blue-500 inline-block mr-1" />
              <b>Cloud Marketplaces</b>
              <p className="mt-1 text-gray-600">
                Listing on major cloud marketplaces for frictionless onboarding.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </TabsContent>
  );
}
