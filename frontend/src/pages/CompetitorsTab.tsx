import { TabsContent } from "@/components/ui/tabs";
import {
  Users,
  Banknote,
  Calendar,
  PieChart,
  MapPin,
  Star,
  Globe,
} from "lucide-react";

export default function CompetitorsTab({ company }: any) {
  const domainWise =
    company?.competitor_analysis?.competitor_analysis?.competitor_analysis
      ?.domain_wise_competitor_analysis;
  const geographyWise =
    company?.competitor_analysis?.competitor_analysis?.competitor_analysis
      ?.geography_wise_competitor_analysis;

  function CompetitorCard({ company }: any) {
    return (
      <div className="p-5 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              {company.name}
            </h2>
            <div className="flex gap-2 mt-1">
              <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">
                {company.b2b_b2c}
              </span>
              <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                {company.status}
              </span>
            </div>
          </div>
          <a
            className="text-sm text-primary underline"
            href={company.domain_url}
            target="_blank"
          >
            Website
          </a>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-3 text-sm text-neutral mb-3">
          {company.team_size && (
            <div className="flex items-center gap-2">
              <Users size={16} /> {company.team_size}
            </div>
          )}
          {company.founded_year && (
            <div className="flex items-center gap-2">
              <Calendar size={16} /> {company.founded_year}
            </div>
          )}
          {company.funding && (
            <div className="flex items-center gap-2">
              <Banknote size={16} /> {company.funding}
            </div>
          )}
          {company.market_share && (
            <div className="flex items-center gap-2">
              <PieChart size={16} /> {company.market_share}
            </div>
          )}
          {company.headquarters && (
            <div className="flex items-center gap-2 col-span-2">
              <MapPin size={16} /> {company.headquarters}
            </div>
          )}
        </div>

        {/* Differentiators */}
        <div className="mb-3">
          <h4 className="text-sm font-semibold text-foreground">
            Differentiators
          </h4>
          <p className="text-sm text-neutral mt-1">
            {company.differentiators}
          </p>
        </div>

        {/* USP */}
        <div className="bg-blue-50 border-l-4 border-blue-600 p-3 rounded">
          <p className="text-sm text-blue-800 flex items-center gap-2">
            <Star size={16} className="text-blue-700" />
            <span className="font-medium">USP:</span> {company.USP}
          </p>
        </div>
      </div>
    );
  }

  return (
    <TabsContent value="competitors">
      <div className="space-y-10">
        {/* Domain-wise Section */}
        {domainWise?.length > 0 && (
          <div>
            <h1 className="text-sm font-bold text-gray-900 mb-5 flex items-center gap-2">
              <Globe size={16}/> Domain-wise Competitor Analysis
            </h1>

            <div className="grid grid-cols-1 gap-6">
              {domainWise?.map((company: any) => (
                <CompetitorCard company={company} />
              ))}
            </div>
          </div>
        )}

        {/* Geography-wise Section */}
        {geographyWise?.length > 0 && (
          <div>
            <h1 className="text-sm font-bold text-gray-900 mb-5 flex items-center gap-2">
              <MapPin size={16}/> Geography-wise Competitor Analysis
            </h1>

            <div className="grid grid-cols-1 gap-6">
              {geographyWise?.map((company: any) => (
                <CompetitorCard company={company} />
              ))}
            </div>
          </div>
        )}
      </div>
    </TabsContent>
  );
}
