// CloudFront invalidation with clock-offset correction
// Local clock is ~309 seconds ahead of AWS (from observed error messages)
import { CloudFrontClient, CreateInvalidationCommand } from "@aws-sdk/client-cloudfront";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

// Read AWS credentials from environment / aws config
const DISTRIBUTION_ID = "E1K6OG7GOLIRJ2";

// Offset: local clock is ahead of AWS by ~316 seconds (observed 2026-06-03)
// systemClockOffset = serverTime - localTime (negative = local is ahead)
const CLOCK_OFFSET_MS = -320000;

const client = new CloudFrontClient({
  region: "us-east-1",
  systemClockOffset: CLOCK_OFFSET_MS,
});

const command = new CreateInvalidationCommand({
  DistributionId: DISTRIBUTION_ID,
  InvalidationBatch: {
    CallerReference: String(Date.now()),
    Paths: {
      Quantity: 1,
      Items: ["/*"],
    },
  },
});

try {
  const result = await client.send(command);
  console.log("✅ CloudFront invalidation created!");
  console.log("   ID:", result.Invalidation.Id);
  console.log("   Status:", result.Invalidation.Status);
  console.log("   CreateTime:", result.Invalidation.CreateTime);
} catch (err) {
  console.error("❌ Error:", err.message);
}
