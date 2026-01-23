type Question = {
  id: number
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
  difficulty: "Simple" | "Intermediate" | "Advanced"
}

type QuizInfo = {
  title: string
  questions: Question[]
}

export const quizData: Record<string, QuizInfo> = {
  q1: {
    title: "Cybersecurity Fundamentals",
    questions: [
      // Simple Questions
      {
        id: 1,
        question: "What does CIA stand for in information security?",
        options: [
          "Central Intelligence Agency",
          "Confidentiality, Integrity, Availability",
          "Computer Information Access",
          "Certified Information Analyst",
        ],
        correctAnswer: 1,
        explanation:
          "CIA refers to the three pillars of information security: Confidentiality (data privacy), Integrity (data accuracy), and Availability (data accessibility).",
        difficulty: "Simple",
      },
      {
        id: 2,
        question: "Which type of attack involves overwhelming a system with traffic?",
        options: ["Phishing", "SQL Injection", "DDoS Attack", "Man-in-the-Middle"],
        correctAnswer: 2,
        explanation:
          "A Distributed Denial of Service (DDoS) attack floods a system with traffic to make it unavailable to legitimate users.",
        difficulty: "Simple",
      },
      {
        id: 3,
        question: "What is the primary purpose of encryption?",
        options: [
          "Speed up data transfer",
          "Protect data confidentiality",
          "Increase storage capacity",
          "Improve network performance",
        ],
        correctAnswer: 1,
        explanation:
          "Encryption converts data into a coded format to protect its confidentiality, ensuring only authorized parties can read it.",
        difficulty: "Simple",
      },
      {
        id: 4,
        question: "Which of these is an example of two-factor authentication?",
        options: ["Password only", "Password + Security Question", "Password + SMS Code", "Username + Password"],
        correctAnswer: 2,
        explanation:
          "Two-factor authentication requires two different types of verification. Password (something you know) + SMS code (something you have) is a common example.",
        difficulty: "Simple",
      },
      // Intermediate Questions
      {
        id: 5,
        question: "What does a firewall primarily do?",
        options: ["Encrypt data", "Filter network traffic", "Delete viruses", "Speed up internet connection"],
        correctAnswer: 1,
        explanation:
          "A firewall monitors and filters incoming and outgoing network traffic based on predetermined security rules.",
        difficulty: "Intermediate",
      },
      {
        id: 6,
        question: "What is the difference between symmetric and asymmetric encryption?",
        options: [
          "Symmetric is faster; asymmetric is more secure",
          "Symmetric uses one key; asymmetric uses two keys",
          "Asymmetric is only for documents",
          "Symmetric cannot be broken",
        ],
        correctAnswer: 1,
        explanation:
          "Symmetric encryption uses one shared key for both encryption and decryption, while asymmetric uses a public key for encryption and a private key for decryption.",
        difficulty: "Intermediate",
      },
      {
        id: 7,
        question: "What is a brute force attack?",
        options: [
          "Using physical force to access servers",
          "Trying all possible password combinations",
          "Flooding a network with data",
          "Stealing credentials from employees",
        ],
        correctAnswer: 1,
        explanation:
          "A brute force attack systematically tries all possible password combinations until the correct one is found.",
        difficulty: "Intermediate",
      },
      {
        id: 8,
        question: "What is multi-factor authentication (MFA)?",
        options: [
          "Using multiple passwords",
          "Using multiple verification methods",
          "Using multiple encryption algorithms",
          "Changing passwords multiple times",
        ],
        correctAnswer: 1,
        explanation:
          "MFA requires users to provide multiple forms of verification (password, biometric, token) before granting access.",
        difficulty: "Intermediate",
      },
      // Advanced Questions
      {
        id: 9,
        question: "What is a side-channel attack?",
        options: [
          "Attacking through unused network ports",
          "Exploiting physical implementation details of cryptographic systems",
          "Attacking through backup channels",
          "Social engineering attacks through alternate contact methods",
        ],
        correctAnswer: 1,
        explanation:
          "Side-channel attacks exploit information leakage from physical implementation (timing, power consumption, electromagnetic radiation) rather than algorithmic weaknesses.",
        difficulty: "Advanced",
      },
      {
        id: 10,
        question: "In PKI, what is the role of a Certificate Authority?",
        options: [
          "Encrypting all network traffic",
          "Verifying identities and issuing digital certificates",
          "Managing firewalls",
          "Monitoring network intrusions",
        ],
        correctAnswer: 1,
        explanation:
          "A Certificate Authority (CA) is a trusted entity that verifies the identity of individuals/organizations and issues digital certificates to establish trusted communications.",
        difficulty: "Advanced",
      },
      {
        id: 11,
        question: "What is a Rainbow Table attack?",
        options: [
          "Attacking using colorful visual patterns",
          "Using pre-computed hash chains to crack passwords",
          "Attacking multiple servers simultaneously",
          "Using light-based encryption breaking",
        ],
        correctAnswer: 1,
        explanation:
          "Rainbow tables are pre-computed tables of password hashes that attackers use to quickly reverse password hashes without having to compute hashes on the fly.",
        difficulty: "Advanced",
      },
      {
        id: 12,
        question: "What is the principle of least privilege?",
        options: [
          "Users should have minimum internet speed",
          "Users should have only the minimum permissions needed for their role",
          "Systems should use minimum encryption",
          "Networks should have the fewest devices possible",
        ],
        correctAnswer: 1,
        explanation:
          "The principle of least privilege ensures users and systems have only the minimum permissions necessary to perform their functions, reducing security risks.",
        difficulty: "Advanced",
      },
      {
        id: 13,
        question: "What is a logic bomb?",
        options: [
          "A bomb detection system",
          "Malicious code triggered by specific conditions",
          "A network security protocol",
          "A type of firewall rule",
        ],
        correctAnswer: 1,
        explanation:
          "A logic bomb is malicious code embedded in legitimate software that executes when specific conditions are met (date, event, etc.).",
        difficulty: "Advanced",
      },
      {
        id: 14,
        question: "What is a Faraday cage used for in security?",
        options: [
          "Blocking malware",
          "Protecting against electromagnetic eavesdropping",
          "Filtering network packets",
          "Encrypting wireless signals",
        ],
        correctAnswer: 1,
        explanation:
          "A Faraday cage is a shielded enclosure that blocks electromagnetic fields, used to protect sensitive equipment from side-channel attacks and eavesdropping.",
        difficulty: "Advanced",
      },
      {
        id: 15,
        question: "What is a covert channel in security?",
        options: [
          "A hidden communication method using legitimate system functions",
          "An encrypted messaging app",
          "A firewall bypass technique",
          "A type of VPN protocol",
        ],
        correctAnswer: 0,
        explanation:
          "A covert channel is a communication method that uses legitimate system functions or timing to transmit information without being detected by security mechanisms.",
        difficulty: "Advanced",
      },
    ],
  },
  q2: {
    title: "Network Security Protocols",
    questions: [
      // Simple Questions
      {
        id: 1,
        question: "Which protocol provides secure communication over a network?",
        options: ["HTTP", "FTP", "HTTPS", "SMTP"],
        correctAnswer: 2,
        explanation: "HTTPS (Hypertext Transfer Protocol Secure) uses SSL/TLS to encrypt data during transmission.",
        difficulty: "Simple",
      },
      {
        id: 2,
        question: "What port does HTTPS typically use?",
        options: ["80", "443", "8080", "22"],
        correctAnswer: 1,
        explanation: "HTTPS uses port 443 by default, while HTTP uses port 80.",
        difficulty: "Simple",
      },
      {
        id: 3,
        question: "What does VPN stand for?",
        options: [
          "Virtual Private Network",
          "Verified Public Network",
          "Visual Protocol Network",
          "Variable Password Node",
        ],
        correctAnswer: 0,
        explanation:
          "A Virtual Private Network creates an encrypted tunnel between your device and the internet, protecting your data and privacy.",
        difficulty: "Simple",
      },
      {
        id: 4,
        question: "What is the purpose of DNS?",
        options: [
          "Encrypt data",
          "Translate domain names to IP addresses",
          "Scan for viruses",
          "Block malicious websites",
        ],
        correctAnswer: 1,
        explanation:
          "DNS (Domain Name System) translates human-readable domain names (like google.com) into IP addresses that computers use.",
        difficulty: "Simple",
      },
      // Intermediate Questions
      {
        id: 5,
        question: "Which protocol is used for secure file transfer?",
        options: ["FTP", "SFTP", "HTTP", "SMTP"],
        correctAnswer: 1,
        explanation:
          "SFTP (SSH File Transfer Protocol) provides secure file transfer capabilities with encryption and authentication.",
        difficulty: "Intermediate",
      },
      {
        id: 6,
        question: "What does TLS stand for?",
        options: [
          "Transport Layer Security",
          "Transfer Limit Service",
          "Trusted Link System",
          "Terminal Level Security",
        ],
        correctAnswer: 0,
        explanation:
          "TLS (Transport Layer Security) is a cryptographic protocol that provides secure communication over networks, successor to SSL.",
        difficulty: "Intermediate",
      },
      {
        id: 7,
        question: "What is the purpose of IPSec?",
        options: [
          "Speed up internet",
          "Secure IP communication at network layer",
          "Filter network traffic",
          "Manage IP addresses",
        ],
        correctAnswer: 1,
        explanation:
          "IPSec is a suite of protocols that provides security at the network layer, encrypting and authenticating IP packets.",
        difficulty: "Intermediate",
      },
      {
        id: 8,
        question: "What is SSH used for?",
        options: [
          "Sending emails securely",
          "Secure remote shell access and command execution",
          "Securing HTTP traffic",
          "Creating virtual networks",
        ],
        correctAnswer: 1,
        explanation:
          "SSH (Secure Shell) provides secure remote access to systems, allowing encrypted command execution and file transfer.",
        difficulty: "Intermediate",
      },
      // Advanced Questions
      {
        id: 9,
        question: "What is the difference between SSL and TLS?",
        options: [
          "TLS is faster",
          "TLS is the newer, more secure version of SSL",
          "SSL is for emails, TLS is for web",
          "They are identical protocols",
        ],
        correctAnswer: 1,
        explanation:
          "TLS is the successor to SSL, offering improved security with better algorithms and key exchange mechanisms.",
        difficulty: "Advanced",
      },
      {
        id: 10,
        question: "What is DNS tunneling?",
        options: [
          "Using DNS to accelerate internet speed",
          "Encapsulating non-DNS traffic in DNS queries to bypass firewalls",
          "Creating secure DNS connections",
          "Encrypting DNS requests",
        ],
        correctAnswer: 1,
        explanation:
          "DNS tunneling is a technique to exfiltrate data or bypass security restrictions by hiding data in DNS queries and responses.",
        difficulty: "Advanced",
      },
      {
        id: 11,
        question: "What is a Man-in-the-Middle (MITM) attack?",
        options: [
          "Attacking the middle server in a network",
          "Intercepting and altering communications between two parties",
          "Injecting malware in the middle of downloads",
          "Positioning servers between firewalls",
        ],
        correctAnswer: 1,
        explanation:
          "A MITM attack intercepts communications between two parties, allowing the attacker to eavesdrop or modify data in transit.",
        difficulty: "Advanced",
      },
      {
        id: 12,
        question: "What is forward secrecy in TLS?",
        options: [
          "Using a firewall in front of servers",
          "Session keys are not compromised even if long-term keys are stolen",
          "Encrypting all future communications",
          "Using only future TLS versions",
        ],
        correctAnswer: 1,
        explanation:
          "Forward secrecy ensures that even if long-term keys are compromised, past session keys remain secure and cannot be decrypted.",
        difficulty: "Advanced",
      },
      {
        id: 13,
        question: "What is a DH (Diffie-Hellman) key exchange?",
        options: [
          "A way to verify identities",
          "A method for two parties to establish a shared secret over an insecure channel",
          "A encryption algorithm",
          "A protocol for file transfer",
        ],
        correctAnswer: 1,
        explanation:
          "Diffie-Hellman is a key exchange algorithm that allows two parties to establish a shared secret without pre-sharing keys.",
        difficulty: "Advanced",
      },
      {
        id: 14,
        question: "What is BGP hijacking?",
        options: [
          "Attacking border routers",
          "Falsely advertising IP address prefixes to redirect traffic",
          "Stealing BGP credentials",
          "Flooding BGP routers",
        ],
        correctAnswer: 1,
        explanation:
          "BGP hijacking occurs when an attacker announces false BGP routes to redirect traffic away from the legitimate path.",
        difficulty: "Advanced",
      },
      {
        id: 15,
        question: "What is DNSSEC?",
        options: [
          "Secure DNS servers",
          "DNS Security Extensions that digitally sign DNS responses",
          "DNS encryption protocol",
          "DNS firewall rules",
        ],
        correctAnswer: 1,
        explanation:
          "DNSSEC adds cryptographic signatures to DNS responses to prevent DNS spoofing and tampering attacks.",
        difficulty: "Advanced",
      },
    ],
  },
  q3: {
    title: "Advanced Threat Detection",
    questions: [
      // Simple Questions
      {
        id: 1,
        question: "What is a zero-day vulnerability?",
        options: [
          "A bug that takes zero days to fix",
          "A vulnerability unknown to the software vendor",
          "A vulnerability with no exploits",
          "A vulnerability found on day zero of release",
        ],
        correctAnswer: 1,
        explanation:
          "A zero-day vulnerability is a security flaw unknown to the vendor, meaning there are zero days to fix it before it can be exploited.",
        difficulty: "Simple",
      },
      {
        id: 2,
        question: "What does APT stand for in cybersecurity?",
        options: [
          "Advanced Password Technology",
          "Automated Protection Tool",
          "Advanced Persistent Threat",
          "Active Protocol Transfer",
        ],
        correctAnswer: 2,
        explanation:
          "An Advanced Persistent Threat is a prolonged and targeted cyberattack where an intruder gains and maintains unauthorized access.",
        difficulty: "Simple",
      },
      {
        id: 3,
        question: "What is the primary goal of threat hunting?",
        options: [
          "Patching vulnerabilities",
          "Proactively searching for threats",
          "Installing antivirus software",
          "Blocking all incoming traffic",
        ],
        correctAnswer: 1,
        explanation:
          "Threat hunting is the proactive practice of searching through networks to detect and isolate advanced threats that evade existing security solutions.",
        difficulty: "Simple",
      },
      {
        id: 4,
        question: "What is a SIEM system used for?",
        options: [
          "Software installation",
          "Security Information and Event Management",
          "System Internet Extension Module",
          "Secure Internet Email Management",
        ],
        correctAnswer: 1,
        explanation:
          "SIEM systems collect and analyze security data from across an organization to detect threats and manage security incidents.",
        difficulty: "Simple",
      },
      // Intermediate Questions
      {
        id: 5,
        question: "What is the purpose of sandboxing?",
        options: [
          "To store backup data",
          "To test potentially malicious code safely",
          "To speed up applications",
          "To encrypt files",
        ],
        correctAnswer: 1,
        explanation:
          "Sandboxing creates an isolated environment to safely execute and analyze suspicious code without risking the main system.",
        difficulty: "Intermediate",
      },
      {
        id: 6,
        question: "What is IDS (Intrusion Detection System)?",
        options: [
          "A system to prevent all attacks",
          "A system that monitors for suspicious activity and alerts administrators",
          "A system that blocks malware",
          "A system that encrypts traffic",
        ],
        correctAnswer: 1,
        explanation:
          "An IDS monitors network traffic and system activity to detect potential security threats and intrusions, then alerts administrators.",
        difficulty: "Intermediate",
      },
      {
        id: 7,
        question: "What is the difference between IDS and IPS?",
        options: [
          "IDS is wireless; IPS is wired",
          "IDS detects; IPS detects and prevents attacks",
          "IPS is cheaper than IDS",
          "They are the same system",
        ],
        correctAnswer: 1,
        explanation:
          "IDS (Intrusion Detection System) detects threats, while IPS (Intrusion Prevention System) detects and automatically blocks threats.",
        difficulty: "Intermediate",
      },
      {
        id: 8,
        question: "What is behavioral analysis in threat detection?",
        options: [
          "Analyzing attacker psychology",
          "Monitoring system behavior to detect anomalies",
          "Analyzing user behavior patterns manually",
          "Studying past attacks",
        ],
        correctAnswer: 1,
        explanation:
          "Behavioral analysis monitors system and network behavior to identify anomalies that may indicate a security threat.",
        difficulty: "Intermediate",
      },
      // Advanced Questions
      {
        id: 9,
        question: "What is a Kill Chain in cybersecurity?",
        options: [
          "A weapon used in cyber attacks",
          "The stages of an attack from initial compromise to goal achievement",
          "A network of compromised systems",
          "A type of ransomware",
        ],
        correctAnswer: 1,
        explanation:
          "The Kill Chain represents the stages of an attack: reconnaissance, weaponization, delivery, exploitation, installation, command & control, and actions.",
        difficulty: "Advanced",
      },
      {
        id: 10,
        question: "What is MITRE ATT&CK?",
        options: [
          "An attack technique to assault servers",
          "A framework of adversary tactics and techniques",
          "A penetration testing tool",
          "An antivirus software",
        ],
        correctAnswer: 1,
        explanation:
          "MITRE ATT&CK is a comprehensive framework of adversary tactics and techniques based on real-world observations.",
        difficulty: "Advanced",
      },
      {
        id: 11,
        question: "What is a rootkit?",
        options: [
          "A toolkit for root vegetables",
          "Malware that provides administrative access and hides its presence",
          "A password recovery tool",
          "A system configuration tool",
        ],
        correctAnswer: 1,
        explanation:
          "A rootkit is sophisticated malware that grants administrative access while remaining hidden from detection mechanisms.",
        difficulty: "Advanced",
      },
      {
        id: 12,
        question: "What is polymorphic malware?",
        options: [
          "Malware that affects many systems",
          "Malware that changes its code to evade detection",
          "Malware with multiple purposes",
          "Malware written in multiple languages",
        ],
        correctAnswer: 1,
        explanation: "Polymorphic malware modifies its own code to avoid detection by antivirus and security software.",
        difficulty: "Advanced",
      },
      {
        id: 13,
        question: "What is a supply chain attack?",
        options: [
          "Attacking shipping companies",
          "Compromising software/hardware before it reaches the target",
          "Attacking inventory systems",
          "Disrupting logistics networks",
        ],
        correctAnswer: 1,
        explanation:
          "A supply chain attack targets a company by compromising one of its trusted vendors or partners before distributing malicious products.",
        difficulty: "Advanced",
      },
      {
        id: 14,
        question: "What is a watering hole attack?",
        options: [
          "Poisoning water supplies with malware",
          "Compromising a website frequently visited by targets",
          "Flooding a network with data",
          "Attacking irrigation systems",
        ],
        correctAnswer: 1,
        explanation:
          "A watering hole attack compromises a website likely to be visited by targeted users, infecting visitors with malware.",
        difficulty: "Advanced",
      },
      {
        id: 15,
        question: "What is a Trojan horse malware?",
        options: [
          "Historical malware from ancient times",
          "Legitimate-looking software that contains hidden malicious code",
          "Self-replicating malware",
          "Malware that spreads through networks",
        ],
        correctAnswer: 1,
        explanation:
          "A Trojan horse appears to be legitimate software but contains hidden malware that executes when installed.",
        difficulty: "Advanced",
      },
    ],
  },
}
