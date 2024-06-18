import { getHostName } from "@/app/frames";
import { ImageResponse } from "next/og";
import { NextRequest, NextResponse } from "next/server";

type UserData = {
  fid: number;
  name: string;
  balance: number;
  score: number;
  allowance: number;
  tippedToday: number;
  rank: number;
  percentTipped: number;
  //{"balance":{"ham":"2326556590021767983356"},"hamScore":3.70514821317099,"todaysAllocation":"1196556590021767983356","totalTippedToday":"1103000000000000000000","rank":284,"percentTipped":0.9218118133300607}
}

const toNum = (value: string) => {
  if (value === null || value.length <= 0) {
    return 0
  }
  const decimals = 18
  const pnt = value.length - decimals
  return parseFloat(`${value.slice(0, pnt)}.${value.slice(pnt)}`)
}

const getDataFromFID = async (fid: number): Promise<UserData|null> => {
  const url = `https://farcaster.dep.dev/ham/user/${fid}`;
  const options = {
    method: 'GET',
  };

  const res = await fetch(url, options)
  if (res.status !== 200) {
    return null
  }
  try {
    const json = await res.json()
    return {
      fid,
      name: '',
      balance: toNum(json.balance.ham),
      score: parseFloat(json.hamScore),
      allowance: toNum(json.todaysAllocation),
      tippedToday: toNum(json.totalTippedToday),
      rank: parseInt(json.rank),
      percentTipped: parseFloat(json.percentTipped)
    }
  } catch (ex) {
    return null
  }
}

type InputParams = {
  fid: number
}

export async function GET(req: NextRequest,
  { params }: { params: InputParams }) {
  let data: UserData|null = null

  data = await getDataFromFID(params.fid)
  if (data !== null) {
    data.name = req.nextUrl.searchParams.get('name') || ''
  }

  if (data === null) {
    return NextResponse.redirect(getHostName() + '/intro')
  }

  const res = new ImageResponse(
      <div
        tw="flex flex-col w-full h-full justify-center items-center"
        style={{ backgroundColor: "#282a36" }}
      >
        <div tw="flex flex-col justify-center w-full items-center h-2/5 pt-8">
          <span tw="text-6xl" style={{ color: "#ffb86c" }}>
            Daily $HAM Stats
          </span>
          <span tw="text-6xl" style={{ color: "#ff79c6" }}>
            @{data.name}
          </span>
        </div>
        <div tw="flex flex-col h-1/3 pt-8 text-5xl">
          <div tw="flex flex-row w-full pb-4">
            <span tw="text-6xl w-1/2 pl-20" style={{ color: "#ffb86c" }}>
              BALANCE
            </span>
            <span tw="text-6xl w-1/3 items-center justify-center" style={{ color: "#f8f8f2" }}>
              {data.balance === 0 ? '0' : data.balance.toFixed(1)}
            </span>
          </div>
          <div tw="flex flex-row w-full">
            <span tw="w-1/2 pl-20" style={{ color: "#50fa7b" }}>
              Today&apos;s Allowance
            </span>
            <span tw="w-1/3 items-center justify-center" style={{ color: "#8be9fd" }}>
              {data.allowance === 0 ? '0' : data.allowance.toFixed(1)}
            </span>
          </div>
          <div tw="flex flex-row w-full">
            <span tw="w-1/2 pl-20" style={{ color: "#50fa7b" }}>
              Tipped Today
            </span>
            <span tw="w-1/3 items-center justify-center" style={{ color: "#8be9fd" }}>
              {data.tippedToday === 0 ? '0' : data.tippedToday.toFixed(1)}
            </span>
          </div>
          <div tw="flex flex-row w-full">
            <span tw="w-1/2 pl-20" style={{ color: "#50fa7b" }}>
              Percent Tipped
            </span>
            <span tw="w-1/3 items-center justify-center" style={{ color: "#8be9fd" }}>
              {data.percentTipped === 0 ? '0.000' : (data.percentTipped * 100.0).toFixed(1)}%
            </span>
          </div>
        </div>
        <div tw="flex flex-row w-full">
          <span tw="text-3xl justify-start pt-26 pl-4 w-3/4" style={{ color: "#ff5555" }}>
          {/*data.address*/}
          </span>
          <span tw="text-3xl flex justify-end pt-24 pr-4 pb-2" style={{ color: "#6272a4"}}>
            by @masshesteria
          </span>
        </div>
      </div>
  )
  res.headers.set('Cache-Control', 'public, max-age=180, s-maxage=180, stale-while-revalidate=30');
  return res
}