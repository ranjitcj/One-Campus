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

interface Department {
  _id: string;
  name: string;
  code: string;
  description?: string;
  academicYear: {
    _id: string;
    name: string;
  };
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

interface Year {
  _id: string;
  name: string;
  department: string;
}

export default function DepartmentDetails({ params }: { params: { id: string } }) {
  const [department, setDepartment] = useState<Department | null>(null);
  const [years, setYears] = useState<Year[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSubjectDialogOpen, setIsSubjectDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
  });
  const [subjectFormData, setSubjectFormData] = useState({
    name: "",
    code: "",
    description: "",
    credits: 3,
    semester: 1,
  });
  const [isStudentDialogOpen, setIsStudentDialogOpen] = useState(false);
  const [studentFormData, setStudentFormData] = useState({
    name: "",
    rollNumber: "",
    email: "",
    phone: "",
  });
  const [yearFormData, setYearFormData] = useState({
    name: "",
  });
  const [isYearDialogOpen, setIsYearDialogOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchDepartment();
    fetchYears();
    fetchSubjects();
    fetchStudents();
  }, [params.id]);

  const fetchDepartment = async () => {
    try {
      const response = await fetch(`/api/departments/${params.id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch department");
      }
      const data = await response.json();
      setDepartment(data);
      setFormData({
        name: data.name,
        code: data.code,
        description: data.description || "",
      });
    } catch (error) {
      console.error("Error fetching department:", error);
      toast.error("Failed to fetch department");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchYears = async () => {
    try {
      const response = await fetch(`/api/years?departmentId=${params.id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch years");
      }
      const data = await response.json();
      setYears(data);
    } catch (error) {
      console.error("Error fetching years:", error);
      toast.error("Failed to fetch years");
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await fetch(`/api/subjects?departmentId=${params.id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch subjects");
      }
      const data = await response.json();
      setSubjects(data);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      toast.error("Failed to fetch subjects");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      console.log("Fetching students for department:", params.id);
      const response = await fetch(`/api/students?departmentId=${params.id}`);
      
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

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/departments/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to update department");
      }

      const updatedDepartment = await response.json();
      setDepartment(updatedDepartment);
      setIsEditDialogOpen(false);
      toast.success("Department updated successfully");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this department?")) return;

    try {
      const response = await fetch(`/api/departments/${params.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete department");
      }

      toast.success("Department deleted successfully");
      router.push(`/dashboard/academy/academic-year/${department?.academicYear._id}`);
    } catch (error) {
      console.error("Error deleting department:", error);
      toast.error("Failed to delete department");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
          department: params.id,
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
      
      // Refresh the student list to show updated subjects
      fetchStudents();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleSubjectInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSubjectFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSubjectFormData((prev) => ({ ...prev, [name]: Number(value) }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast.error("Please select a file first");
      return;
    }

    setImporting(true);
    try {
      console.log("Starting import process...");
      const formData = new FormData();
      formData.append("file", file);
      formData.append("departmentId", params.id);

      console.log("Sending import request...");
      const response = await fetch("/api/students/import", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      console.log("Import response:", result);

      if (!response.ok) {
        throw new Error(result.error || "Failed to import students");
      }

      toast.success(`Successfully imported ${result.count} students`);
      setFile(null);
      setIsImportDialogOpen(false);
      fetchStudents();
    } catch (error: any) {
      console.error("Error importing students:", error);
      toast.error(error.message || "Failed to import students");
    } finally {
      setImporting(false);
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

      if (!response.ok) throw new Error("Failed to delete student");

      toast.success("Student deleted successfully");
      fetchStudents();
    } catch (error) {
      console.error("Error deleting student:", error);
      toast.error("Failed to delete student");
    }
  };

  const handleStudentInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setStudentFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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
          department: params.id,
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

  const handleYearSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/years", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...yearFormData,
          department: params.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create year");
      }

      const newYear = await response.json();
      setYears([...years, newYear]);
      setYearFormData({
        name: "",
      });
      setIsYearDialogOpen(false);
      toast.success("Year created successfully");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleYearInputChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setYearFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!department) {
    return <div>Department not found</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Link
            href={`/dashboard/academy/academic-year/${department.academicYear._id}`}
            className="text-blue-600 hover:underline mb-2 inline-block"
          >
            ← Back to Academic Year
          </Link>
          <h1 className="text-2xl font-bold">Department Details</h1>
        </div>
        <div className="flex gap-2">
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">Edit</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Edit Department</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department Code
                  </label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
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
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-[#4CAF50] hover:bg-[#45a049]">
                    Save Changes
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Department Name
                </label>
                <p className="mt-1 text-lg">{department.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Department Code
                </label>
                <p className="mt-1 text-lg">{department.code}</p>
              </div>
              {department.description && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <p className="mt-1 text-gray-600">{department.description}</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4">Academic Year</h2>
            <Link
              href={`/dashboard/academy/academic-year/${department.academicYear._id}`}
              className="text-blue-600 hover:underline"
            >
              {department.academicYear.name}
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Years</h2>
                <Dialog open={isYearDialogOpen} onOpenChange={setIsYearDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-[#4CAF50] hover:bg-[#45a049]">
                      Add Year
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Add New Year</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleYearSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Year
                        </label>
                        <select
                          name="name"
                          value={yearFormData.name}
                          onChange={handleYearInputChange}
                          className="w-full px-3 py-2 border rounded-md"
                          required
                        >
                          <option value="">Select Year</option>
                          <option value="First Year">First Year</option>
                          <option value="Second Year">Second Year</option>
                          <option value="Third Year">Third Year</option>
                          <option value="Fourth Year">Fourth Year</option>
                        </select>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsYearDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" className="bg-[#4CAF50] hover:bg-[#45a049]">
                          Add Year
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              {years.length === 0 ? (
                <p className="text-gray-500">No years added yet</p>
              ) : (
                <div className="space-y-4">
                  {years.map((year) => (
                    <Link
                      key={year._id}
                      href={`/dashboard/academy/year/${year._id}`}
                      className="block"
                    >
                      <div className="border rounded-md p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-medium">{year.name}</h3>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Commented out Subjects section
            <div>
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
                          onChange={handleNumberInputChange}
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
                          onChange={handleNumberInputChange}
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
                    <Link
                      key={subject._id}
                      href={`/dashboard/academy/subject/${subject._id}`}
                      className="block border rounded-md p-4 hover:bg-gray-50 transition-colors"
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
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
            */}

            {/* Commented out Students section
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Students</h2>
                <div className="flex gap-2">
                  <Dialog open={isStudentDialogOpen} onOpenChange={setIsStudentDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-blue-600 hover:bg-blue-700">
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
                          <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                            Add Student
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                  <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-[#4CAF50] hover:bg-[#45a049]">
                        Import Students
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Import Students</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Excel File
                          </label>
                          <input
                            type="file"
                            accept=".xlsx,.xls"
                            onChange={handleFileChange}
                            className="w-full px-3 py-2 border rounded-md"
                          />
                          <p className="text-sm text-gray-500 mt-1">
                            File should contain columns: RollNo, Name, Email
                          </p>
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsImportDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleImport}
                            disabled={!file || importing}
                            className="bg-[#4CAF50] hover:bg-[#45a049]"
                          >
                            {importing ? "Importing..." : "Import Students"}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
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
                        <TableRow key={student._id} className="hover:bg-gray-50">
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
            </div>
            */}
          </div>
        </div>
      </div>
    </div>
  );
} 