/* eslint-disable react/jsx-key */
import { Button } from "frames.js/next";
import { frames, getHostName } from "../frames";
import { AllowedFrameButtonItems } from "frames.js/types";

type UserData = {
  fid: number;
  name: string;
  addresses: string[];
}

type LiquidHamData = {
  balance: number;
  sent: number;
  recv: number;
}

const getShareLink = (fid: number|null) => {
  let baseRoute = getHostName() + `?ts=${Date.now()}`;
  if (fid != null) {
    baseRoute += `&fid=${fid}`
  }
  const shareLink =
    `https://warpcast.com/~/compose?text=${encodeURIComponent(
      "Liquid $HAM Stats in a frame!"
    )}` +
    "&embeds[]=" +
    encodeURIComponent(baseRoute);
  return shareLink;
}

const getData = async (users: any[]|null): Promise<UserData|null> => {
  if (users && users.length > 0) {
    //console.log(users[0].verified_addresses.eth_addresses)
    return {
      fid: users[0].fid,
      name: users[0].username,
      addresses: users[0].verified_addresses.eth_addresses
    }
  }

  return null
}

const getDataFromFID = async (fid: number): Promise<UserData|null> => {
  const url = `https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}&viewer_fid=3`;
  const options = {
    method: 'GET',
    headers: {accept: 'application/json', api_key: 'NEYNAR_API_DOCS'}
  };

  const res = await fetch(url, options)
  const json = await res.json()
  return getData(json.users)
}

const getDataFromName = async (name: string): Promise<UserData|null> => {
  const url = `https://api.neynar.com/v2/farcaster/user/search?q=${name}&viewer_fid=3&limit=1`;
  const options = {
    method: 'GET',
    headers: {accept: 'application/json', api_key: 'NEYNAR_API_DOCS'}
  };

  const res = await fetch(url, options)
  const json = await res.json()
  return getData(json.result.users)
}

const getStats = async (addr: string): Promise<LiquidHamData> => {
  return {
    balance: 14,
    sent: 15,
    recv: 29
  }
}

const handleRequest = frames(async (ctx: any) => {
  const timestamp = `${Date.now()}`;
  const baseRoute = getHostName() + "/frames?ts=" + timestamp;
  const message = ctx?.message
  let data: UserData|null = null

  //console.log(message)

  if (ctx.searchParams?.fid) {
    data = await getDataFromFID(ctx.searchParams.fid)
  } else if (message !== undefined) {
    if (message.inputText) {
      const text: string = message.inputText
      data = await getDataFromName(text.replace('@', ''))
    } else if (message.requesterUserData !== undefined) {
      data = {
        fid: message.requesterFid,
        name: message.requesterUserData.username,
        addresses: message.requesterVerifiedAddresses
      }
    }
  }

  if (data === null) {
    return {
      image: (
        <div
          tw="flex flex-col w-full h-full justify-center items-center"
          style={{ backgroundColor: "#282a36" }}
        >
          <div tw="flex">
            <span tw="text-7xl" style={{ color: "#f8f8f2" }}>
              Liquid $HAM Stats
            </span>
          </div>
          <div tw="flex">
            <span style={{ color: "#ffb86c" }}>by @masshesteria</span>
          </div>
        </div>
      ),
      imageOptions: {
        aspectRatio: "1.91:1",
      },
      textInput: " Search by username",
      buttons: [
        <Button action="post" target={baseRoute}>Mine/🔎</Button>,
        <Button action="link" target = {getShareLink(null)}>Share</Button>
      ],
    };
  }

  const addresses = data.addresses
  console.log(addresses)

  const rollup: LiquidHamData = {
    balance: 0,
    sent: 0,
    recv: 0
  }
  
  for (let i = 0; i < addresses.length; i++) {
    const stats = await getStats(addresses[i])
    rollup.balance += stats.balance
    rollup.sent += stats.sent
    rollup.recv += stats.recv
  }

  return {
    image: (
      <div
        tw="flex flex-col w-full h-full justify-center items-center"
        style={{ backgroundColor: "#282a36" }}
      >
        <div tw="flex flex-col justify-center w-full items-center h-1/2">
          <span tw="text-7xl" style={{ color: "#ffb86c" }}>
            Liquid $HAM Stats
          </span>
          <span tw="text-7xl" style={{ color: "#ff79c6" }}>
            @{data.name}
          </span>
        </div>
        <div tw="flex flex-col h-1/2">
          <div tw="flex flex-row w-full">
            <span tw="text-6xl w-1/3 pl-16" style={{ color: "#50fa7b" }}>
              Balance
            </span>
            <span tw="text-6xl w-1/3 items-center justify-center" style={{ color: "#8be9fd" }}>
              {rollup.balance}
            </span>
          </div>
          <div tw="flex flex-row w-full">
            <span tw="text-6xl w-1/3 pl-16" style={{ color: "#50fa7b" }}>
              Sent
            </span>
            <span tw="text-6xl w-1/3 items-center justify-center" style={{ color: "#8be9fd" }}>
              {rollup.sent}
            </span>
          </div>
          <div tw="flex flex-row w-full">
            <span tw="text-6xl w-1/3 pl-16" style={{ color: "#50fa7b" }}>
              Received
            </span>
            <span tw="text-6xl w-1/3 items-center justify-center" style={{ color: "#8be9fd" }}>
              {rollup.recv}
            </span>
          </div>
        </div>
      </div>
    ),
    imageOptions: {
      aspectRatio: '1.91:1'
    },
    textInput: " Search by username",
    buttons: [
      <Button action="post" target={baseRoute}>Mine/🔎</Button>,
      <Button action="link" target = {getShareLink(data.fid)}>Share</Button>
    ]
  }
})

export const GET = handleRequest;
export const POST = handleRequest;