"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import StepIndicator from "./StepIndicator";
import StepReportType from "./StepReportType";
import StepUploadModel from "./StepUploadModel";
import StepSelectApproaches from "./StepSelectApproaches";
import StepQualitativeContext from "./StepQualitativeContext";
import StepReview from "./StepReview";
import GenerationStatus from "./GenerationStatus";
import type { ParsedModelResponse } from "@/types/excel";
import type { ApproachSelection } from "@/types/narrative";

type ReportType = "FOUR09A" | "FIFTY_NINE_SIXTY";

const STEPS = ["Report Type", "Upload Model", "Approaches", "Context", "Review"];

export default function NewEngagementFlow() {
  const [currentStep, setCurrentStep] = useState(1);
  const [reportType, setReportType] = useState<ReportType | null>(null);
  const [modelFilePath, setModelFilePath] = useState<string | null>(null);
  const [modelFileName, setModelFileName] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<ParsedModelResponse | null>(null);
  const [selectedApproaches, setSelectedApproaches] = useState<ApproachSelection>({
    guidelinePublicCompany: false,
    guidelineTransaction: false,
    incomeApproach: false,
  });
  const [qualitativeContext, setQualitativeContext] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Generation status tracking
  const [isGenerating, setIsGenerating] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [engagementId, setEngagementId] = useState<string | null>(null);

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
      setError(null);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError(null);
    }
  };

  const handleModelParsed = (
    filePath: string,
    fileName: string,
    data: ParsedModelResponse
  ) => {
    setModelFilePath(filePath);
    setModelFileName(fileName);
    setParsedData(data);
    setError(null);
  };

  const handleGenerate = async () => {
    if (!reportType || !modelFilePath || !parsedData) {
      setError("Missing required data to generate report");
      return;
    }

    // Check at least one approach is selected
    const hasApproachSelected = Object.values(selectedApproaches).some(Boolean);
    if (!hasApproachSelected) {
      setError("Please select at least one valuation approach");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Create engagement
      const createResponse = await fetch("/api/engagements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportType,
          modelFilePath,
          qualitativeContext: qualitativeContext || null,
          companyName: parsedData.companyName,
          valuationDate: parsedData.valuationDate,
          selectedApproaches,
        }),
      });

      if (!createResponse.ok) {
        const errorData = await createResponse.json();
        throw new Error(errorData.error || "Failed to create engagement");
      }

      const { data: engagement } = await createResponse.json();
      setEngagementId(engagement.id);

      // Trigger generation (now returns immediately with job ID)
      const generateResponse = await fetch(
        `/api/engagements/${engagement.id}/generate`,
        { method: "POST" }
      );

      if (!generateResponse.ok) {
        const errorData = await generateResponse.json();
        throw new Error(errorData.error || "Failed to start generation");
      }

      const generateData = await generateResponse.json();
      
      // Set job ID and show generation status
      setJobId(generateData.data.jobId);
      setIsGenerating(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return reportType !== null;
      case 2:
        return parsedData !== null;
      case 3:
        return Object.values(selectedApproaches).some(Boolean); // At least one approach selected
      case 4:
        return true; // Context is optional
      case 5:
        return !isProcessing;
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <StepReportType value={reportType} onChange={setReportType} />;
      case 2:
        return (
          <StepUploadModel
            onModelParsed={handleModelParsed}
            currentFileName={modelFileName}
            parsedData={parsedData}
          />
        );
      case 3:
        return (
          <StepSelectApproaches
            value={selectedApproaches}
            onChange={setSelectedApproaches}
          />
        );
      case 4:
        return (
          <StepQualitativeContext
            value={qualitativeContext}
            onChange={setQualitativeContext}
          />
        );
      case 5:
        return (
          <StepReview
            reportType={reportType!}
            parsedData={parsedData!}
            modelFileName={modelFileName!}
            qualitativeContext={qualitativeContext}
            selectedApproaches={selectedApproaches}
            onGenerate={handleGenerate}
            isGenerating={isProcessing}
          />
        );
      default:
        return null;
    }
  };

  // Show generation status if generating
  if (isGenerating && jobId && engagementId) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Generating Sections</h1>
          <p className="mt-1 text-gray-500">
            Your AI-powered report sections are being generated
          </p>
        </div>

        <GenerationStatus
          jobId={jobId}
          engagementId={engagementId}
          companyName={parsedData?.companyName || undefined}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">New Report Sections</h1>
        <p className="mt-1 text-gray-500">
          Generate AI-powered sections for your valuation report
        </p>
      </div>

      {/* Step Indicator */}
      <Card padding="lg">
        <StepIndicator steps={STEPS} currentStep={currentStep} />
      </Card>

      {/* Step Content */}
      <Card padding="lg">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-red-400 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-sm text-red-700">{error}</span>
            </div>
          </div>
        )}

        {renderStep()}
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 1 || isProcessing}
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back
        </Button>

        <div className="flex gap-3">
          {currentStep === 4 && (
            <Button variant="secondary" onClick={handleNext}>
              Skip
            </Button>
          )}

          {currentStep < 5 && (
            <Button onClick={handleNext} disabled={!canProceed()}>
              Next
              <svg
                className="w-4 h-4 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
