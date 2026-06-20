import { create } from "zustand";
import type {
  AnalysisResult,
  BrewingGuide,
  CorrectionForm,
} from "@/lib/schemas/tea";

/**
 * 차 등록 플로우의 임시 상태 (명세 §5).
 * 업로드(③) → AI분석(④) → 결과(⑤) → 보정(⑥) → 가이드(⑦) → 저장.
 * 서버에 저장된 차/기록은 여기 두지 않고 TanStack Query로 조회.
 */
export type ScanStep =
  | "upload"
  | "analyzing"
  | "result"
  | "correction"
  | "guide";

interface ScanFlowState {
  imageFile: File | null;
  previewUrl: string | null;
  imagePath: string | null; // Supabase Storage 경로 ({uid}/...)
  isAnalyzing: boolean;
  analysisResult: AnalysisResult | null;
  correctionForm: Partial<CorrectionForm>;
  brewingGuide: BrewingGuide | null;
  currentStep: ScanStep;

  setImage: (file: File | null) => void;
  setImagePath: (path: string | null) => void;
  setAnalyzing: (v: boolean) => void;
  setAnalysisResult: (r: AnalysisResult | null) => void;
  setCorrectionForm: (patch: Partial<CorrectionForm>) => void;
  setBrewingGuide: (g: BrewingGuide | null) => void;
  setStep: (s: ScanStep) => void;
  resetScanFlow: () => void;
}

const initialState = {
  imageFile: null,
  previewUrl: null,
  imagePath: null,
  isAnalyzing: false,
  analysisResult: null,
  correctionForm: {},
  brewingGuide: null,
  currentStep: "upload" as ScanStep,
};

export const useScanFlow = create<ScanFlowState>((set, get) => ({
  ...initialState,

  setImage: (file) => {
    const prev = get().previewUrl;
    if (prev) URL.revokeObjectURL(prev);
    set({
      imageFile: file,
      previewUrl: file ? URL.createObjectURL(file) : null,
    });
  },
  setImagePath: (path) => set({ imagePath: path }),
  setAnalyzing: (v) => set({ isAnalyzing: v }),
  setAnalysisResult: (r) => set({ analysisResult: r }),
  setCorrectionForm: (patch) =>
    set((s) => ({ correctionForm: { ...s.correctionForm, ...patch } })),
  setBrewingGuide: (g) => set({ brewingGuide: g }),
  setStep: (s) => set({ currentStep: s }),
  resetScanFlow: () => {
    const prev = get().previewUrl;
    if (prev) URL.revokeObjectURL(prev);
    set({ ...initialState });
  },
}));
