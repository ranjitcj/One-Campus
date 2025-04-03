// src/app/actions/attendance.ts
"use client";

interface AttendanceSubmissionProps {
  classCode: string;
  subjectName: string;
  startRoll: number;
  attendance: string[];
}

interface SubmissionResponse {
  message?: string;
  error?: string;
}

export async function submitAttendance(
  data: AttendanceSubmissionProps
): Promise<SubmissionResponse> {
  try {
    // Send a POST request to our API route
    const response = await fetch("/api/classattendance", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    return await response.json();
  } catch (error) {
    console.error("Submission error:", error);
    return { error: "An unexpected error occurred during submission." };
  }
}
