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

export default function StudentCalendar() {
  const router = useRouter();
  const [profile, setProfile] = useState<{ full_name: string; role: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [image, setImage] = useState<File | null>(null);
  const [structuredText, setStructuredText] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [events, setEvents] = useState<CalendarEventEntry[] | null>(null);

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
        if (!userProfile || userProfile.role !== 'student') {
          router.push('/auth/choose-role');
          return;
        }

        setProfile(userProfile);

        // Load latest saved calendar for this student, if any
        const { data, error } = await supabase
          .from('student_calendars')
          .select('content, created_at')
          .eq('student_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error('Error loading saved calendar for student:', error);
        } else if (data?.content) {
          const raw = data.content as string;
          setStructuredText(raw);

          // Try to parse saved content as JSON events
          const parsed: CalendarEventEntry[] = [];
          let jsonCandidate = raw.trim();
          if (jsonCandidate.startsWith('```')) {
            jsonCandidate = jsonCandidate.replace(/^```[a-zA-Z]*\n?/, '').replace(/```$/, '');
          }
          try {
            const maybeJson = JSON.parse(jsonCandidate);
            if (Array.isArray(maybeJson)) {
              maybeJson.forEach((item) => {
                if (
                  item &&
                  typeof item.date === 'string' &&
                  typeof item.time === 'string' &&
                  typeof item.exam_type === 'string' &&
                  typeof item.code === 'string' &&
                  typeof item.title === 'string'
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
            // If not JSON, keep parsed empty and show raw structuredText fallback
          }

          setEvents(parsed.length ? parsed : null);
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

      // Try to parse Gemini output into structured events. We expect either
      // plain lines or optionally JSON; handle both gently.
      const parsedEvents: CalendarEventEntry[] = [];
      const trimmed = text.trim();

      let jsonCandidate = trimmed;
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
              parsedEvents.push({
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
        // Fallback: parse line-based format "date – time – exam_type – code – title"
        const lines = trimmed.split(/\n+/).filter((l) => /–/.test(l));
        for (const line of lines) {
          const parts = line.split("–").map((p) => p.trim());
          if (parts.length >= 5) {
            parsedEvents.push({
              date: parts[0],
              time: parts[1],
              exam_type: parts[2],
              code: parts[3],
              title: parts.slice(4).join(" – "),
            });
          }
        }
      }

      setEvents(parsedEvents.length ? parsedEvents : null);
    } catch (error) {
      console.error("Error processing image:", error);
      setStructuredText("Error: Could not extract text.");
    } finally {
      setProcessing(false);
    }
  };

  const handleSaveCalendar = async () => {
    if (!structuredText) return;
    setSaving(true);
    setSaveMessage(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setSaveMessage("You must be logged in to save the calendar.");
        return;
      }

      const payloadContent = events && events.length
        ? JSON.stringify(events)
        : structuredText;

      const { error } = await supabase.from("student_calendars").insert({
        student_id: session.user.id,
        content: payloadContent,
      });

      if (error) {
        console.error("Error saving calendar:", JSON.stringify(error, null, 2));
        setSaveMessage(error.message || "Failed to save calendar. Please try again.");
      } else {
        setSaveMessage("Calendar saved and shared with your parent.");
      }
    } catch (error) {
      console.error("Unexpected error saving calendar:", error);
      setSaveMessage("Unexpected error while saving calendar.");
    } finally {
      setSaving(false);
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
        userName={profile?.full_name || 'Student'} 
        userRole="student"
        onSignOut={handleSignOut} 
      />

      <main className="container mx-auto px-4 py-20">
        <h1 className="text-3xl font-bold mb-6">Student Calendar</h1>

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
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                <Button onClick={processImage} disabled={processing}>
                  {processing ? "Processing..." : "Extract Text"}
                </Button>
                {structuredText && (
                  <Button
                    variant="secondary"
                    onClick={handleSaveCalendar}
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save & share with parent"}
                  </Button>
                )}
              </div>
            )}

            {saveMessage && (
              <p className="text-sm text-muted-foreground">
                {saveMessage}
              </p>
            )}

            {events && events.length > 0 && (
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {events.map((evt, idx) => (
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
            )}

            {!events && structuredText && (
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
  