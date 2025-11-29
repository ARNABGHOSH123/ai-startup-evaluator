import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { TrendingUp, Users, Target, Zap, LineChart } from "lucide-react";
import { TabsContent } from "@/components/ui/tabs";

export default function TractionAnalysis({ company }: any) {
  if (!company) return null;

  const cx = company?.traction?.traction?.customer_acquisition_and_growth_metrics;
  const rev = company?.traction?.traction?.revenue_and_financial_metrics;
  const ret = company?.traction?.traction?.product_engagement_and_retention_metrics;
  const mv = company?.traction?.traction?.market_validation_and_adoption_signals;

  return (
    <TabsContent value="traction">
    <div className="space-y-12 pb-20">

      {/* -------------------------------------------------------- */}
      {/* 🟦 HERO SECTION */}
      {/* -------------------------------------------------------- */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-10 text-white shadow-lg">
        <h1 className="text-3xl font-semibold mb-3">Traction Intelligence</h1>
        <p className="text-blue-100 text-sm max-w-2xl">
          A modern, structured breakdown of customer growth, revenue momentum,
          retention, and market validation.
        </p>

        {/* Key metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
          <KeyMetric icon={Users} label="Userbase" value="30K+ Families" />
          <KeyMetric icon={TrendingUp} label="Growth Velocity" value="Strong YoY ↑" />
          <KeyMetric icon={Zap} label="Distribution Partners" value="200+ Women" />
        </div>
      </section>

      {/* -------------------------------------------------------- */}
      {/* 🟩 CUSTOMER ACQUISITION */}
      {/* -------------------------------------------------------- */}
      <InsightSection
        title="Customer Acquisition & Growth"
        subtitle="Acquisition channels, CAC, virality and early traction signals"
        items={[
          { label: "Customer Acquisition Cost (CAC)", value: cx.customer_acquisition_cost },
          { label: "Lifetime Value (LTV)", value: cx.customer_lifetime_value },
          { label: "Sign-ups / New Users", value: cx.sign_ups_new_users },
          { label: "Conversion Rate", value: cx.conversion_rate },
          { label: "Growth Velocity", value: cx.growth_velocity },
          { label: "Referral Engine & Virality", value: cx.referral_and_virality_indicators },
        ]}
      />

      {/* -------------------------------------------------------- */}
      {/* 🟨 REVENUE & FINANCIAL MOMENTUM */}
      {/* -------------------------------------------------------- */}
      <InsightSection
        title="Revenue & Financial Momentum"
        subtitle="MRR, revenue projections, retention-linked churn, EBITDA improvements"
        items={[
          { label: "Annual Revenue Run Rate", value: rev.monthly_recurring_revenue_annual_recurring_revenue },
          { label: "Growth Rate", value: rev.revenue_growth_rate },
          { label: "Churn Rate", value: rev.churn_rate },
          { label: "Cash Flow & Runway", value: rev.cash_flow_and_runway },
        ]}
      />

      {/* -------------------------------------------------------- */}
      {/* 🟧 ENGAGEMENT & RETENTION */}
      {/* -------------------------------------------------------- */}
      <InsightSection
        title="Engagement & Retention"
        subtitle="Cohorts, repeat usage, partner-led retention strength"
        items={[
          { label: "Active Users", value: ret.active_users },
          { label: "User Retention", value: ret.user_retention_rates },
          { label: "Engagement Metrics", value: ret.engagement_metrics },
        ]}
      />

      {/* -------------------------------------------------------- */}
      {/* 🟦 MARKET VALIDATION */}
      {/* -------------------------------------------------------- */}
      <InsightSection
        title="Market Validation & Adoption"
        subtitle="Partnerships, early customers, testimonials & LOIs"
        items={[
          { label: "Partnerships", value: mv.partnerships_and_collaborations },
          { label: "Pilot Customers", value: mv.pilot_customers_and_letters_of_intent },
          { label: "Waitlists / Pre-orders", value: mv.waitlists_and_pre_orders },
          { label: "Customer Testimonials", value: mv.customer_testimonials_and_case_studies },
        ]}
      />

      {/* -------------------------------------------------------- */}
      {/* 🟪 FOUR VECTOR / 4-PILLAR IMPACT SECTION */}
      {/* -------------------------------------------------------- */}
      <section className="space-y-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Target className="h-5 w-5 text-purple-600" />
          4-Vector Traction Model
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <VectorPillar title="Acquisition" icon={Users} color="blue" />
          <VectorPillar title="Retention" icon={Zap} color="green" />
          <VectorPillar title="Revenue" icon={TrendingUp} color="orange" />
          <VectorPillar title="Market Validation" icon={LineChart} color="purple" />
        </div>
      </section>

      {/* -------------------------------------------------------- */}
      {/* 🟥 SWOT & RISK */}
      {/* -------------------------------------------------------- */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
        {/* SWOT */}
        <Card className="p-5">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">SWOT Summary</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-6 text-sm">
            <SwotItem label="Strengths" color="green" />
            <SwotItem label="Weaknesses" color="yellow" />
            <SwotItem label="Opportunities" color="blue" />
            <SwotItem label="Threats" color="red" />
          </CardContent>
        </Card>

        {/* RISK MATRIX */}
        <Card className="p-5">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Risk Assessment</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-3">
            <RiskRow label="Operational Risk" score="Medium" />
            <RiskRow label="Financial Risk" score="High" />
            <RiskRow label="Product Risk" score="Low" />
            <RiskRow label="Market Risk" score="Medium" />
          </CardContent>
        </Card>
      </section>

      {/* -------------------------------------------------------- */}
      {/* 🟦 GAPS SECTION */}
      {/* -------------------------------------------------------- */}
      <section className="mt-8">
        <h2 className="text-xl font-semibold">Missing / Gap Areas</h2>

        <Accordion type="single" collapsible className="mt-4">
          <AccordionItem value="mandatory">
            <AccordionTrigger>Mandatory Information Missing</AccordionTrigger>
            <AccordionContent>
              {company?.traction?.traction?.gaps.mandatory_information.map((g: string) => (
                <p key={g} className="text-sm mb-2">• {g}</p>
              ))}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="optional">
            <AccordionTrigger>Optional Enhancements</AccordionTrigger>
            <AccordionContent>
              {company?.traction?.traction?.gaps.optional_information.map((g: string) => (
                <p key={g} className="text-sm mb-2">• {g}</p>
              ))}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

    </div>
    </TabsContent>
  );
}

/* -------------------------------------------------------- */
/* COMPONENTS */
/* -------------------------------------------------------- */

function KeyMetric({ icon: Icon, label, value }: any) {
  return (
    <div className="bg-white/10 backdrop-blur-sm p-5 rounded-xl border border-white/20">
      <div className="flex items-center gap-3">
        <Icon className="h-6 w-6 text-white" />
        <div>
          <p className="text-blue-100 text-xs">{label}</p>
          <p className="text-white text-lg font-semibold">{value}</p>
        </div>
      </div>
    </div>
  );
}

function InsightSection({ title, subtitle, items }: any) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-sm text-gray-500">{subtitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {items.map((item: any) => (
          <Card key={item.label} className="p-5 shadow-sm">
            <CardTitle className="text-base">{item.label}</CardTitle>
            <CardContent className="text-sm text-gray-600 mt-3 leading-relaxed">
              {item.value}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

function VectorPillar({ title, icon: Icon, color }: any) {
  return (
    <div className="rounded-xl border p-6 flex flex-col items-center text-center space-y-3 hover:shadow-md transition">
      <Icon className={`h-8 w-8 text-${color}-600`} />
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="text-xs text-gray-500">
        Key metrics from this quadrant mapped to growth impact.
      </p>
    </div>
  );
}

function SwotItem({ label, color }: any) {
  return (
    <div>
      <h4 className={`font-semibold text-${color}-600`}>{label}</h4>
      <p className="text-gray-600 text-xs mt-1">
        AI-generated summary will appear here.
      </p>
    </div>
  );
}

function RiskRow({ label, score }: any) {
  const colors: any = {
    High: "bg-red-100 text-red-700",
    Medium: "bg-yellow-100 text-yellow-700",
    Low: "bg-green-100 text-green-700",
  };

  return (
    <div className="flex justify-between items-center border-b py-2">
      <span className="text-sm text-gray-700">{label}</span>

      <span
        className={`px-3 py-1 rounded-full text-xs font-medium ${colors[score] || "bg-gray-100 text-gray-700"}`}
      >
        {score}
      </span>
    </div>
  );
}

