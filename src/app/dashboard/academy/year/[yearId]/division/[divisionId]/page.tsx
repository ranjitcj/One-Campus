"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Division {
  _id: string;
  name: string;
  strength: number;
  startingRoll: number;
  endingRoll: number;
  year: {
    _id: string;
    name: string;
    department: {
      _id: string;
      name: string;
      academicYear: {
        _id: string;
        name: string;
      };
    };
  };
}

interface Student {
  _id: string;
  name: string;
  rollNumber: string;
  email: string;
  phone?: string;
}

interface Subject {
  _id: string;
  name: string;
  code: string;
  credits: number;
}

export default function DivisionPage({
  params,
}: {
  params: { yearId: string; divisionId: string };
}) {
  const router = useRouter();
  const [division, setDivision] = useState<Division | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [newStudent, setNewStudent] = useState({
    name: "",
    rollNumber: "",
    email: "",
    phone: "",
  });
  const [newSubject, setNewSubject] = useState({
    name: "",
    code: "",
    credits: 0,
  });

  useEffect(() => {
    fetchDivisionDetails();
    fetchStudents();
    fetchSubjects();
  }, [params.divisionId]);

  const fetchDivisionDetails = async () => {
    try {
      const response = await fetch(`/api/divisions/${params.divisionId}`);
      if (!response.ok) throw new Error("Failed to fetch division details");
      const data = await response.json();
      setDivision(data);
    } catch (error) {
      console.error("Error fetching division details:", error);
      toast.error("Failed to load division details");
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await fetch(`/api/students?divisionId=${params.divisionId}`);
      if (!response.ok) throw new Error("Failed to fetch students");
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await fetch(`/api/subjects?divisionId=${params.divisionId}`);
      if (!response.ok) throw new Error("Failed to fetch subjects");
      const data = await response.json();
      setSubjects(data);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      toast.error("Failed to load subjects");
    }
  };

  const handleAddStudent = async () => {
    try {
      const response = await fetch("/api/students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newStudent,
          division: params.divisionId,
        }),
      });

      if (!response.ok) throw new Error("Failed to add student");

      toast.success("Student added successfully");
      setNewStudent({ name: "", rollNumber: "", email: "", phone: "" });
      fetchStudents();
    } catch (error) {
      console.error("Error adding student:", error);
      toast.error("Failed to add student");
    }
  };

  const handleAddSubject = async () => {
    try {
      const response = await fetch("/api/subjects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newSubject,
          division: params.divisionId,
        }),
      });

      if (!response.ok) throw new Error("Failed to add subject");

      toast.success("Subject added successfully");
      setNewSubject({ name: "", code: "", credits: 0 });
      fetchSubjects();
    } catch (error) {
      console.error("Error adding subject:", error);
      toast.error("Failed to add subject");
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    try {
      const response = await fetch(`/api/students/${studentId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete student");

      toast.success("Student deleted successfully");
      fetchStudents();
    } catch (error) {
      console.error("Error deleting student:", error);
      toast.error("Failed to delete student");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!division) {
    return <div>Division not found</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Link href="/dashboard/academy">Academy</Link>
          <span>›</span>
          <Link
            href={`/dashboard/academy/year/${division.year.department.academicYear._id}`}
          >
            {division.year.department.academicYear.name}
          </Link>
          <span>›</span>
          <Link
            href={`/dashboard/academy/year/${division.year.department.academicYear._id}/department/${division.year.department._id}`}
          >
            {division.year.department.name}
          </Link>
          <span>›</span>
          <Link
            href={`/dashboard/academy/year/${division.year.department.academicYear._id}/department/${division.year.department._id}/year/${division.year._id}`}
          >
            {division.year.name}
          </Link>
          <span>›</span>
          <span className="font-medium text-foreground">{division.name}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Division Details</h2>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Name:</span> {division.name}
              </p>
              <p>
                <span className="font-medium">Strength:</span> {division.strength}
              </p>
              <p>
                <span className="font-medium">Roll Range:</span>{" "}
                {division.startingRoll} - {division.endingRoll}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Quick Actions</h2>
            <div className="flex gap-4">
              <Dialog>
                <DialogTrigger asChild>
                  <Button>Add Student</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Student</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={newStudent.name}
                        onChange={(e) =>
                          setNewStudent({ ...newStudent, name: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rollNumber">Roll Number</Label>
                      <Input
                        id="rollNumber"
                        value={newStudent.rollNumber}
                        onChange={(e) =>
                          setNewStudent({
                            ...newStudent,
                            rollNumber: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newStudent.email}
                        onChange={(e) =>
                          setNewStudent({ ...newStudent, email: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone (Optional)</Label>
                      <Input
                        id="phone"
                        value={newStudent.phone}
                        onChange={(e) =>
                          setNewStudent({ ...newStudent, phone: e.target.value })
                        }
                      />
                    </div>
                    <Button onClick={handleAddStudent}>Add Student</Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <Button>Add Subject</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Subject</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="subjectName">Name</Label>
                      <Input
                        id="subjectName"
                        value={newSubject.name}
                        onChange={(e) =>
                          setNewSubject({ ...newSubject, name: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subjectCode">Code</Label>
                      <Input
                        id="subjectCode"
                        value={newSubject.code}
                        onChange={(e) =>
                          setNewSubject({ ...newSubject, code: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="credits">Credits</Label>
                      <Input
                        id="credits"
                        type="number"
                        value={newSubject.credits}
                        onChange={(e) =>
                          setNewSubject({
                            ...newSubject,
                            credits: parseInt(e.target.value),
                          })
                        }
                      />
                    </div>
                    <Button onClick={handleAddSubject}>Add Subject</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold mb-4">Students</h2>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Roll Number</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student._id}>
                    <TableCell>{student.rollNumber}</TableCell>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>{student.phone || "-"}</TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteStudent(student._id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">Subjects</h2>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Credits</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subjects.map((subject) => (
                  <TableRow key={subject._id}>
                    <TableCell>{subject.code}</TableCell>
                    <TableCell>{subject.name}</TableCell>
                    <TableCell>{subject.credits}</TableCell>
                    <TableCell>
                      <Button variant="destructive" size="sm">
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
} 