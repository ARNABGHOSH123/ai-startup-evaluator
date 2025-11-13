import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

export default function SummaryCard({ company }: { company: any }) {
  const bigString = company?.extract_benchmark_agent_response;

  const scoreRegex = /Recommendation Score:\s*(\d+)\s*\/\s*\d+/i;
  const match = bigString?.match(scoreRegex);
  const score = match && match[1] ? parseInt(match[1]) : 0;

  const parentCompanyRegex = /\*{0,2}Parent Company\*{0,2}:\s*([^(]+?)(?=\s*\()/i;
  const matchParent = bigString?.match(parentCompanyRegex);
  const parent_company = matchParent ? matchParent[1].trim() : "";

  // ---------- Score Dots UI ----------
  function ScoreDots({ score }: { score: number }) {
    const totalDots = 10;
    const color =
      score < 5 ? "bg-red-500" : score < 7 ? "bg-yellow-400" : "bg-green-500";

    return (
      <div className="flex flex-col gap-2">
        <span className="text-gray-500 text-xs uppercase tracking-wide">
          Score
        </span>
        <div className="flex items-center gap-2">
          {Array.from({ length: totalDots }).map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full ${
                i < score ? color : "bg-gray-200"
              }`}
            ></div>
          ))}
          <span className="text-sm font-medium text-gray-700">{score}/10</span>
        </div>
      </div>
    );
  }

  // ---------- Component Layout ----------
  return (
    <Card className="bg-white shadow-sm rounded-2xl border border-gray-100">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-gray-800">
          Company Info
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-5 text-sm text-gray-700">
          {/* Company Name */}
          <div>
            <p className="text-gray-500 text-xs uppercase tracking-wide">
              Company Name
            </p>
            <p className="font-medium text-gray-800">
              {company?.company_name || "—"}
            </p>
          </div>

          {/* Parent Company */}
          <div>
            <p className="text-gray-500 text-xs uppercase tracking-wide">
              Parent Company
            </p>
            {parent_company ? (
              <Link
                to={company?.parentWebsite}
                className="text-blue-600 hover:underline font-medium"
                target="_blank"
                rel="noopener noreferrer"
              >
                {parent_company}
              </Link>
            ) : (
              <span className="text-gray-800 font-medium">—</span>
            )}
          </div>

          {/* Email */}
          <div>
            <p className="text-gray-500 text-xs uppercase tracking-wide">
              Email
            </p>
            {company?.company_email ? (
              <Link
                to={`mailto:${company?.company_email}`}
                className="text-blue-600 hover:underline font-medium"
              >
                {company?.company_email}
              </Link>
            ) : (
              <span className="text-gray-800 font-medium">—</span>
            )}
          </div>

          {/* Phone */}
          <div>
            <p className="text-gray-500 text-xs uppercase tracking-wide">
              Phone
            </p>
            <p className="font-medium text-gray-800">
              {company?.company_phone_no || "—"}
            </p>
          </div>

          {/* Address */}
          <div>
            <p className="text-gray-500 text-xs uppercase tracking-wide">
              Address
            </p>
            <p className="font-medium text-gray-800">
              {company?.company_address || "—"}
            </p>
          </div>

          {/* Stage */}
          <div>
            <p className="text-gray-500 text-xs uppercase tracking-wide">
              Stage of Development
            </p>
            <p className="font-medium text-gray-800">
              {company?.stage_of_development || "—"}
            </p>
          </div>

          {/* Score */}
          <div className="lg:col-span-1 md:col-span-2 flex flex-col justify-center">
            <ScoreDots score={score} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
