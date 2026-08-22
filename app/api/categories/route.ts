import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { status: "active" },
      orderBy: { nameTR: "asc" },
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("GET Categories API Error:", error);
    return NextResponse.json({ error: "Kategoriler getirilemedi." }, { status: 500 });
  }
}
