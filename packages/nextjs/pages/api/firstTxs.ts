import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

type ResponseData = [
  {
    blockNum: any;
    hash: any;
  },
];

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  const txs = await fetchFirstTxs(req.query.from as string);
  res.status(200).json(txs);
}

async function fetchFirstTxs(from: string): Promise<[{ blockNum: any; hash: any }]> {
  const res = await axios.post("https://eth-mainnet.g.alchemy.com/v2/" + process.env.NEXT_PUBLIC_ALCHEMY_API_KEY, {
    id: 1,
    jsonrpc: "2.0",
    method: "alchemy_getAssetTransfers",
    params: [
      {
        fromBlock: "0x0",
        toBlock: "latest",
        category: ["external"],
        order: "asc",
        withMetadata: true,
        excludeZeroValue: false,
        maxCount: "0x14",
        fromAddress: from,
      },
    ],
  });

  const txs = res.data.result.transfers.map((transfer: { blockNum: any; hash: any }) => {
    return { blockNum: Number(transfer.blockNum), hash: transfer.hash };
  });

  return txs;
}
