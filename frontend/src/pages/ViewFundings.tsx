import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type ViewModalProps = {
  viewFunding: boolean;
  setViewFunding: (value: boolean) => void;
  fundingsAndFinancialsData: any;
};

export default function ViewFundings({
  viewFunding,
  setViewFunding,
  fundingsAndFinancialsData,
}: ViewModalProps) {
  return (
    <Dialog open={viewFunding}>
      <DialogContent className="rounded-xl p-4 space-y-2 max-h-[80vh] overflow-y-auto max-w-3xl">
        {(fundingsAndFinancialsData?.adoption_and_investment_momentum ||
          fundingsAndFinancialsData?.funding_history_evaluation) && (
          <div className="flex flex-col">
            <h3 className="text-sm font-semibold text-foreground">
              Funding History
            </h3>

            {fundingsAndFinancialsData?.funding_history && (
              <p className="text-xs text-muted-foreground leading-relaxed">
                {fundingsAndFinancialsData?.funding_history}
              </p>
            )}
            {fundingsAndFinancialsData?.funding_history_evaluation && (
              <p className="text-xs text-muted-foreground leading-relaxed">
                {fundingsAndFinancialsData?.funding_history_evaluation}
              </p>
            )}
          </div>
        )}
        {(fundingsAndFinancialsData?.funding_ask_analysis ||
          fundingsAndFinancialsData?.startup_funding_status_and_trends) && (
          <div className="flex flex-col">
            <h3 className="text-sm font-semibold text-foreground">
              Funding Asked
            </h3>

            {fundingsAndFinancialsData?.funding_ask_analysis && (
              <p className="text-xs text-muted-foreground leading-relaxed">
                {fundingsAndFinancialsData?.funding_ask_analysis}
              </p>
            )}
            {fundingsAndFinancialsData?.startup_funding_status_and_trends && (
              <p className="text-xs text-muted-foreground leading-relaxed">
                {fundingsAndFinancialsData?.startup_funding_status_and_trends}
              </p>
            )}
          </div>
        )}
        {fundingsAndFinancialsData?.funding_timelines && (
          <div className="flex flex-col">
            <h3 className="text-sm font-semibold text-foreground">Timeline</h3>

            <p className="text-xs text-muted-foreground leading-relaxed">
              {fundingsAndFinancialsData?.funding_timelines}
            </p>
          </div>
        )}

        {(fundingsAndFinancialsData?.historical_financial_performance ||
          fundingsAndFinancialsData?.financial_health_indicators) && (
          <div className="flex flex-col">
            <h3 className="text-sm font-semibold text-foreground">
              Financial Performance History
            </h3>

            {fundingsAndFinancialsData?.historical_financial_performance && (
              <p className="text-xs text-muted-foreground leading-relaxed">
                {fundingsAndFinancialsData?.historical_financial_performance}
              </p>
            )}
            {fundingsAndFinancialsData?.financial_health_indicators && (
              <p className="text-xs text-muted-foreground leading-relaxed">
                {fundingsAndFinancialsData?.financial_health_indicators}
              </p>
            )}
          </div>
        )}
        {(fundingsAndFinancialsData?.financial_projections_and_milestones ||
          fundingsAndFinancialsData?.financial_projections_review) && (
          <div className="flex flex-col">
            <h3 className="text-sm font-semibold text-foreground">
              Financial Projections And Milestones
            </h3>

            {fundingsAndFinancialsData?.financial_projections_and_milestones && (
              <p className="text-xs text-muted-foreground leading-relaxed">
                {
                  fundingsAndFinancialsData?.financial_projections_and_milestones
                }
              </p>
            )}
            {fundingsAndFinancialsData?.financial_projections_review && (
              <p className="text-xs text-muted-foreground leading-relaxed">
                {fundingsAndFinancialsData?.financial_projections_review}
              </p>
            )}
          </div>
        )}
        {fundingsAndFinancialsData?.consumer_behavior && (
          <div className="flex flex-col">
            <h3 className="text-sm font-semibold text-foreground">
              Consumer Behaviour
            </h3>

            <p className="text-xs text-muted-foreground leading-relaxed">
              {fundingsAndFinancialsData?.consumer_behavior}
            </p>
          </div>
        )}
        {(fundingsAndFinancialsData?.emerging_technologies ||
          fundingsAndFinancialsData?.regulatory_changes) && (
          <div className="flex flex-col">
            <h3 className="text-sm font-semibold text-foreground">
              Technologies
            </h3>

            {fundingsAndFinancialsData?.emerging_technologies && (
              <p className="text-xs text-muted-foreground leading-relaxed">
                {fundingsAndFinancialsData?.emerging_technologies}
              </p>
            )}
            {fundingsAndFinancialsData?.regulatory_changes && (
              <p className="text-xs text-muted-foreground leading-relaxed">
                {fundingsAndFinancialsData?.regulatory_changes}
              </p>
            )}
          </div>
        )}
        {fundingsAndFinancialsData?.funding_breakdowns && (
          <div className="flex flex-col">
            <h3 className="text-sm font-semibold text-foreground">Fundings</h3>

            <p className="text-xs text-muted-foreground leading-relaxed">
              {fundingsAndFinancialsData?.funding_breakdowns}
            </p>
          </div>
        )}
        {fundingsAndFinancialsData?.market_growth_trends && (
          <div className="flex flex-col">
            <h3 className="text-sm font-semibold text-foreground">
              Market Growth Trends
            </h3>

            <p className="text-xs text-muted-foreground leading-relaxed">
              {fundingsAndFinancialsData?.market_growth_trends}
            </p>
          </div>
        )}
        {fundingsAndFinancialsData?.other_relevant_insights && (
          <div className="flex flex-col">
            <h3 className="text-sm font-semibold text-foreground">
              Other Insights
            </h3>

            <p className="text-xs text-muted-foreground leading-relaxed">
              {fundingsAndFinancialsData?.other_relevant_insights}
            </p>
          </div>
        )}
        {fundingsAndFinancialsData?.market_growth_trends && (
          <div className="flex flex-col">
            <h3 className="text-sm font-semibold text-foreground">
              Market Growth Trends
            </h3>

            <p className="text-xs text-muted-foreground leading-relaxed">
              {fundingsAndFinancialsData?.market_growth_trends}
            </p>
          </div>
        )}
        {fundingsAndFinancialsData?.sector_market_size && (
          <div className="flex flex-col">
            <h3 className="text-sm font-semibold text-foreground">
              Sector Market Size
            </h3>

            <p className="text-xs text-muted-foreground leading-relaxed">
              {fundingsAndFinancialsData?.sector_market_size}
            </p>
          </div>
        )}
        {fundingsAndFinancialsData?.total_market_size && (
          <div className="flex flex-col">
            <h3 className="text-sm font-semibold text-foreground">
              Total Market Size
            </h3>

            <p className="text-xs text-muted-foreground leading-relaxed">
              {fundingsAndFinancialsData?.total_market_size}
            </p>
          </div>
        )}

        {/* Footer */}
        <DialogClose asChild>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setViewFunding(false)}
          >
            Close
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
