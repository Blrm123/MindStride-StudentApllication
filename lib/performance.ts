export interface PerformanceInput {
  cgpa: number; // 0–10
  attendance: number; // 0–100 percentage
  desktopStudyHours: number; // hours per day
  desktopEntertainmentHours: number; // hours per day
  phoneHours: number; // hours per day
}

export function calculatePerformanceScore({
  cgpa,
  attendance,
  desktopStudyHours,
  desktopEntertainmentHours,
  phoneHours,
}: PerformanceInput): number {
  const safeCgpa = Math.max(0, Math.min(10, cgpa));
  const safeAttendance = Math.max(0, Math.min(100, attendance));
  const studyHrs = Math.max(0, desktopStudyHours);
  const desktopEntHrs = Math.max(0, desktopEntertainmentHours);
  const phoneHrs = Math.max(0, phoneHours);

  // 1) Normalize
  const cgpaScore = (safeCgpa / 10) * 100;
  const attendanceScore = safeAttendance;
  const studyScore = Math.min(100, (studyHrs / 4) * 100);

  const totalEntertainment = desktopEntHrs + phoneHrs;
  let entertainmentScore: number;
  if (totalEntertainment <= 1) entertainmentScore = 100;
  else if (totalEntertainment >= 6) entertainmentScore = 0;
  else entertainmentScore = 100 - ((totalEntertainment - 1) / 5) * 100;

  // 2) Weighted performance score
  const performance =
    cgpaScore * 0.35 +
    attendanceScore * 0.25 +
    studyScore * 0.2 +
    entertainmentScore * 0.2;

  return Math.round(performance * 10) / 10;
}
