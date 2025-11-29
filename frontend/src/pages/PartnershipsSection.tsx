import { Handshake } from "lucide-react";

export const PartnershipsSection = ({ data }: any) => (
  <section>
    <div className="flex items-center gap-2 mb-4">
      <Handshake className="text-blue-600" />
      <h3 className="text-xl font-semibold text-gray-700">Partnerships & Alliances</h3>
    </div>

    <div className="grid md:grid-cols-3 gap-4">
      {Object.entries(data.partnerships_and_alliance).map(([title, text]: any) => (
        <div
          key={title}
          className="p-4 rounded-xl border bg-white shadow-sm hover:shadow-md transition"
        >
          <h4 className="text-md font-medium text-blue-600 capitalize">
            {title.replace(/_/g, " ")}
          </h4>
          <p className="text-sm text-gray-700 mt-2 leading-relaxed">{text}</p>
        </div>
      ))}
    </div>
  </section>
);
