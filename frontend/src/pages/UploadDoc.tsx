import React, { useState } from "react";
import { Upload, FileText, Mic, Mail, Edit3 } from "lucide-react";

export default function UploadDoc() {
  const [files, setFiles] = useState({
    pitchDeck: null as File | null,
    transcript: null as File | null,
    email: null as File | null,
    founderUpdate: null as File | null,
  });

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    key: keyof typeof files
  ) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;

    // 🔒 Validate file based on upload type
    let isValid = false;
    let errorMessage = "";

    switch (key) {
      case "pitchDeck":
        // Allow only PDF or PPT/PPTX
        isValid =
          file.type === "application/pdf" ||
          file.type ===
            "application/vnd.ms-powerpoint" || // .ppt
          file.type ===
            "application/vnd.openxmlformats-officedocument.presentationml.presentation"; // .pptx
        errorMessage = "Please upload only PDF or PPT files for Pitch Deck.";
        break;

      case "transcript":
        // Allow only MP3 or WAV
        isValid =
          file.type === "audio/mpeg" || file.type === "audio/wav";
        errorMessage = "Please upload only audio files (MP3 or WAV) for Transcript.";
        break;

      case "email":
        // Allow only TXT or EML
        isValid =
          file.type === "text/plain" ||
          file.type === "message/rfc822" || // .eml
          file.name.endsWith(".eml") || // fallback for browsers not detecting .eml MIME
          file.name.endsWith(".txt") ||
          file.type === "application/pdf"; // allow PDF-exported emails
        errorMessage = "Please upload only TXT, EML, or PDF files for Email Communication.";
        break;

      case "founderUpdate":
        // Allow only DOCX, TXT, or PDF
        isValid =
          file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || // .docx
          file.type === "application/pdf" ||
          file.type === "text/plain";
        errorMessage = "Please upload only DOCX, TXT, or PDF files for Founder Updates.";
        break;

      default:
        break;
    }

    if (!isValid) {
      alert(errorMessage);
      e.target.value = ""; // reset input
      return;
    }

    // ✅ If valid, save file
    setFiles((prev) => ({ ...prev, [key]: file }));
  };


  const handleSubmit = () => {
    console.log("Uploaded files:", files);
    alert("Documents uploaded successfully!");
  };

  const uploadFields = [
  {
    key: "pitchDeck",
    label: "Pitch Deck (PDF or PPT)",
    icon: <FileText className="text-indigo-600" />,
    accept: ".pdf,.ppt,.pptx",
  },
  {
    key: "transcript",
    label: "Audio Transcript (MP3, WAV)",
    icon: <Mic className="text-indigo-600" />,
    accept: ".mp3,.wav",
  },
  {
    key: "email",
    label: "Founder Email Communication (TXT or EML)",
    icon: <Mail className="text-indigo-600" />,
    accept: ".txt,.eml,.pdf",
  },
  {
    key: "founderUpdate",
    label: "Founder Updates (DOCX, TXT, or PDF)",
    icon: <Edit3 className="text-indigo-600" />,
    accept: ".docx,.txt,.pdf",
  },
];


  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-indigo-50 to-blue-100 flex items-center justify-center px-6 py-10">
      <div className="max-w-3xl w-full bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-2xl font-semibold text-indigo-700 mb-8 text-center">
          Upload Your Startup Documents
        </h2>

        <div className="space-y-6">
          {uploadFields.map((field) => (
            <div
              key={field.key}
              className="border border-gray-200 rounded-lg p-5 flex items-center justify-between hover:border-indigo-300 transition-all"
            >
              <div className="flex items-center gap-4">
                {field.icon}
                <div>
                  <p className="font-medium text-gray-700">{field.label}</p>
                  <p className="text-xs text-gray-400">Click below to upload</p>
                </div>
              </div>

              <div>
                <label className="cursor-pointer bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 transition">
                  <Upload size={16} className="inline mr-1" />
                  Upload
                  <input
                    type="file"
                    accept={field.accept}
                    className="hidden"
                    onChange={(e) =>
                      handleFileChange(e, field.key as keyof typeof files)
                    }
                  />
                </label>
                {files[field.key as keyof typeof files] && (
                  <p className="text-xs text-green-600 mt-2 text-right">
                    ✅ {files[field.key as keyof typeof files]?.name}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end mt-10">
          <button
            onClick={handleSubmit}
            className="px-6 py-3 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-all"
          >
            Submit Documents
          </button>
        </div>
      </div>
    </div>
  );
}
