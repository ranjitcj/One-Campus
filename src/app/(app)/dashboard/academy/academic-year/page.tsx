"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface AcademicYear {
  _id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export default function AcademicYearManagement() {
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    startDate: "",
    endDate: "",
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchAcademicYears();
  }, []);

  const fetchAcademicYears = async () => {
    try {
      const response = await fetch("/api/academic-year");
      const data = await response.json();
      setAcademicYears(data);
    } catch (error) {
      console.error("Error fetching academic years:", error);
      toast.error("Failed to fetch academic years");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/academic-year", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create academic year");
      }

      const newAcademicYear = await response.json();
      setAcademicYears([...academicYears, newAcademicYear]);
      setFormData({ name: "", startDate: "", endDate: "" });
      setIsDialogOpen(false);
      toast.success("Academic year created successfully");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Academic Year Management</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#4CAF50] hover:bg-[#45a049]">
              Add New Academic Year
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Academic Year</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Academic Year Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="e.g., 2023-2024"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  />
                </div>
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
                  Add Academic Year
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Academic Years</h2>
        {isLoading ? (
          <div>Loading academic years...</div>
        ) : (
          <div className="space-y-4">
            {academicYears.map((year) => (
              <Link
                key={year._id}
                href={`/dashboard/academy/academic-year/${year._id}`}
                className="block"
              >
                <div className="border rounded-md p-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
                  <div>
                    <h3 className="font-medium">{year.name}</h3>
                    <p className="text-sm text-gray-600">
                      {new Date(year.startDate).toLocaleDateString()} -{" "}
                      {new Date(year.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        year.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {year.isActive ? "Active" : "Inactive"}
                    </span>
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