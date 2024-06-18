/* eslint-disable react/jsx-key */
import { Button } from "frames.js/next";
import { frames, getHostName } from "../frames";
//import { AllowedFrameButtonItems } from "frames.js/types";

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

const getShareLink = (fid: number|null, name: string|null) => {
  let baseRoute = getHostName() + `?ts=${Date.now()}`;
  if (fid != null) {
    baseRoute += `&fid=${fid}&name=${name}`
  }
  const shareLink =
    `https://warpcast.com/~/compose?text=${encodeURIComponent(
      "Daily $HAM Stats in a frame!"
    )}` +
    "&embeds[]=" +
    encodeURIComponent(baseRoute);
  return shareLink;
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
  const json = await res.json()
  //console.log(json)
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
}

const getDataFromName = async (name: string): Promise<UserData|null> => {
  //console.log('getDataFromName')
  const url = `https://api.neynar.com/v2/farcaster/user/search?q=${name}&viewer_fid=3&limit=1`;
  const options = {
    method: 'GET',
    headers: {accept: 'application/json', api_key: 'NEYNAR_API_DOCS'}
  };

  const res = await fetch(url, options)
  const json = await res.json()
  if (json && json.result && json.result.users && json.result.users.length > 0) {
    const data = await getDataFromFID(json.result.users[0].fid)
    if (data) {
      data.name = json.result.users[0].username
    }
    return data
  }
  return null
}

const handleRequest = frames(async (ctx: any) => {
  const timestamp = `${Date.now()}`;
  const baseRoute = getHostName() + "/v2?ts=" + timestamp;
  const message = ctx?.message
  let data: UserData|null = null

  //console.log(message)

  if (ctx.searchParams?.fid && ctx.searchParams?.name) {
    data = await getDataFromFID(ctx.searchParams.fid)
    if (data !== null) {
      data.name = ctx.searchParams.name
    }
  } else if (message !== undefined) {
    if (message.inputText) {
      const text: string = message.inputText
      data = await getDataFromName(text.replace('@', ''))
    } else if (message.requesterUserData !== undefined) {
      data = await getDataFromFID(message.requesterFid)
      if (data !== null) {
        data.name = message.requesterUserData.username
      }
    }
  }

  if (data === null) {
    return {
      image: getHostName() + `/intro`,
      imageOptions: {
        aspectRatio: "1.91:1",
      },
      textInput: " Search by username",
      buttons: [
        <Button action="post" target={baseRoute}>Mine/🔎</Button>,
        <Button action="link" target = {getShareLink(null, null)}>Share</Button>
      ],
    };
  }

  return {
    image: (
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
          <span tw="flex justify-end pt-24 pr-4 pb-2" style={{ color: "#6272a4"}}>
            by @masshesteria
          </span>
        </div>
      </div>
    ),
    imageOptions: {
      aspectRatio: '1.91:1',
      /*height: 400,
      width: 764*/
    },
    textInput: " Search by username",
    buttons: [
      <Button action="post" target={baseRoute}>Mine/🔎</Button>,
      <Button action="link" target = {getShareLink(data.fid, data.name)}>Share</Button>
    ]
  }
})

export const GET = handleRequest;
export const POST = handleRequest;