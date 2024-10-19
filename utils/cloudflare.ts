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

export const removeDNSRecordInCloudflareZone = async (recordId: string | null) => {
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
