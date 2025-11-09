'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Award, BookOpen, Calendar, Monitor } from "lucide-react";
import { PerformanceScoreBreakdown, getStatusColor, getStatusBgColor } from "@/lib/performance-score";
import { useState } from "react";

type PerformanceScoreCardProps = {
  breakdown: PerformanceScoreBreakdown;
  showDetails?: boolean;
};

type TooltipData = {
  label: string;
  value: string;
  description: string;
  x: number;
  y: number;
} | null;

export function PerformanceScoreCard({ breakdown, showDetails = true }: PerformanceScoreCardProps) {
  const { totalScore, internalsScore, seeScore, attendanceScore, screenEfficiencyScore, grade, status } = breakdown;
  const [tooltip, setTooltip] = useState<TooltipData>(null);
  
  return (
    <Card className="overflow-hidden border-2" style={{ borderColor: getStatusBorderColor(status) }}>
      <CardHeader className={`${getStatusBgColor(status)} border-b`}>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Award className="h-5 w-5" />
              Performance Score
            </CardTitle>
            <CardDescription className="text-sm">Overall academic & behavioral performance</CardDescription>
          </div>
          <div className="text-right">
            <div className={`text-5xl font-bold ${getStatusColor(status)}`}>
              {totalScore.toFixed(1)}
            </div>
            <div className={`text-sm font-semibold ${getStatusColor(status)}`}>
              Grade: {grade}
            </div>
          </div>
        </div>
      </CardHeader>
      
      {showDetails && (
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Side - Metrics */}
            <div className="space-y-5">
          {/* Internals Score */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-blue-600" />
                <span className="font-medium">Internals (20%)</span>
              </div>
              <span className="font-semibold">{internalsScore.toFixed(1)}/100</span>
            </div>
            <Progress value={internalsScore} className="h-2" />
            <p className="text-xs text-muted-foreground">
              Combined score from Internal 1, 2, and 3 exams
            </p>
          </div>

          {/* SEE Marks */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-purple-600" />
                <span className="font-medium">SEE Marks (20%)</span>
              </div>
              <span className="font-semibold">{seeScore.toFixed(1)}/100</span>
            </div>
            <Progress value={seeScore} className="h-2" />
            <p className="text-xs text-muted-foreground">
              Semester End Examination marks
            </p>
          </div>

          {/* Attendance */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-green-600" />
                <span className="font-medium">Attendance (15%)</span>
              </div>
              <span className="font-semibold">{attendanceScore.toFixed(1)}%</span>
            </div>
            <Progress value={attendanceScore} className="h-2" />
            <p className="text-xs text-muted-foreground">
              Overall class attendance percentage
            </p>
          </div>

          {/* Screen Efficiency Score */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Monitor className="h-4 w-4 text-orange-600" />
                <span className="font-medium">Screen Efficiency (45%)</span>
              </div>
              <span className="font-semibold">{screenEfficiencyScore.toFixed(1)}/100</span>
            </div>
            <Progress value={screenEfficiencyScore} className="h-2" />
            <p className="text-xs text-muted-foreground">
              Based on productive screen time usage (4hrs optimal, 10hrs+ poor)
            </p>
          </div>

              {/* Status Badge */}
              <div className={`p-3 rounded-lg ${getStatusBgColor(status)} border`}>
                <div className="flex items-center gap-2">
                  <TrendingUp className={`h-5 w-5 ${getStatusColor(status)}`} />
                  <div>
                    <p className={`font-semibold ${getStatusColor(status)} capitalize text-sm`}>
                      {status.replace('-', ' ')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {getStatusMessage(status)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - 3D Area Chart Visualization */}
            <div className="flex flex-col bg-gradient-to-br from-emerald-50/50 to-teal-50/50 dark:from-emerald-950/20 dark:to-teal-950/20 rounded-lg p-6 relative min-h-[400px]">
              {/* Top Label */}
              <div className="text-xs font-semibold text-slate-400 tracking-[0.2em] mb-4">
                PERFORMANCE
              </div>
              
              {/* Tooltip */}
              {tooltip && (
                <div 
                  className="absolute z-50 bg-slate-900 dark:bg-slate-800 text-white px-3 py-2 rounded-lg shadow-xl border border-slate-700 pointer-events-none transition-all duration-200"
                  style={{ 
                    left: `${tooltip.x}px`, 
                    top: `${tooltip.y - 80}px`,
                    transform: 'translateX(-50%)'
                  }}
                >
                  <div className="text-xs font-semibold text-emerald-400">{tooltip.label}</div>
                  <div className="text-lg font-bold">{tooltip.value}</div>
                  <div className="text-xs text-slate-300 mt-1">{tooltip.description}</div>
                  {/* Arrow */}
                  <div className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-2 h-2 bg-slate-900 dark:bg-slate-800 border-r border-b border-slate-700 rotate-45" />
                </div>
              )}
              
              {/* 3D Area Chart */}
              <div className="flex-1 relative"
                onMouseLeave={() => setTooltip(null)}
              >
                <svg viewBox="0 0 540 300" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
                  {/* Grid lines */}
                  <g className="opacity-20">
                    <line x1="40" y1="250" x2="520" y2="250" stroke="currentColor" strokeWidth="1" className="text-slate-400" />
                    <line x1="40" y1="200" x2="520" y2="200" stroke="currentColor" strokeWidth="1" className="text-slate-400" />
                    <line x1="40" y1="150" x2="520" y2="150" stroke="currentColor" strokeWidth="1" className="text-slate-400" />
                    <line x1="40" y1="100" x2="520" y2="100" stroke="currentColor" strokeWidth="1" className="text-slate-400" />
                    <line x1="40" y1="50" x2="520" y2="50" stroke="currentColor" strokeWidth="1" className="text-slate-400" />
                  </g>
                  
                  {/* Y-axis labels */}
                  <g className="text-slate-500 text-xs">
                    <text x="30" y="254" textAnchor="end" className="fill-current">0</text>
                    <text x="30" y="204" textAnchor="end" className="fill-current">50</text>
                    <text x="30" y="154" textAnchor="end" className="fill-current">100</text>
                    <text x="30" y="104" textAnchor="end" className="fill-current">150</text>
                    <text x="30" y="54" textAnchor="end" className="fill-current">200</text>
                  </g>
                  
                  {/* 3D Area Chart Path - Using performance data */}
                  <defs>
                    <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                      <stop offset="50%" stopColor="#14b8a6" stopOpacity="0.6" />
                      <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.2" />
                    </linearGradient>
                    
                    {/* Shadow for 3D effect */}
                    <filter id="shadow">
                      <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
                      <feOffset dx="2" dy="4" result="offsetblur"/>
                      <feComponentTransfer>
                        <feFuncA type="linear" slope="0.3"/>
                      </feComponentTransfer>
                      <feMerge>
                        <feMergeNode/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                    
                    {/* Glow effect for hover */}
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                  
                  {/* Main area path with data points based on performance metrics */}
                  <path
                    d={`M 40,${250 - (internalsScore * 2)}
                       L 100,${250 - (seeScore * 2)}
                       L 160,${250 - (attendanceScore * 2)}
                       L 220,${250 - (screenEfficiencyScore * 2)}
                       L 280,${250 - (internalsScore * 1.8)}
                       L 340,${250 - (seeScore * 1.9)}
                       L 400,${250 - (attendanceScore * 1.7)}
                       L 460,${250 - (screenEfficiencyScore * 2.2)}
                       L 520,${250 - (totalScore * 2)}
                       L 520,250
                       L 40,250 Z`}
                    fill="url(#areaGradient)"
                    filter="url(#shadow)"
                    className="transition-all duration-500"
                  />
                  
                  {/* Top line for emphasis */}
                  <path
                    d={`M 40,${250 - (internalsScore * 2)}
                       L 100,${250 - (seeScore * 2)}
                       L 160,${250 - (attendanceScore * 2)}
                       L 220,${250 - (screenEfficiencyScore * 2)}
                       L 280,${250 - (internalsScore * 1.8)}
                       L 340,${250 - (seeScore * 1.9)}
                       L 400,${250 - (attendanceScore * 1.7)}
                       L 460,${250 - (screenEfficiencyScore * 2.2)}
                       L 520,${250 - (totalScore * 2)}`}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-all duration-500"
                  />
                  
                  {/* Data points with hover */}
                  <g>
                    {/* Internals */}
                    <circle 
                      cx="40" 
                      cy={250 - (internalsScore * 2)} 
                      r="8" 
                      fill="transparent" 
                      className="cursor-pointer"
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setTooltip({
                          label: 'Internals (20%)',
                          value: `${internalsScore.toFixed(1)}/100`,
                          description: 'Combined score from Internal 1, 2, and 3 exams',
                          x: rect.left + rect.width / 2,
                          y: rect.top
                        });
                      }}
                    />
                    <circle cx="40" cy={250 - (internalsScore * 2)} r="4" fill="#10b981" className="drop-shadow-lg pointer-events-none transition-all" filter="url(#glow)" />
                    <circle cx="40" cy={250 - (internalsScore * 2)} r="6" fill="#10b981" opacity="0.3" className="pointer-events-none animate-ping" style={{ animationDuration: '2s' }} />
                    
                    {/* SEE Marks */}
                    <circle 
                      cx="100" 
                      cy={250 - (seeScore * 2)} 
                      r="8" 
                      fill="transparent" 
                      className="cursor-pointer"
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setTooltip({
                          label: 'SEE Marks (20%)',
                          value: `${seeScore.toFixed(1)}/100`,
                          description: 'Semester End Examination marks',
                          x: rect.left + rect.width / 2,
                          y: rect.top
                        });
                      }}
                    />
                    <circle cx="100" cy={250 - (seeScore * 2)} r="4" fill="#10b981" className="drop-shadow-lg pointer-events-none transition-all" filter="url(#glow)" />
                    <circle cx="100" cy={250 - (seeScore * 2)} r="6" fill="#10b981" opacity="0.3" className="pointer-events-none animate-ping" style={{ animationDuration: '2s' }} />
                    
                    {/* Attendance */}
                    <circle 
                      cx="160" 
                      cy={250 - (attendanceScore * 2)} 
                      r="8" 
                      fill="transparent" 
                      className="cursor-pointer"
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setTooltip({
                          label: 'Attendance (15%)',
                          value: `${attendanceScore.toFixed(1)}%`,
                          description: 'Overall class attendance percentage',
                          x: rect.left + rect.width / 2,
                          y: rect.top
                        });
                      }}
                    />
                    <circle cx="160" cy={250 - (attendanceScore * 2)} r="4" fill="#10b981" className="drop-shadow-lg pointer-events-none transition-all" filter="url(#glow)" />
                    <circle cx="160" cy={250 - (attendanceScore * 2)} r="6" fill="#10b981" opacity="0.3" className="pointer-events-none animate-ping" style={{ animationDuration: '2s' }} />
                    
                    {/* Screen Efficiency */}
                    <circle 
                      cx="220" 
                      cy={250 - (screenEfficiencyScore * 2)} 
                      r="8" 
                      fill="transparent" 
                      className="cursor-pointer"
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setTooltip({
                          label: 'Screen Efficiency (45%)',
                          value: `${screenEfficiencyScore.toFixed(1)}/100`,
                          description: 'Based on productive screen time (4hrs optimal, 10hrs+ poor)',
                          x: rect.left + rect.width / 2,
                          y: rect.top
                        });
                      }}
                    />
                    <circle cx="220" cy={250 - (screenEfficiencyScore * 2)} r="4" fill="#ef4444" className="drop-shadow-lg pointer-events-none transition-all" filter="url(#glow)" />
                    <circle cx="220" cy={250 - (screenEfficiencyScore * 2)} r="6" fill="#ef4444" opacity="0.3" className="pointer-events-none animate-ping" style={{ animationDuration: '2s' }} />
                    
                    {/* Total Score */}
                    <circle 
                      cx="520" 
                      cy={250 - (totalScore * 2)} 
                      r="10" 
                      fill="transparent" 
                      className="cursor-pointer"
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setTooltip({
                          label: 'Total Performance Score',
                          value: `${totalScore.toFixed(1)}`,
                          description: `Grade: ${grade} - ${status.replace('-', ' ')}`,
                          x: rect.left + rect.width / 2,
                          y: rect.top
                        });
                      }}
                    />
                    <circle cx="520" cy={250 - (totalScore * 2)} r="5" fill="#10b981" className="drop-shadow-lg pointer-events-none transition-all" filter="url(#glow)" />
                    <circle cx="520" cy={250 - (totalScore * 2)} r="8" fill="#10b981" opacity="0.3" className="pointer-events-none animate-ping" style={{ animationDuration: '2s' }} />
                  </g>
                  
                  {/* X-axis labels */}
                  <g className="text-slate-500 text-[10px]">
                    <text x="40" y="270" textAnchor="middle" className="fill-current">Int</text>
                    <text x="100" y="270" textAnchor="middle" className="fill-current">SEE</text>
                    <text x="160" y="270" textAnchor="middle" className="fill-current">Att</text>
                    <text x="220" y="270" textAnchor="middle" className="fill-current">Scr</text>
                    <text x="520" y="270" textAnchor="middle" className="fill-current">Total</text>
                  </g>
                </svg>
              </div>
              
              {/* Bottom Label */}
              <div className="text-xs font-semibold text-slate-400 tracking-[0.2em] text-right mt-4">
                ANALYTICS
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

function getStatusMessage(status: PerformanceScoreBreakdown['status']): string {
  switch (status) {
    case 'excellent':
      return 'Outstanding performance! Keep up the excellent work.';
    case 'good':
      return 'Great job! You\'re performing well across all areas.';
    case 'average':
      return 'Satisfactory performance. There\'s room for improvement.';
    case 'needs-improvement':
      return 'Focus on improving attendance and reducing screen time.';
    case 'poor':
      return 'Immediate attention needed. Please consult with your advisor.';
    default:
      return '';
  }
}

function getStatusBorderColor(status: PerformanceScoreBreakdown['status']): string {
  switch (status) {
    case 'excellent':
      return '#10b981'; // green
    case 'good':
      return '#3b82f6'; // blue
    case 'average':
      return '#eab308'; // yellow
    case 'needs-improvement':
      return '#f97316'; // orange
    case 'poor':
      return '#ef4444'; // red
    default:
      return '#6b7280'; // gray
  }
}
