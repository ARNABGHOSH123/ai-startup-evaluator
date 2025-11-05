import React from "react";
import { Upload, FileText, Mic, Mail, Edit3, XCircle } from "lucide-react";

interface UploadDocProps {
  files: {
    pitchDeck: File | null;
    transcript: File | null;
    email: File | null;
    founderUpdate: File | null;
  };
  setFiles: React.Dispatch<
    React.SetStateAction<{
      pitchDeck: File | null;
      transcript: File | null;
      email: File | null;
      founderUpdate: File | null;
    }>
  >;
}

export default function UploadDoc({ files, setFiles }: UploadDocProps) {
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    key: keyof typeof files
  ) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;

    let isValid = false;
    let errorMessage = "";

    switch (key) {
      case "pitchDeck":
        isValid =
          file.type === "application/pdf" ||
          file.type === "application/vnd.ms-powerpoint" ||
          file.type ===
            "application/vnd.openxmlformats-officedocument.presentationml.presentation";
        errorMessage = "Please upload only PDF or PPT files for Pitch Deck.";
        break;
      case "transcript":
        isValid = file.type === "audio/mpeg" || file.type === "audio/wav";
        errorMessage =
          "Please upload only audio files (MP3 or WAV) for Transcript.";
        break;
      case "email":
        isValid =
          file.type === "text/plain" ||
          file.type === "message/rfc822" ||
          file.name.endsWith(".eml") ||
          file.name.endsWith(".txt") ||
          file.type === "application/pdf";
        errorMessage =
          "Please upload only TXT, EML, or PDF files for Email Communication.";
        break;
      case "founderUpdate":
        isValid =
          file.type ===
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
          file.type === "application/pdf" ||
          file.type === "text/plain";
        errorMessage =
          "Please upload only DOCX, TXT, or PDF files for Founder Updates.";
        break;
      default:
        break;
    }

    if (!isValid) {
      alert(errorMessage);
      e.target.value = "";
      return;
    }

    setFiles((prev) => ({ ...prev, [key]: file }));
  };

  const handleCancel = (key: keyof typeof files) => {
    setFiles((prev) => ({ ...prev, [key]: null }));
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
          {uploadFields.map((field) => {
            const uploadedFile = files[field.key as keyof typeof files];
            return (
              <div
                key={field.key}
                className="border border-gray-200 rounded-lg p-5 flex items-center justify-between hover:border-indigo-300 transition-all"
              >
                <div className="flex items-center gap-4">
                  {field.icon}
                  <div>
                    <p className="font-medium text-gray-700">{field.label}</p>
                    {uploadedFile ? (
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        ✅ {uploadedFile.name}
                        <button
                          type="button"
                          onClick={() =>
                            handleCancel(field.key as keyof typeof files)
                          }
                          className="text-red-500 hover:text-red-700"
                        >
                          <XCircle size={16} />
                        </button>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400">No file chosen</p>
                    )}
                  </div>
                </div>

                <label className="cursor-pointer bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 transition">
                  <Upload size={16} className="inline mr-1" />
                  Choose File
                  <input
                    type="file"
                    accept={field.accept}
                    className="hidden"
                    onChange={(e) =>
                      handleFileChange(e, field.key as keyof typeof files)
                    }
                  />
                </label>
              </div>
            );
          })}
        </div>

        {/* <div className="flex justify-end mt-10">
          <button
            onClick={handleSubmit}
            className="px-6 py-3 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-all"
          >
            Submit Documents
          </button>
        </div> */}
      </div>
    </div>
  );
}
