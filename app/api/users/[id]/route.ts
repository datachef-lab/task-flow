import { getUserById } from "@/lib/services/user-service";
import { NextResponse } from "next/server";

export async function GET(request: Request,
    { params }: { params: { id: string } }) {
    try {
        const id = await params.id;
        console.log(id);
        const result = await getUserById(Number(id));
        return NextResponse.json(result);
    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json(
            { error: "Failed to fetch users" },
            { status: 500 }
        );
    }
}