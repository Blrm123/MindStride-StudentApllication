'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { GraduationCap } from 'lucide-react';
import { signOut } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { getProfile } from '@/lib/auth';
import { HeroHeader as StudentHeader } from '@/components/header';
import { HeroHeader as TeacherHeader } from '@/components/headertea';
import { HeroHeader as ParentHeader } from '@/components/headerpar';
import StudentProfile from "@/components/StudentProfile";
import FooterSection from "@/components/footer";
import ContentSection from "@/components/content-3";
import LogoCloud from "@/components/logo-cloud";
import TeamSection from "@/components/team";
import FeaturesSection from "@/components/features-9";
import HeroSectionForHome from './components/hero-section';

// Header Component
function AppHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const profile = await getProfile(session.user.id);
          setUser(profile);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      }
    };

    checkAuth();
  }, []);

  // Map user roles to their corresponding header components
  const headerComponents = {
    student: StudentHeader,
    teacher: TeacherHeader,
    parent: ParentHeader
  };

  // If user is logged in, show the appropriate header component
  if (user) {
    const normalizedRole = (user.role || 'student').toString().toLowerCase();
    const HeaderComponent = headerComponents[normalizedRole as keyof typeof headerComponents] || StudentHeader;
    return (
      <HeaderComponent 
        isLoggedIn={!!user}
        userName={user.full_name || user.email}
        onSignOut={async () => {
          await signOut();
          router.push('/');
        }}
      />
    );
  }

  // Default header for non-logged in users
  return (
    <header className="fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-md z-50 border-b border-border">
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            MindStride
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-sm font-medium text-foreground hover:text-primary transition">
            Home
          </Link>
          <Link href="/dashboard" className="text-sm font-medium text-foreground hover:text-primary transition">
            Dashboard
          </Link>
          <Link href="/notes" className="text-sm font-medium text-foreground hover:text-primary transition">
            Notes
          </Link>
          <Link href="/chatbot" className="text-sm font-medium text-foreground hover:text-primary transition">
            AI Chatbot
          </Link>
          
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-foreground">Hi, {user.full_name}</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={async () => {
                  await signOut();
                  router.push('/');
                }}
              >
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Link href="/auth">
                <Button variant="outline" size="sm">
                  Log In
                </Button>
              </Link>
              <Link href="/auth?signup=true">
                <Button size="sm">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-foreground"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
              <line x1="4" x2="20" y1="12" y2="12" />
              <line x1="4" x2="20" y1="6" y2="6" />
              <line x1="4" x2="20" y1="18" y2="18" />
            </svg>
          )}
        </button>
      </nav>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-background border-t border-border">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
            <Link 
              href="/" 
              className="py-2 text-foreground hover:text-primary transition"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link 
              href="/dashboard" 
              className="py-2 text-foreground hover:text-primary transition"
              onClick={() => setIsOpen(false)}
            >
              Dashboard
            </Link>
            <Link 
              href="/notes" 
              className="py-2 text-foreground hover:text-primary transition"
              onClick={() => setIsOpen(false)}
            >
              Notes
            </Link>
            <Link 
              href="/chatbot" 
              className="py-2 text-foreground hover:text-primary transition"
              onClick={() => setIsOpen(false)}
            >
              AI Chatbot
            </Link>
            
            {user ? (
              <div className="pt-4 mt-4 border-t border-border">
                <p className="text-sm text-muted-foreground mb-2">Logged in as {user.email}</p>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={async () => {
                    await signOut();
                    router.push('/');
                  }}
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 pt-4 mt-4 border-t border-border">
                <Link href="/auth" className="w-full">
                  <Button variant="outline" className="w-full" onClick={() => setIsOpen(false)}>
                    Log In
                  </Button>
                </Link>
                <Link href="/auth?signup=true" className="w-full">
                  <Button className="w-full" onClick={() => setIsOpen(false)}>
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

// Main Home Page Component
export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <AppHeader />
      <main className="pt-20">
        <section className="container mx-auto px-4 flex flex-col lg:flex-row gap-8 items-stretch">
          {/* left side */}
          <div className="w-full lg:w-1/2 flex items-stretch">
            <div className="w-full">
              <HeroSectionForHome />
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
      </main>
    </div>
  );
}
