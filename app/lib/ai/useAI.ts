"use client";

import { useState, useEffect } from "react";
import * as tf from "@tensorflow/tfjs";
import { 
  predictGrade, 
  getStudyRecommendations, 
  getAIChatResponse,
  getPersonalizedInsights,
  detectAtRiskStudents,
  initAIModel 
} from "./ai-service";

export function useAI() {
  const [isReady, setIsReady] = useState(false);
  const [isTraining, setIsTraining] = useState(true);

  useEffect(() => {
    // Initialize AI model in background
    const init = async () => {
      try {
        await initAIModel();
        setIsReady(true);
      } catch (error) {
        console.error("AI init failed:", error);
      } finally {
        setIsTraining(false);
      }
    };
    init();
  }, []);

  return {
    isReady,
    isTraining,
    predictGrade,
    getStudyRecommendations,
    getAIChatResponse,
    getPersonalizedInsights,
    detectAtRiskStudents
  };
}
