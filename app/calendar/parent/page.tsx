'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { RoleBasedHeader } from "@/components/role-based-header";
import { getProfile, signOut } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { GoogleGenerativeAI } from "@google/generative-ai";

interface CalendarEventEntry {
  date: string;
  time: string;
  exam_type: string;
  code: string;
  title: string;
}

export default function ParentCalendar() {
  const router = useRouter();
  const [profile, setProfile] = useState<{ full_name: string; role: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [image, setImage] = useState<File | null>(null);
  const [structuredText, setStructuredText] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [savedCalendar, setSavedCalendar] = useState<string | null>(null);
  const [savedEvents, setSavedEvents] = useState<CalendarEventEntry[] | null>(null);

  const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/auth/choose-role');
          return;
        }

        const userProfile = await getProfile(session.user.id);
        if (!userProfile || userProfile.role !== 'parent') {
          router.push('/auth/choose-role');
          return;
        }

        setProfile(userProfile);
        // Load the latest saved calendar for this parent&apos;s ward (currently latest overall)
        const { data, error } = await supabase
          .from('student_calendars')
          .select('content, created_at')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error('Error loading saved calendar for parent:', error);
        } else if (data?.content) {
          const raw = data.content as string;
          setSavedCalendar(raw);

          // Try to parse as JSON array of events first
          const parsed: CalendarEventEntry[] = [];
          let jsonCandidate = raw.trim();
          if (jsonCandidate.startsWith("```")) {
            jsonCandidate = jsonCandidate.replace(/^```[a-zA-Z]*\n?/, "").replace(/```$/, "");
          }
          try {
            const maybeJson = JSON.parse(jsonCandidate);
            if (Array.isArray(maybeJson)) {
              maybeJson.forEach((item) => {
                if (
                  item &&
                  typeof item.date === "string" &&
                  typeof item.time === "string" &&
                  typeof item.exam_type === "string" &&
                  typeof item.code === "string" &&
                  typeof item.title === "string"
                ) {
                  parsed.push({
                    date: item.date,
                    time: item.time,
                    exam_type: item.exam_type,
                    code: item.code,
                    title: item.title,
                  });
                }
              });
            }
          } catch {
            // If not JSON, leave parsed empty and fall back to plain text
          }

          setSavedEvents(parsed.length ? parsed : null);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/auth/choose-role');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [router]);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setStructuredText(null);
    }
  };

  const processImage = async () => {
    if (!image) return;

    setProcessing(true);
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const base64 = await fileToBase64(image);

      const result = await model.generateContent([
        {
          inlineData: {
            data: base64,
            mimeType: image.type,
          },
        },
        {
          text:
            "You are reading an academic calendar image. Extract only the meaningful exam or event entries (like internal exams, SEE exams, tests, or important college events). For each entry, output a single line in this exact human-readable format: '23/10/2025 (Thu) – 10:00–11:30 – CIE-I – 22CDS51 – Software Engineering and Project Management'. Include: date with short day name in brackets, time range, exam type or label (CIE-I, SEE, Event, etc.), subject or event code, and subject or event name. Do NOT output markdown tables or bullet lists. Do NOT repeat institutional headers or signatories. Start with an optional short title line like 'Exam / Event Schedule:' and then the lines, one per entry.",
        },
      ]);

      const text = result.response.text();
      setStructuredText(text);
    } catch (error) {
      console.error("Error processing image:", error);
      setStructuredText("Error: Could not extract text.");
    } finally {
      setProcessing(false);
    }
  };

  const fileToBase64 = (file: File) => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64Data = (reader.result as string).split(",")[1];
        resolve(base64Data);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Skeleton className="h-16 w-full" />
        <div className="container mx-auto px-4 py-20">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <RoleBasedHeader 
        isLoggedIn={true} 
        userName={profile?.full_name || 'Parent'} 
        userRole="parent"
        onSignOut={handleSignOut} 
      />

      <main className="container mx-auto px-4 py-20">
        <h1 className="text-3xl font-bold mb-6">Parent Calendar</h1>

        {savedEvents && savedEvents.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-3">Student&apos;s Shared Exam / Event Schedule</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {savedEvents.map((evt, idx) => (
                <Card key={idx} className="border shadow-sm">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">{evt.exam_type}</p>
                        <CardTitle className="text-base mt-1">{evt.title}</CardTitle>
                      </div>
                      <div className="text-right text-xs font-medium">
                        <div>{evt.date}</div>
                        <div className="text-muted-foreground">{evt.time}</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 text-sm text-muted-foreground flex items-center justify-between">
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                      {evt.code}
                    </span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {!savedEvents && savedCalendar && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Student&apos;s Shared Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mt-2 bg-gray-50 p-4 rounded-md border whitespace-pre-wrap text-sm">
                {savedCalendar}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Upload Academic Calendar (OCR Extraction)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <input 
              type="file" 
              accept="image/*"
              onChange={handleImageUpload}
              className="block w-full border rounded-md p-2"
            />

            {image && (
              <Button onClick={processImage} disabled={processing}>
                {processing ? "Processing..." : "Extract Text"}
              </Button>
            )}

            {structuredText && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Extracted Calendar Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mt-2 bg-gray-50 p-4 rounded-md border whitespace-pre-wrap text-sm">
                    {structuredText}
                  </div>
                </CardContent>
              </Card>
            )}
            </CardContent>
          </Card>
        </main>
      </div>
    )
  };  
  