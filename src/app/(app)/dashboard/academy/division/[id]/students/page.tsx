"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableHeader, TableBody, TableCell, TableHead, TableRow } from "@/components/ui/table";
import { Trash2 } from "lucide-react";

interface Division {
  _id: string;
  name: string;
  year: {
    _id: string;
    name: string;
    department: {
      _id: string;
      name: string;
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

export default function DivisionStudents({ params }: { params: { id: string } }) {
  const [division, setDivision] = useState<Division | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isStudentDialogOpen, setIsStudentDialogOpen] = useState(false);
  const [studentFormData, setStudentFormData] = useState({
    name: "",
    rollNumber: "",
    email: "",
    phone: "",
  });
  const router = useRouter();

  useEffect(() => {
    fetchDivision();
    fetchStudents();
  }, [params.id]);

  const fetchDivision = async () => {
    try {
      const response = await fetch(`/api/divisions/${params.id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch division");
      }
      const data = await response.json();
      setDivision(data);
    } catch (error) {
      console.error("Error fetching division:", error);
      toast.error("Failed to fetch division");
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await fetch(`/api/students?divisionId=${params.id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch students");
      }
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error("Failed to fetch students");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...studentFormData,
          division: params.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create student");
      }

      const newStudent = await response.json();
      setStudents([...students, newStudent]);
      setStudentFormData({
        name: "",
        rollNumber: "",
        email: "",
        phone: "",
      });
      setIsStudentDialogOpen(false);
      toast.success("Student created successfully");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleStudentInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setStudentFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDeleteStudent = async (studentId: string) => {
    if (!confirm("Are you sure you want to delete this student?")) {
      return;
    }

    try {
      const response = await fetch(`/api/students/${studentId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete student");
      }

      setStudents(students.filter((student) => student._id !== studentId));
      toast.success("Student deleted successfully");
    } catch (error) {
      console.error("Error deleting student:", error);
      toast.error("Failed to delete student");
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!division) {
    return <div>Division not found</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Link
            href={`/dashboard/academy/year/${division.year._id}`}
            className="text-blue-600 hover:underline mb-2 inline-block"
          >
            ← Back to Year
          </Link>
          <h1 className="text-2xl font-bold">{division.name}</h1>
          <p className="text-gray-600">Year: {division.year.name}</p>
          <p className="text-gray-600">Department: {division.year.department.name}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Students</h2>
          <Dialog open={isStudentDialogOpen} onOpenChange={setIsStudentDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#4CAF50] hover:bg-[#45a049]">
                Add Student
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Student</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleStudentSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={studentFormData.name}
                    onChange={handleStudentInputChange}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Roll Number
                  </label>
                  <input
                    type="text"
                    name="rollNumber"
                    value={studentFormData.rollNumber}
                    onChange={handleStudentInputChange}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={studentFormData.email}
                    onChange={handleStudentInputChange}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={studentFormData.phone}
                    onChange={handleStudentInputChange}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsStudentDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-[#4CAF50] hover:bg-[#45a049]">
                    Add Student
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {students.length === 0 ? (
          <p className="text-gray-500">No students added yet</p>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Roll Number</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student._id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{student.rollNumber}</TableCell>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>{student.phone || "-"}</TableCell>
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
      </div>
    </div>
  );
} 