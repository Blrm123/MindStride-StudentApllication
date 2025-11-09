'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { RoleBasedHeader } from "@/components/role-based-header";
import { getProfile, signOut } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { User, Search, X, Award, Plus, Edit, Save, Check, XCircle, Clock, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Student = {
  id: string;
  full_name: string;
  student_id: string;
  class: string;
  cgpa: string;
};

type AttendanceRecord = {
  id: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  course_name: string;
};

type MarksRecord = {
  id: string;
  student_id: string;
  course_code: string;
  course_name: string;
  internal_1: number | null;
  internal_2: number | null;
  internal_3: number | null;
  see_marks: number | null;
  total_marks: number | null;
};

export default function TeacherMarks() {
  const router = useRouter();
  const { toast } = useToast();
  const [profile, setProfile] = useState<{ full_name: string; role: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [marksRecords, setMarksRecords] = useState<MarksRecord[]>([]);
  const [isMarksDialogOpen, setIsMarksDialogOpen] = useState(false);
  const [editingMarks, setEditingMarks] = useState<MarksRecord | null>(null);
  
  // Form states
  const [courseCode, setCourseCode] = useState("");
  const [courseName, setCourseName] = useState("");
  const [internal1, setInternal1] = useState("");
  const [internal2, setInternal2] = useState("");
  const [internal3, setInternal3] = useState("");
  const [seeMarks, setSeeMarks] = useState("");

  useEffect(() => {
    checkAuth();
  }, []);

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
      await loadStudents();
    } catch (error) {
      console.error('Auth check failed:', error);
      router.push('/auth/choose-role');
    } finally {
      setIsLoading(false);
    }
  };

  const loadStudents = async () => {
    const { data: studentsData, error } = await supabase
      .from('profiles')
      .select('id, full_name, student_id, class, cgpa')
      .eq('role', 'student')
      .order('class', { ascending: true });
    
    if (error) {
      console.error('Error fetching students:', error);
      toast({
        title: "Error",
        description: "Failed to load students",
        variant: "destructive",
      });
      return;
    }
    
    if (studentsData) {
      setStudents(studentsData as Student[]);
      setFilteredStudents(studentsData as Student[]);
    }
  };

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
    const filtered = students.filter(
      (s) =>
        s.full_name.toLowerCase().includes(query.toLowerCase()) ||
        s.student_id.toLowerCase().includes(query.toLowerCase()) ||
        s.class.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredStudents(filtered);
  };

  const handleStudentClick = async (student: Student) => {
    setSelectedStudent(student);
    await loadStudentAttendance(student.id);
    await loadStudentMarks(student.id);
  };

  const loadStudentAttendance = async (studentId: string) => {
    // Mock data - replace with actual Supabase query when attendance table is ready
    const mockAttendance: AttendanceRecord[] = [
      { id: '1', date: '2024-11-01', status: 'present', course_name: 'Data Structures' },
      { id: '2', date: '2024-11-02', status: 'present', course_name: 'Algorithms' },
      { id: '3', date: '2024-11-03', status: 'absent', course_name: 'Database Systems' },
      { id: '4', date: '2024-11-04', status: 'late', course_name: 'Web Development' },
      { id: '5', date: '2024-11-05', status: 'present', course_name: 'Data Structures' },
    ];
    setAttendanceRecords(mockAttendance);
  };

  const loadStudentMarks = async (studentId: string) => {
    // Try to fetch from Supabase - create table if doesn't exist
    try {
      const { data, error } = await supabase
        .from('student_marks')
        .select('*')
        .eq('student_id', studentId);

      if (error) {
        console.log('Marks table might not exist yet, using mock data');
        // Use mock data if table doesn't exist
        const mockMarks: MarksRecord[] = [
          { id: '1', student_id: studentId, course_code: 'CS101', course_name: 'Data Structures', internal_1: 18, internal_2: 20, internal_3: 19, see_marks: 85, total_marks: 142 },
          { id: '2', student_id: studentId, course_code: 'CS102', course_name: 'Algorithms', internal_1: 17, internal_2: 19, internal_3: 18, see_marks: 80, total_marks: 134 },
          { id: '3', student_id: studentId, course_code: 'CS103', course_name: 'Database Systems', internal_1: 20, internal_2: 18, internal_3: 19, see_marks: null, total_marks: null },
        ];
        setMarksRecords(mockMarks);
      } else {
        setMarksRecords(data as MarksRecord[]);
      }
    } catch (err) {
      console.error('Error loading marks:', err);
      setMarksRecords([]);
    }
  };

  const handleAddMarks = () => {
    setEditingMarks(null);
    setCourseCode("");
    setCourseName("");
    setInternal1("");
    setInternal2("");
    setInternal3("");
    setSeeMarks("");
    setIsMarksDialogOpen(true);
  };

  const handleEditMarks = (marks: MarksRecord) => {
    setEditingMarks(marks);
    setCourseCode(marks.course_code);
    setCourseName(marks.course_name);
    setInternal1(marks.internal_1?.toString() || "");
    setInternal2(marks.internal_2?.toString() || "");
    setInternal3(marks.internal_3?.toString() || "");
    setSeeMarks(marks.see_marks?.toString() || "");
    setIsMarksDialogOpen(true);
  };

  const handleSaveMarks = async () => {
    if (!selectedStudent) return;

    const int1 = internal1 ? parseFloat(internal1) : null;
    const int2 = internal2 ? parseFloat(internal2) : null;
    const int3 = internal3 ? parseFloat(internal3) : null;
    const see = seeMarks ? parseFloat(seeMarks) : null;
    
    const total = (int1 || 0) + (int2 || 0) + (int3 || 0) + (see || 0);

    const marksData = {
      student_id: selectedStudent.id,
      course_code: courseCode,
      course_name: courseName,
      internal_1: int1,
      internal_2: int2,
      internal_3: int3,
      see_marks: see,
      total_marks: total > 0 ? total : null,
    };

    try {
      if (editingMarks) {
        // Update existing marks
        const { error } = await supabase
          .from('student_marks')
          .update(marksData)
          .eq('id', editingMarks.id);

        if (error) throw error;

        setMarksRecords(marksRecords.map(m => 
          m.id === editingMarks.id ? { ...m, ...marksData } : m
        ));
        toast({
          title: "Success",
          description: "Marks updated successfully",
        });
      } else {
        // Insert new marks
        const { data, error } = await supabase
          .from('student_marks')
          .insert([marksData])
          .select();

        if (error) throw error;

        if (data) {
          setMarksRecords([...marksRecords, data[0] as MarksRecord]);
        }
        toast({
          title: "Success",
          description: "Marks added successfully",
        });
      }
      setIsMarksDialogOpen(false);
    } catch (error) {
      console.error('Error saving marks:', error);
      toast({
        title: "Error",
        description: "Failed to save marks. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getAttendanceStats = () => {
    const present = attendanceRecords.filter(r => r.status === 'present').length;
    const absent = attendanceRecords.filter(r => r.status === 'absent').length;
    const late = attendanceRecords.filter(r => r.status === 'late').length;
    const total = attendanceRecords.length;
    const percentage = total > 0 ? ((present + late) / total * 100).toFixed(1) : '0';
    return { present, absent, late, total, percentage };
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
        <h1 className="text-3xl font-bold mb-8">Marks Management</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Students List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Students</CardTitle>
                <CardDescription>{filteredStudents.length} students</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Search Bar */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Search by name, USN, or class"
                    className="pl-10"
                  />
                </div>

                {/* Students List */}
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {filteredStudents.map((student) => (
                    <div
                      key={student.id}
                      onClick={() => handleStudentClick(student)}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                        selectedStudent?.id === student.id ? 'bg-muted border-primary' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                          {getInitials(student.full_name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{student.full_name}</p>
                          <p className="text-xs text-muted-foreground">{student.student_id}</p>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Class: {student.class}</span>
                        <span className="font-medium">CGPA: {student.cgpa || 'N/A'}</span>
                      </div>
                    </div>
                  ))}
                  {filteredStudents.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No students found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Student Details */}
          <div className="lg:col-span-2">
            {selectedStudent ? (
              <div className="space-y-6">
                {/* Student Info Card */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary">
                        {getInitials(selectedStudent.full_name)}
                      </div>
                      <div>
                        <CardTitle>{selectedStudent.full_name}</CardTitle>
                        <CardDescription>{selectedStudent.student_id}</CardDescription>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedStudent(null)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Class</p>
                        <p className="text-lg font-semibold">{selectedStudent.class}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">CGPA</p>
                        <p className="text-lg font-semibold">{selectedStudent.cgpa || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Attendance</p>
                        <p className="text-lg font-semibold">{getAttendanceStats().percentage}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Tabs for Attendance and Marks - PART 1 */}
                <Tabs defaultValue="marks" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="marks">Marks</TabsTrigger>
                    <TabsTrigger value="attendance">Attendance</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="marks" className="space-y-4">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                          <CardTitle>Student Marks</CardTitle>
                          <CardDescription>Internal and SEE marks details</CardDescription>
                        </div>
                        <Button onClick={handleAddMarks} size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Marks
                        </Button>
                      </CardHeader>
                      <CardContent>
                        {marksRecords.length > 0 ? (
                          <div className="space-y-4">
                            {marksRecords.map((marks) => (
                              <div key={marks.id} className="border rounded-lg p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <div>
                                    <h3 className="font-semibold">{marks.course_name}</h3>
                                    <p className="text-sm text-muted-foreground">{marks.course_code}</p>
                                  </div>
                                  <Button variant="ghost" size="sm" onClick={() => handleEditMarks(marks)}>
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                  <div>
                                    <p className="text-xs text-muted-foreground">Internal 1</p>
                                    <p className="text-lg font-semibold">{marks.internal_1 ?? '-'}/20</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground">Internal 2</p>
                                    <p className="text-lg font-semibold">{marks.internal_2 ?? '-'}/20</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground">Internal 3</p>
                                    <p className="text-lg font-semibold">{marks.internal_3 ?? '-'}/20</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground">SEE Marks</p>
                                    <p className="text-lg font-semibold">{marks.see_marks ?? '-'}/100</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground">Total</p>
                                    <p className="text-lg font-bold text-primary">{marks.total_marks ?? '-'}/160</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-muted-foreground">
                            <Award className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>No marks recorded yet</p>
                            <Button onClick={handleAddMarks} variant="outline" size="sm" className="mt-4">
                              <Plus className="h-4 w-4 mr-2" />
                              Add First Marks
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="attendance" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Attendance Records</CardTitle>
                        <CardDescription>Recent attendance history</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {/* Attendance Stats */}
                        <div className="grid grid-cols-4 gap-4 mb-6">
                          <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                            <Check className="h-5 w-5 mx-auto mb-1 text-green-600" />
                            <p className="text-2xl font-bold text-green-600">{getAttendanceStats().present}</p>
                            <p className="text-xs text-muted-foreground">Present</p>
                          </div>
                          <div className="text-center p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                            <XCircle className="h-5 w-5 mx-auto mb-1 text-red-600" />
                            <p className="text-2xl font-bold text-red-600">{getAttendanceStats().absent}</p>
                            <p className="text-xs text-muted-foreground">Absent</p>
                          </div>
                          <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                            <Clock className="h-5 w-5 mx-auto mb-1 text-yellow-600" />
                            <p className="text-2xl font-bold text-yellow-600">{getAttendanceStats().late}</p>
                            <p className="text-xs text-muted-foreground">Late</p>
                          </div>
                          <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                            <Calendar className="h-5 w-5 mx-auto mb-1 text-blue-600" />
                            <p className="text-2xl font-bold text-blue-600">{getAttendanceStats().percentage}%</p>
                            <p className="text-xs text-muted-foreground">Overall</p>
                          </div>
                        </div>

                        {/* Attendance List */}
                        <div className="space-y-2">
                          {attendanceRecords.map((record) => (
                            <div key={record.id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex items-center space-x-3">
                                {record.status === 'present' && <Check className="h-5 w-5 text-green-600" />}
                                {record.status === 'absent' && <XCircle className="h-5 w-5 text-red-600" />}
                                {record.status === 'late' && <Clock className="h-5 w-5 text-yellow-600" />}
                                <div>
                                  <p className="font-medium text-sm">{record.course_name}</p>
                                  <p className="text-xs text-muted-foreground">{new Date(record.date).toLocaleDateString()}</p>
                                </div>
                              </div>
                              <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                                record.status === 'present' ? 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400' :
                                record.status === 'absent' ? 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400' :
                                'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400'
                              }`}>
                                {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center h-[400px]">
                  <div className="text-center text-muted-foreground">
                    <User className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">Select a student</p>
                    <p className="text-sm">Click on a student to view their details, attendance, and marks</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* Add/Edit Marks Dialog */}
      <Dialog open={isMarksDialogOpen} onOpenChange={setIsMarksDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingMarks ? 'Edit Marks' : 'Add Marks'}</DialogTitle>
            <DialogDescription>
              Enter the marks for {selectedStudent?.full_name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="courseCode">Course Code</Label>
                <Input
                  id="courseCode"
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value)}
                  placeholder="e.g., CS101"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="courseName">Course Name</Label>
                <Input
                  id="courseName"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  placeholder="e.g., Data Structures"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="internal1">Internal 1 (out of 20)</Label>
                <Input
                  id="internal1"
                  type="number"
                  min="0"
                  max="20"
                  value={internal1}
                  onChange={(e) => setInternal1(e.target.value)}
                  placeholder="0-20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="internal2">Internal 2 (out of 20)</Label>
                <Input
                  id="internal2"
                  type="number"
                  min="0"
                  max="20"
                  value={internal2}
                  onChange={(e) => setInternal2(e.target.value)}
                  placeholder="0-20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="internal3">Internal 3 (out of 20)</Label>
                <Input
                  id="internal3"
                  type="number"
                  min="0"
                  max="20"
                  value={internal3}
                  onChange={(e) => setInternal3(e.target.value)}
                  placeholder="0-20"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="seeMarks">SEE Marks (out of 100)</Label>
              <Input
                id="seeMarks"
                type="number"
                min="0"
                max="100"
                value={seeMarks}
                onChange={(e) => setSeeMarks(e.target.value)}
                placeholder="0-100"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMarksDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveMarks}>
              <Save className="h-4 w-4 mr-2" />
              Save Marks
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
