import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Users, Banknote, PieChart, MapPin, Star, Globe } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useState } from "react";

type ViewModalProps = {
  viewCompetitors: boolean;
  setViewCompetitors: (value: boolean) => void;
  competitorData: any;
};

export default function ViewCompetitors({
  viewCompetitors,
  setViewCompetitors,
  competitorData,
}: ViewModalProps) {
  const domainWise = competitorData?.domain_wise_competitor_analysis;
  const geographyWise = competitorData?.geography_wise_competitor_analysis;

  const [selectedView, setSelectedView] = useState("all");

  function CompetitorCard({ company }: any) {
    return (
      <div className="p-3 bg-background rounded-lg border border-border hover:border-primary shadow-sm hover:shadow transition">
        {/* Header Row */}
        <div className="flex justify-between items-start mb-2">
          <div className="space-y-1">
            <div className="flex items-center gap-4">
              <h2 className="text-sm font-semibold text-foreground">
                {company.name}
              </h2>

              {company.founded_year && (
                <span className="text-[10px] text-neutral">
                  Founded {company.founded_year}
                </span>
              )}

              {company.team_size && (
                <span className="text-[10px] text-neutral flex items-center gap-1 truncate">
                  <Users size={13} /> {company.team_size}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-y-1 text-[10px] text-neutral mb-2">
              {
                <span className="flex items-center gap-1">
                  {company.b2b_b2c && (
                    <span className="px-2 py-[2px] text-[10px] bg-primary-foreground font-medium text-primary rounded-full">
                      {company.b2b_b2c}
                    </span>
                  )}

                  {company.status && (
                    <span className="px-2 py-[2px] text-[10px] bg-cardborderlight text-cardborder rounded-full">
                      {company.status}
                    </span>
                  )}
                </span>
              }

              {company.headquarters && (
                <div className="flex items-center gap-1 text-[10px] text-neutral">
                  <MapPin size={13} />
                  {company.headquarters}
                </div>
              )}
            </div>
          </div>

          {/* Website */}
          <a
            href={company.domain_url}
            target="_blank"
            className="text-[10px] text-blue-600 underline whitespace-nowrap"
          >
            Website
          </a>
        </div>

        <div className="grid grid-cols-2 gap-y-1 text-[10px] text-neutral mb-2">
          {company.funding && (
            <div className="flex items-center gap-1 truncate">
              <Banknote size={13} /> {company.funding}
            </div>
          )}

          {company.market_share && (
            <div className="flex items-center gap-1 truncate">
              <PieChart size={13} /> {company.market_share}
            </div>
          )}
        </div>

        {company.differentiators && (
          <div className="mb-2">
            <p className="text-xs text-neutral leading-snug mt-1">
              {company.description}
            </p>
          </div>
        )}

        {company.differentiators && (
          <div className="mb-2">
            <h4 className="font-semibold text-xs text-foreground">Features</h4>
            <p className="text-xs text-neutral leading-snug mt-1">
              {company.detailed_offerings_and_features}
            </p>
          </div>
        )}

        {company.differentiators && (
          <div className="mb-2">
            <h4 className="text-xs font-semibold text-foreground">
              Differentiators
            </h4>
            <p className="text-xs text-neutral leading-snug mt-1">
              {company.differentiators}
            </p>
          </div>
        )}

        {company.USP && (
          <div className="bg-blue-50 border-l-4 border-blue-600 p-2 rounded">
            <p className="text-[10px] text-blue-900 flex items-center gap-1">
              <Star size={13} className="text-blue-700" />
              <span className="font-semibold">USP:</span> {company.USP}
            </p>
          </div>
        )}
      </div>
    );
  }

  // Select data based on dropdown
  const displayedData =
    selectedView === "all"
      ? [...(domainWise || []), ...(geographyWise || [])]
      : selectedView === "domain"
      ? domainWise
      : geographyWise;

  return (
    <Dialog open={viewCompetitors}>
      <DialogContent className="rounded-xl p-4 space-y-2 max-h-[80vh] overflow-y-auto max-w-3xl">
        {/* Dropdown Title Area */}
        <div className="flex space-x-8 items-center justify-between">
          <span className="flex space-x-8 items-center">
            <h2 className="text-foreground font-semibold">
              Competitor Analysis
            </h2>

            {/* <Select value={selectedView} onValueChange={setSelectedView}>
            <SelectTrigger className="w-40 h-8 text-xs outline-none text-primary">
              <SelectValue placeholder="Select View" className="outline-none"/>
            </SelectTrigger>
            <SelectContent  className="outline-none">
              <SelectItem value="all" className="outline-none">All</SelectItem>
              <SelectItem value="domain">Domain-wise</SelectItem>
              <SelectItem value="geography">Geography-wise</SelectItem>
            </SelectContent>
          </Select> */}
          </span>
          <Button
            variant="outline"
            className="w-24 justify-center text-foreground"
            onClick={() => setViewCompetitors(false)}
          >
            Close
          </Button>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 gap-6">
          {displayedData?.map((company: any) => (
            <CompetitorCard company={company} key={company.name} />
          ))}
        </div>

        <DialogClose asChild>
          <Button
            variant="outline"
            className="w-24 justify-center text-foreground"
            onClick={() => setViewCompetitors(false)}
          >
            Close
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
