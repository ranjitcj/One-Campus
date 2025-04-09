"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSession } from "next-auth/react";
import { User } from "next-auth";
import { AtSign, Book } from "lucide-react";

interface CollegeDataRecord {
  [key: string]: string | number;
}

// Define the specific fields we want to display
const DISPLAY_FIELDS = [
  "title",
  "author",
  "issuedate",
  "date_due",
  "fine_amount",
];

// Field display names (for headers)
const FIELD_LABELS: Record<string, string> = {
  title: "Title",
  author: "Author",
  issuedate: "Issue Date",
  date_due: "Due Date",
  fine_amount: "Fine Amount",
};

export default function CollegeDataPage() {
  const { data: session } = useSession();
  // const user: User = session?.user as User;
  const user: User & { college_id?: string } = session?.user as User & {
    college_id?: string;
  };

  const [collegeData, setCollegeData] = useState<CollegeDataRecord[] | null>(
    null
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Automatically fetch college data if college_id exists in session
    if (user?.college_id) {
      fetchCollegeData(user.college_id);
    }
  }, [user?.college_id]);

  const fetchCollegeData = async (collegeId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://script.google.com/macros/s/AKfycbxhAo2fJiJoEhZvtArZnb1FqIgABhP6tB726MvMUCsBUjpe5IlfQQFNcuE1KE9c63Bj/exec?college_id=${collegeId}`
      );

      const data = await response.json();

      if (data.status === "success") {
        setCollegeData(data.data);
      } else {
        throw new Error(data.data || "Failed to fetch college data");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center">
            <Book className="mr-3" /> Library Books
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="text-center py-4">Loading library data...</div>
          )}

          {error && (
            <div className="bg-red-100 text-red-800 p-4 rounded mb-4">
              {error}
              {!user?.college_id && (
                <div className="mt-2">No college ID found in your profile.</div>
              )}
            </div>
          )}

          {!isLoading && !collegeData && !error && !user?.college_id && (
            <div className="bg-yellow-100 text-yellow-800 p-4 rounded">
              No college ID found in your profile. Please contact your
              administrator.
            </div>
          )}

          {collegeData && collegeData.length > 0 && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {DISPLAY_FIELDS.map((field) => (
                      <TableHead key={field}>
                        {FIELD_LABELS[field] || field}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {collegeData.map((record, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {DISPLAY_FIELDS.map((field) => (
                        <TableCell key={field}>
                          {field === "fine_amount"
                            ? `₹${record[field] || "0"}`
                            : String(record[field] || "")}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {collegeData && collegeData.length === 0 && (
            <div className="text-center py-4">
              No library books found for this college ID.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
