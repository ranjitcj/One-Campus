"use client";

import React, { useState, useEffect } from "react";
import { submitAttendance } from "@/app/api/classattendance/route";

// Define types for class data structure
interface DivisionData {
  strength: number;
  starting_roll: number;
  ending_roll: number;
  subjects: string[];
}

interface YearData {
  code: string;
  [division: string]: DivisionData | string;
}

interface BranchData {
  branchName: string;
  code: string;
  years: {
    [year: string]: YearData;
  };
}

interface ClassroomData {
  branches: BranchData[];
}

// Initial class data (same structure as the HTML file)
const classData: ClassroomData = {
  branches: [
    {
      branchName: "Computer",
      code: "C",
      years: {
        SE: {
          code: "S",
          A: {
            strength: 74,
            starting_roll: 1,
            ending_roll: 74,
            subjects: ["M3", "PPL", "SE", "MP", "DSA"],
          },
          B: {
            strength: 74,
            starting_roll: 75,
            ending_roll: 148,
            subjects: ["M3", "PPL", "SE", "MP", "DSA"],
          },
          C: {
            strength: 75,
            starting_roll: 149,
            ending_roll: 223,
            subjects: ["M3", "PPL", "SE", "MP", "DSA"],
          },
        },
        TE: {
          code: "T",
          A: {
            strength: 42,
            starting_roll: 1,
            ending_roll: 42,
            subjects: ["ML", "AI", "IoT", "SPOS", "DAA"],
          },
        },
        BE: {
          code: "B",
          A: {
            strength: 45,
            starting_roll: 1,
            ending_roll: 45,
            subjects: ["M3", "PPL", "SE", "MP", "DSA"],
          },
        },
      },
    },
    {
      branchName: "Electronics",
      code: "E",
      years: {
        SE: {
          code: "S",
          A: {
            strength: 35,
            starting_roll: 1,
            ending_roll: 35,
            subjects: ["M3", "PPL", "SE", "MP", "DSA"],
          },
          B: {
            strength: 30,
            starting_roll: 36,
            ending_roll: 65,
            subjects: ["M3", "PPL", "SE", "MP", "DSA"],
          },
        },
        TE: {
          code: "T",
          A: {
            strength: 38,
            starting_roll: 1,
            ending_roll: 38,
            subjects: ["M3", "PPL", "SE", "MP", "DSA"],
          },
        },
        BE: {
          code: "B",
          A: {
            strength: 40,
            starting_roll: 1,
            ending_roll: 40,
            subjects: ["M3", "PPL", "SE", "MP", "DSA"],
          },
        },
      },
    },
  ],
};

export default function AttendanceManagementSystem() {
  const [selections, setSelections] = useState({
    Branch: "",
    Year: "",
    Division: "",
    Subject: "",
  });

  const [studentData, setStudentData] = useState({
    totalStudents: 0,
    startRoll: 1,
    attendanceData: [] as string[],
  });

  const [presentCount, setPresentCount] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState({
    text: "",
    isError: false,
  });

  // Clear lower selections when higher level changes
  const clearLowerSelections = (fromKey: keyof typeof selections) => {
    const keys = Object.keys(selections) as (keyof typeof selections)[];
    const index = keys.indexOf(fromKey);

    const newSelections = { ...selections };
    for (let i = index + 1; i < keys.length; i++) {
      newSelections[keys[i]] = "";
    }

    setSelections(newSelections);
    setStatusMessage({ text: "", isError: false });
    setIsSubmitted(false);
  };

  // Update selection and clear lower levels if needed
  const handleSelection = (key: keyof typeof selections, value: string) => {
    setSelections((prev) => {
      const newSelections = { ...prev, [key]: value };

      // Clear lower selections when a higher level changes
      if (key === "Branch") {
        newSelections.Year = "";
        newSelections.Division = "";
        newSelections.Subject = "";
      } else if (key === "Year") {
        newSelections.Division = "";
        newSelections.Subject = "";
      } else if (key === "Division") {
        newSelections.Subject = "";
      }

      return newSelections;
    });
  };

  // Generate student grid when subject is selected
  useEffect(() => {
    if (!selections.Subject) {
      setStudentData({
        totalStudents: 0,
        startRoll: 1,
        attendanceData: [],
      });
      setPresentCount(0);
      return;
    }

    const branch = classData.branches.find(
      (b) => b.branchName === selections.Branch
    );
    if (!branch) return;

    const yearData = branch.years[selections.Year];
    if (!yearData) return;

    const divisionData = yearData[selections.Division] as
      | DivisionData
      | undefined;
    if (!divisionData) return;

    setStudentData({
      totalStudents: divisionData.strength,
      startRoll: divisionData.starting_roll,
      attendanceData: new Array(divisionData.strength).fill("A"),
    });
    setPresentCount(0);
    setIsSubmitted(false);
  }, [selections]);

  // Toggle attendance for a student
  const toggleStudentAttendance = (index: number) => {
    if (isSubmitted) return;

    setStudentData((prev) => {
      const newAttendanceData = [...prev.attendanceData];
      newAttendanceData[index] = newAttendanceData[index] === "P" ? "A" : "P";

      setPresentCount(
        newAttendanceData.filter((status) => status === "P").length
      );

      return {
        ...prev,
        attendanceData: newAttendanceData,
      };
    });
  };

  // Toggle all students' attendance
  const toggleAllAttendance = () => {
    if (isSubmitted) return;

    setStudentData((prev) => {
      const allPresent = prev.attendanceData.every((status) => status === "P");
      const newAttendanceData = prev.attendanceData.map(() =>
        allPresent ? "A" : "P"
      );

      setPresentCount(allPresent ? 0 : prev.attendanceData.length);

      return {
        ...prev,
        attendanceData: newAttendanceData,
      };
    });
  };

  // Submit attendance to the server
  const handleSubmit = async () => {
    if (
      !selections.Branch ||
      !selections.Year ||
      !selections.Division ||
      !selections.Subject
    ) {
      setStatusMessage({
        text: "Please complete all selections first.",
        isError: true,
      });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage({ text: "Submitting attendance...", isError: false });

    try {
      const branch = classData.branches.find(
        (b) => b.branchName === selections.Branch
      );
      if (!branch) throw new Error("Branch not found");

      const yearCode = branch.years[selections.Year]?.code || "X";
      const classCode = `${branch.code}${yearCode}${selections.Division}`;

      const response = await submitAttendance({
        classCode,
        subjectName: selections.Subject,
        startRoll: studentData.startRoll,
        attendance: studentData.attendanceData,
      });

      if (response.error) {
        throw new Error(response.error);
      }

      setStatusMessage({
        text: response.message || "Attendance submitted successfully!",
        isError: false,
      });
      setIsSubmitted(true);
    } catch (error) {
      console.error("Submission error:", error);
      setStatusMessage({
        text:
          error instanceof Error
            ? error.message
            : "Failed to submit attendance",
        isError: true,
      });
      setIsSubmitted(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get available options for each selection level
  const getBranchOptions = () => classData.branches.map((b) => b.branchName);
  const getYearOptions = () => {
    const branch = classData.branches.find(
      (b) => b.branchName === selections.Branch
    );
    return branch ? Object.keys(branch.years) : [];
  };
  const getDivisionOptions = () => {
    const branch = classData.branches.find(
      (b) => b.branchName === selections.Branch
    );
    if (!branch || !selections.Year) return [];

    const yearData = branch.years[selections.Year];
    return Object.keys(yearData).filter((k) => k !== "code");
  };
  const getSubjectOptions = () => {
    const branch = classData.branches.find(
      (b) => b.branchName === selections.Branch
    );
    if (!branch || !selections.Year || !selections.Division) return [];

    const divisionData = branch.years[selections.Year][
      selections.Division
    ] as DivisionData;
    return divisionData?.subjects || [];
  };

  // Calculate class code
  const getClassCode = () => {
    const branch = classData.branches.find(
      (b) => b.branchName === selections.Branch
    );
    if (!branch) return "N/A";

    const yearCode = branch.years[selections.Year]?.code || "X";
    return `${branch.code}${yearCode}${selections.Division || "X"}`;
  };

  // Calculate attendance percentage
  const attendancePercentage =
    studentData.totalStudents > 0
      ? Math.round((presentCount / studentData.totalStudents) * 100)
      : 0;

  // Check if all students are present
  const allPresent =
    studentData.attendanceData.length > 0 &&
    studentData.attendanceData.every((status) => status === "P");

  return (
    <div className="min-h-screen bg-[#f4f4f6] flex flex-col items-center">
      <header className="w-full bg-[#4CAF50] text-white py-5 text-center shadow-md">
        <h1 className="text-2xl font-bold">Attendance Management System</h1>
      </header>

      <main className="w-full max-w-[800px] px-4 py-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Selection Container */}
          <div id="selection-container" className="space-y-4 mb-6">
            {/* Branch Selection */}
            <div className="selection Branch">
              <h2 className="h-h2 text-lg font-bold mb-2">Branch:</h2>
              <div className="flex flex-wrap gap-2">
                {getBranchOptions().map((branch) => (
                  <div
                    key={branch}
                    onClick={() => handleSelection("Branch", branch)}
                    className={`option px-3 py-2 rounded cursor-pointer transition-colors ${
                      selections.Branch === branch
                        ? "bg-[#4CAF50] text-white selected"
                        : "bg-[#f0f0f0] hover:bg-[#4CAF50] hover:text-white"
                    }`}
                  >
                    {branch}
                  </div>
                ))}
              </div>
            </div>

            {/* Year Selection */}
            {selections.Branch && (
              <div className="selection Year">
                <h2 className="h-h2 text-lg font-bold mb-2">Year:</h2>
                <div className="flex flex-wrap gap-2">
                  {getYearOptions().map((year) => (
                    <div
                      key={year}
                      onClick={() => handleSelection("Year", year)}
                      className={`option px-3 py-2 rounded cursor-pointer transition-colors ${
                        selections.Year === year
                          ? "bg-[#4CAF50] text-white selected"
                          : "bg-[#f0f0f0] hover:bg-[#4CAF50] hover:text-white"
                      }`}
                    >
                      {year}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Division Selection */}
            {selections.Branch && selections.Year && (
              <div className="selection Division">
                <h2 className="h-h2 text-lg font-bold mb-2">Division:</h2>
                <div className="flex flex-wrap gap-2">
                  {getDivisionOptions().map((division) => (
                    <div
                      key={division}
                      onClick={() => handleSelection("Division", division)}
                      className={`option px-3 py-2 rounded cursor-pointer transition-colors ${
                        selections.Division === division
                          ? "bg-[#4CAF50] text-white selected"
                          : "bg-[#f0f0f0] hover:bg-[#4CAF50] hover:text-white"
                      }`}
                    >
                      {division}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Subject Selection */}
            {selections.Branch && selections.Year && selections.Division && (
              <div className="selection Subject">
                <h2 className="h-h2 text-lg font-bold mb-2">Subject:</h2>
                <div className="flex flex-wrap gap-2">
                  {getSubjectOptions().map((subject) => (
                    <div
                      key={subject}
                      onClick={() => handleSelection("Subject", subject)}
                      className={`option px-3 py-2 rounded cursor-pointer transition-colors ${
                        selections.Subject === subject
                          ? "bg-[#4CAF50] text-white selected"
                          : "bg-[#f0f0f0] hover:bg-[#4CAF50] hover:text-white"
                      }`}
                    >
                      {subject}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Class Header and Student Grid */}
          {selections.Subject && (
            <div>
              <div className="header-status flex justify-between items-center mb-4">
                <span id="class-display" className="font-semibold">
                  {`${selections.Year} ${selections.Branch} ${selections.Division}`}
                </span>
                <button
                  id="toggle-all-btn"
                  onClick={toggleAllAttendance}
                  className="toggle-btn bg-[#2196F3] text-white px-3 py-1.5 rounded text-sm hover:bg-[#0b7dda] transition-colors"
                  disabled={isSubmitted}
                >
                  {allPresent ? "Mark All Absent" : "Mark All Present"}
                </button>
              </div>

              <div
                id="student-grid"
                className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2 mb-6"
              >
                {studentData.attendanceData.map((status, index) => (
                  <div
                    key={index}
                    onClick={() => toggleStudentAttendance(index)}
                    className={`student-card w-full aspect-square flex items-center justify-center rounded cursor-pointer font-mono font-bold text-white transition-colors ${
                      status === "P"
                        ? "bg-[#87DF77] hover:bg-[#6bc85a] present"
                        : "bg-[#FA5C35] hover:bg-[#d35400]"
                    } ${isSubmitted ? "cursor-default" : ""}`}
                    data-index={index}
                  >
                    {studentData.startRoll + index}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Attendance Summary */}
          <div className="attendance-summary bg-[#e7f3fe] border-l-[6px] border-[#2196F3] rounded p-4 mb-6">
            <p>
              Selected:{" "}
              <span id="selected-options">
                {Object.values(selections).filter(Boolean).join(" ") || "None"}
              </span>
            </p>
            <p>
              Class Code: <span id="class-code">{getClassCode()}</span>
            </p>
            <p>
              Subject:{" "}
              <span id="subject-name">
                {selections.Subject || "Not Selected"}
              </span>
            </p>
            <p>
              Total Students:{" "}
              <span id="total-students">{studentData.totalStudents}</span>
            </p>
            <p>
              Present Students: <span id="present-summary">{presentCount}</span>
            </p>
            <p>
              Absent Students:{" "}
              <span id="absent-summary">
                {studentData.totalStudents - presentCount}
              </span>
            </p>
            <p>
              Attendance Percentage:{" "}
              <span id="attendance-percentage">{attendancePercentage}%</span>
            </p>
          </div>

          {/* Status Message */}
          {statusMessage.text && (
            <div
              id="status-message"
              className={`p-3 rounded mb-4 text-center text-sm ${
                statusMessage.isError
                  ? "error-message bg-[#f2dede] text-[#a94442] border border-[#ebccd1]"
                  : "success-message bg-[#dff0d8] text-[#3c763d] border border-[#d6e9c6]"
              }`}
            >
              {statusMessage.text}
            </div>
          )}

          {/* Submit Button */}
          {selections.Subject && (
            <button
              id="submit-btn"
              onClick={handleSubmit}
              disabled={isSubmitted || isSubmitting}
              className={`w-full py-3 rounded text-white font-bold text-base transition-colors ${
                isSubmitted || isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#4CAF50] hover:bg-[#45a049]"
              }`}
            >
              {isSubmitting ? (
                <span className="inline-flex items-center justify-center">
                  Submitting...
                  <span className="submit-spinner ml-2 inline-block w-4 h-4 border-2 border-white border-opacity-30 rounded-full border-t-white"></span>
                </span>
              ) : isSubmitted ? (
                "Attendance Submitted"
              ) : (
                "Submit Attendance"
              )}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}

// "use client";

// import React, { useState, useEffect } from "react";
// import { submitAttendance } from "@/app/api/classattendance/route";
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { useSession } from "next-auth/react";

// interface DivisionData {
//   strength: number;
//   starting_roll: number;
//   ending_roll: number;
//   subjects: string[];
// }

// interface YearData {
//   code: string;
//   [division: string]: DivisionData | string;
// }

// interface BranchData {
//   branchName: string;
//   code: string;
//   years: {
//     [year: string]: YearData;
//   };
// }

// interface ClassroomData {
//   branches: BranchData[];
// }

// interface User {
//   classes?: {
//     [classCode: string]: string[];
//   };
// }

// const classData: ClassroomData = {
//   branches: [
//     {
//       branchName: "Computer",
//       code: "C",
//       years: {
//         SE: {
//           code: "S",
//           A: {
//             strength: 74,
//             starting_roll: 1,
//             ending_roll: 74,
//             subjects: ["M3", "PPL", "SE", "MP", "DSA"],
//           },
//           B: {
//             strength: 74,
//             starting_roll: 75,
//             ending_roll: 148,
//             subjects: ["M3", "PPL", "SE", "MP", "DSA"],
//           },
//           C: {
//             strength: 75,
//             starting_roll: 149,
//             ending_roll: 223,
//             subjects: ["M3", "PPL", "SE", "MP", "DSA"],
//           },
//         },
//         TE: {
//           code: "T",
//           A: {
//             strength: 42,
//             starting_roll: 1,
//             ending_roll: 42,
//             subjects: ["ML", "AI", "IoT", "SPOS", "DAA"],
//           },
//         },
//         BE: {
//           code: "B",
//           A: {
//             strength: 45,
//             starting_roll: 1,
//             ending_roll: 45,
//             subjects: ["M3", "PPL", "SE", "MP", "DSA"],
//           },
//         },
//       },
//     },
//     {
//       branchName: "Electronics",
//       code: "E",
//       years: {
//         SE: {
//           code: "S",
//           A: {
//             strength: 35,
//             starting_roll: 1,
//             ending_roll: 35,
//             subjects: ["M3", "PPL", "SE", "MP", "DSA"],
//           },
//           B: {
//             strength: 30,
//             starting_roll: 36,
//             ending_roll: 65,
//             subjects: ["M3", "PPL", "SE", "MP", "DSA"],
//           },
//         },
//         TE: {
//           code: "T",
//           A: {
//             strength: 38,
//             starting_roll: 1,
//             ending_roll: 38,
//             subjects: ["M3", "PPL", "SE", "MP", "DSA"],
//           },
//         },
//         BE: {
//           code: "B",
//           A: {
//             strength: 40,
//             starting_roll: 1,
//             ending_roll: 40,
//             subjects: ["M3", "PPL", "SE", "MP", "DSA"],
//           },
//         },
//       },
//     },
//   ],
// };

// export default function AttendanceManagementSystem() {
//   const { data: session } = useSession();
//   const user = session?.user as User;
//   const hasClasses = user?.classes && Object.keys(user.classes).length > 0;

//   const [selections, setSelections] = useState({
//     Branch: "",
//     Year: "",
//     Division: "",
//     Subject: "",
//   });

//   const [studentData, setStudentData] = useState({
//     totalStudents: 0,
//     startRoll: 1,
//     attendanceData: [] as string[],
//   });

//   const [presentCount, setPresentCount] = useState(0);
//   const [isSubmitted, setIsSubmitted] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [statusMessage, setStatusMessage] = useState({
//     text: "",
//     isError: false,
//   });

//   const parseClassCode = (classCode: string) => {
//     if (classCode.length !== 3) return null;

//     const branchCode = classCode[0];
//     const yearCode = classCode[1];
//     const division = classCode[2];

//     const branch = classData.branches.find((b) => b.code === branchCode);
//     if (!branch) return null;

//     const year = Object.entries(branch.years).find(
//       ([_, data]) => data.code === yearCode
//     )?.[0];
//     if (!year) return null;

//     return { branch: branch.branchName, year, division };
//   };

//   const handleClassCardSelect = (classCode: string, subject: string) => {
//     const components = parseClassCode(classCode);
//     if (!components) {
//       setStatusMessage({ text: "Invalid class code format", isError: true });
//       return;
//     }

//     const { branch, year, division } = components;
//     setSelections({
//       Branch: branch,
//       Year: year,
//       Division: division,
//       Subject: subject,
//     });

//     const branchData = classData.branches.find((b) => b.branchName === branch);
//     if (!branchData) return;

//     const divisionData = branchData.years[year][division] as
//       | DivisionData
//       | undefined;
//     if (!divisionData) return;

//     setStudentData({
//       totalStudents: divisionData.strength,
//       startRoll: divisionData.starting_roll,
//       attendanceData: new Array(divisionData.strength).fill("A"),
//     });
//     setPresentCount(0);
//     setIsSubmitted(false);
//     setStatusMessage({ text: "", isError: false });
//   };

//   const toggleStudentAttendance = (index: number) => {
//     if (isSubmitted) return;

//     setStudentData((prev) => {
//       const newAttendanceData = [...prev.attendanceData];
//       newAttendanceData[index] = newAttendanceData[index] === "P" ? "A" : "P";
//       setPresentCount(
//         newAttendanceData.filter((status) => status === "P").length
//       );
//       return { ...prev, attendanceData: newAttendanceData };
//     });
//   };

//   const toggleAllAttendance = () => {
//     if (isSubmitted) return;

//     setStudentData((prev) => {
//       const allPresent = prev.attendanceData.every((status) => status === "P");
//       const newAttendanceData = prev.attendanceData.map(() =>
//         allPresent ? "A" : "P"
//       );
//       setPresentCount(allPresent ? 0 : prev.attendanceData.length);
//       return { ...prev, attendanceData: newAttendanceData };
//     });
//   };

//   const handleSubmit = async () => {
//     if (
//       !selections.Branch ||
//       !selections.Year ||
//       !selections.Division ||
//       !selections.Subject
//     ) {
//       setStatusMessage({
//         text: "Please complete all selections first.",
//         isError: true,
//       });
//       return;
//     }

//     setIsSubmitting(true);
//     setStatusMessage({ text: "Submitting attendance...", isError: false });

//     try {
//       const branch = classData.branches.find(
//         (b) => b.branchName === selections.Branch
//       );
//       if (!branch) throw new Error("Branch not found");

//       const yearCode = branch.years[selections.Year]?.code || "X";
//       const classCode = `${branch.code}${yearCode}${selections.Division}`;

//       const response = await submitAttendance({
//         classCode,
//         subjectName: selections.Subject,
//         startRoll: studentData.startRoll,
//         attendance: studentData.attendanceData,
//       });

//       if (response.error) {
//         throw new Error(response.error);
//       }

//       setStatusMessage({
//         text: response.message || "Attendance submitted successfully!",
//         isError: false,
//       });
//       setIsSubmitted(true);
//     } catch (error) {
//       setStatusMessage({
//         text:
//           error instanceof Error
//             ? error.message
//             : "Failed to submit attendance",
//         isError: true,
//       });
//       setIsSubmitted(false);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const getClassCode = () => {
//     const branch = classData.branches.find(
//       (b) => b.branchName === selections.Branch
//     );
//     if (!branch) return "N/A";
//     const yearCode = branch.years[selections.Year]?.code || "X";
//     return `${branch.code}${yearCode}${selections.Division || "X"}`;
//   };

//   const attendancePercentage =
//     studentData.totalStudents > 0
//       ? Math.round((presentCount / studentData.totalStudents) * 100)
//       : 0;

//   const allPresent =
//     studentData.attendanceData.length > 0 &&
//     studentData.attendanceData.every((status) => status === "P");

//   if (!hasClasses) {
//     return (
//       <div className="min-h-screen bg-[#f4f4f6] flex flex-col items-center justify-center">
//         <div className="bg-white rounded-lg shadow-md p-8 max-w-md text-center">
//           <h2 className="text-xl font-bold mb-4">No Classes Assigned</h2>
//           <p className="mb-6">
//             Please contact your administrator to get access to classes.
//           </p>
//           <Button variant="outline" onClick={() => window.location.reload()}>
//             Refresh Page
//           </Button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-[#f4f4f6] flex flex-col items-center">
//       <header className="w-full bg-[#4CAF50] text-white py-5 text-center shadow-md">
//         <h1 className="text-2xl font-bold">Attendance Management System</h1>
//       </header>

//       <main className="w-full max-w-[800px] px-4 py-6">
//         <div className="bg-white rounded-lg shadow-md p-6">
//           {!selections.Subject ? (
//             <div className="mb-6">
//               <h2 className="text-xl font-bold mb-4">Your Classes</h2>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 {Object.entries(user.classes!).map(([classCode, subjects]) => (
//                   <Card key={classCode}>
//                     <CardHeader>
//                       <CardTitle className="text-lg">{classCode}</CardTitle>
//                     </CardHeader>
//                     <CardContent>
//                       <div className="space-y-2">
//                         {subjects.map((subject) => (
//                           <Button
//                             key={`${classCode}-${subject}`}
//                             variant="outline"
//                             className="w-full"
//                             onClick={() =>
//                               handleClassCardSelect(classCode, subject)
//                             }
//                           >
//                             {subject}
//                           </Button>
//                         ))}
//                       </div>
//                     </CardContent>
//                   </Card>
//                 ))}
//               </div>
//             </div>
//           ) : (
//             <>
//               <div className="header-status flex justify-between items-center mb-4">
//                 <span id="class-display" className="font-semibold">
//                   {`${selections.Year} ${selections.Branch} ${selections.Division}`}
//                 </span>
//                 <button
//                   id="toggle-all-btn"
//                   onClick={toggleAllAttendance}
//                   className="toggle-btn bg-[#2196F3] text-white px-3 py-1.5 rounded text-sm hover:bg-[#0b7dda] transition-colors"
//                   disabled={isSubmitted}
//                 >
//                   {allPresent ? "Mark All Absent" : "Mark All Present"}
//                 </button>
//               </div>

//               <div
//                 id="student-grid"
//                 className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2 mb-6"
//               >
//                 {studentData.attendanceData.map((status, index) => (
//                   <div
//                     key={index}
//                     onClick={() => toggleStudentAttendance(index)}
//                     className={`student-card w-full aspect-square flex items-center justify-center rounded cursor-pointer font-mono font-bold text-white transition-colors ${
//                       status === "P"
//                         ? "bg-[#87DF77] hover:bg-[#6bc85a] present"
//                         : "bg-[#FA5C35] hover:bg-[#d35400]"
//                     } ${isSubmitted ? "cursor-default" : ""}`}
//                     data-index={index}
//                   >
//                     {studentData.startRoll + index}
//                   </div>
//                 ))}
//               </div>

//               <div className="attendance-summary bg-[#e7f3fe] border-l-[6px] border-[#2196F3] rounded p-4 mb-6">
//                 <p>
//                   Selected:{" "}
//                   <span id="selected-options">
//                     {Object.values(selections).filter(Boolean).join(" ") ||
//                       "None"}
//                   </span>
//                 </p>
//                 <p>
//                   Class Code: <span id="class-code">{getClassCode()}</span>
//                 </p>
//                 <p>
//                   Subject:{" "}
//                   <span id="subject-name">
//                     {selections.Subject || "Not Selected"}
//                   </span>
//                 </p>
//                 <p>
//                   Total Students:{" "}
//                   <span id="total-students">{studentData.totalStudents}</span>
//                 </p>
//                 <p>
//                   Present Students:{" "}
//                   <span id="present-summary">{presentCount}</span>
//                 </p>
//                 <p>
//                   Absent Students:{" "}
//                   <span id="absent-summary">
//                     {studentData.totalStudents - presentCount}
//                   </span>
//                 </p>
//                 <p>
//                   Attendance Percentage:{" "}
//                   <span id="attendance-percentage">
//                     {attendancePercentage}%
//                   </span>
//                 </p>
//               </div>

//               {statusMessage.text && (
//                 <div
//                   id="status-message"
//                   className={`p-3 rounded mb-4 text-center text-sm ${
//                     statusMessage.isError
//                       ? "error-message bg-[#f2dede] text-[#a94442] border border-[#ebccd1]"
//                       : "success-message bg-[#dff0d8] text-[#3c763d] border border-[#d6e9c6]"
//                   }`}
//                 >
//                   {statusMessage.text}
//                 </div>
//               )}

//               <button
//                 id="submit-btn"
//                 onClick={handleSubmit}
//                 disabled={isSubmitted || isSubmitting}
//                 className={`w-full py-3 rounded text-white font-bold text-base transition-colors ${
//                   isSubmitted || isSubmitting
//                     ? "bg-gray-400 cursor-not-allowed"
//                     : "bg-[#4CAF50] hover:bg-[#45a049]"
//                 }`}
//               >
//                 {isSubmitting ? (
//                   <span className="inline-flex items-center justify-center">
//                     Submitting...
//                     <span className="submit-spinner ml-2 inline-block w-4 h-4 border-2 border-white border-opacity-30 rounded-full border-t-white"></span>
//                   </span>
//                 ) : isSubmitted ? (
//                   "Attendance Submitted"
//                 ) : (
//                   "Submit Attendance"
//                 )}
//               </button>
//             </>
//           )}
//         </div>
//       </main>
//     </div>
//   );
// }
