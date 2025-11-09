import React, { useRef, useState } from "react";
import { Upload, XCircle } from "lucide-react";

interface UploadDocProps {
  file: File | null;
  setFile: React.Dispatch<React.SetStateAction<File | null>>;
  onError?: (message: string) => void;
}

const AUDIO_EXTS = [
  "mp3",
  "wav",
  "m4a",
  "aac",
  "flac",
  "ogg",
  "oga",
  "opus",
] as const;
const VIDEO_EXTS = ["mp4", "mov", "mkv", "webm", "avi", "m4v", "wmv"] as const;
const DOC_EXTS = ["pdf", "doc", "docx", "ppt", "pptx"] as const;

const ACCEPT_LIST = [...AUDIO_EXTS, ...VIDEO_EXTS, ...DOC_EXTS];

const ACCEPT_ATTR = ACCEPT_LIST.map((ext) => `.${ext}`).join(",");

function getExt(name: string) {
  const idx = name.lastIndexOf(".");
  return idx >= 0 ? name.slice(idx + 1).toLowerCase() : "";
}

function isAllowedFile(file: File) {
  const ext = getExt(file.name);
  return ACCEPT_LIST.includes(ext as any);
}

export default function UploadDoc({ file, setFile, onError }: UploadDocProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setDragging] = useState(false);

  const reportError = (msg: string) => {
    if (onError) onError(msg);
    else alert(msg);
  };

  const handleSelect = (f: File | null) => {
    if (!f) return;
    if (!isAllowedFile(f)) {
      reportError(
        "Invalid file type. Allowed: pdf, doc, docx, ppt, pptx, audio (mp3,wav,m4a,aac,flac,ogg,oga,opus), video (mp4,mov,mkv,webm,avi,m4v,wmv)."
      );
      return;
    }
    setFile(f);
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    if (!f) return;
    handleSelect(f);
    // reset value to allow re-selecting the same file
    e.currentTarget.value = "";
  };

  const onDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    setDragging(false);
    const dt = e.dataTransfer;
    if (!dt || !dt.files || dt.files.length === 0) return;
    if (dt.files.length > 1) {
      reportError("Please drop only one file.");
      return;
    }
    handleSelect(dt.files[0]);
  };

  const onDragOver: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const onDragLeave: React.DragEventHandler<HTMLDivElement> = () => {
    setDragging(false);
  };

  return (
    <div className="w-full">
      <div
        className={`border-2 ${
          isDragging
            ? "border-indigo-500 bg-indigo-50"
            : "border-dashed border-gray-300"
        } rounded-xl p-6 text-center transition-colors`}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
      >
        <div className="flex flex-col items-center gap-2">
          <Upload className="text-indigo-600" />
          <p className="text-sm text-gray-700">
            Drag & drop your file here, or
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="ml-1 text-indigo-600 hover:underline"
            >
              browse
            </button>
          </p>
          <p className="text-xs text-gray-500">
            Allowed: pdf, doc, docx, ppt, pptx, audio (mp3, wav, m4a, aac, flac,
            ogg, oga, opus) and video (mp4, mov, mkv, webm, avi, m4v, wmv).
          </p>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT_ATTR}
            className="hidden"
            onChange={onInputChange}
          />
        </div>

        {file ? (
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-green-700">
            ✅ {file.name}
            <button
              type="button"
              onClick={() => setFile(null)}
              className="text-red-500 hover:text-red-700"
              title="Remove file"
            >
              <XCircle size={16} />
            </button>
          </div>
        ) : (
          <div className="mt-4 text-xs text-gray-400">No file selected</div>
        )}
      </div>
    </div>
  );
}
