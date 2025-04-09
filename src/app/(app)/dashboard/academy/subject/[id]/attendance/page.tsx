"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Table, TableHeader, TableBody, TableCell, TableHead, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

interface Student {
  _id: string;
  name: string;
  rollNumber: string;
  email: string;
  semester?: number;
}

interface Attendance {
  _id: string;
  student: string;
  date: string;
  status: "present" | "absent" | "late";
}

export default function SubjectAttendance({ params }: { params: { id: string } }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchStudents();
    fetchAttendance();
  }, [params.id]);

  const fetchStudents = async () => {
    try {
      const response = await fetch(`/api/subjects/${params.id}/students`);
      if (!response.ok) throw new Error("Failed to fetch students");
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error("Failed to fetch students");
    }
  };

  const fetchAttendance = async () => {
    try {
      const response = await fetch(`/api/subjects/${params.id}/attendance`);
      if (!response.ok) throw new Error("Failed to fetch attendance");
      const data = await response.json();
      setAttendance(data);
    } catch (error) {
      console.error("Error fetching attendance:", error);
      toast.error("Failed to fetch attendance");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAttendanceChange = async (studentId: string, status: "present" | "absent" | "late") => {
    try {
      const response = await fetch(`/api/subjects/${params.id}/attendance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentId,
          date: selectedDate.toISOString(),
          status,
        }),
      });

      if (!response.ok) throw new Error("Failed to update attendance");
      
      toast.success("Attendance updated successfully");
      fetchAttendance();
    } catch (error) {
      console.error("Error updating attendance:", error);
      toast.error("Failed to update attendance");
    }
  };

  const getAttendanceStatus = (studentId: string) => {
    const record = attendance.find(
      (a) => a.student === studentId && format(new Date(a.date), "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd")
    );
    return record?.status || null;
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Link
            href={`/dashboard/academy/subject/${params.id}`}
            className="text-blue-600 hover:underline mb-2 inline-block"
          >
            ← Back to Subject
          </Link>
          <h1 className="text-2xl font-bold">Subject Attendance</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Roll Number</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Semester</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student._id}>
                      <TableCell className="font-medium">{student.rollNumber}</TableCell>
                      <TableCell>{student.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{student.semester || 1}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center space-x-2">
                          <Button
                            variant={getAttendanceStatus(student._id) === "present" ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleAttendanceChange(student._id, "present")}
                          >
                            Present
                          </Button>
                          <Button
                            variant={getAttendanceStatus(student._id) === "absent" ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleAttendanceChange(student._id, "absent")}
                          >
                            Absent
                          </Button>
                          <Button
                            variant={getAttendanceStatus(student._id) === "late" ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleAttendanceChange(student._id, "late")}
                          >
                            Late
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Select Date</h2>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            className="rounded-md border"
          />
        </div>
      </div>
    </div>
  );
} 