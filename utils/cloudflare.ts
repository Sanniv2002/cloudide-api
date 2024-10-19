/**
 * Utility functions for interacting with the Cloudflare DNS management API.
 *
 * This file provides functions to manage DNS records on Cloudflare, such as
 * adding or deleting records programmatically. It utilizes the Cloudflare
 * API, making HTTP requests with authentication headers.
 *
 * Functions in this utility file include:
 * - `addCloudflareDNSRecord`: Adds a new DNS record to Cloudflare for the specified zone.
 * - `deleteCloudflareDNSRecord`: Deletes an existing DNS record from Cloudflare for the specified zone.
 *
 * @requires node-fetch - Used for making API calls to Cloudflare.
 *
 * @param {string} name - The DNS name (e.g., subdomain or domain).
 * @param {string} content - The content for the DNS record (e.g., IP address for A records).
 * @param {string} zoneId - The ID of the Cloudflare zone (domain) where the DNS record is being managed.
 * @param {string} authKey - The API key used to authenticate requests to Cloudflare.
 */


export const createDNSRecordInCloudflareZone = async (
  type: string,
  name: string,
  content: string,
  comment: string = "example dns record",
  is_proxied: boolean = true,
  ttl: number = 3600
) => {
  const myHeaders = new Headers();

  const zoneId = process.env.ZONE_ID;

  myHeaders.append("X-Auth-Key", process.env.X_Auth_Key as string);
  myHeaders.append("X-Auth-Email", process.env.X_Auth_Email as string);
  myHeaders.append("Content-Type", "application/json");

  const raw = JSON.stringify({
    type: type,
    name: name,
    content: content,
    comment: comment,
    proxied: is_proxied,
    ttl: ttl,
  });

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow" as RequestRedirect,
  };

  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`,
      requestOptions
    );

    if (!response.ok) {
      throw new Error(`Cloudflare API error: ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error adding DNS record:", error);
    throw error;
  }
};

export const removeDNSRecordInCloudflareZone = async (
  recordId: string | null
) => {
  const myHeaders = new Headers();

  const zoneId = process.env.ZONE_ID;

  myHeaders.append("X-Auth-Email", process.env.X_Auth_Email as string);
  myHeaders.append("X-Auth-Key", process.env.X_Auth_Key as string);
  myHeaders.append("Content-Type", "application/json");

  const requestOptions = {
    method: "DELETE",
    headers: myHeaders,
    redirect: "follow" as RequestRedirect,
  };

  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records/${recordId}`,
      requestOptions
    );

    if (!response.ok) {
      throw new Error(`Cloudflare API error: ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error deleting DNS record:", error);
    throw error;
  }
};
