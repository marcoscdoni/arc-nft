import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import { Web3Provider } from "@/providers/web3-provider";
import { ToastProvider } from "@/components/toast-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ArcNFT - NFT Marketplace on Arc Layer 1",
  description: "Create, buy, and sell NFTs on the Arc blockchain",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className="dark">
      <body className={`${inter.className} bg-black text-white antialiased`}>
        <Web3Provider>
          {children}
          <ToastProvider />
        </Web3Provider>
      </body>
    </html>
  );
}


