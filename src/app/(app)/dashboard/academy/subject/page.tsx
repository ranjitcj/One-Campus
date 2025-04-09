"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, BookOpen, Users } from "lucide-react";

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
  studentCount: number;
}

export default function SubjectList() {
  const router = useRouter();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const response = await fetch("/api/subjects");
      if (!response.ok) throw new Error("Failed to fetch subjects");
      const data = await response.json();
      setSubjects(data);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      toast.error("Failed to load subjects");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Subjects</h1>
          <p className="text-muted-foreground">Manage and view all subjects</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <Button variant="outline" className="w-full sm:w-auto" onClick={() => router.push("/dashboard/academy")}>
            Back to Academy
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            All Subjects
          </CardTitle>
          <CardDescription>List of all subjects with their details</CardDescription>
        </CardHeader>
        <CardContent>
          {subjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <BookOpen className="h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg">No subjects added yet</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Credits</TableHead>
                    <TableHead>Semester</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subjects.map((subject) => (
                    <TableRow key={subject._id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{subject.name}</TableCell>
                      <TableCell>{subject.code}</TableCell>
                      <TableCell>{subject.department.name}</TableCell>
                      <TableCell>{subject.credits}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{subject.semester}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{subject.studentCount}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/dashboard/academy/subject/${subject._id}`)}
                        >
                          View Details
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