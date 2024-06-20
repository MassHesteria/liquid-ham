import { getHostName } from "./frames";

export async function generateMetadata() {
  const postUrl = getHostName() + '/frames'
  const imageUrl = getHostName() + '/outro.png'
  if (process.env['VERCEL_URL']) {
    const vars = ['VERCEL_URL', 'VERCEL_BRANCH_URL', 'VERCEL_PROJECT_PRODUCTION_URL']
    console.log('')
    vars.forEach(p => console.log(p, process.env[p]))
    vars.map(p => 'NEXT_PUBLIC_' + p).forEach(p => console.log(p, process.env[p]))
    console.log('')
  }
  return {
    title: "Daily $HAM Stats",
    description: "Daily $HAM Stats in a frame",
    openGraph: {
      title: "Daily $HAM Stats",
      images: [imageUrl],
    },
    other: {
      "fc:frame": "vNext",
      "fc:frame:image": imageUrl,
      "fc:frame:post_url": postUrl,
      "fc:frame:image:aspect_ratio": "1.91:1",
      "fc:frame:button:1": "Open Ham Stats Frame",
      "fc:frame:button:1:action": "link",
      "fc:frame:button:1:target": 'https://warpcast.com/nikolaiii/0xf51d0528',
      /*"hey:portal": "vLatest",
      "hey:portal:image": imageUrl,
      "hey:portal:post_url": postUrl,
      "hey:portal:button:1": "SHARE",
      "hey:portal:button:1:type": "link",
      "hey:portal:button:1:target": HOST,
      "hey:portal:button:2": "POST",
      "hey:portal:button:2:type": "submit",*/
    },

  };

}

export default async function Page() {
  return (
    <div className="pl-4 pt-4">
      <center>
      <h1 className="pb-2 text-4xl">Liquid $HAM Stats <span className="text-2xl">by MassHesteria</span></h1>
      <div>
        <a className="text-red-600 text-2xl no-underline hover:underline pr-8" href="https://github.com/masshesteria/liquid-ham">Source code</a>
        {/*<a className="text-purple-600 text-2xl no-underline hover:underline" href="https://warpcast.com/masshesteria/0xec2772dc">Original cast</a>*/}
      </div>
      {/*<img className="mt-4 border border-black" style={{ maxWidth: '80%' }} alt="Daily $HAM Stats" src="/page?u=masshesteria&a=220&b=219"></img>*/}
      </center>
    </div>
  )
}
