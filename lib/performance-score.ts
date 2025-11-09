/**
 * Performance Score Calculation Utility
 * 
 * Formula:
 * Performance Score = 0.20I + 0.20S + 0.15A + 0.45SES
 * 
 * Where:
 * I = Combined Internals (normalized to 100)
 * S = SEE Marks (out of 100)
 * A = Attendance (%)
 * SES = Screen Efficiency Score (based on screen time)
 */

export type PerformanceScoreInputs = {
  internal1: number | null;  // out of 20
  internal2: number | null;  // out of 20
  internal3: number | null;  // out of 20
  seeMarks: number | null;   // out of 100
  attendance: number;         // percentage (0-100)
  desktopScreenTime: number;  // hours per day
  mobileScreenTime: number;   // hours per day
};

export type PerformanceScoreBreakdown = {
  totalScore: number;
  internalsScore: number;
  seeScore: number;
  attendanceScore: number;
  screenEfficiencyScore: number;
  grade: string;
  status: 'excellent' | 'good' | 'average' | 'needs-improvement' | 'poor';
};

/**
 * Step 1: Combine 3 internals and normalize to 100 scale
 * I = (I₁ + I₂ + I₃) / 60 × 100
 */
function calculateInternalsScore(i1: number | null, i2: number | null, i3: number | null): number {
  const internal1 = i1 ?? 0;
  const internal2 = i2 ?? 0;
  const internal3 = i3 ?? 0;
  
  const total = internal1 + internal2 + internal3;
  const maxTotal = 60; // 3 internals × 20 marks each
  
  return (total / maxTotal) * 100;
}

/**
 * Step 2: Compute Screen Efficiency Score (SES)
 * 
 * Rewards lower total screen time:
 * - 4 hours/day → score = 100
 * - 10 hours/day → score = 0
 * 
 * SES = max(0, min(100, 100 × (1 - ((D + M) - 4) / 6)))
 */
function calculateScreenEfficiencyScore(desktopHours: number, mobileHours: number): number {
  const totalScreenTime = desktopHours + mobileHours;
  
  // Formula: 100 × (1 - ((totalScreenTime - 4) / 6))
  const ses = 100 * (1 - ((totalScreenTime - 4) / 6));
  
  // Clamp between 0 and 100
  return Math.max(0, Math.min(100, ses));
}

/**
 * Step 3: Calculate final performance score with weights
 * 
 * Weights:
 * - Internals (I): 20%
 * - SEE Marks (S): 20%
 * - Attendance (A): 15%
 * - Screen Efficiency (SES): 45%
 */
export function calculatePerformanceScore(inputs: PerformanceScoreInputs): PerformanceScoreBreakdown {
  // Step 1: Calculate Internals Score (normalized to 100)
  const internalsScore = calculateInternalsScore(
    inputs.internal1,
    inputs.internal2,
    inputs.internal3
  );
  
  // Step 2: SEE Marks (already out of 100)
  const seeScore = inputs.seeMarks ?? 0;
  
  // Step 3: Attendance (already in percentage)
  const attendanceScore = inputs.attendance;
  
  // Step 4: Screen Efficiency Score
  const screenEfficiencyScore = calculateScreenEfficiencyScore(
    inputs.desktopScreenTime,
    inputs.mobileScreenTime
  );
  
  // Step 5: Apply weights and calculate final score
  const totalScore = 
    (0.20 * internalsScore) +
    (0.20 * seeScore) +
    (0.15 * attendanceScore) +
    (0.45 * screenEfficiencyScore);
  
  // Determine grade and status
  const { grade, status } = getGradeAndStatus(totalScore);
  
  return {
    totalScore: Math.round(totalScore * 100) / 100, // Round to 2 decimal places
    internalsScore: Math.round(internalsScore * 100) / 100,
    seeScore: Math.round(seeScore * 100) / 100,
    attendanceScore: Math.round(attendanceScore * 100) / 100,
    screenEfficiencyScore: Math.round(screenEfficiencyScore * 100) / 100,
    grade,
    status,
  };
}

/**
 * Determine grade and status based on total score
 */
function getGradeAndStatus(score: number): { grade: string; status: PerformanceScoreBreakdown['status'] } {
  if (score >= 90) {
    return { grade: 'A+', status: 'excellent' };
  } else if (score >= 80) {
    return { grade: 'A', status: 'excellent' };
  } else if (score >= 70) {
    return { grade: 'B+', status: 'good' };
  } else if (score >= 60) {
    return { grade: 'B', status: 'good' };
  } else if (score >= 50) {
    return { grade: 'C', status: 'average' };
  } else if (score >= 40) {
    return { grade: 'D', status: 'needs-improvement' };
  } else {
    return { grade: 'F', status: 'poor' };
  }
}

/**
 * Calculate average marks from all courses
 */
export function calculateAverageMarks(marksRecords: Array<{
  internal_1: number | null;
  internal_2: number | null;
  internal_3: number | null;
  see_marks: number | null;
}>): { avgInternal1: number; avgInternal2: number; avgInternal3: number; avgSee: number } {
  if (marksRecords.length === 0) {
    return { avgInternal1: 0, avgInternal2: 0, avgInternal3: 0, avgSee: 0 };
  }
  
  const totals = marksRecords.reduce(
    (acc, record) => ({
      internal1: acc.internal1 + (record.internal_1 ?? 0),
      internal2: acc.internal2 + (record.internal_2 ?? 0),
      internal3: acc.internal3 + (record.internal_3 ?? 0),
      see: acc.see + (record.see_marks ?? 0),
    }),
    { internal1: 0, internal2: 0, internal3: 0, see: 0 }
  );
  
  return {
    avgInternal1: totals.internal1 / marksRecords.length,
    avgInternal2: totals.internal2 / marksRecords.length,
    avgInternal3: totals.internal3 / marksRecords.length,
    avgSee: totals.see / marksRecords.length,
  };
}

/**
 * Get color based on status
 */
export function getStatusColor(status: PerformanceScoreBreakdown['status']): string {
  switch (status) {
    case 'excellent':
      return 'text-green-600 dark:text-green-400';
    case 'good':
      return 'text-blue-600 dark:text-blue-400';
    case 'average':
      return 'text-yellow-600 dark:text-yellow-400';
    case 'needs-improvement':
      return 'text-orange-600 dark:text-orange-400';
    case 'poor':
      return 'text-red-600 dark:text-red-400';
    default:
      return 'text-gray-600 dark:text-gray-400';
  }
}

/**
 * Get background color based on status
 */
export function getStatusBgColor(status: PerformanceScoreBreakdown['status']): string {
  switch (status) {
    case 'excellent':
      return 'bg-green-50 dark:bg-green-950/20';
    case 'good':
      return 'bg-blue-50 dark:bg-blue-950/20';
    case 'average':
      return 'bg-yellow-50 dark:bg-yellow-950/20';
    case 'needs-improvement':
      return 'bg-orange-50 dark:bg-orange-950/20';
    case 'poor':
      return 'bg-red-50 dark:bg-red-950/20';
    default:
      return 'bg-gray-50 dark:bg-gray-950/20';
  }
}
