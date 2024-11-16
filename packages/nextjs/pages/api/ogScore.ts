import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

type ResponseData = {
  ogScore: number;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  const deployedUrl =
    process.env.VERCEL_URL == "localhost:3000"
      ? `http://${process.env.VERCEL_URL}`
      : `https://${process.env.VERCEL_URL}`;

  const txs = (
    await axios.get(deployedUrl + "/api/firstTxs", {
      params: {
        from: req.query.from,
      },
    })
  ).data;

  const benchmarkBlock = 18405586;
  let ogScore = 0;
  for (const tx of txs) {
    ogScore += benchmarkBlock - Number(tx.blockNum);
  }

  const maxScore = (benchmarkBlock - 7500000) * 20;
  const score = Math.min((100 / maxScore) * ogScore, 100);

  res.status(200).json({ ogScore: score });
}
