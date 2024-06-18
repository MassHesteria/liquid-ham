/* eslint-disable react/jsx-key */
import { Button } from "frames.js/next";
import { frames, getHostName } from "../frames";
//import { AllowedFrameButtonItems } from "frames.js/types";

type UserData = {
  fid: number;
  name: string;
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

const getDataFromFID = async (fid: number): Promise<UserData|null> => {
  const url = `https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}&viewer_fid=3`;
  const options = {
    method: 'GET',
    headers: {accept: 'application/json', api_key: 'NEYNAR_API_DOCS'}
  };

  const res = await fetch(url, options)
  const json = await res.json()
  if (json && json.users && json.users .length > 0) {
    return {
      fid: json.result.users[0].fid,
      name: json.result.users[0].username
    }
  }
  return null
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
    return {
      fid: json.result.users[0].fid,
      name: json.result.users[0].username
    }
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
  } else if (message !== undefined) {
    if (message.inputText) {
      const text: string = message.inputText
      data = await getDataFromName(text.replace('@', ''))
    } else if (message.requesterUserData !== undefined) {
      data = {
        fid:  message.requesterFid,
        name: message.requesterUserData.username
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
    image: getHostName() + `/stats/${data.fid}?name=${encodeURIComponent(data.name)}`,
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