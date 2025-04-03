// //src/app/(app)/dashboard/academy/attendance/page.tsx

"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AtSign,
  BarChart2,
  PieChart,
  Calendar,
  TrendingUp,
  Loader,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { User } from "next-auth";

// Types for attendance data
interface AttendanceRecord {
  date: string;
  status: "P" | "A";
}

interface SubjectAttendance {
  subject: string;
  attendance: AttendanceRecord[];
  attendancePercentage: number;
}

interface StudentAttendanceData {
  name: string;
  attendance_data: SubjectAttendance[];
  scores?: Array<{ subject: string; score: number }>;
}

export default function StudentAttendancePage() {
  const { data: session, status: sessionStatus } = useSession();
  const user: User = session?.user as User;

  const [rollNo, setRollNo] = useState<string>("");
  const [attendanceData, setAttendanceData] =
    useState<StudentAttendanceData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if attendance data exists in session
    if (user?.attendanceData) {
      setAttendanceData(user.attendanceData as StudentAttendanceData);
    }
    // If no attendance data but session is authenticated and roll number exists, fetch it
    else if (sessionStatus === "authenticated" && user?.rollno) {
      setRollNo(user.rollno);
      fetchAttendance(user.rollno);
    }
  }, [user?.rollno, user?.attendanceData, sessionStatus]);

  const fetchAttendance = async (roll: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/attendance?roll=${roll}`);

      if (!response.ok) {
        throw new Error("Failed to fetch attendance data");
      }

      const data = await response.json();
      setAttendanceData(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rollNo) {
      fetchAttendance(rollNo);
    }
  };

  const calculateTotalAttendance = () => {
    if (!attendanceData) return 0;

    const subjects = attendanceData.attendance_data.filter(
      (item) => item.subject !== "MAIN"
    );
    const totalPresent = subjects.reduce(
      (sum, subject) =>
        sum +
        subject.attendance.filter((record) => record.status === "P").length,
      0
    );

    const totalClasses = subjects.reduce(
      (sum, subject) => sum + subject.attendance.length,
      0
    );

    return totalClasses > 0 ? (totalPresent / totalClasses) * 100 : 0;
  };

  // Show loading spinner when loading
  const renderLoadingState = () => {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader className="w-12 h-12 animate-spin text-blue-600 mb-4" />
        <p className="text-lg font-medium">Loading attendance data...</p>
      </div>
    );
  };

  // Handle initial authentication loading state
  if (sessionStatus === "loading") {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex items-center">
              <AtSign className="mr-3" /> Student Attendance Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>{renderLoadingState()}</CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center">
            <AtSign className="mr-3" /> Student Attendance Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Show form only when appropriate */}
          {!isLoading &&
            (sessionStatus === "unauthenticated" ||
              (sessionStatus === "authenticated" && !user?.rollno)) && (
              <form onSubmit={handleSubmit} className="mb-6 flex gap-2">
                <Input
                  type="text"
                  value={rollNo}
                  onChange={(e) => setRollNo(e.target.value)}
                  placeholder="Enter Roll Number"
                  required
                />
                <Button type="submit" disabled={isLoading}>
                  Get Attendance
                </Button>
              </form>
            )}

          {isLoading && renderLoadingState()}

          {error && !isLoading && (
            <div className="bg-red-100 text-red-800 p-4 rounded">{error}</div>
          )}

          {attendanceData && !isLoading && (
            <div>
              <div className="bg-white-50 p-4 rounded mb-6">
                <h2 className="text-2xl font-bold mb-2">
                  {attendanceData.name}
                </h2>
                <div className="flex items-center">
                  <TrendingUp className="mr-2 text-blue-600" />
                  <span>
                    Total Attendance: {calculateTotalAttendance().toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {attendanceData.attendance_data
                  .filter((subject) => subject.subject !== "MAIN")
                  .map((subject, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <BarChart2 className="mr-2" /> {subject.subject}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between">
                          <span>Attendance:</span>
                          <span
                            className={`font-bold ${
                              subject.attendancePercentage >= 75
                                ? "text-green-600"
                                : subject.attendancePercentage >= 60
                                  ? "text-yellow-600"
                                  : "text-red-600"
                            }`}
                          >
                            {subject.attendancePercentage.toFixed(1)}%
                          </span>
                        </div>
                        <div className="mt-2">
                          <PieChart className="inline-block mr-2" size={16} />
                          <span>
                            Present:{" "}
                            {
                              subject.attendance.filter((r) => r.status === "P")
                                .length
                            }{" "}
                            / Total: {subject.attendance.length}
                          </span>
                        </div>
                        <div className="mt-2">
                          <Calendar className="inline-block mr-2" size={16} />
                          <span>
                            First Class: {subject.attendance[0]?.date || "N/A"}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
