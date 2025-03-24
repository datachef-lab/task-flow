import { NextRequest, NextResponse } from "next/server";
import { deleteCronjob, getCronjobById, updateCronjob } from "@/lib/services/cronjob-service.server";

// ✅ Get Cronjob by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const cronjob = await getCronjobById(Number(params.id));
        if (!cronjob) {
            return NextResponse.json({ error: "Cronjob not found" }, { status: 404 });
        }
        return NextResponse.json(cronjob);
    } catch (error) {
        console.error("Error fetching cronjob:", error);
        return NextResponse.json({ error: "Failed to fetch cronjob" }, { status: 500 });
    }
}

// ✅ Update Cronjob by ID
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const data = await request.json();
        const updatedCronjob = await updateCronjob(Number(params.id), data);

        if (!updatedCronjob) {
            return NextResponse.json({ error: "Cronjob not found" }, { status: 404 });
        }

        return NextResponse.json(updatedCronjob);
    } catch (error) {
        console.error("Error updating cronjob:", error);
        return NextResponse.json({ error: "Failed to update cronjob" }, { status: 500 });
    }
}

// ✅ Delete Cronjob by ID
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const deletedCronjob = await deleteCronjob(Number(params.id));

        if (!deletedCronjob) {
            return NextResponse.json({ error: "Cronjob not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Cronjob deleted successfully" });
    } catch (error) {
        console.error("Error deleting cronjob:", error);
        return NextResponse.json({ error: "Failed to delete cronjob" }, { status: 500 });
    }
}
