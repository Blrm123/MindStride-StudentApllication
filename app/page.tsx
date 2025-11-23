'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import HeroSection from "@/components/hero-section";
import FooterSection from "@/components/footer";
import { supabase } from "@/integrations/supabase/client";
import { getProfile, getRoleDashboardPath } from "@/lib/auth";
import StudentProfile from "@/components/StudentProfile";
import ContentSection from "@/components/content-3";
import LogoCloud from "@/components/logo-cloud";
import TeamSection from "@/components/team";
import FeaturesSection from "@/components/features-9";
export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const profile = await getProfile(session.user.id);
          if (profile) {
            router.push(getRoleDashboardPath(profile.role));
          }
        }
      } catch (error) {
        console.log("Auth check failed, continuing to home page:", error);
        // Continue to show home page if auth check fails
      }
    };
    checkAuth();
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <section className="container mx-auto px-4 flex flex-col lg:flex-row gap-8 items-stretch">
        {/* left side */}
        <div className="w-full lg:w-1/2 flex items-stretch">
          <div className="w-full">
            <HeroSection />
          </div>
        </div>
        {/* right side */}
        <div className="py-15 w-full lg:w-1/2 flex items-stretch">
          <div className="w-full lg:scale-90 lg:origin-top-right">
            <StudentProfile imageUrl="/student.jpeg" />
          </div>
        </div>
      </section>
      <LogoCloud />
      <ContentSection />
      <FeaturesSection />
      <TeamSection />
      <FooterSection />
    </div>
  );
}
