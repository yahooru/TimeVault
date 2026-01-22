import { PinataSDK } from "pinata";

let pinataInstance: PinataSDK | null = null;

export function getPinata(): PinataSDK {
  if (!pinataInstance) {
    pinataInstance = new PinataSDK({
      pinataJwt: process.env.PINATA_JWT!,
      pinataGateway: process.env.NEXT_PUBLIC_PINATA_GATEWAY!,
    });
  }
  return pinataInstance;
}

export interface UploadResult {
  cid: string;
  url: string;
}

export async function uploadToIPFS(content: string | File): Promise<UploadResult> {
  const pinata = getPinata();
  
  if (typeof content === "string") {
    const blob = new Blob([content], { type: "text/plain" });
    const file = new File([blob], "vault-content.txt", { type: "text/plain" });
    const upload = await pinata.upload.public.file(file);
    const url = await pinata.gateways.public.convert(upload.cid);
    return { cid: upload.cid, url };
  }
  
  const upload = await pinata.upload.public.file(content);
  const url = await pinata.gateways.public.convert(upload.cid);
  return { cid: upload.cid, url };
}

export async function getFromIPFS(cid: string): Promise<string> {
  const pinata = getPinata();
  const url = await pinata.gateways.public.convert(cid);
  const response = await fetch(url);
  return response.text();
}
