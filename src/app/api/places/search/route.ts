import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { mutationRateLimit } from "@/lib/rate-limit"
import { checkRateLimit } from "@/lib/utils/check-rate-limit"

type KakaoPlace = {
  id: string
  place_name: string
  category_name: string
  category_group_code: string
  category_group_name: string
  phone: string
  address_name: string
  road_address_name: string
  x: string
  y: string
  place_url: string
  distance: string
}

type KakaoSearchResponse = {
  meta: {
    total_count: number
    pageable_count: number
    is_end: boolean
  }
  documents: KakaoPlace[]
}

export async function GET(request: NextRequest) {
  const rateLimitResponse = await checkRateLimit(request, mutationRateLimit)
  if (rateLimitResponse) return rateLimitResponse

  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "인증이 필요합니다", code: "UNAUTHORIZED" },
      { status: 401 }
    )
  }

  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get("query")
  const priorityCategory = searchParams.get("priorityCategory")

  if (!query || query.trim().length < 2) {
    return NextResponse.json({ places: [] })
  }

  const kakaoApiKey = process.env.KAKAO_REST_API_KEY

  if (!kakaoApiKey) {
    return NextResponse.json(
      { error: "Kakao API key is not configured", code: "INTERNAL_ERROR" },
      { status: 500 }
    )
  }

  try {
    const url = new URL("https://dapi.kakao.com/v2/local/search/keyword.json")
    url.searchParams.set("query", query)
    url.searchParams.set("size", "10")

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `KakaoAK ${kakaoApiKey}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Kakao API error:", errorText)
      return NextResponse.json(
        { error: "장소 검색에 실패했습니다", code: "INTERNAL_ERROR" },
        { status: 502 }
      )
    }

    const data: KakaoSearchResponse = await response.json()

    const places = data.documents.map((doc) => ({
      id: doc.id,
      name: doc.place_name,
      address: doc.road_address_name || doc.address_name,
      category: doc.category_group_name || doc.category_name.split(" > ").pop(),
      phone: doc.phone,
      x: doc.x,
      y: doc.y,
      url: doc.place_url,
    }))

    if (priorityCategory) {
      places.sort((a, b) => {
        const aMatch = a.category === priorityCategory ? 1 : 0
        const bMatch = b.category === priorityCategory ? 1 : 0
        return bMatch - aMatch
      })
    }

    return NextResponse.json({ places })
  } catch (error) {
    console.error("Places search error:", error)
    return NextResponse.json(
      { error: "장소 검색에 실패했습니다", code: "INTERNAL_ERROR" },
      { status: 500 }
    )
  }
}
