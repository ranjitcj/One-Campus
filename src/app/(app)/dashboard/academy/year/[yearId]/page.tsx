"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableHeader, TableBody, TableCell, TableHead, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";

interface Year {
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
}

interface Division {
  _id: string;
  name: string;
  strength: number;
  startingRoll: number;
  endingRoll: number;
  year: string;
}

interface Subject {
  _id: string;
  name: string;
  code: string;
  description?: string;
  credits: number;
  semester: number;
  department: string;
}

interface Student {
  _id: string;
  name: string;
  rollNumber: string;
  email: string;
  phone?: string;
  department: {
    _id: string;
    name?: string;
    code?: string;
  };
  semester?: number;
  subjects: string[];
}

export default function YearDetails({ params }: { params: { yearId: string } }) {
  const [year, setYear] = useState<Year | null>(null);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDivisionDialogOpen, setIsDivisionDialogOpen] = useState(false);
  const [isSubjectDialogOpen, setIsSubjectDialogOpen] = useState(false);
  const [isStudentDialogOpen, setIsStudentDialogOpen] = useState(false);
  const [divisionFormData, setDivisionFormData] = useState({
    name: "",
    strength: 30,
    startingRoll: 1,
    endingRoll: 30,
  });
  const [subjectFormData, setSubjectFormData] = useState({
    name: "",
    code: "",
    description: "",
    credits: 3,
    semester: 1,
  });
  const [studentFormData, setStudentFormData] = useState({
    name: "",
    rollNumber: "",
    email: "",
    phone: "",
  });
  const router = useRouter();

  useEffect(() => {
    fetchYear();
    fetchDivisions();
    fetchSubjects();
    fetchStudents();
  }, [params.yearId]);

  const fetchYear = async () => {
    try {
      const response = await fetch(`/api/years/${params.yearId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch year");
      }
      const data = await response.json();
      setYear(data);
    } catch (error) {
      console.error("Error fetching year:", error);
      toast.error("Failed to fetch year");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDivisions = async () => {
    try {
      const response = await fetch(`/api/divisions?yearId=${params.yearId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch divisions");
      }
      const data = await response.json();
      setDivisions(data);
    } catch (error) {
      console.error("Error fetching divisions:", error);
      toast.error("Failed to fetch divisions");
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await fetch(`/api/subjects?yearId=${params.yearId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch subjects");
      }
      const data = await response.json();
      setSubjects(data);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      toast.error("Failed to fetch subjects");
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await fetch(`/api/students?yearId=${params.yearId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch students");
      }
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error("Failed to fetch students");
    }
  };

  const handleDivisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/divisions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...divisionFormData,
          year: params.yearId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create division");
      }

      const newDivision = await response.json();
      setDivisions([...divisions, newDivision]);
      setDivisionFormData({
        name: "",
        strength: 30,
        startingRoll: 1,
        endingRoll: 30,
      });
      setIsDivisionDialogOpen(false);
      toast.success("Division created successfully");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleSubjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/subjects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...subjectFormData,
          department: year?.department._id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create subject");
      }

      const newSubject = await response.json();
      setSubjects([...subjects, newSubject]);
      setSubjectFormData({
        name: "",
        code: "",
        description: "",
        credits: 3,
        semester: 1,
      });
      setIsSubjectDialogOpen(false);
      toast.success("Subject created successfully");
    } catch (error: any) {
      toast.error(error.message);
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
          department: year?.department._id,
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

  const handleDivisionInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setDivisionFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubjectInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSubjectFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStudentInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setStudentFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDivisionFormData((prev) => ({ ...prev, [name]: Number(value) }));
  };

  const handleDeleteDivision = async (divisionId: string) => {
    if (!confirm("Are you sure you want to delete this division?")) {
      return;
    }

    try {
      const response = await fetch(`/api/divisions/${divisionId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete division");
      }

      setDivisions(divisions.filter((division) => division._id !== divisionId));
      toast.success("Division deleted successfully");
    } catch (error) {
      console.error("Error deleting division:", error);
      toast.error("Failed to delete division");
    }
  };

  const handleDeleteSubject = async (subjectId: string) => {
    if (!confirm("Are you sure you want to delete this subject?")) {
      return;
    }

    try {
      const response = await fetch(`/api/subjects/${subjectId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete subject");
      }

      setSubjects(subjects.filter((subject) => subject._id !== subjectId));
      toast.success("Subject deleted successfully");
    } catch (error) {
      console.error("Error deleting subject:", error);
      toast.error("Failed to delete subject");
    }
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

  if (!year) {
    return <div>Year not found</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Link
            href={`/dashboard/academy/department/${year.department._id}`}
            className="text-blue-600 hover:underline mb-2 inline-block"
          >
            ← Back to Department
          </Link>
          <h1 className="text-2xl font-bold">{year.name}</h1>
          <p className="text-gray-600">Department: {year.department.name}</p>
          <p className="text-gray-600">Academic Year: {year.department.academicYear.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Divisions Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Divisions</h2>
            <Dialog open={isDivisionDialogOpen} onOpenChange={setIsDivisionDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#4CAF50] hover:bg-[#45a049]">
                  Add Division
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New Division</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleDivisionSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Division Name
                    </label>
                    <select
                      name="name"
                      value={divisionFormData.name}
                      onChange={handleDivisionInputChange}
                      className="w-full px-3 py-2 border rounded-md"
                      required
                    >
                      <option value="">Select Division</option>
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
                      <option value="E">E</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Strength
                    </label>
                    <input
                      type="number"
                      name="strength"
                      value={divisionFormData.strength}
                      onChange={handleNumberInputChange}
                      className="w-full px-3 py-2 border rounded-md"
                      min="1"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Starting Roll Number
                    </label>
                    <input
                      type="number"
                      name="startingRoll"
                      value={divisionFormData.startingRoll}
                      onChange={handleNumberInputChange}
                      className="w-full px-3 py-2 border rounded-md"
                      min="1"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ending Roll Number
                    </label>
                    <input
                      type="number"
                      name="endingRoll"
                      value={divisionFormData.endingRoll}
                      onChange={handleNumberInputChange}
                      className="w-full px-3 py-2 border rounded-md"
                      min="1"
                      required
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDivisionDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-[#4CAF50] hover:bg-[#45a049]">
                      Add Division
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {divisions.length === 0 ? (
            <p className="text-gray-500">No divisions added yet</p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Division</TableHead>
                    <TableHead>Strength</TableHead>
                    <TableHead>Roll Numbers</TableHead>
                    <TableHead>Subjects</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {divisions.map((division) => (
                    <TableRow key={division._id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{division.name}</TableCell>
                      <TableCell>{division.strength}</TableCell>
                      <TableCell>
                        {division.startingRoll} - {division.endingRoll}
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/dashboard/academy/division/${division._id}/subjects`}
                          className="text-blue-600 hover:underline"
                        >
                          View Subjects
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/dashboard/academy/division/${division._id}/students`}
                          className="text-blue-600 hover:underline"
                        >
                          View Students
                        </Link>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteDivision(division._id)}
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

        {/* Subjects Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Subjects</h2>
            <Dialog open={isSubjectDialogOpen} onOpenChange={setIsSubjectDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#4CAF50] hover:bg-[#45a049]">
                  Add Subject
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New Subject</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubjectSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subject Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={subjectFormData.name}
                      onChange={handleSubjectInputChange}
                      className="w-full px-3 py-2 border rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subject Code
                    </label>
                    <input
                      type="text"
                      name="code"
                      value={subjectFormData.code}
                      onChange={handleSubjectInputChange}
                      className="w-full px-3 py-2 border rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={subjectFormData.description}
                      onChange={handleSubjectInputChange}
                      className="w-full px-3 py-2 border rounded-md"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Credits
                    </label>
                    <input
                      type="number"
                      name="credits"
                      value={subjectFormData.credits}
                      onChange={handleSubjectInputChange}
                      className="w-full px-3 py-2 border rounded-md"
                      min="1"
                      max="10"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Semester
                    </label>
                    <input
                      type="number"
                      name="semester"
                      value={subjectFormData.semester}
                      onChange={handleSubjectInputChange}
                      className="w-full px-3 py-2 border rounded-md"
                      min="1"
                      max="8"
                      required
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsSubjectDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-[#4CAF50] hover:bg-[#45a049]">
                      Add Subject
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {subjects.length === 0 ? (
            <p className="text-gray-500">No subjects added yet</p>
          ) : (
            <div className="space-y-4">
              {subjects.map((subject) => (
                <div
                  key={subject._id}
                  className="border rounded-md p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{subject.name}</h3>
                      <p className="text-sm text-gray-600">Code: {subject.code}</p>
                      <p className="text-sm text-gray-600">
                        Credits: {subject.credits} | Semester: {subject.semester}
                      </p>
                      {subject.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {subject.description}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteSubject(subject._id)}
                      className="hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Students Section */}
        <div className="bg-white rounded-lg shadow-md p-6 md:col-span-2">
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
    </div>
  );
} 