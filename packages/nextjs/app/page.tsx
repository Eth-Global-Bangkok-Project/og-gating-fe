"use client";

import { useState } from "react";
import Image from "next/image";
import { IDKitWidget, ISuccessResult } from "@worldcoin/idkit";
import axios from "axios";
import type { NextPage } from "next";
import { AwesomeButton } from "react-awesome-button";
import "react-awesome-button/dist/styles.css";
import { decodeAbiParameters, parseAbiParameters } from "viem";
import { useAccount, useAccountEffect, useWriteContract } from "wagmi";
import { Address } from "~~/components/scaffold-eth";
import { useTransactor } from "~~/hooks/scaffold-eth";

const CONTRACT_ABI = [
  {
    type: "function",
    name: "verifyAndClaim",
    inputs: [
      { name: "signal", type: "address", internalType: "address" },
      { name: "root", type: "uint256", internalType: "uint256" },
      {
        name: "nullifierHash",
        type: "uint256",
        internalType: "uint256",
      },
      { name: "proof", type: "uint256[8]", internalType: "uint256[8]" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
];

const Home: NextPage = () => {
  const [ogScore, setOgScore] = useState(0);
  const [ogScoreAddress, setOgScoreAddress] = useState<string | undefined>("");
  const { address: connectedAddress } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const transactor = useTransactor();

  const submitTx = async (proof: ISuccessResult) => {
    return await writeContractAsync({
      address: "0xf606B1Dca16B4Af1EB9457e44Fea6Ae6e56fC4AF",
      account: connectedAddress,
      abi: CONTRACT_ABI,
      functionName: "verifyAndClaim",
      args: [
        connectedAddress,
        BigInt(proof!.merkle_root),
        BigInt(proof!.nullifier_hash),
        decodeAbiParameters(parseAbiParameters("uint256[8]"), proof!.proof as `0x${string}`)[0],
      ],
    });
  };

  async function submitUsingTransactor(proof: ISuccessResult) {
    await transactor(() => submitTx(proof));
  }

  useAccountEffect({
    onConnect(data) {
      console.log("here");
      updateOgScore(data.address);
    },
  });

  const updateOgScore = async (newAddress: string) => {
    setOgScoreAddress(newAddress);
    if (!newAddress) return;
    console.log("Running request");
    const res = await axios.get("/api/ogScore", {
      params: { from: newAddress },
    });
    setOgScore(res.data.ogScore);
  };

  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5">
          <h1 className="text-center">
            <span className="block text-2xl mb-2">Welcome To</span>
            <span className="block text-4xl font-bold">OG Gating</span>
          </h1>
          <div className="flex justify-center items-center space-x-2 flex-col sm:flex-row">
            <p className="my-2 font-medium">Connected Address:</p>
            <Address address={connectedAddress} />
          </div>
          <p className="flex justify-center items-center">
            {!!ogScoreAddress && <>OG Score: {parseFloat(ogScore.toString()).toFixed(2)}</>}
          </p>
          <p className="flex justify-center items-center">
            {!!connectedAddress && (
              <IDKitWidget
                app_id="app_staging_3d02714c53dfc77067b01db15846f729" // must be an app set to on-chain in Developer Portal
                action="claim-nft"
                signal={connectedAddress} // proof will only verify if the signal is unchanged, this prevents tampering
                onSuccess={submitUsingTransactor} // use onSuccess to call your smart contract
              >
                {({ open }) => (
                  <AwesomeButton type="primary" onPress={open}>
                    Verify With World ID
                  </AwesomeButton>
                )}
              </IDKitWidget>
            )}
          </p>
        </div>
        <Image src="/theOg.png" width={500} height={500} alt="Picture of the author" />
      </div>
    </>
  );
};

export default Home;
