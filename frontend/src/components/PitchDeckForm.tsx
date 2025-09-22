import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

type FormData = {
  companyName: string;
  domain: string;
  phone: string;
  email: string;
  founderName: string;
  address: string;
  stage: string;
  about: string;
  usp: string;
  revenue: string;
  comments: string;
  pitchDeck: File | null;
};

type PitchFormProps = {
  onSubmit?: (formData: FormData) => void;
  onSuccess?: (formData: FormData) => void;
};

async function getUploadSessionUrl(filename: string) {
  const resp = await fetch(
    `${import.meta.env.VITE_CLOUD_RUN_SERVICE_URL}/generate_v4_signed_url`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        object_name: filename,
      }),
    }
  );
  return resp.json();
}

// new function to initiate resumable session (POST)
async function initiateResumableSession(signedUrl: string) {
  const res = await fetch(signedUrl, {
    method: "POST",
    // Must include this header because server included it when signing
    headers: {
      "x-goog-resumable": "start",
      // don't include Content-Type/Length here
    },
    // body can be empty
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Failed to start resumable session: ${res.status} ${txt}`);
  }

  // The resumable session URL is returned in Location header
  const sessionUrl = res.headers.get("Location");
  if (!sessionUrl)
    throw new Error("No Location header returned for resumable session");
  return sessionUrl;
}

async function uploadFileViaSession(sessionUrl: string, file: File) {
  // Put entire file in a single request (works for many 70-100MB uploads but chunking recommended)
  const res = await fetch(sessionUrl, {
    method: "PUT",
    headers: {
      "Content-Type": file.type,
      "Content-Length": file.size.toString(),
    },
    body: file,
  });

  if (!res.ok) {
    // check res.status, implement resume logic (query upload status)
    throw new Error("Upload failed");
  }
  return res;
}

export default function PitchForm({ onSubmit, onSuccess }: PitchFormProps) {
  const [isSubmitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState<FormData>({
    companyName: "",
    domain: "",
    phone: "",
    email: "",
    founderName: "",
    address: "",
    stage: "",
    about: "",
    usp: "",
    revenue: "",
    comments: "",
    pitchDeck: null as File | null,
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, pitchDeck: e.target.files[0] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Upload the file to GCS
    if (!formData.pitchDeck) throw new Error("Pitch deck is not provided");
    const pitchDeckFileNameRegex = /^[a-z]+(?:_[a-z]+)*_pitch_deck$/;
    if (!pitchDeckFileNameRegex.test(formData.pitchDeck.name)) {
      toast({
        title: "Form errors",
        description:
          "Pitch deck should be of format <company_name>_pitch_deck.pdf and must be in lowercase",
      });
      return;
    }
    setSubmitting(true);
    const { signedUrl } = await getUploadSessionUrl(formData?.pitchDeck.name);
    const sessionUrl = await initiateResumableSession(signedUrl);
    await uploadFileViaSession(sessionUrl, formData.pitchDeck);
    await fetch(
      `${import.meta.env.VITE_CLOUD_RUN_SERVICE_URL}/add_to_companies_list`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          company_name: formData.pitchDeck.name
            .split("_pitch_deck")[0]
            .toLowerCase(),
          founder_name: formData.founderName,
        }),
      }
    );
    setSubmitting(false);
    onSubmit?.(formData);
    onSuccess?.(formData);
  };

  return (
    <div className="w-full h-full flex justify-center items-center bg-gray-50 p-6">
      <form onSubmit={handleSubmit} className="w-full rounded-2xl space-y-4">
        <p className="text-sm text-gray-500 mb-6">
          Fundraise Application for Startups
        </p>

        {/* Company Name */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Company Name *
          </label>
          <input
            type="text"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-primary"
            required
          />
        </div>

        {/* Domain */}
        <div>
          <label className="block text-sm font-medium mb-1">Domain *</label>
          <input
            type="text"
            name="domain"
            value={formData.domain}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-primary"
            required
          />
        </div>

        {/* Phone and Email */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Company Phone No. *
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-primary"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Company Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-primary"
              required
            />
          </div>
        </div>

        {/* Founder Name */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Founder Name *
          </label>
          <input
            type="text"
            name="founderName"
            value={formData.founderName}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-primary"
            required
          />
        </div>

        {/* Company Address */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Company Address *
          </label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-primary"
            required
          ></textarea>
        </div>

        {/* Stage of Development */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Stage of Development *
          </label>
          <select
            name="stage"
            value={formData.stage}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-primary"
            required
          >
            <option value="">Select...</option>
            <option value="Idea">Idea</option>
            <option value="Early Traction">Early Traction</option>
            <option value="Growth">Growth</option>
          </select>
        </div>

        {/* About the Business */}
        <div>
          <label className="block text-sm font-medium mb-1">
            About the Business *
          </label>
          <textarea
            name="about"
            value={formData.about}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-primary"
            required
          ></textarea>
        </div>

        {/* USP */}
        <div>
          <label className="block text-sm font-medium mb-1">USP *</label>
          <textarea
            name="usp"
            value={formData.usp}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-primary"
            required
          ></textarea>
        </div>

        {/* Revenue Model */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Revenue Model *
          </label>
          <textarea
            name="revenue"
            value={formData.revenue}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-primary"
            required
          ></textarea>
        </div>

        {/* Comments */}
        <div>
          <label className="block text-sm font-medium mb-1">Comments</label>
          <input
            type="text"
            name="comments"
            value={formData.comments}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-primary"
          />
        </div>

        {/* Pitch Deck */}
        <div>
          <label className="block text-sm font-medium mb-1">Pitch Deck *</label>
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="w-full border rounded-lg px-3 py-2"
            required
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-primary text-white font-medium py-2 px-4 rounded-lg hover:opacity-70 transition"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
}
