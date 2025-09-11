"use client";

import { useEffect, useState } from "react";
import Web3 from "web3";
import { useRouter } from "next/navigation";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "./contractConfig";

export default function Home() {
  const router = useRouter();
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [amount, setAmount] = useState("");
  const [mounted, setMounted] = useState(false); // ✅ track client mount

  // Auto-connect if authorized
  useEffect(() => {
    setMounted(true); // ✅ mark as mounted on client
    if (typeof window !== "undefined" && window.ethereum) {
      const w3 = new Web3(window.ethereum);
      setWeb3(w3);
      const c = new w3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
      setContract(c);

      window.ethereum.request({ method: "eth_accounts" }).then((accounts) => {
        if (accounts.length) setAccount(accounts[0]);
      });

      window.ethereum.on("accountsChanged", (accounts) => {
        setAccount(accounts[0] || null);
      });

      window.ethereum.on("chainChanged", () => window.location.reload());
    }
  }, []);

  // Connect wallet manually
  const connectWallet = async () => {
    if (!window.ethereum) return alert("Install MetaMask!");
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setAccount(accounts[0]);
    } catch (err) {
      console.error("Wallet connection failed:", err);
      alert("Connection rejected!");
    }
  };

  // Donate
  const donate = async () => {
    if (!contract || !account) return alert("Connect wallet first!");
    if (!amount || Number(amount) <= 0) return alert("Enter valid amount!");
    try {
      await contract.methods.donate().send({
        from: account,
        value: Web3.utils.toWei(amount.toString(), "ether"),
      });
      alert("Donation sent!");
      router.push("/dashboard");
    } catch (err) {
      console.error("Donation failed:", err);
      alert("Donation failed (check MetaMask and network)");
    }
  };

  // ✅ Prevent hydration mismatch by rendering nothing on server
  if (!mounted) return null;

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#ff9966,#ff5e62,#ffc371)", fontFamily: "'Poppins', sans-serif", padding: 24 }}>
      <div style={{ maxWidth: 560, width: "100%", borderRadius: 20, padding: 30, background: "rgba(255,255,255,0.08)", boxShadow: "0 12px 40px rgba(0,0,0,0.25)", color: "#fff", textAlign: "center" }}>
        <h1 style={{ fontSize: 40, margin: 0, color: "#FFF3B0", textShadow: "0 8px 20px rgba(0,0,0,0.3)" }}>DoNoGo ✨</h1>
        <p style={{ marginTop: 6, marginBottom: 18, fontSize: 16 }}>Secure • Transparent • Impactful donations — blockchain powered</p>

        {account ? (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 14, marginBottom: 8 }}>Connected: <b>{account.slice(0,6)}...{account.slice(-4)}</b></div>
            <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 12 }}>
              <input type="number" placeholder="Amount (ETH)" value={amount} onChange={(e) => setAmount(e.target.value)} style={{ padding: "10px 14px", borderRadius: 10, border: "none", width: 180, fontWeight: 600, textAlign: "center" }}/>
              <button onClick={donate} style={{ background: "linear-gradient(90deg,#ff5e62,#ff9966)", border: "none", padding: "10px 18px", borderRadius: 10, color: "#fff", fontWeight: 700, cursor: "pointer", boxShadow: "0 8px 20px rgba(0,0,0,0.2)" }}>🚀 Donate</button>
            </div>
            <button onClick={() => router.push("/dashboard")} style={{ marginTop: 8, background: "transparent", border: "1px solid rgba(255,255,255,0.12)", padding: "8px 14px", borderRadius: 8, color: "#fff", cursor: "pointer" }}>View Dashboard</button>
          </div>
        ) : (
          <button onClick={connectWallet} style={{ marginTop: 8, background: "linear-gradient(90deg,#ffd200,#ff6b6b)", border: "none", padding: "12px 26px", borderRadius: 12, color: "#111", fontWeight: 800, fontSize: 16, cursor: "pointer" }}>🔗 Connect Wallet</button>
        )}

        <div style={{ marginTop: 22, color: "rgba(255,255,255,0.9)", fontSize: 13 }}>
          <div>Demo: donate on same network as contract.</div>
          <div style={{ marginTop: 8 }}>
            <a style={{ color: "#fff", textDecoration: "underline", cursor: "pointer" }} onClick={() => router.push("/donors")}>See donors sample →</a>
          </div>
        </div>
      </div>
    </div>
  );
}
