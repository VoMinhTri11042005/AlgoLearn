import { AlgorithmicStep } from '../../types';

export const generateMergeSortSteps = (arrInput: number[]): AlgorithmicStep[] => {
  const steps: AlgorithmicStep[] = [];
  // TODO: Implement Merge Sort logic step generation here
  // For now, return the unsorted and sorted steps as a placeholder
  
  if (arrInput.length === 0) return [];
  
  steps.push({
    array: [...arrInput],
    highlights: {},
    description: `🚀 Khởi đầu Merge Sort. Phân rã mảng thành các mảng con nhỏ hơn.`
  });
  
  const sortedCopy = [...arrInput].sort((a, b) => a - b);
  steps.push({
    array: sortedCopy,
    highlights: {},
    description: `🎉 Gộp các mảng con đã sắp xếp lại. Mảng hoàn thiện: [${sortedCopy.join(", ")}].`
  });
  
  return steps;
};
