import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { SquareDashedKanban } from "lucide-react";
import ViewFourVector from "./ViewFourVector";

interface ScoreData {
  detail: string;
  score: number | string;
  reasoning: string;
}

interface AssessmentData {
  market_attractiveness: ScoreData;
  competitive_position: ScoreData;
  strategic_fit: ScoreData;
  financial_performance: ScoreData;
}

interface Props {
  data: AssessmentData;
}

export default function FourVectorAnalysis({ data }: Props) {
  const [viewData, setViewData] = useState(false);
  // Prepare data for radar chart
  const radarData = [
    {
      category: "Market Attractiveness",
      score: Number(data.market_attractiveness.score),
    },
    {
      category: "Competitive Position",
      score: Number(data.competitive_position.score),
    },
    { category: "Strategic Fit", score: Number(data.strategic_fit.score) },
    {
      category: "Financial Performance",
      score: Number(data.financial_performance.score),
    },
  ];

  const sections = [
    {
      id: "market_attractiveness",
      title: "Market Attractiveness",
      body: data.market_attractiveness,
    },
    {
      id: "competitive_position",
      title: "Competitive Position",
      body: data.competitive_position,
    },
    { id: "strategic_fit", title: "Strategic Fit", body: data.strategic_fit },
    {
      id: "financial_performance",
      title: "Financial Performance",
      body: data.financial_performance,
    },
  ];

  return (
    <div className="space-y-6">
       <ViewFourVector
              viewData={viewData}
              setViewData={setViewData}
              sections={sections}
            />
      {/* Radar Chart */}
      <Card className="rounded-lg border border-border hover:border-primary bg-background">
        <span className="flex flex-row items-center justify-between">
          <CardHeader className="flex flex-row space-x-2 items-center -mt-3 -ml-2">
            <SquareDashedKanban className="p-1 rounded-sm bg-cardborderlight text-cardborder" />
            <CardTitle className="text-sm">Four Vector Analysis</CardTitle>
          </CardHeader>
          <span
            className="text-xs hover:cursor-pointer text-primary -mt-2 mr-2 font-semibold bg-primary-foreground rounded-xl px-2"
            onClick={() => setViewData(true)}
          >
            View Details
          </span>
        </span>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart
              cx="50%"
              cy="50%"
              outerRadius="70%"
              data={radarData}
              margin={{ top: 20, right: 20, bottom: 40, left: 20 }}
            >
              <PolarGrid />
              <PolarAngleAxis dataKey="category" tick={{ fontSize: 12 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} />
              <Radar
                name="Score"
                dataKey="score"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.4}
              />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
