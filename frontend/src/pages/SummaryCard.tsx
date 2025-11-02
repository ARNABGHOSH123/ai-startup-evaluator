import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

export default function SummaryCard({ companyInfo }: { companyInfo: any }) {
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
          ))} <span className="-mt-1 px-2">{score}/10</span>
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
            <Link
              to={companyInfo?.website}
              className="text-blue-600 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {companyInfo.name}
            </Link>
          </div>
          <div className="flex flex-col">
            <span className="font-semibold">Parent Company: </span>
            <Link
              to={companyInfo?.parentWebsite}
              className="text-blue-600 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {companyInfo.parent}
            </Link>
          </div>
          <div className="flex flex-col">
            <span className="font-semibold">Email: </span>
            <Link
              to={`mailto:${companyInfo.email}`}
              className="text-blue-600 hover:underline"
            >
              {companyInfo.email}
            </Link>
          </div>
          <div className="flex flex-col">
            <span className="font-semibold">Phone: </span>
            {companyInfo.phone.join(", ")}
          </div>
          <div className="flex flex-col">
            <span className="font-semibold">Address: </span>
            {companyInfo.address}
          </div>
          <div className="flex flex-col">
            <span className="font-semibold">Foundation: </span>
            {companyInfo.foundation}
          </div>
          <div className="flex flex-col">
            <span className="font-semibold">Company Size: </span>
            {companyInfo.size}
          </div>
          <div className="w-full max-w-xs">
            <ScoreDots score={companyInfo?.score} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
