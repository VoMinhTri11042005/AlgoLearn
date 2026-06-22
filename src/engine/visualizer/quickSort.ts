import { AlgorithmicStep } from '../../types';

export const generateLomutoSteps = (arrInput: number[]): AlgorithmicStep[] => {
  const steps: AlgorithmicStep[] = [];
  const n = arrInput.length;
  if (n === 0) return [];
  
  const currentArr = [...arrInput];
  const low = 0;
  const high = n - 1;
  const pivotVal = currentArr[high];
  
  steps.push({
    array: [...currentArr],
    highlights: { pivot: high, low, high, active: -1 },
    description: `🚀 Khởi đầu phân hoạch Lomuto. Chọn chốt pivot = A[high] = ${pivotVal} ở vị trí cuối cùng (index ${high}). Thiết lập chỉ số i = -1.`
  });
  
  let i = low - 1;
  for (let j = low; j < high; j++) {
    const valJ = currentArr[j];
    
    steps.push({
      array: [...currentArr],
      highlights: { pivot: high, low, high, active: j },
      description: `🔍 j = ${j}: So sánh A[j] (${valJ}) với pivot (${pivotVal}).` + 
        (valJ <= pivotVal 
          ? ` Vì ${valJ} <= ${pivotVal}, tăng chỉ số i lên và hoán đổi.` 
          : ` Vì ${valJ} > ${pivotVal}, không hoán đổi, chỉ số i giữ nguyên ở vị trí index ${i}.`)
    });
    
    if (valJ <= pivotVal) {
      i++;
      const valI = currentArr[i];
      const temp = currentArr[i];
      currentArr[i] = currentArr[j];
      currentArr[j] = temp;
      
      steps.push({
        array: [...currentArr],
        highlights: { pivot: high, low, high, active: j, swapping: [i, j] },
        description: `🔄 Hoán đổi A[i=${i}] (${valI}) với A[j=${j}] (${valJ}) để dồn phần tử nhỏ hơn lên đầu mảng.`
      });
    }
  }
  
  const targetIdx = i + 1;
  const targetVal = currentArr[targetIdx];
  const originalPivotIdx = high;
  
  steps.push({
    array: [...currentArr],
    highlights: { pivot: originalPivotIdx, low, high, active: -1 },
    description: `🔚 Đã quét xong mảng con. Chuẩn bị đưa chốt pivot (${pivotVal}) từ cuối về vị trí phân tách mảng i+1 = ${targetIdx} (thay thế giá trị ${targetVal}).`
  });
  
  const temp = currentArr[targetIdx];
  currentArr[targetIdx] = currentArr[high];
  currentArr[high] = temp;
  
  steps.push({
    array: [...currentArr],
    highlights: { pivot: targetIdx, low, high, swapping: [targetIdx, originalPivotIdx] },
    description: `💎 Chốt pivot (${pivotVal}) đã ở vị trí chính xác tuyệt đối (index ${targetIdx}). Phía bên trái đều bé hơn, bên phải đều lớn hơn hoặc bằng nó.`
  });
  
  const sortedCopy = [...currentArr].sort((a, b) => a - b);
  steps.push({
    array: sortedCopy,
    highlights: {},
    description: `🎉 Tiếp tục đệ quy chia để trị trên nhánh trái & phải. Mảng sau khi hoàn thiện toàn bộ luồng Quick Sort tăng dần: [${sortedCopy.join(", ")}].`
  });
  
  return steps;
};
