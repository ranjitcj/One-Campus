"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Trash2, BookOpen, Users } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";

interface Subject {
  _id: string;
  name: string;
  code: string;
  department: {
    _id: string;
    name: string;
  };
  description: string;
  credits: number;
  semester: number;
}

interface Student {
  _id: string;
  name: string;
  rollNumber: string;
  email: string;
  phone?: string;
  department?: string;
  subjects: string[];
}

export default function SubjectDetails({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    fetchSubject();
    fetchStudents();
  }, [params.id]);

  const fetchSubject = async () => {
    try {
      const response = await fetch(`/api/subjects/${params.id}`);
      if (!response.ok) throw new Error("Failed to fetch subject");
      const data = await response.json();
      setSubject(data);
    } catch (error) {
      console.error("Error fetching subject:", error);
      toast.error("Failed to load subject details");
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      console.log("Fetching students for subject:", params.id);
      const response = await fetch(`/api/subjects/${params.id}/students`);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Server error:", errorData);
        throw new Error(`Failed to fetch students: ${errorData.error || response.statusText}`);
      }
      
      const data = await response.json();
      console.log("Students data received:", data);
      
      if (!Array.isArray(data)) {
        console.error("Received invalid data format:", data);
        throw new Error("Invalid data format received from server");
      }
      
      setStudents(data);
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error("Failed to fetch students");
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    if (!confirm("Are you sure you want to remove this student from the subject?")) {
      return;
    }

    try {
      const response = await fetch(`/api/subjects/${params.id}/students/${studentId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to remove student");

      toast.success("Student removed successfully");
      fetchStudents();
    } catch (error) {
      console.error("Error removing student:", error);
      toast.error("Failed to remove student");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] space-y-4">
        <h1 className="text-2xl font-bold text-destructive">Subject not found</h1>
        <Button onClick={() => router.push("/dashboard/academy/subject")}>
          Back to Subjects
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">{subject.name}</h1>
          <p className="text-muted-foreground max-w-2xl">{subject.description}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <Button variant="outline" className="w-full sm:w-auto" onClick={() => router.push("/dashboard/academy/subject")}>
            Back to Subjects
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Code</span>
                <span className="font-medium">{subject.code}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Department</span>
                <span className="font-medium">{subject.department.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Credits</span>
                <span className="font-medium">{subject.credits}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Semester</span>
                <Badge variant="secondary">{subject.semester}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Students
            </CardTitle>
            <CardDescription>Total enrolled students</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary">{students.length}</div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button variant="outline" className="w-full" asChild>
                <Link href={`/dashboard/academy/subject/${params.id}/edit`}>
                  Edit Subject
                </Link>
              </Button>
              <Button variant="destructive" className="w-full">
                Delete Subject
              </Button>
              <div className="flex gap-2">
                <Link href={`/dashboard/academy/subject/${subject._id}/attendance`}>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Attendance
                  </Button>
                </Link>
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                </Dialog>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Enrolled Students
          </CardTitle>
        </CardHeader>
        <CardContent>
          {students.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg">No students enrolled in this subject</p>
              <p className="text-sm mt-2">Students can be imported from the department page</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Roll Number</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students
                    .sort((a, b) => {
                      const rollA = parseInt(a.rollNumber);
                      const rollB = parseInt(b.rollNumber);
                      if (!isNaN(rollA) && !isNaN(rollB)) {
                        return rollA - rollB;
                      }
                      return a.rollNumber.localeCompare(b.rollNumber);
                    })
                    .map((student) => (
                    <TableRow key={student._id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{student.rollNumber}</TableCell>
                      <TableCell>{student.name}</TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteStudent(student._id)}
                          className="hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 