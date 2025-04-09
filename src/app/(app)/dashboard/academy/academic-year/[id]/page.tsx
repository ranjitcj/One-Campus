"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface AcademicYear {
  _id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

interface Department {
  _id: string;
  name: string;
  code: string;
  description?: string;
  academicYear: string;
}

export default function AcademicYearDetails({ params }: { params: { id: string } }) {
  const [academicYear, setAcademicYear] = useState<AcademicYear | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
  });
  const router = useRouter();

  useEffect(() => {
    fetchAcademicYear();
    fetchDepartments();
  }, [params.id]);

  const fetchAcademicYear = async () => {
    try {
      const response = await fetch(`/api/academic-year/${params.id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch academic year");
      }
      const data = await response.json();
      setAcademicYear(data);
    } catch (error) {
      console.error("Error fetching academic year:", error);
      toast.error("Failed to fetch academic year");
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await fetch(`/api/departments?academicYearId=${params.id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch departments");
      }
      const data = await response.json();
      setDepartments(data);
    } catch (error) {
      console.error("Error fetching departments:", error);
      toast.error("Failed to fetch departments");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async () => {
    if (!academicYear) return;

    try {
      const response = await fetch(`/api/academic-year/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isActive: !academicYear.isActive,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update academic year");
      }

      const updatedYear = await response.json();
      setAcademicYear(updatedYear);
      toast.success(
        `Academic year ${updatedYear.isActive ? "activated" : "deactivated"} successfully`
      );
    } catch (error) {
      console.error("Error updating academic year:", error);
      toast.error("Failed to update academic year");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this academic year?")) return;

    try {
      const response = await fetch(`/api/academic-year/${params.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete academic year");
      }

      toast.success("Academic year deleted successfully");
      router.push("/dashboard/academy/academic-year");
    } catch (error) {
      console.error("Error deleting academic year:", error);
      toast.error("Failed to delete academic year");
    }
  };

  const handleDepartmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/departments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          academicYear: params.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create department");
      }

      const newDepartment = await response.json();
      setDepartments([...departments, newDepartment]);
      setFormData({ name: "", code: "", description: "" });
      setIsDialogOpen(false);
      toast.success("Department created successfully");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!academicYear) {
    return <div>Academic year not found</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Link
            href="/dashboard/academy/academic-year"
            className="text-blue-600 hover:underline mb-2 inline-block"
          >
            ← Back to Academic Years
          </Link>
          <h1 className="text-2xl font-bold">Academic Year Details</h1>
        </div>
        <div className="flex gap-2">
          <Button
            variant={academicYear.isActive ? "destructive" : "default"}
            onClick={handleToggleActive}
          >
            {academicYear.isActive ? "Deactivate" : "Activate"}
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Academic Year Name
              </label>
              <p className="mt-1 text-lg">{academicYear.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <span
                className={`inline-block mt-1 px-2 py-1 rounded text-sm ${
                  academicYear.isActive
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {academicYear.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Date Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Start Date
              </label>
              <p className="mt-1">
                {new Date(academicYear.startDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                End Date
              </label>
              <p className="mt-1">
                {new Date(academicYear.endDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Departments</h2>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#4CAF50] hover:bg-[#45a049]">
                Add Department
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Department</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleDepartmentSubmit} className="space-y-4">
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
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-[#4CAF50] hover:bg-[#45a049]">
                    Add Department
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {departments.length === 0 ? (
          <p className="text-gray-500">No departments added yet</p>
        ) : (
          <div className="space-y-4">
            {departments.map((department) => (
              <Link
                key={department._id}
                href={`/dashboard/academy/department/${department._id}`}
                className="block border rounded-md p-4 hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">{department.name}</h3>
                    <p className="text-sm text-gray-600">Code: {department.code}</p>
                    {department.description && (
                      <p className="text-sm text-gray-600 mt-1">
                        {department.description}
                      </p>
                    )}
                  </div>
                  <div className="text-gray-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 