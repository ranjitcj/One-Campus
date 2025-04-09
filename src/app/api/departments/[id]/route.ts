import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import DepartmentModel from "@/model/Department";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const department = await DepartmentModel.findById(params.id).populate("academicYear", "name");

    if (!department) {
      return NextResponse.json(
        { error: "Department not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(department);
  } catch (error) {
    console.error("Error fetching department:", error);
    return NextResponse.json(
      { error: "Failed to fetch department" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const body = await request.json();

    const department = await DepartmentModel.findByIdAndUpdate(
      params.id,
      { $set: body },
      { new: true }
    ).populate("academicYear", "name");

    if (!department) {
      return NextResponse.json(
        { error: "Department not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(department);
  } catch (error) {
    console.error("Error updating department:", error);
    return NextResponse.json(
      { error: "Failed to update department" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const department = await DepartmentModel.findByIdAndDelete(params.id);

    if (!department) {
      return NextResponse.json(
        { error: "Department not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Department deleted successfully" });
  } catch (error) {
    console.error("Error deleting department:", error);
    return NextResponse.json(
      { error: "Failed to delete department" },
      { status: 500 }
    );
  }
} 