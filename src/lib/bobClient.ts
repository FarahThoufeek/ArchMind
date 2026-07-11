import OpenAI from "openai";

/**
 * Returns an OpenAI SDK client pointed at Bob's inference endpoint.
 * Bob requires:
 *   - Authorization: apikey <key>   (not "Bearer")
 *   - x-instance-id / x-team-id    routing headers
 * The OpenAI SDK lets us inject these via defaultHeaders + baseURL.
 */
export function getBobClient(): OpenAI {
  const apiKey      = process.env.BOB_API_KEY      ?? "";
  const instanceId  = process.env.BOB_INSTANCE_ID  ?? "";
  const teamId      = process.env.BOB_TEAM_ID       ?? "";
  const baseURL     = process.env.BOB_BASE_URL      ?? "https://api.us-east.bob.ibm.com/inference/v1";

  return new OpenAI({
    apiKey,                    // stored as the key; header is overridden below
    baseURL,
    defaultHeaders: {
      Authorization:    `apikey ${apiKey}`,
      "x-instance-id":  instanceId,
      "x-team-id":      teamId,
    },
  });
}
