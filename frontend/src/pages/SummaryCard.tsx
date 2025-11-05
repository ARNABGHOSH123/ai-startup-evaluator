import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

export default function SummaryCard({ company }: { company: any }) {
  const bigString = company?.extract_benchmark_agent_response;
  const scoreRegex =
    /recommendation[^0-9]*score[^0-9]*[:\-]?\s*\**\s*(\d+(?:\.\d+)?)(?=\s*(?:\/|$|\*|\n))/i;
  const match = bigString?.match(scoreRegex);
  const score = match && match[1] ? match[1] : "";
  console.log(score);
  const parentCompanyRegex =
    /\*{0,2}Parent Company\*{0,2}:\s*([^(]+?)(?=\s*\()/i;
  const matchParent = bigString?.match(parentCompanyRegex);
  const parent_company = matchParent ? matchParent[1].trim() : "";

  function ScoreDots({ score }: { score: number | string | undefined }) {
    const totalDots = 10;
    const numericScore = Number(score) || 0; // safely convert
    const color =
      numericScore < 5
        ? "bg-red-500"
        : numericScore < 7
        ? "bg-yellow-400"
        : "bg-green-500";

    return (
      <div className="flex flex-col gap-2">
        <span className="font-semibold">Score:</span>
        <div className="flex items-center gap-1">
          {Array.from({ length: totalDots }).map((_, i) => {
            const filled = i + 1 <= Math.floor(numericScore);
            const partial =
              i === Math.floor(numericScore) && numericScore % 1 !== 0;
            return (
              <div
                key={i}
                className="relative w-3 h-3 rounded-full overflow-hidden bg-gray-200"
              >
                {filled && <div className={`absolute inset-0 ${color}`} />}
                {partial && (
                  <div
                    className={`absolute inset-0 ${color}`}
                    style={{ width: `${(numericScore % 1) * 100}%` }}
                  />
                )}
              </div>
            );
          })}
          <span className="ml-2 text-sm font-medium text-gray-700">
            {numericScore.toFixed(1)}/10
          </span>
        </div>
      </div>
    );
  }

  return (
    <Card className="bg-white">
      <CardHeader className="-mt-4">
        <CardTitle className="text-lg font-semibold">Company Info</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-3 text-sm text-gray-700">
          <div className="flex flex-col">
            <span className="font-semibold">Company Name: </span>
            {/* <Link
              to={company_websites[0]}
              className="text-blue-600 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            > */}
            {company?.company_name}
            {/* </Link> */}
          </div>
          <div className="flex flex-col">
            <span className="font-semibold">Parent Company: </span>
            <Link
              to={company?.parentWebsite}
              className="text-blue-600 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {parent_company}
            </Link>
          </div>
          <div className="flex flex-col">
            <span className="font-semibold">Email: </span>
            <Link
              to={`mailto:${company?.company_email}`}
              className="text-blue-600 hover:underline"
            >
              {company?.company_email}
            </Link>
          </div>
          <div className="flex flex-col">
            <span className="font-semibold">Phone: </span>
            {company?.company_phone_no}
          </div>
          <div className="flex flex-col">
            <span className="font-semibold">Address: </span>
            {company?.company_address}
          </div>
          {/* <div className="flex flex-col">
            <span className="font-semibold">Foundation: </span>
            {company?.foundation}
          </div> */}
          <div className="flex flex-col">
            <span className="font-semibold">Stage of Development: </span>
            {company?.stage_of_development}
          </div>
          <div className="w-full max-w-xs">
            <ScoreDots score={score} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
