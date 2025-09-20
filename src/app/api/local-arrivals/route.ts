import { NextRequest, NextResponse } from "next/server"

import { getOnlinePieces } from "@/lib/fashionPieces"
import type { GenderTarget } from "@/types/arrivals"

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const genderParam = url.searchParams.get("gender")?.toLowerCase()
  const genderFilter = ["male", "female", "unisex"].includes(genderParam ?? "")
    ? (genderParam as GenderTarget)
    : undefined

  const pieces = await getOnlinePieces(genderFilter, undefined)

  return NextResponse.json({ arrivals: pieces })
}
