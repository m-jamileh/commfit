"use client";
import { useMutation } from "@tanstack/react-query";
import { useCommfitClient } from "../lib/commfit-client";

async function hmacSha256Hex(key: string, data: string): Promise<string> {
  const keyBytes = new TextEncoder().encode(key);
  const dataBytes = new TextEncoder().encode(data);
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", cryptoKey, dataBytes);
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function useFireEsignWebhook() {
  const client = useCommfitClient();
  return useMutation({
    mutationFn: async ({
      envelopeId,
      signerName,
      webhookSecret,
    }: {
      envelopeId: string;
      signerName: string;
      webhookSecret?: string;
    }) => {
      const secret =
        webhookSecret ??
        (typeof process !== "undefined"
          ? (process.env.NEXT_PUBLIC_ESIGN_WEBHOOK_SECRET ?? "mock-secret")
          : "mock-secret");
      const payload = {
        envelopeId,
        event: "envelope.completed",
        signedAt: new Date().toISOString(),
        signerName,
      };
      const payloadStr = JSON.stringify(payload);
      const signature = await hmacSha256Hex(secret, payloadStr);
      return client.webhooks.esign(payload, signature);
    },
  });
}
