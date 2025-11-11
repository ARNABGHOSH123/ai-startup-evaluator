import { useState } from "react";
import { useParams } from "react-router-dom";
import UploadDoc from "@/pages/UploadDoc";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
  company_websites: string[]; // multiple URLs: main site, LinkedIn, etc.
};

type PitchFormProps = {
  onSubmit?: (formData: FormData) => void;
  onSuccess?: (formData: FormData) => void;
  founderName?: string;
  goNext?: () => void;
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

// // new function to initiate resumable session (POST)
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

export default function PitchForm({
  founderName,
  onSubmit,
  onSuccess,
  goNext,
}: PitchFormProps) {
  const params = useParams();
  const [isSubmitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    companyName: "",
    domain: "",
    phone: "",
    email: "",
    founderName: founderName ?? "",
    address: "",
    stage: "",
    about: "",
    usp: "",
    revenue: "",
    comments: "",
    company_websites: [""], // start with one empty field
  });
  const [file, setFile] = useState<File | null>(null);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   if (e.target.files && e.target.files[0]) {
  //     setFormData({ ...formData, pitchDeck: e.target.files[0] });
  //   }
  // };

  function isValidHttpUrl(url: string) {
    try {
      const u = new URL(url);
      return u.protocol === "http:" || u.protocol === "https:";
    } catch {
      return false;
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate a single required file is provided
    if (!file) {
      setFormError("Please upload exactly one file before submitting.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setFormError(null);

    // Validate at least one valid website URL is provided
    const cleanedWebsites = (formData.company_websites || [])
      .map((u) => u.trim())
      .filter((u) => u.length > 0);
    const hasAtLeastOneValidWebsite = cleanedWebsites.some((u) =>
      isValidHttpUrl(u)
    );
    if (!hasAtLeastOneValidWebsite) {
      setFormError(
        "Please provide at least one valid company website or profile URL (starting with http:// or https://)."
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // Upload the file to GCS
    setSubmitting(true);
    const { signedUrl } = await getUploadSessionUrl(
      file?.name || "uploaded_file"
    );
    const sessionUrl = await initiateResumableSession(signedUrl);
    if (file) await uploadFileViaSession(sessionUrl, file);

    await fetch(
      `${import.meta.env.VITE_CLOUD_RUN_SERVICE_URL}/add_to_companies_list/${
        params?.founderId
      }`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          company_name: formData.companyName.trim(),
          founder_id: params?.founderId,
          domain: formData.domain,
          company_phone_no: formData.phone,
          company_email: formData.email,
          company_address: formData.address,
          stage_of_development: formData.stage,
          business_details: formData.about,
          usp: formData.usp,
          revenue_model: formData.revenue,
          comments: formData.comments,
          input_deck_filename: file?.name?.split(".")[0] || "",
          file_extension: file?.name?.split(".").slice(-1)[0] || "",
          company_websites: formData.company_websites
            .map((u) => u.trim())
            .filter((u) => u.length > 0),
        }),
      }
    );
    setSubmitting(false);
    onSubmit?.(formData);
    onSuccess?.(formData);
    goNext?.();
  };

  return (
    <div className="w-full h-full flex justify-center items-center bg-gray-50 p-6">
      <form onSubmit={handleSubmit} className="w-full rounded-2xl space-y-4">
        {formError && (
          <Alert variant="destructive" className="mb-2">
            <AlertTitle>Missing required file</AlertTitle>
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}
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

        {/* Company Websites (Required: at least one) */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Company Websites / Profiles *
          </label>
          <p className="text-xs text-gray-500 mb-2">
            Add at least one valid URL (main website, LinkedIn, Crunchbase,
            product demo, etc.).
          </p>
          <div className="space-y-2">
            {formData.company_websites.map((url, idx) => (
              <div key={idx} className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData((prev) => {
                      const next = [...prev.company_websites];
                      next[idx] = value;
                      return { ...prev, company_websites: next };
                    });
                  }}
                  className="flex-1 border rounded-lg px-3 py-2 focus:ring focus:ring-primary"
                  pattern="https?://.*"
                />
                <div className="flex items-center gap-1">
                  {formData.company_websites.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        setFormData((prev) => {
                          const next = prev.company_websites.filter(
                            (_, i) => i !== idx
                          );
                          return {
                            ...prev,
                            company_websites: next.length ? next : [""],
                          };
                        });
                      }}
                      className="text-xs px-2 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100"
                    >
                      Remove
                    </button>
                  )}
                  {idx === formData.company_websites.length - 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          company_websites: [...prev.company_websites, ""],
                        }));
                      }}
                      className="text-xs px-2 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                    >
                      + Add
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
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
        <div className="space-y-2">
          <UploadDoc file={file} setFile={setFile} onError={setFormError} />
          <p className="text-xs text-gray-500">
            Exactly one file is required. Allowed: pdf, doc, docx, ppt, pptx,
            audio (mp3, wav, m4a, aac, flac, ogg, oga, opus) or video (mp4, mov,
            mkv, webm, avi, m4v, wmv).
          </p>
        </div>

        {/* Pitch Deck */}
        {/* <div>
          <label className="block text-sm font-medium mb-1">Pitch Deck *</label>
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="w-full border rounded-lg px-3 py-2"
            required
          />
        </div> */}

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-primary text-white font-medium py-2 px-4 rounded-lg hover:opacity-70 transition disabled:cursor-not-allowed  disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
}
