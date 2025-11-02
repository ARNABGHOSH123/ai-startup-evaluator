import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Check } from "lucide-react";
import PitchForm from "@/components/PitchDeckForm";
import PitchCall from "./PitchCall";
import UploadDoc from "./UploadDoc";

export default function FounderPitchDeck() {
  const { founderName } = useParams<{ founderName?: string }>();
  const [activeStep, setActiveStep] = useState(0);
  console.log(founderName);
  const goNext = () =>
    setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
  const goBack = () => setActiveStep((prev) => Math.max(prev - 1, 0));

  const steps = [
    {
      id: 0,
      stepperName: "Startup Info",
    },
    {
      id: 1,
      stepperName: "Upload Documents",
    },
    { id: 2, stepperName: "Pitch Call" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-indigo-50 to-blue-100 flex flex-col items-center justify-center px-6 py-12">
      <div className="max-w-3xl w-full bg-white shadow-xl rounded-2xl p-10">
        <h2 className="text-2xl font-semibold text-indigo-700 mb-6 text-center">
          Your Story. Your Pitch
        </h2>

        {/* Stepper Header */}
        {/* Stepper Header */}
<div className="relative flex justify-between items-center">
  {/* Connecting Line (background) */}
  <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-300 -translate-y-1/2 -mt-3"></div>

  {/* Progress Line (foreground) */}
  <div
    className="absolute top-1/2 left-0 h-1 bg-indigo-600 -translate-y-1/2 transition-all duration-500 -mt-3"
    style={{
      width: `${(activeStep / (steps.length - 1)) * 100}%`,
    }}
  ></div>

  {/* Steps */}
  {steps?.map((step, index) => (
    <div
      key={step?.id}
      className="relative z-10 flex flex-col items-center"
    >
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
          index < activeStep
            ? "bg-green-500 text-white"
            : index === activeStep
            ? "bg-blue-600 text-white"
            : "bg-gray-200 text-gray-600"
        }`}
      >
        {index < activeStep ? (
          <Check size={20} className="text-white" />
        ) : (
          index + 1
        )}
      </div>
      <p
        className={`text-sm mt-2 transition-all text-center ${
          index === activeStep
            ? "text-blue-600 font-medium"
            : index < activeStep
            ? "text-green-600 font-medium"
            : "text-gray-500"
        }`}
      >
        {step?.stepperName}
      </p>
    </div>
  ))}
</div>


        {/* Step Content */}
        <div className="mt-8">
          <div>{activeStep === 0 && <PitchForm founderName={founderName}/>}</div>
        </div>
        <div className="mt-8">
          <div>{activeStep === 1 && <UploadDoc/>}</div>
        </div>
        <div className="mt-8">
          <div>{activeStep === 2 && <PitchCall />}</div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-10">
          <button
            onClick={goBack}
            disabled={activeStep === 0}
            className={`px-6 py-3 rounded-lg text-sm font-medium border transition-all ${
              activeStep === 0
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white text-indigo-600 border-indigo-300 hover:bg-indigo-50"
            }`}
          >
            Back
          </button>

          {activeStep < steps.length - 1 ? (
            <button
              onClick={goNext}
              className="px-6 py-3 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-all"
            >
              Next
            </button>
          ) : (
            <button
              onClick={() => alert("Pitch submitted successfully!")}
              className="px-6 py-3 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition-all"
            >
              Submit
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
