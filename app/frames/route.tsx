/* eslint-disable react/jsx-key */
import { Button } from "frames.js/next";
import { frames, getHostName } from "../frames";
//import { AllowedFrameButtonItems } from "frames.js/types";
import { Web3 } from 'web3';
import { FID_Storage_ABI } from "./fid-storage-abi";

type UserData = {
  fid: number;
  name: string;
  address: string;
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
      address: await getAddressFromFID(users[0].fid)
    }
  }

  return null
}

const getAddressFromFID = async (fid: number): Promise<string> => {
  //console.log('getAddressFromFID')
  const web3 = new Web3('https://rpc.ham.fun');
  const contractAddress = '0xCca2e3e860079998622868843c9A00dEbb591D30';
  const contract = new web3.eth.Contract(FID_Storage_ABI, contractAddress);
  return await contract.methods.fids(fid).call()
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
  //console.log('getDataFromName')
  const url = `https://api.neynar.com/v2/farcaster/user/search?q=${name}&viewer_fid=3&limit=1`;
  const options = {
    method: 'GET',
    headers: {accept: 'application/json', api_key: 'NEYNAR_API_DOCS'}
  };

  const res = await fetch(url, options)
  const json = await res.json()
  return getData(json.result.users)
}

function objectToQueryString(params: any) {
  return Object.entries(params)
    .map(
      ([key, value]: [any, any]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
    )
    .join("&");
}

async function fetchPaginatedData(
  apiUrl: string,
  addr: string,
  onSuccess: (sent: boolean, count: number) => void,
  onError: (err: any) => void
) {
  let hasNextPage = true;
  let nextPageParams = {};
  const hash = '0x7a6B7Ad9259c57fD599E1162c6375B7eA63864e4'

  while (hasNextPage) {
    // Construct the URL with the next page parameters
    const queryString = Object.keys(nextPageParams).length
      ? `&${objectToQueryString(nextPageParams)}`
      : `&token=${hash}`;
    const url = `${apiUrl}${queryString}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      //console.log(data)
      if (data.items) {
        //console.log(data.items)

        data.items.forEach((item: any) => {
          const { decimals, value } = item.total
          const pnt = value.length - decimals
          const num = parseFloat(`${value.slice(0, pnt)}.${value.slice(pnt)}`)
          if (item.from.hash.toLowerCase() === addr.toLowerCase()) {
            onSuccess(true, num)
            //console.log('sent',num)
          } else if (item.to.hash.toLowerCase() == addr.toLowerCase()) {
            onSuccess(false, num)
            //console.log('recv',num)
          }
        });
      }

      // Check if there are more pages to fetch
      if (data.next_page_params) {
        nextPageParams = data.next_page_params;
      } else {
        hasNextPage = false;
      }
    } catch (error) {
      onError(`Error fetching data: ${error}`);
      hasNextPage = false; // Exit loop on error
    }
  }
}
const getStats = async (addr: string): Promise<LiquidHamData> => {
  const route = `https://ham.calderaexplorer.xyz/api/v2/addresses/${addr}/token-transfers?type=ERC-20&filter=to%20%7C%20from`
  let rollup: LiquidHamData = {
    balance: 0,
    sent: 0,
    recv: 0,
  }
  await fetchPaginatedData(
    route,
    addr,
    (sent: boolean, count: number) => {
      if (sent) {
        rollup.balance -= count
        rollup.sent += count
      } else {
        rollup.balance += count
        rollup.recv += count
      }
    },
    (err: any) => console.error(err)
  );
  //console.log(rollup)
  return rollup
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
        address: await getAddressFromFID(message.requesterFid)
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

  const rollup = await getStats(data.address)
  //console.log(rollup)

  return {
    image: (
      <div
        tw="flex flex-col w-full h-full justify-center items-center"
        style={{ backgroundColor: "#282a36" }}
      >
        <div tw="flex flex-col justify-center w-full items-center h-2/5 pt-8">
          <span tw="text-7xl" style={{ color: "#ffb86c" }}>
            Liquid $HAM Stats
          </span>
          <span tw="text-7xl" style={{ color: "#ff79c6" }}>
            @{data.name}
          </span>
        </div>
        <div tw="flex flex-col h-1/3 pt-8">
          <div tw="flex flex-row w-full">
            <span tw="text-6xl w-1/3 pl-20" style={{ color: "#50fa7b" }}>
              Balance
            </span>
            <span tw="text-6xl w-1/3 items-center justify-center" style={{ color: "#8be9fd" }}>
              {rollup.balance === 0 ? '0' : rollup.balance.toFixed(3)}
            </span>
          </div>
          <div tw="flex flex-row w-full">
            <span tw="text-6xl w-1/3 pl-20" style={{ color: "#50fa7b" }}>
              Sent
            </span>
            <span tw="text-6xl w-1/3 items-center justify-center" style={{ color: "#8be9fd" }}>
              {rollup.sent === 0 ? '0' : rollup.sent.toFixed(3)}
            </span>
          </div>
          <div tw="flex flex-row w-full">
            <span tw="text-6xl w-1/3 pl-20" style={{ color: "#50fa7b" }}>
              Received
            </span>
            <span tw="text-6xl w-1/3 items-center justify-center" style={{ color: "#8be9fd" }}>
              {rollup.recv === 0 ? '0' : rollup.recv.toFixed(3)}
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