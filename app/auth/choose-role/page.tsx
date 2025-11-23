'use client'

import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, Users, BookOpen } from "lucide-react";

export default function ChooseRolePage() {
  const router = useRouter();

  const roles = [
    {
      role: "student",
      title: "Student",
      description: "Access your classes, grades, and academic performance",
      icon: GraduationCap,
      imageUrl: "https://images.pexels.com/photos/733852/pexels-photo-733852.jpeg?auto=compress&cs=tinysrgb&w=1200",
    },
    {
      role: "parent",
      title: "Parent",
      description: "Monitor your child's progress and academic journey",
      icon: Users,
      imageUrl: "https://images.pexels.com/photos/4260323/pexels-photo-4260323.jpeg?auto=compress&cs=tinysrgb&w=1200",
    },
    {
      role: "teacher",
      title: "Teacher",
      description: "Manage classes, students, and track performance",
      icon: BookOpen,
      imageUrl: "https://images.pexels.com/photos/5212345/pexels-photo-5212345.jpeg?auto=compress&cs=tinysrgb&w=1200",
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <div className="w-full max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            CampusConnect
          </h1>
          <p className="text-xl text-muted-foreground">
            Choose your role to get started
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {roles.map(({ role, title, description, icon: Icon, imageUrl }) => (
            <Card
              key={role}
              className="relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer border-2 hover:border-primary/50 group"
              onClick={() => router.push(`/auth/signup?role=${role}`)}
            >
              {/* Background image covering the card */}
              <div
                className="absolute inset-0 bg-cover bg-center opacity-40 group-hover:opacity-60 transition-opacity"
                style={{ backgroundImage: `url(${imageUrl})` }}
              />

              {/* Content overlay */}
              <div className="relative z-10 bg-gradient-to-b from-background/70 via-background/60 to-background/80 h-full flex flex-col">
                <CardHeader className="pb-4">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 mx-auto bg-background/90 shadow-sm">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-2xl text-center">{title}</CardTitle>
                  <CardDescription className="text-center">
                    {description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 mt-auto pb-6">
                  <Button
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/auth/signup?role=${role}`);
                    }}
                  >
                    Sign Up as {title}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full bg-background/80"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/auth/login?role=${role}`);
                    }}
                  >
                    Already have an account?
                  </Button>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
