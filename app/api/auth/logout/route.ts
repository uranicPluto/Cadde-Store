import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete("cadde_store_session");
  return response;
}
