import { 
  Globe, Server, Terminal, Shield, Lock, Cloud, 
  Cpu, Database, Eye, Search, FileText, Wifi, 
  Code, Layers, Key, Award, AlertTriangle 
} from "lucide-react"

// --- TYPES ---
export type Course = {
  title: string
  provider: string
  type: "Course" | "Lab" | "Certification"
  link: string
  icon: any
}

export type TreeNode = {
  id: string
  label: string
  description?: string
  children?: TreeNode[]
}

// --- DATA ---

export const ROADMAP_DATA = {
  // 1. THE FULL ANIMATED TIMELINE
  timeline: [
    {
      phase: "Phase 1: The Foundation (0-3 Months)",
      desc: "You cannot hack what you do not understand. Master the building blocks.",
      steps: [
        { title: "Networking Mastery", desc: "OSI Model, TCP/IP, DNS, Subnetting, HTTP/HTTPS.", icon: Globe },
        { title: "Linux & OS Architecture", desc: "File systems, CLI mastery, permissions, Bash scripting.", icon: Terminal },
        { title: "Hardware Basics", desc: "CPU, RAM, Motherboards, Virtualization (VMware/VirtualBox).", icon: Cpu },
      ]
    },
    {
      phase: "Phase 2: Programming & Scripting (3-6 Months)",
      desc: "Automate tasks and understand code vulnerabilities.",
      steps: [
        { title: "Python for Security", desc: "Socket programming, automation scripts, Scapy.", icon: Code },
        { title: "Bash & PowerShell", desc: "Windows/Linux administration and automation.", icon: Terminal },
        { title: "Web Technologies", desc: "HTML, JavaScript, SQL (and SQL Injection basics).", icon: Database },
      ]
    },
    {
      phase: "Phase 3: Core Security Concepts (6-12 Months)",
      desc: "Learn defense before offense.",
      steps: [
        { title: "CIA Triad & Risk", desc: "Confidentiality, Integrity, Availability.", icon: Shield },
        { title: "Cryptography Basics", desc: "Encryption, Hashing, PKI, SSL/TLS.", icon: Key },
        { title: "Network Security", desc: "Firewalls, IDS/IPS, VPNs, SIEM basics.", icon: Wifi },
      ]
    },
    {
      phase: "Phase 4: Specialization & Offense (1-2 Years)",
      desc: "Pick your weapon: Red Team, Blue Team, or Cloud.",
      steps: [
        { title: "Vulnerability Assessment", desc: "Nmap, Nessus, OpenVAS.", icon: Search },
        { title: "Web App Hacking", desc: "OWASP Top 10, Burp Suite.", icon: Layers },
        { title: "Digital Forensics", desc: "Memory analysis, disk imaging, chain of custody.", icon: Eye },
      ]
    },
    {
      phase: "Phase 5: Advanced & Leadership (3+ Years)",
      desc: "Architecture, Management, and Elite Ops.",
      steps: [
        { title: "Cloud Security Architecture", desc: "AWS/Azure Security, Zero Trust.", icon: Cloud },
        { title: "GRC & Auditing", desc: "ISO 27001, SOC2, HIPAA compliance.", icon: FileText },
        { title: "CISO/Management", desc: "Security strategy, budget, team leadership.", icon: Award },
      ]
    }
  ],

  // 2. INTERACTIVE CAREER TREES
  careerTrees: [
    {
      id: "red-team",
      label: "🔴 Red Team (Offensive)",
      description: "Adversary simulation and ethical hacking.",
      children: [
        { 
          id: "pentest", label: "Penetration Tester", 
          children: [
            { id: "net-pen", label: "Network Pentesting", description: "Active Directory, Nmap, Metasploit" },
            { id: "web-pen", label: "Web App Pentesting", description: "Burp Suite, OWASP, SQLi, XSS" },
            { id: "mob-pen", label: "Mobile Security", description: "Android/iOS reversing, Frida, Jadx" }
          ]
        },
        { 
          id: "exploit-dev", label: "Exploit Developer",
          children: [
            { id: "rev-eng", label: "Reverse Engineering", description: "Ghidra, IDA Pro, Assembly" },
            { id: "fuzz", label: "Fuzzing & Buffer Overflows", description: "Finding zero-days in software" }
          ]
        },
        { id: "social", label: "Social Engineering", description: "Phishing, Vishing, Physical Entry" }
      ]
    },
    {
      id: "blue-team",
      label: "🔵 Blue Team (Defensive)",
      description: "Defending organizations and hunting threats.",
      children: [
        { 
          id: "soc", label: "SOC Analyst", 
          children: [
            { id: "l1", label: "Tier 1: Triage", description: "Alert monitoring, Ticket creation" },
            { id: "l2", label: "Tier 2: Incident Responder", description: "Deep analysis, Malware containment" },
            { id: "l3", label: "Tier 3: Threat Hunter", description: "Proactive searching for anomalies" }
          ]
        },
        { id: "forensics", label: "Digital Forensics", description: "EnCase, FTK, Volatility" },
        { id: "intel", label: "Threat Intelligence", description: "Tracking APT groups, IoCs" }
      ]
    },
    {
      id: "grc",
      label: "🟢 GRC (Governance)",
      description: "Policy, Compliance, and Risk Management.",
      children: [
        { id: "auditor", label: "IT Auditor", description: "Validating controls vs policy" },
        { id: "compliance", label: "Compliance Officer", description: "PCI-DSS, HIPAA, GDPR" },
        { id: "risk", label: "Risk Analyst", description: "Quantifying cyber risk" }
      ]
    }
  ],

  // 3. REAL FREE COURSES
  courses: [
    {
      title: "Introduction to Cybersecurity",
      provider: "Cisco Skills For All",
      type: "Course",
      link: "https://skillsforall.com/course/introduction-to-cybersecurity",
      icon: "cisco"
    },
    {
      title: "Networking Basics",
      provider: "Cisco Skills For All",
      type: "Course",
      link: "https://skillsforall.com/course/networking-basics",
      icon: "cisco"
    },
    {
      title: "Cybersecurity for Businesses – The Fundamental Edition",
      provider: "EC-Council",
      type: "Certification",
      link: "https://learn.eccouncil.org/course/cybersecurity-for-businesses-the-fundamental-edition",
      icon: "ecc"
    },
    {
      title: "A Practical Introduction to Cloud Computing",
      provider: "EC-Council",
      type: "Course",
      link: "https://learn.eccouncil.org/course/a-practical-introduction-to-cloud-computing",
      icon: "ecc"
    },
    {
      title: "Python for Absolute Beginners",
      provider: "EC-Council",
      type: "Course",
      link: "https://learn.eccouncil.org/course/python-for-absolute-beginners",
      icon: "ecc"
    },
    {
      title: "ISO 27001 Foundation",
      provider: "Mastermind Assurance",
      type: "Course",
      link: "https://learn.mastermindassurance.com/",
      icon: "iso"
    },
    {
      title: "Practical Ethical Hacking (PEH)",
      provider: "TCM Security (YouTube)",
      type: "Lab",
      link: "https://youtube.com/playlist?list=PLLKT__MCUeixqHJ1TRqrHsEd6_EdEvo47&si=KBWyh5LwCdr6fefJ",
      icon: "tcm"
    },
    {
      title: "Python for Cybersecurity",
      provider: "Kaggle",
      type: "Lab",
      link: "https://www.kaggle.com/learn/python",
      icon: "kaggle"
    },
    {
      title: "Intro to AI Ethics",
      provider: "Kaggle",
      type: "Course",
      link: "https://www.kaggle.com/learn/intro-to-ai-ethics",
      icon: "kaggle"
    },
    {
      title: "Cyber Security Awareness",
      provider: "Udemy (Free)",
      type: "Course",
      link: "https://www.udemy.com/course/cyber-security-awareness-training-course/",
      icon: "udemy"
    }
  ]
}