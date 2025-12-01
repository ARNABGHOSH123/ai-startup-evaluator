"use client";
import { TabsContent } from "@/components/ui/tabs";
import FourVectorAnalysis from "./FourVectorAnalysis";
import SwotAnalysis from "./SwotAnalysis";
import RiskAssessment from "./RiskAssessment";

export default function RisksAndStrategicAnalysis({ company }: { company: any }) {
  return (
    <TabsContent value="partnership">
      <div className="grid grid-cols-5 gap-4">
        <span className="col-span-3">
          <SwotAnalysis
            data={
              company?.partnerships_and_strategic_analysis
                ?.partnerships_and_strategic_analysis?.swot_analysis
            }
          />
        </span>
        <span className="col-span-2">
          <span> <FourVectorAnalysis
            data={
              company?.partnerships_and_strategic_analysis
                ?.partnerships_and_strategic_analysis?.four_vector_analysis
            }
          /></span>
         <span><RiskAssessment
          data={company?.partnerships_and_strategic_analysis?.partnerships_and_strategic_analysis?.risk_assessment}
        /></span>
          
        </span>
      </div>
    </TabsContent>
  );
}
