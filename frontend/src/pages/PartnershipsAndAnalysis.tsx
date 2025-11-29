"use client";
import { TabsContent } from "@/components/ui/tabs";
import {FourVectorAnalysis} from "./FourVectorAnalysis";
import {SwotAnalysis} from "./SwotAnalysis";
import {RiskAssessment} from "./RiskAssessment";
import { PartnershipsSection } from "./PartnershipsSection";

export default function PartnershipsAndAnalysis({ company }: { company: any }) {
  return (
    <TabsContent value="partnership">
      <div className="space-y-10 px-6 py-8">
        <PartnershipsSection
          data={
            company?.partnerships_and_strategic_analysis?.partnerships_and_strategic_analysis
          }
        />
        <FourVectorAnalysis
          data={
            company?.partnerships_and_strategic_analysis?.partnerships_and_strategic_analysis.four_vector_analysis
          }
        />
        <SwotAnalysis
          data={company?.partnerships_and_strategic_analysis?.partnerships_and_strategic_analysis.swot_analysis}
        />
        <RiskAssessment
          data={company?.partnerships_and_strategic_analysis?.partnerships_and_strategic_analysis.risk_assessment}
        />
      </div>
    </TabsContent>
  );
}
