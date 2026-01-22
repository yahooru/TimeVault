import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content } = body;

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    // Prioritize Server-side JWT for security
    const jwt = process.env.PINATA_JWT || process.env.NEXT_PUBLIC_PINATA_JWT_TOKEN;
    
    if (!jwt) {
      console.error("Missing PINATA_JWT environment variable");
      return NextResponse.json({ error: "IPFS service not configured" }, { status: 500 });
    }

    const response = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwt}`,
      },
      body: JSON.stringify({
        pinataContent: content,
        pinataMetadata: {
          name: `timevault_${Date.now()}`,
          keyvalues: {
            app: "TimeVault",
            type: content.type || "unknown"
          }
        },
        pinataOptions: {
          cidVersion: 1
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Pinata API Error:", errorData);
      return NextResponse.json({ 
        error: "Failed to upload to IPFS", 
        details: errorData 
      }, { status: response.status });
    }

    const data = await response.json();
    
    return NextResponse.json({ 
      success: true, 
      ipfsHash: data.IpfsHash,
      pinSize: data.PinSize,
      timestamp: data.Timestamp,
      gateway: `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`
    });
  } catch (error) {
    console.error("IPFS Upload Exception:", error);
    return NextResponse.json({ 
      error: "Internal server error during IPFS upload",
      message: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
