export interface URLCheckResult {
  status: "Clean" | "Warning" | "Malicious"
  reason: string
}

const MALICIOUS_URLS = [
  "malware-download.com",
  "phishing-site.net",
  "ransomware-hub.org",
  "trojan-distribution.io",
  "credential-stealer.cc",
  "botnet-command.xyz",
  "keylogger-deposit.tk",
  "fake-bank.site",
  "stolen-data-marketplace.dark",
  "exploit-kit-hosting.biz",
  "malicious-url.com",
  "virus-distribution.net",
  "spyware-central.org",
  "fraudulent-store.shop",
  "fake-crypto-exchange.pro",
  "illegal-marketplace.onion",
  "backdoor-access.io",
  "worm-spreading.net",
  "adware-installer.com",
  "rootkit-payload.site",
]

const SUSPICIOUS_URLS = [
  "wrerjkhjk.com",
  "xyzabc123.net",
  "random-chars-site.org",
  "shortened-url-redirect.info",
  "free-gift-cards.shop",
  "verify-account-now.site",
  "update-browser-plugin.xyz",
  "click-here-to-win.net",
  "limited-time-offer.biz",
  "confirm-identity-now.pro",
  "urgent-action-required.io",
  "suspicious-domain-123.tk",
  "file-sharing-malware.net",
  "gaming-server-proxy.org",
  "bit.ly",
  "tinyurl.com",
  "short.link",
  "url.co",
  "mysterious-redirect.site",
  "unknown-shortener.net",
  "premium-download-free.biz",
  "stream-movie-illegal.org",
  "free-software-cracked.com",
]

const FAMOUS_DOMAINS = [
  "google.com",
  "amazon.com",
  "microsoft.com",
  "apple.com",
  "facebook.com",
  "meta.com",
  "twitter.com",
  "linkedin.com",
  "github.com",
  "netflix.com",
  "wikipedia.org",
  "youtube.com",
  "instagram.com",
  "reddit.com",
  "stackoverflow.com",
  "medium.com",
  "wordpress.com",
  "shopify.com",
  "stripe.com",
  "paypal.com",
  "gmail.com",
  "outlook.com",
  "slack.com",
  "zoom.us",
  "discord.com",
  "telegram.org",
  "whatsapp.com",
  "pinterest.com",
  "tiktok.com",
  "quora.com",
]

function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname || url
  } catch {
    return url.replace(/^https?:\/\//, "").split("/")[0]
  }
}

function checkDomainReputation(domain: string): URLCheckResult {
  const lowerDomain = domain.toLowerCase()

  // Check if it's a known malicious domain
  if (MALICIOUS_URLS.some((mal) => lowerDomain.includes(mal))) {
    return {
      status: "Malicious",
      reason: "This domain is known to host malware, phishing, or other malicious content. DO NOT VISIT.",
    }
  }

  // Check if it's a famous/legitimate domain
  if (FAMOUS_DOMAINS.some((famous) => lowerDomain.includes(famous))) {
    return {
      status: "Clean",
      reason: "This is a legitimate and well-known domain. Safe to visit.",
    }
  }

  // Check for suspicious characteristics
  const suspiciousIndicators = [
    /^xn--/, // IDN homograph attacks
    /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/, // IP address instead of domain
    /[0-9]{10,}/, // Lots of numbers
    /bit\.ly|tinyurl|short\.link|url\.co/, // URL shorteners
    /tmp|test|demo|fake|scam|phish|fraud/, // Suspicious keywords
  ]

  if (suspiciousIndicators.some((indicator) => indicator.test(lowerDomain))) {
    return {
      status: "Warning",
      reason:
        "This URL has suspicious characteristics. The domain may not be legitimate or could be masking its true nature.",
    }
  }

  // Check if it's in suspicious list
  if (SUSPICIOUS_URLS.some((sus) => lowerDomain.includes(sus))) {
    return {
      status: "Warning",
      reason: "This domain exhibits suspicious patterns. Proceed with caution and verify the URL before interacting.",
    }
  }

  // Check domain structure
  const parts = lowerDomain.split(".")
  if (parts.length < 2) {
    return {
      status: "Warning",
      reason: "URL structure appears invalid or suspicious. Verify the URL format.",
    }
  }

  // Default: Unknown domain - suspicious
  return {
    status: "Warning",
    reason: "This is an unknown domain. Always verify URLs before clicking, especially from untrusted sources.",
  }
}

export function checkUrlStatus(url: string): URLCheckResult {
  try {
    // Extract domain from URL
    const domain = extractDomain(url)

    // Check reputation
    return checkDomainReputation(domain)
  } catch (error) {
    return {
      status: "Warning",
      reason: "Unable to parse URL. The format may be incorrect or malformed.",
    }
  }
}
