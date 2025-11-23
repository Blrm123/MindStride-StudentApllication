"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import { useMemo, useState, useEffect } from "react";

interface Props {
  imageUrl?: string;
}

const COLORS = ["#22c55e", "#eab308", "#3b82f6"];

export default function StudentProfile({ imageUrl }: Props) {
  const cards = [
    { id: 1, label: "Mobile Screentime", type: "pie" },
    { id: 2, label: "Attendance", type: "bar" },
    { id: 3, label: "Teacher Remarks", type: "text" },
    { id: 4, label: "Grades", type: "bar" },
    { id: 5, label: "Desktop Screentime", type: "pie" },
  ];

  // ✅ re-trigger animation every 5 seconds
  const [cycleKey, setCycleKey] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCycleKey(prev => prev + 1);
    }, 5000); // ✅ 5 seconds

    return () => clearInterval(interval);
  }, []);

  // ✅ circular positions
  const positions = useMemo(() => {
    const radius = 200;
    return cards.map((_, i) => {
      const angle = (i / cards.length) * Math.PI * 2;
      return {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
      };
    });
  }, []);

  return (
    <div className="relative flex items-center justify-center h-[650px] w-full">

      {/* 🔥 Infinite Orbit Rotation */}
      <motion.div
        className="absolute inset-0"
        animate={{ rotate: 360 }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      />

      {/* 🟣 Center Profile */}
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 1.4 }}
        className="z-20"
      >
        <Avatar className="w-40 h-40 shadow-xl ring-4 ring-primary/40">
          {imageUrl && <AvatarImage src={imageUrl} />}
          <AvatarFallback className="text-5xl font-bold bg-gradient-to-br from-blue-500 to-purple-500 text-white">
            SP
          </AvatarFallback>
        </Avatar>
      </motion.div>

      {/* 🌟 Orbiting Cards */}
      {cards.map((card, i) => (
        <motion.div
          key={`${card.id}-${cycleKey}`}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{
            opacity: 1,
            scale: 1,
            x: positions[i].x,
            y: positions[i].y,
          }}
          transition={{
            delay: i * 0.4,   // ✅ slower stagger
            duration: 1.6,    // ✅ smoother animation
            type: "spring",
            stiffness: 70,    // ✅ softer motion
          }}
          whileHover={{
            scale: 1.12,
            rotate: 3,
            boxShadow: "0 0 30px rgba(255,255,255,0.35)",
          }}
          className="absolute"
        >
          <GlassCard type={card.type} label={card.label} />
        </motion.div>
      ))}
    </div>
  );
}

/* ✅ Reusable Content Card */
function GlassCard({
  label,
  type,
}: {
  label: string;
  type: string;
}) {
  const pieData = [
    { name: "Study", value: 68 },
    { name: "Entertainment", value: 32 },
  ];

  const barData = [
    { name: "Math", value: 92 },
    { name: "Physics", value: 88 },
    { name: "CS", value: 97 },
  ];

  return (
    <Card className="w-48 h-48 p-4 rounded-2xl backdrop-blur-xl bg-white/60 border border-white/30 shadow-xl flex flex-col items-center justify-center">
      <p className="text-xs font-bold mb-2 text-slate-700 text-center">
        {label}
      </p>

      {/* ✅ Pie Charts */}
      {type === "pie" && (
        <ResponsiveContainer width="90%" height="70%">
          <PieChart>
            <Pie data={pieData} outerRadius={40} dataKey="value">
              {pieData.map((_, i) => (
                <Cell key={i} fill={COLORS[i]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      )}

      {/* ✅ Bar Charts */}
      {type === "bar" && (
        <ResponsiveContainer width="100%" height="70%">
          <BarChart data={barData}>
            <Bar dataKey="value" fill="#3b82f6" />
            <XAxis dataKey="name" fontSize={8} />
            <YAxis hide />
          </BarChart>
        </ResponsiveContainer>
      )}

      {/* ✅ Text Content */}
      {type === "text" && (
        <p className="text-[11px] text-slate-600 text-center leading-tight">
          ⭐ Excellent participation and steady improvement!
        </p>
      )}
    </Card>
  );
}
