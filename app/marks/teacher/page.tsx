'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { RoleBasedHeader } from "@/components/role-based-header";
import { getProfile, signOut } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Student = {
  id: string;
  full_name: string;
  student_id: string;
  class: string;
  semester: string | null;
  cgpa: string | null;
};

type Course = {
  id: string;
  name: string;
};

export default function TeacherMarks() {
  const router = useRouter();
  const [profile, setProfile] = useState<{ full_name: string; role: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentSubjects, setStudentSubjects] = useState<Course[]>([]);
  const [showMarksDialog, setShowMarksDialog] = useState(false);
  const [marksForm, setMarksForm] = useState({
    subject: "",
    internal1: "",
    internal2: "",
    assignment: "",
    see: "",
    previousCgpa: "",
    semester: ""
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/auth/choose-role');
          return;
        }

        const userProfile = await getProfile(session.user.id);
        if (!userProfile || userProfile.role !== 'teacher') {
          router.push('/auth/choose-role');
          return;
        }

        setProfile(userProfile);

        const { data: studentsData, error: studentsError } = await supabase
          .from('profiles')
          .select('id, full_name, student_id, class, semester, cgpa')
          .eq('role', 'student')
          .order('class', { ascending: true });

        if (studentsError) {
          console.error('Error fetching students:', studentsError);
        }

        if (studentsData) {
          setStudents(studentsData as Student[]);
          setFilteredStudents(studentsData as Student[]);
        } else {
          setStudents([]);
          setFilteredStudents([]);
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

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredStudents(students);
      return;
    }
    const lowered = query.toLowerCase();
    const filtered = students.filter((s) =>
      s.full_name.toLowerCase().includes(lowered) ||
      s.student_id.toLowerCase().includes(lowered) ||
      s.class.toLowerCase().includes(lowered)
    );
    setFilteredStudents(filtered);
  };

  const handleStudentClick = async (student: Student) => {
    setSelectedStudent(student);
    setShowMarksDialog(true);

    // Load this student's subjects from courses table
    const { data: courseRows, error: coursesError } = await supabase
      .from('courses')
      .select('id, name')
      .eq('user_id', student.id)
      .order('created_at', { ascending: false });

    if (coursesError) {
      console.error('Error fetching student courses:', JSON.stringify(coursesError, null, 2));
      setStudentSubjects([]);
    } else {
      setStudentSubjects((courseRows || []) as Course[]);
    }

    setMarksForm((prev) => ({
      ...prev,
      subject: (courseRows && courseRows[0]?.name) || "",
      internal1: "",
      internal2: "",
      assignment: "",
      see: "",
      previousCgpa: student.cgpa || "",
      semester: student.semester || ""
    }));
  };

  const parseNumber = (value: string) => {
    const n = parseFloat(value);
    return isNaN(n) ? 0 : n;
  };

  const internalRawTotal = parseNumber(marksForm.internal1) + parseNumber(marksForm.internal2);
  const internalConverted25 = Math.max(0, Math.min(25, (internalRawTotal / 100) * 25));
  const assignment25 = Math.max(0, Math.min(25, parseNumber(marksForm.assignment)));
  const internalTotal50 = Math.max(0, Math.min(50, internalConverted25 + assignment25));
  const seeRaw100 = parseNumber(marksForm.see);
  const seeConverted50 = Math.max(0, Math.min(50, (seeRaw100 / 100) * 50));
  const finalTotal100 = Math.max(0, Math.min(100, internalTotal50 + seeConverted50));
  const sgpa = finalTotal100 / 10;

  const derivedPreviousCgpa = marksForm.previousCgpa
    ? parseNumber(marksForm.previousCgpa)
    : selectedStudent && selectedStudent.cgpa
    ? parseFloat(selectedStudent.cgpa) || 0
    : 0;

  const newCgpa = derivedPreviousCgpa > 0 ? (derivedPreviousCgpa + sgpa) / 2 : sgpa;

  const handleSaveMarks = async () => {
    if (!selectedStudent) return;

    const subjectName = marksForm.subject.trim();
    if (!subjectName) {
      alert('Please enter subject name');
      return;
    }

    const semesterValue = marksForm.semester || selectedStudent.semester || "1";
    const semesterNumber = parseInt(semesterValue, 10) || 1;

    try {
      // Upsert subject-wise marks for this student and subject
      const { error: upsertError } = await supabase
        .from('subject_marks')
        .upsert({
          student_id: selectedStudent.id,
          subject_name: subjectName,
          semester: semesterNumber,
          internal1: parseNumber(marksForm.internal1),
          internal2: parseNumber(marksForm.internal2),
          assignment: parseNumber(marksForm.assignment),
          see: seeRaw100,
          total_internal_50: internalTotal50,
          see_50: seeConverted50,
          total_100: finalTotal100,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'student_id,subject_name,semester' });

      if (upsertError) {
        console.error('Error saving marks:', upsertError);
        alert('Failed to save marks');
        return;
      }

      // Recompute SGPA for this semester from all subjects
      const { data: allMarks, error: fetchError } = await supabase
        .from('subject_marks')
        .select('total_100')
        .eq('student_id', selectedStudent.id)
        .eq('semester', semesterNumber);

      if (fetchError) {
        console.error('Error fetching subject marks for SGPA:', fetchError);
      }

      let currentSgpa = sgpa;
      if (allMarks && allMarks.length > 0) {
        const sumTotals = allMarks.reduce(
          (sum: number, row: { total_100?: number | null }) => sum + (row.total_100 || 0),
          0
        );
        const avgTotal = sumTotals / allMarks.length;
        currentSgpa = avgTotal / 10;
      }

      const previousCgpaValue = derivedPreviousCgpa;
      const calculatedNewCgpa = previousCgpaValue > 0 ? (previousCgpaValue + currentSgpa) / 2 : currentSgpa;

      // Update profiles.cgpa so dashboards see the new CGPA
      const { error: updateProfileError } = await supabase
        .from('profiles')
        .update({ cgpa: calculatedNewCgpa.toFixed(2) })
        .eq('id', selectedStudent.id);

      if (updateProfileError) {
        console.error('Error updating profile CGPA:', updateProfileError);
      }

      alert('Marks saved and CGPA updated');
      setShowMarksDialog(false);
      setSelectedStudent(null);
    } catch (error) {
      console.error('Unexpected error saving marks:', error);
      alert('Unexpected error while saving marks');
    }
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
        userName={profile?.full_name || 'Teacher'} 
        userRole="teacher"
        onSignOut={handleSignOut} 
      />
      <main className="container mx-auto px-4 py-20">
        <h1 className="text-3xl font-bold mb-6">Marks Management</h1>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Students</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Input
                    placeholder="Search by name, USN, or class"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {filteredStudents.map((student) => (
                    <button
                      key={student.id}
                      type="button"
                      onClick={() => handleStudentClick(student)}
                      className="w-full text-left p-3 border rounded-lg hover:bg-muted transition-colors"
                    >
                      <div className="font-medium">{student.full_name}</div>
                      <div className="text-xs text-muted-foreground flex justify-between">
                        <span>{student.student_id}</span>
                        <span>Class: {student.class}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Previous CGPA: {student.cgpa ?? 'N/A'}
                      </div>
                    </button>
                  ))}
                  {filteredStudents.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center">No students found.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Select a student from the list to enter internal, assignment, and SEE marks. The system will
                  automatically convert them to a total out of 100, calculate the semester SGPA, and compute the new
                  CGPA using the previous CGPA and current SGPA.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {showMarksDialog && selectedStudent && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>Mark Entry - {selectedStudent.full_name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Select
                      value={marksForm.subject}
                      onValueChange={(value) => setMarksForm({ ...marksForm, subject: value })}
                    >
                      <SelectTrigger id="subject">
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {studentSubjects.map((course) => (
                          <SelectItem key={course.id} value={course.name}>
                            {course.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="internal1">Internal 1 (out of 50)</Label>
                    <Input
                      id="internal1"
                      type="number"
                      min={0}
                      max={50}
                      value={marksForm.internal1}
                      onChange={(e) => setMarksForm({ ...marksForm, internal1: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="internal2">Internal 2 (out of 50)</Label>
                    <Input
                      id="internal2"
                      type="number"
                      min={0}
                      max={50}
                      value={marksForm.internal2}
                      onChange={(e) => setMarksForm({ ...marksForm, internal2: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="assignment">Assignment (out of 25)</Label>
                    <Input
                      id="assignment"
                      type="number"
                      min={0}
                      max={25}
                      value={marksForm.assignment}
                      onChange={(e) => setMarksForm({ ...marksForm, assignment: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="see">SEE (out of 100)</Label>
                    <Input
                      id="see"
                      type="number"
                      min={0}
                      max={100}
                      value={marksForm.see}
                      onChange={(e) => setMarksForm({ ...marksForm, see: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="previousCgpa">Previous CGPA</Label>
                    <Input
                      id="previousCgpa"
                      type="number"
                      step="0.01"
                      value={marksForm.previousCgpa}
                      onChange={(e) => setMarksForm({ ...marksForm, previousCgpa: e.target.value })}
                      placeholder={selectedStudent.cgpa ?? undefined}
                    />
                  </div>
                  <div>
                    <Label htmlFor="semester">Semester</Label>
                    <Input
                      id="semester"
                      type="number"
                      min={1}
                      max={10}
                      value={marksForm.semester}
                      onChange={(e) => setMarksForm({ ...marksForm, semester: e.target.value })}
                      placeholder={selectedStudent.semester ?? "1"}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <p><span className="font-semibold">Internal Converted (25):</span> {internalConverted25.toFixed(2)}</p>
                    <p><span className="font-semibold">Assignment (25):</span> {assignment25.toFixed(2)}</p>
                    <p><span className="font-semibold">Internal Total (50):</span> {internalTotal50.toFixed(2)}</p>
                  </div>
                  <div className="space-y-1">
                    <p><span className="font-semibold">SEE Converted (50):</span> {seeConverted50.toFixed(2)}</p>
                    <p><span className="font-semibold">Final Total (100):</span> {finalTotal100.toFixed(2)}</p>
                    <p><span className="font-semibold">SGPA:</span> {sgpa.toFixed(2)}</p>
                    <p><span className="font-semibold">New CGPA:</span> {newCgpa.toFixed(2)}</p>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowMarksDialog(false);
                      setSelectedStudent(null);
                    }}
                  >
                    Close
                  </Button>
                  <Button onClick={handleSaveMarks}>
                    Save Marks
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
