export type Guide = {
  slug: string
  title: string
  description: string
  readTime: string
  level: string
  sections: {
    heading: string
    paragraphs: string[]
  }[]
}

export const guides: Guide[] = [
  {
    slug: "phishing-for-beginners",
    title: "What Is Phishing? A Beginner's Guide",
    description:
      "Learn how phishing works, the warning signs to look for, and what to do when a message feels suspicious.",
    readTime: "6 min read",
    level: "Beginner",
    sections: [
      {
        heading: "What is phishing?",
        paragraphs: [
          "Phishing is a type of online scam where someone pretends to be a trusted person, company, bank, school, or service. Their goal is usually to make you reveal a password, OTP, bank detail, or other private information.",
          "A phishing message may arrive by email, SMS, WhatsApp, social media, or a fake website. It often creates fear or urgency, such as saying that your account will be blocked unless you act immediately.",
        ],
      },
      {
        heading: "Common warning signs",
        paragraphs: [
          "Check the sender address carefully. A message may look like it came from a real company, but the email address or website domain can contain small spelling changes.",
          "Be careful with messages that demand urgent action, request passwords or OTPs, promise unexpected rewards, or contain suspicious links and attachments.",
        ],
      },
      {
        heading: "How to stay safe",
        paragraphs: [
          "Do not open unknown attachments or enter passwords after clicking a message link. Instead, open the official app or type the official website address yourself.",
          "Use a password manager and enable two-factor authentication. If you think you entered details on a fake site, change your password immediately and contact the real service provider.",
        ],
      },
    ],
  },
  {
    slug: "password-security-basics",
    title: "Password Security: Simple Habits That Protect Accounts",
    description:
      "Understand strong passwords, password managers, reused passwords, and why two-factor authentication matters.",
    readTime: "7 min read",
    level: "Beginner",
    sections: [
      {
        heading: "Why reused passwords are risky",
        paragraphs: [
          "Using one password for many websites is dangerous. If one website suffers a data breach, attackers may try the same email and password on banking, social-media, shopping, and work accounts.",
          "This is called credential stuffing. Even a strong password becomes risky when it is reused across multiple services.",
        ],
      },
      {
        heading: "What makes a password strong?",
        paragraphs: [
          "A strong password is long, unique, and difficult to guess. A long passphrase made from unrelated words is often easier to remember and safer than a short password with many symbols.",
          "Avoid names, birthdays, mobile numbers, favourite teams, and predictable patterns such as Password123 or YourName@123.",
        ],
      },
      {
        heading: "Use a password manager and 2FA",
        paragraphs: [
          "A password manager can generate and save a different strong password for every account. You only need to remember the password for the manager itself.",
          "Two-factor authentication adds another protection step. Even if someone learns your password, they should not be able to sign in without your authenticator code, security key, or approval.",
        ],
      },
    ],
  },
  {
    slug: "understanding-two-factor-authentication",
    title: "Understanding Two-Factor Authentication",
    description:
      "A simple explanation of 2FA, authenticator apps, backup codes, and safer account recovery.",
    readTime: "5 min read",
    level: "Beginner",
    sections: [
      {
        heading: "What does 2FA mean?",
        paragraphs: [
          "Two-factor authentication, also called 2FA, asks for more than just a password when you sign in. It combines something you know, such as your password, with something you have, such as a phone or security key.",
          "This makes account theft harder because a stolen password alone is not enough to complete the sign-in process.",
        ],
      },
      {
        heading: "Different types of 2FA",
        paragraphs: [
          "Authenticator apps are usually safer than SMS codes because phone numbers can sometimes be transferred or attacked through SIM swapping.",
          "Security keys offer strong protection for important accounts. Email codes can help, but they are only as secure as the email account receiving them.",
        ],
      },
      {
        heading: "Keep backup codes safely",
        paragraphs: [
          "Many services give recovery or backup codes when you enable 2FA. Save them in a secure place, such as a password manager or an offline location you control.",
          "Do not send backup codes through chat, email, or social media. Anyone with those codes may be able to access your account.",
        ],
      },
    ],
  },
  {
    slug: "spotting-suspicious-urls",
    title: "How to Spot a Suspicious Website URL",
    description:
      "Learn how web addresses work and how small domain differences can reveal risky or fake websites.",
    readTime: "6 min read",
    level: "Beginner",
    sections: [
      {
        heading: "Read the real domain name",
        paragraphs: [
          "The most important part of a website address is usually the domain near the end. In shop.example.com, the main domain is example.com. In example-login.security-check.com, the main domain is security-check.com, not example.com.",
          "Attackers often add trusted brand names as subdomains or inside long URLs to make a fake website look real.",
        ],
      },
      {
        heading: "Look for spelling tricks",
        paragraphs: [
          "Be careful with small spelling changes, extra hyphens, unusual endings, and lookalike characters. For example, a fake address may use paypaI.com with a capital i instead of paypal.com.",
          "A padlock icon or HTTPS connection does not prove that a website is safe. HTTPS only means the connection is encrypted; scam sites can also use it.",
        ],
      },
      {
        heading: "What to do before signing in",
        paragraphs: [
          "If a link comes from an unexpected message, do not sign in through that link. Open the official app or type the trusted website address manually.",
          "If you are unsure, search for the company independently or ask its official support channel before entering information.",
        ],
      },
    ],
  },
  {
    slug: "ethical-osint-for-beginners",
    title: "What Is OSINT? Ethical Rules for Beginners",
    description:
      "Understand open-source intelligence, its legitimate uses, and the boundaries that protect privacy and safety.",
    readTime: "7 min read",
    level: "Beginner",
    sections: [
      {
        heading: "What is OSINT?",
        paragraphs: [
          "OSINT means Open Source Intelligence. It is information collected from publicly available sources, such as official websites, public reports, company pages, public records, and news articles.",
          "Security teams may use OSINT to understand their public exposure, investigate phishing campaigns, identify fake brand accounts, or improve awareness.",
        ],
      },
      {
        heading: "Public does not mean permissionless",
        paragraphs: [
          "Even if information is publicly visible, collecting, sharing, or combining it can still affect a person's privacy and safety. Responsible use matters.",
          "Do not use OSINT to stalk, harass, dox, impersonate, shame, or target another person. Never attempt to access private accounts, bypass controls, or collect information without a legitimate reason.",
        ],
      },
      {
        heading: "Practice safely",
        paragraphs: [
          "Beginners should practise using their own public accounts, test domains they own, training examples, or intentionally designed labs. Always keep written permission when testing an organisation's systems.",
          "SecurityX OSINT features are educational simulations. They should be used to learn concepts, not as proof of a real breach or professional investigation result.",
        ],
      },
    ],
  },
]

export function getGuide(slug: string) {
  return guides.find((guide) => guide.slug === slug)
}