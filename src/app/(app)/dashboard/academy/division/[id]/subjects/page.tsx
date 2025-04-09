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

interface Subject {
  _id: string;
  name: string;
  code: string;
  description?: string;
  credits: number;
  semester: number;
}

export default function DivisionSubjects({ params }: { params: { id: string } }) {
  const [division, setDivision] = useState<Division | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubjectDialogOpen, setIsSubjectDialogOpen] = useState(false);
  const [subjectFormData, setSubjectFormData] = useState({
    name: "",
    code: "",
    description: "",
    credits: 3,
    semester: 1,
  });
  const router = useRouter();

  useEffect(() => {
    fetchDivision();
    fetchSubjects();
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

  const fetchSubjects = async () => {
    try {
      const response = await fetch(`/api/subjects?divisionId=${params.id}`);
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
          division: params.id,
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

  const handleSubjectInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSubjectFormData((prev) => ({ ...prev, [name]: value }));
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
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Credits</TableHead>
                  <TableHead>Semester</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subjects.map((subject) => (
                  <TableRow key={subject._id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{subject.name}</TableCell>
                    <TableCell>{subject.code}</TableCell>
                    <TableCell>{subject.credits}</TableCell>
                    <TableCell>{subject.semester}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteSubject(subject._id)}
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