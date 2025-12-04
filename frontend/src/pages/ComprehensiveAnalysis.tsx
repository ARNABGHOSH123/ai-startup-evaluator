import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartNoAxesCombined, Coins, PieChartIcon } from "lucide-react";
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
import ViewMarketAnalysis from "./ViewMarketAnalysis";
import ViewCompetitors from "./ViewCompetitors";
import ViewFundings from "./ViewFundings";
import { TabsContent } from "@/components/ui/tabs";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";

export default function ComprehensiveAnalysis({ company }: any) {
  const marketData = company?.overview?.overview?.market_size_and_position;
  const industryTrendsData = company?.industry_trends?.industry_trends;
  const fundingsAndFinancialsData =
    company?.funding_and_financials?.funding_and_financials;
  const competitorData =
    company?.competitor_analysis?.competitor_analysis?.competitor_analysis;
  const topThreeDomainWise =
    competitorData?.domain_wise_competitor_analysis?.length > 0
      ? competitorData?.domain_wise_competitor_analysis?.slice(0, 3)
      : [];
  const topThreeGeographyWise =
    competitorData?.geography_wise_competitor_analysis?.length > 0
      ? competitorData?.geography_wise_competitor_analysis?.slice(0, 3)
      : [];
  const COLORS = ["#FFB8FF", "#FF8AFF", "#FF5CFF", "#D100D1", "#A300A3"];
  const defaultMode =
    topThreeDomainWise?.length > 0 && topThreeGeographyWise?.length > 0
      ? "geographical"
      : topThreeDomainWise?.length > 0
      ? "domain"
      : "geographical";

  const [viewData, setViewData] = useState(false);
  const [viewCompetitors, setViewCompetitors] = useState(false);
  const [viewFunding, setViewFunding] = useState(false);
  const [mode /*setMode*/] = useState<"geographical" | "domain">(defaultMode);

  return (
    <>
      <ViewMarketAnalysis
        viewData={viewData}
        setViewData={setViewData}
        industryTrendsData={industryTrendsData}
      />
      <ViewCompetitors
        viewCompetitors={viewCompetitors}
        setViewCompetitors={setViewCompetitors}
        competitorData={competitorData}
      />
      <ViewFundings
        viewFunding={viewFunding}
        setViewFunding={setViewFunding}
        fundingsAndFinancialsData={fundingsAndFinancialsData}
      />

      {/* Market Analysis */}
      <TabsContent
        value="comprehensive"
        className="overflow-y-auto max-h-[80vh] mt-3 space-y-3"
      >
        <div className="grid grid-cols-3 gap-6">
          <Card className="rounded-lg border border-border hover:border-primary bg-background">
            <span className="flex flex-row items-center justify-between">
              <CardHeader className="flex flex-row space-x-2 items-center -mt-3 -ml-2">
                <PieChartIcon className="p-1 rounded-sm bg-cardborderlight text-cardborder" />
                <CardTitle className="text-sm">Market Analysis</CardTitle>
              </CardHeader>
              <span
                className="text-xs hover:cursor-pointer text-primary -mt-2 mr-2 font-semibold bg-primary-foreground rounded-xl px-2"
                onClick={() => setViewData(true)}
              >
                View Details
              </span>
            </span>
            <CardContent>
              {/* Bar Chart */}
              {marketData?.SOM_Projection?.data && (
                <div>
                  {marketData?.SOM_Projection?.data &&
                    marketData?.SOM_Projection?.data.length > 0 && (
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={marketData?.SOM_Projection?.data}>
                          <XAxis dataKey="year" />
                          <YAxis />
                          <Tooltip />
                          <Legend
                            wrapperStyle={{
                              fontSize: "12px",
                              paddingTop: "6px",
                            }}
                            iconSize={10}
                          />
                          <Bar
                            dataKey="value"
                            name={`SOM Projection (${marketData?.SOM_Projection?.unit})`}
                          >
                            {marketData?.SOM_Projection?.data?.map(
                              (_: any, index: number) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={COLORS[index % COLORS.length]}
                                />
                              )
                            )}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                </div>
              )}

              {/* TAM + SAM Bullets */}
              <div className="space-y-2 text-foreground text-xs">
                <p className="font-semibold">Market Size</p>
                <ul className="list-disc list-inside space-y-1">
                  {marketData?.TAM && (
                    <li>
                      <span className="font-medium">TAM:</span>{" "}
                      {marketData?.TAM}
                    </li>
                  )}
                  {marketData?.SAM && (
                    <li>
                      <span className="font-medium">SAM:</span>{" "}
                      {marketData?.SAM}
                    </li>
                  )}
                  {marketData?.SOM && (
                    <li>
                      <span className="font-medium">SOM:</span>{" "}
                      {marketData?.SOM}
                    </li>
                  )}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Competitor Analysis*/}
          <Card className="rounded-lg border border-border hover:border-primary bg-background pb-8">
            <span className="flex flex-row items-center justify-between">
              <CardHeader className="flex flex-row space-x-2 items-center -mt-3 -ml-2">
                <ChartNoAxesCombined className="p-1 rounded-sm bg-cardorangelight text-cardorange" />
                <CardTitle className="text-sm">Competitor Analysis</CardTitle>
              </CardHeader>
              <span
                className="text-xs hover:cursor-pointer text-primary -mt-2 mr-2 font-semibold bg-primary-foreground rounded-xl px-2"
                onClick={() => setViewCompetitors(true)}
              >
                View Details
              </span>
            </span>
            <CardContent>
              {competitorData?.domain_wise_competitor_analysis?.length > 0 &&
                competitorData?.geography_wise_competitor_analysis?.length >
                  0 && (
                  // <div
                  //   onClick={() =>
                  //     setMode(
                  //       mode === "geographical" ? "domain" : "geographical"
                  //     )
                  //   }
                  //   className="inline-flex items-center border border-border rounded-full overflow-hidden cursor-pointer select-none bg-muted w-auto"
                  // >
                  //   {/* Geographical */}
                  //   <span
                  //     className={`px-3 py-1 text-xs font-medium transition-colors ${
                  //       mode === "geographical"
                  //         ? "bg-primary text-background"
                  //         : "text-muted-foreground"
                  //     }`}
                  //   >
                  //     Geographical
                  //   </span>

                  //   {/* Domain */}
                  //   <span
                  //     className={`px-3 py-1 text-xs font-medium transition-colors ${
                  //       mode === "domain"
                  //         ? "bg-primary text-background"
                  //         : "text-muted-foreground"
                  //     }`}
                  //   >
                  //     Domain
                  //   </span>
                  // </div>
                  <span
                    className={`py-1 text-sm font-semibold text-cardorange`}
                  >
                    Top 3 Competitors
                  </span>
                )}
              {competitorData?.domain_wise_competitor_analysis?.length > 0 &&
                competitorData?.geography_wise_competitor_analysis?.length ===
                  0 && (
                  <span
                    className={`py-1 text-sm font-semibold text-cardorange`}
                  >
                    Top 3 Domain-Based Competitors
                  </span>
                )}
              {competitorData?.domain_wise_competitor_analysis?.length === 0 &&
                competitorData?.geography_wise_competitor_analysis?.length >
                  0 && (
                  <span
                    className={`py-1 text-sm text-cardorange font-semibold`}
                  >
                    Top 3 Geo-Based Competitors
                  </span>
                )}
            </CardContent>

            <CardDescription>
              <div className="space-y-6">
                {(mode?.toString()?.toLowerCase() === "domain"
                  ? topThreeDomainWise
                  : topThreeGeographyWise
                )?.map((item: any, index: number) => (
                  <div key={index} className="space-y-1 px-6">
                    {/* Header row */}
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-sm text-foreground">
                        {item?.name}
                      </h3>

                      {/* <div className="flex gap-1">
                        <span className="px-1 py-0.5 text-xs rounded-md bg-green-100 text-green-700">
                          Low Cost
                        </span>
                        <span className="px-1 py-0.5 text-xs rounded-md bg-green-100 text-green-700">
                          High Speed
                        </span>
                      </div> */}
                    </div>

                    {/* Progress bar */}
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          index === 0
                            ? "bg-green-500 w-[90%]"
                            : index === 1
                            ? "bg-gray-400 w-[60%]"
                            : "bg-gray-400 w-[70%]"
                        }`}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardDescription>
          </Card>

          {/*Funding Details */}
          <Card className="rounded-lg border border-border hover:border-primary bg-background">
            <span className="flex flex-row items-center justify-between">
              <CardHeader className="flex flex-row space-x-2 items-center -mt-3 -ml-2">
                <Coins className="p-1 rounded-sm bg-cardgreenlight text-cardgreen" />
                <CardTitle className="text-sm">
                  Funding and Financials
                </CardTitle>
              </CardHeader>
              <span
                className="text-xs hover:cursor-pointer text-primary -mt-2 mr-2 font-semibold bg-primary-foreground rounded-xl px-2"
                onClick={() => setViewFunding(true)}
              >
                View Details
              </span>
            </span>
            <CardContent className="text-foreground">
              {fundingsAndFinancialsData?.financial_projections_review && (
                <div className="text-xs leading-relaxed">
                  <article className="max-w-none space-y-2">
                    <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                      {fundingsAndFinancialsData?.financial_projections_review}
                    </ReactMarkdown>
                  </article>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </>
  );
}
