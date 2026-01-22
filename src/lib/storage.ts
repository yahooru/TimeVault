export async function uploadToIPFS(content: object): Promise<string> {
  try {
    const response = await fetch("/api/ipfs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to upload to IPFS");
    }

    const data = await response.json();
    return data.ipfsHash;
  } catch (error) {
    console.error("IPFS Upload Error:", error);
    throw new Error("Failed to upload to IPFS");
  }
}

export async function fetchFromIPFS(ipfsHash: string): Promise<unknown> {
  try {
    const gateway = process.env.NEXT_PUBLIC_PINATA_GATEWAY || "https://gateway.pinata.cloud/ipfs/";
    const response = await fetch(`${gateway}${ipfsHash}`);
    
    if (!response.ok) {
      throw new Error("Failed to fetch from IPFS");
    }

    return await response.json();
  } catch (error) {
    console.error("IPFS Fetch Error:", error);
    throw new Error("Failed to fetch from IPFS");
  }
}

export async function encryptContent(content: string, secretKey: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const key = encoder.encode(secretKey.slice(0, 32).padEnd(32, '0'));
  
  const encrypted = data.map((byte, i) => byte ^ key[i % key.length]);
  return Buffer.from(encrypted).toString('base64');
}

export async function decryptContent(encryptedBase64: string, secretKey: string): Promise<string> {
  const encrypted = Buffer.from(encryptedBase64, 'base64');
  const key = new TextEncoder().encode(secretKey.slice(0, 32).padEnd(32, '0'));
  
  const decrypted = encrypted.map((byte, i) => byte ^ key[i % key.length]);
  return new TextDecoder().decode(new Uint8Array(decrypted));
}

export async function enhanceWithAI(content: string): Promise<string> {
  try {
    const response = await fetch("/api/enhance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      throw new Error("AI enhancement failed");
    }

    const data = await response.json();
    return data.enhanced || content;
  } catch (error) {
    console.error("AI Enhancement Error:", error);
    return content;
  }
}
