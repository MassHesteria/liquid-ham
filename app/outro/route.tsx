import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
 
export async function GET(_: NextRequest) {
  return new ImageResponse(
    (
      <div
        tw="flex flex-col w-full h-full justify-center items-center"
        style={{ backgroundColor: "#282a36" }}
      >
        <div tw="flex">
          <span tw="w-4/5 text-3xl" style={{ color: "#f8f8f2" }}>
            Thanks for using this frame to track your Daily $HAM Stats!
          </span>
        </div>
        <div tw="flex">
          <span tw="w-4/5 text-3xl pt-6" style={{ color: "#f8f8f2" }}>
            Unfortunately it has been brought offline to save hosting costs.
          </span>
        </div>
        <div tw="flex">
          <span tw="w-4/5 text-3xl pt-6" style={{ color: "#f8f8f2" }}>
            Click the button to check out the excellent Ham Stats frame made by @nikolaiii
          </span>
        </div>
        <div tw="flex w-full justify-end text-3xl pr-27 pt-2" style={{ color: "#ffb86c" }}>
          - mass
        </div>
      </div>
    ),
    {
      width: 764,
      height: 400,
    },
  );
}
