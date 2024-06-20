import { farcasterHubContext } from "frames.js/middleware";
import { createFrames } from "frames.js/next";
import { headers } from "next/headers";

//-------------------------------------------------------------------
// Utility functions
//-------------------------------------------------------------------

export const getHostName = (): string => {
  if (process.env['HOST']) {
    return process.env['HOST']
  }
  if (process.env['VERCEL_URL']) {
    return 'https://' + process.env['VERCEL_URL']
  }
  return 'http://localhost:3000'
}

//-------------------------------------------------------------------
// Frame setup
//-------------------------------------------------------------------
 
export const frames = createFrames({
  basePath: "/v2",
  imagesRoute: "/",
  middleware: [farcasterHubContext(
    process.env['VERCEL_REGION'] ? {} : {
    hubHttpUrl: 'http://localhost:3010/hub'
  })],
});