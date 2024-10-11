import React, { useState } from "react";
import {
  createWalletClient,
  createPublicClient,
  custom,
  getContract,
  Address,
} from "viem";

import { Eip1193Provider, BrowserProvider } from "ethers";
import SignatureVerifierMetadata from "./SignatureVerifier.json";
import { kakarotSepolia } from "viem/chains";

declare global {
  interface Window {
    ethereum: Eip1193Provider & BrowserProvider;
  }
}

const Home = () => {
  const [contractAddress, setContractAddress] = useState(
    "0xeE2D7486bcE9821DaBB7878840E1ab2cBaaB4379"
  );
  const [message, setMessage] = useState("meow");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string|null>(null);

  const handleSignAndVerify = async () => {
    setLoading(true);

    // Connect
    const publicClient = createPublicClient({
      chain: kakarotSepolia,
      transport: custom(window.ethereum!),
    });
    const walletClient = createWalletClient({
      chain: kakarotSepolia,
      transport: custom(window.ethereum!),
    });
    await walletClient.switchChain({ id: kakarotSepolia.id });
    const contract = getContract({
      address: contractAddress as Address,
      abi: SignatureVerifierMetadata.abi,
      client: { public: publicClient, wallet: walletClient },
    }) as any;

    // Sign
    const [address] = await walletClient.requestAddresses();
    const messageHash = await contract.read.getMessageHash([message])
    const signature = await walletClient.signMessage({
      account: address,
      message: { raw: messageHash },
    });

    // Verify
    const verifyResult = await contract.read.verify([
      address,
      message,
      signature, 
    ]) as boolean
    console.log(verifyResult);
    setResult(String(verifyResult))
    setLoading(false);
  };
  return (
    <div>
      <h1>Kakarot Dapp Example</h1>

      <div>
        <p>
          Twitter:{" "}
          <a
            href="https://twitter.com/murmurlu"
            target="_blank"
            rel="noopener noreferrer"
          >
            @murmurlu
          </a>
        </p>
        <p>
          Github Repo:{" "}
          <a
            href="https://github.com/ChiHaoLu/kakarot-dapp"
            target="_blank"
            rel="noopener noreferrer"
          >
            kakarot-dapp
          </a>
        </p>
      </div>

      <h2>1. Fill Up the field</h2>
      <div>
        <label>
          Contract Address:
          <input
            type="text"
            value={contractAddress}
            onChange={(e) => setContractAddress(e.target.value)}
            required
          />
        </label>
      </div>
      <div>
        <label>
          Signing Message:
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />
        </label>
      </div>

      <h2>2. Try It!</h2>
      <button onClick={handleSignAndVerify} disabled={loading}>
        {loading ? "Loading..." : "Try sign and verify"}
      </button>
      {result && (
        <p>Verify result: {result}</p>
      )}
    </div>
  );
};

export default Home;
