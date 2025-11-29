import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type ViewModalProps = {
  viewData: boolean;
  setViewData: (value: boolean) => void;
  industryTrendsData: any;
};

export default function ViewMarketAnalysis({
  viewData,
  setViewData,
  industryTrendsData,
}: ViewModalProps) {
  return (
    <Dialog open={viewData}>
      <DialogContent className="rounded-xl p-4 space-y-2 max-h-[80vh] overflow-y-auto max-w-3xl">
        {industryTrendsData?.CAGR_analysis && (
          <div className="flex flex-col">
            <h3 className="text-sm font-semibold text-foreground">
              CAGR Analysis
            </h3>

            <p className="text-xs text-muted-foreground leading-relaxed">
              {industryTrendsData?.CAGR_analysis}
            </p>
          </div>
        )}
        {industryTrendsData?.adoption_and_investment_momentum && (
          <div className="flex flex-col">
            <h3 className="text-sm font-semibold text-foreground">
              Adoption & Investment Momentum
            </h3>

            <p className="text-xs text-muted-foreground leading-relaxed">
              {industryTrendsData?.adoption_and_investment_momentum}
            </p>
          </div>
        )}
        {industryTrendsData?.ai_adoption_rates && (
          <div className="flex flex-col">
            <h3 className="text-sm font-semibold text-foreground">
              Adoption Reports
            </h3>

            <p className="text-xs text-muted-foreground leading-relaxed">
              {industryTrendsData?.ai_adoption_rates}
            </p>
          </div>
        )}
        {industryTrendsData?.ai_investment_surge && (
          <div className="flex flex-col">
            <h3 className="text-sm font-semibold text-foreground">
              AI Investment Surge
            </h3>

            <p className="text-xs text-muted-foreground leading-relaxed">
              {industryTrendsData?.ai_investment_surge}
            </p>
          </div>
        )}
        {industryTrendsData?.consumer_behavior && (
          <div className="flex flex-col">
            <h3 className="text-sm font-semibold text-foreground">
              Consumer Behaviour
            </h3>

            <p className="text-xs text-muted-foreground leading-relaxed">
              {industryTrendsData?.consumer_behavior}
            </p>
          </div>
        )}
        {(industryTrendsData?.emerging_technologies ||
          industryTrendsData?.regulatory_changes) && (
          <div className="flex flex-col">
            <h3 className="text-sm font-semibold text-foreground">
              Technologies
            </h3>

            {industryTrendsData?.emerging_technologies && (
              <p className="text-xs text-muted-foreground leading-relaxed">
                {industryTrendsData?.emerging_technologies}
              </p>
            )}
            {industryTrendsData?.regulatory_changes && (
              <p className="text-xs text-muted-foreground leading-relaxed">
                {industryTrendsData?.regulatory_changes}
              </p>
            )}
          </div>
        )}
        {industryTrendsData?.funding_breakdowns && (
          <div className="flex flex-col">
            <h3 className="text-sm font-semibold text-foreground">Fundings</h3>

            <p className="text-xs text-muted-foreground leading-relaxed">
              {industryTrendsData?.funding_breakdowns}
            </p>
          </div>
        )}
        {industryTrendsData?.market_growth_trends && (
          <div className="flex flex-col">
            <h3 className="text-sm font-semibold text-foreground">
              Market Growth Trends
            </h3>

            <p className="text-xs text-muted-foreground leading-relaxed">
              {industryTrendsData?.market_growth_trends}
            </p>
          </div>
        )}
        {industryTrendsData?.other_relevant_insights && (
          <div className="flex flex-col">
            <h3 className="text-sm font-semibold text-foreground">
              Other Insights
            </h3>

            <p className="text-xs text-muted-foreground leading-relaxed">
              {industryTrendsData?.other_relevant_insights}
            </p>
          </div>
        )}
        {industryTrendsData?.market_growth_trends && (
          <div className="flex flex-col">
            <h3 className="text-sm font-semibold text-foreground">
              Market Growth Trends
            </h3>

            <p className="text-xs text-muted-foreground leading-relaxed">
              {industryTrendsData?.market_growth_trends}
            </p>
          </div>
        )}
        {industryTrendsData?.sector_market_size && (
          <div className="flex flex-col">
            <h3 className="text-sm font-semibold text-foreground">
              Sector Market Size
            </h3>

            <p className="text-xs text-muted-foreground leading-relaxed">
              {industryTrendsData?.sector_market_size}
            </p>
          </div>
        )}
        {industryTrendsData?.total_market_size && (
          <div className="flex flex-col">
            <h3 className="text-sm font-semibold text-foreground">
              Total Market Size
            </h3>

            <p className="text-xs text-muted-foreground leading-relaxed">
              {industryTrendsData?.total_market_size}
            </p>
          </div>
        )}
        {/* <h2 className="text-lg font-semibold text-foreground">
          {marketData?.tag_line}
        </h2> */}

        {/* <div className="rounded-lg border p-3 bg-background hover:border-primary shadow-sm space-y-2">
          <p className="text-xs text-muted-foreground leading-relaxed">
            {marketData?.short_description}
          </p>
        </div> */}

        {/* Competitors Section */}
        {/* <div className="rounded-lg border p-3 bg-background hover:border-primary shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">
              Competitors Summary
            </h3>
            <span className="text-xs text-muted-foreground">
              {marketData?.competitors_summary?.number_of_competitors}{" "}
              Competitors
            </span>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">
            {marketData?.competitors_summary?.summary}
          </p>
        </div> */}

        {/* Innovation Cycle Section */}
        {/* <div className="rounded-lg border p-3 bg-background hover:border-primary shadow-sm space-y-2">
          <h3 className="text-sm font-semibold text-foreground">
            {marketData?.innovation_cycle_status?.status}
          </h3>

          <p className="text-xs text-muted-foreground leading-relaxed">
            {marketData?.innovation_cycle_status?.reasoning}
          </p>
        </div> */}

        {/* Footer */}
        <DialogClose asChild>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setViewData(false)}
          >
            Close
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
