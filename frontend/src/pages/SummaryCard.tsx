import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

export default function SummaryCard({ company }: { company: any }) {
  const bigString = company?.extract_benchmark_agent_response;
  const scoreRegex = /Recommendation Score:\s*(\d+)\s*\/\s*\d+/i;
  const match = bigString?.match(scoreRegex);
  const score = match && match[1] ? match[1] : "";

const parentCompanyRegex = /\*{0,2}Parent Company\*{0,2}:\s*([^(]+?)(?=\s*\()/i;
const matchParent = bigString?.match(parentCompanyRegex);
const parent_company = matchParent ? matchParent[1].trim() : "";

function ScoreDots({ score }: { score: number }) {
    const totalDots = 10;
    const color =
      score < 5 ? "bg-red-500" : score < 7 ? "bg-yellow-400" : "bg-green-500";

    return (
      <div className="flex flex-col gap-2">
        <span className="font-semibold">Score:</span>
        <span className="flex gap-1">
          {Array.from({ length: totalDots }).map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full ${
                i < score ? color : "bg-gray-200"
              }`}
            ></div>
          ))}{" "}
          <span className="-mt-1 px-2">{score}/10</span>
        </span>
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
