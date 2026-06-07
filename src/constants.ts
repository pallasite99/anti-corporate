import { BoardSpace, ActionCard } from './types';

export const INITIAL_SPACES: BoardSpace[] = [
  {
    id: 0,
    name: "Clock-In Desk",
    type: "start",
    cost: 0,
    baseRent: 0,
    rentScales: [0, 0, 0, 0, 0],
    upgradeCost: 0,
    numUpgrades: 0,
    ownerId: null,
    outsourced: false,
    description: "Submit timesheet. Collect your Salary (deducts $1,200 of debt) and accrue passing interest on your outstanding unpaid debt.",
    upgradeName: ""
  },
  {
    id: 1,
    name: "Synergy Task Force",
    type: "department",
    group: "Middle Management",
    groupColor: "#78350f", // Dark brown
    cost: 80,
    baseRent: 8,
    rentScales: [8, 40, 100, 240, 320],
    upgradeCost: 50,
    numUpgrades: 0,
    ownerId: null,
    outsourced: false,
    description: "A meeting to plan future meetings. Rent is charged as 'Bandwidth Tax' when colleagues land here.",
    upgradeName: "KPI Dashboard"
  },
  {
    id: 2,
    name: "HR Incident Audit",
    type: "action_hr",
    cost: 0,
    baseRent: 0,
    rentScales: [0, 0, 0, 0, 0],
    upgradeCost: 0,
    numUpgrades: 0,
    ownerId: null,
    outsourced: false,
    description: "Draw an HR Incident report. HR exists to protect the company, not you.",
    upgradeName: ""
  },
  {
    id: 3,
    name: "Agile Alignment Committee",
    type: "department",
    group: "Middle Management",
    groupColor: "#78350f", // Dark brown
    cost: 120,
    baseRent: 12,
    rentScales: [12, 60, 150, 360, 450],
    upgradeCost: 50,
    numUpgrades: 0,
    ownerId: null,
    outsourced: false,
    description: "Daily 45-minute stand-ups where standing up is actually discouraged for productivity reasons.",
    upgradeName: "KPI Dashboard"
  },
  {
    id: 4,
    name: "Subtle KPI Reductions",
    type: "tax_audit",
    cost: 0,
    baseRent: 0,
    rentScales: [0, 0, 0, 0, 0],
    upgradeCost: 0,
    numUpgrades: 0,
    ownerId: null,
    outsourced: false,
    description: "A sudden audit reveals your Excel formulas are too efficient. Adjusting KPIs costs you $150 in stress consulting or adds 20 points of stress.",
    upgradeName: ""
  },
  {
    id: 5,
    name: "Overpriced Coffee Machine",
    type: "department",
    group: "Shared Services",
    groupColor: "#6b21a8", // Purple
    cost: 150,
    baseRent: 20,
    rentScales: [20, 100, 220, 450, 600],
    upgradeCost: 75,
    numUpgrades: 0,
    ownerId: null,
    outsourced: false,
    description: "Fancier than a microwave, but charges a huge markup. Reduces stress by 15 for the owner, but drains card balance for visitors.",
    upgradeName: "Espresso Upgrade"
  },
  {
    id: 6,
    name: "Interactive Onboarding",
    type: "department",
    group: "Shared Services",
    groupColor: "#6b21a8", // Purple
    cost: 140,
    baseRent: 18,
    rentScales: [18, 90, 210, 440, 580],
    upgradeCost: 75,
    numUpgrades: 0,
    ownerId: null,
    outsourced: false,
    description: "An interactive video panel that errors out on step 3. The company charges you for 're-assessment fees'.",
    upgradeName: "Espresso Upgrade"
  },
  {
    id: 7,
    name: "Interactive VR Training",
    type: "department",
    group: "Shared Services",
    groupColor: "#6b21a8", // Purple
    cost: 150,
    baseRent: 20,
    rentScales: [20, 100, 225, 450, 600],
    upgradeCost: 75,
    numUpgrades: 0,
    ownerId: null,
    outsourced: false,
    description: "Equipping expensive goggles to walk and gesture in virtual workspaces that look like 2004 web graphics.",
    upgradeName: "Espresso Upgrade"
  },
  {
    id: 8,
    name: "Water Cooler Oasis",
    type: "water_cooler",
    cost: 0,
    baseRent: 0,
    rentScales: [0, 0, 0, 0, 0],
    upgradeCost: 0,
    numUpgrades: 0,
    ownerId: null,
    outsourced: false,
    description: "A place to whisper gossip about management. Reduces stress by 25 points. Safe zone.",
    upgradeName: ""
  },
  {
    id: 9,
    name: "Venture Capital Bait",
    type: "department",
    group: "Vaporware Tech",
    groupColor: "#1e3a8a", // Dark blue
    cost: 185,
    baseRent: 15,
    rentScales: [15, 75, 180, 440, 550],
    upgradeCost: 100,
    numUpgrades: 0,
    ownerId: null,
    outsourced: false,
    description: "Using blockchain buzzwords to raise funding from investors who don't know what database means.",
    upgradeName: "Slack Integration"
  },
  {
    id: 10,
    name: "C-Suite Town Hall",
    type: "action_townhall",
    cost: 0,
    baseRent: 0,
    rentScales: [0, 0, 0, 0, 0],
    upgradeCost: 0,
    numUpgrades: 0,
    ownerId: null,
    outsourced: false,
    description: "A mandatory company-wide assembly broadcast live from the CEO's beach house. Draw a Town Hall card.",
    upgradeName: ""
  },
  {
    id: 11,
    name: "Blockchain Optimization Lab",
    type: "department",
    group: "Vaporware Tech",
    groupColor: "#1e3a8a", // Dark blue
    cost: 180,
    baseRent: 16,
    rentScales: [16, 80, 200, 480, 600],
    upgradeCost: 100,
    numUpgrades: 0,
    ownerId: null,
    outsourced: false,
    description: "Nobody knows what it does, but it secured $10m in internal funding.",
    upgradeName: "Slack Integration"
  },
  {
    id: 12,
    name: "Quantum Machine Learning",
    type: "department",
    group: "Vaporware Tech",
    groupColor: "#1e3a8a", // Dark blue
    cost: 220,
    baseRent: 20,
    rentScales: [20, 100, 250, 600, 750],
    upgradeCost: 100,
    numUpgrades: 0,
    ownerId: null,
    outsourced: false,
    description: "Translates random numbers into decorative slide deck graphs. Powered by outsourced spreadsheet processors.",
    upgradeName: "Slack Integration"
  },
  {
    id: 13,
    name: "AI Pizza Party Annex",
    type: "department",
    group: "Shared Services",
    groupColor: "#6b21a8", // Purple
    cost: 160,
    baseRent: 22,
    rentScales: [22, 110, 240, 500, 650],
    upgradeCost: 75,
    numUpgrades: 0,
    ownerId: null,
    outsourced: false,
    description: "Instead of a pay raise, you get high-carb cold cheese slices to boost alignment indices.",
    upgradeName: "Extra Crust"
  },
  {
    id: 14,
    name: "Mandatory Friday Fun Hour",
    type: "tax_overtime",
    cost: 0,
    baseRent: 0,
    rentScales: [0, 0, 0, 0, 0],
    upgradeCost: 0,
    numUpgrades: 0,
    ownerId: null,
    outsourced: false,
    description: "You must participate in organized team trust-falls. Failure to look happy results in a $100 penalty for behavioral correction or 25 stress.",
    upgradeName: ""
  },
  {
    id: 15,
    name: "The Chess Table Cover-Up",
    type: "department",
    group: "Shared Services",
    groupColor: "#6b21a8", // Purple
    cost: 170,
    baseRent: 24,
    rentScales: [24, 120, 260, 520, 680],
    upgradeCost: 75,
    numUpgrades: 0,
    ownerId: null,
    outsourced: false,
    description: "An expensive walnut wooden table installed in the breakroom as a substitute for cost-of-living adjustments.",
    upgradeName: "Extra Crust"
  },
  {
    id: 16,
    name: "Performance Improvement Plan",
    type: "pip",
    cost: 0,
    baseRent: 0,
    rentScales: [0, 0, 0, 0, 0],
    upgradeCost: 0,
    numUpgrades: 0,
    ownerId: null,
    outsourced: false,
    description: "Undergoing HR performance review. If stuck here, you are isolated and cannot collect rent or make changes, and pay interest on every turn.",
    upgradeName: ""
  },
  {
    id: 17,
    name: "Micromanaged Sandbox",
    type: "department",
    group: "Administrative Loops",
    groupColor: "#be185d", // Deep pink/red
    cost: 240,
    baseRent: 22,
    rentScales: [22, 110, 280, 680, 850],
    upgradeCost: 150,
    numUpgrades: 0,
    ownerId: null,
    outsourced: false,
    description: "A sandbox environment where your project manager screenshares your VS Code edits live for security.",
    upgradeName: "Ad-hoc Sub-committee"
  },
  {
    id: 18,
    name: "HR Incident Audit",
    type: "action_hr",
    cost: 0,
    baseRent: 0,
    rentScales: [0, 0, 0, 0, 0],
    upgradeCost: 0,
    numUpgrades: 0,
    ownerId: null,
    outsourced: false,
    description: "Draw an HR Incident report. HR exists to protect the company, not you.",
    upgradeName: ""
  },
  {
    id: 19,
    name: "Outsourced Client Sandbox",
    type: "department",
    group: "Administrative Loops",
    groupColor: "#be185d", // Deep pink/red
    cost: 260,
    baseRent: 24,
    rentScales: [24, 120, 300, 720, 900],
    upgradeCost: 150,
    numUpgrades: 0,
    ownerId: null,
    outsourced: false,
    description: "An isolated environment where testing reveals everything works, except in production.",
    upgradeName: "Ad-hoc Sub-committee"
  },
  {
    id: 20,
    name: "Feedback Loop Committee",
    type: "department",
    group: "Administrative Loops",
    groupColor: "#be185d", // Deep pink
    cost: 280,
    baseRent: 26,
    rentScales: [26, 130, 320, 780, 950],
    upgradeCost: 150,
    numUpgrades: 0,
    ownerId: null,
    outsourced: false,
    description: "A loop that references itself, creating endless requests for validation of templates.",
    upgradeName: "Ad-hoc Sub-committee"
  },
  {
    id: 21,
    name: "Endless Reorg Committee",
    type: "department",
    group: "Administrative Loops",
    groupColor: "#be185d", // Deep pink
    cost: 300,
    baseRent: 28,
    rentScales: [28, 140, 350, 850, 1050],
    upgradeCost: 150,
    numUpgrades: 0,
    ownerId: null,
    outsourced: false,
    description: "A specialized body focusing on shifting the organizational chart blocks every 3 weeks to show agility.",
    upgradeName: "Ad-hoc Sub-committee"
  },
  {
    id: 22,
    name: "C-Suite Presentation Prep",
    type: "department",
    group: "C-Suite Excess",
    groupColor: "#b45309", // Orange-gold
    cost: 320,
    baseRent: 30,
    rentScales: [30, 150, 380, 900, 1100],
    upgradeCost: 200,
    numUpgrades: 0,
    ownerId: null,
    outsourced: false,
    description: "Preparing 40 slides that the Vice Director will skip in 15 seconds. High stress, immense payoff.",
    upgradeName: "Executive Summary"
  },
  {
    id: 23,
    name: "Synergy Off-Site Retreat",
    type: "department",
    group: "C-Suite Excess",
    groupColor: "#b45309", // Orange-gold
    cost: 350,
    baseRent: 35,
    rentScales: [35, 175, 420, 1000, 1250],
    upgradeCost: 200,
    numUpgrades: 0,
    ownerId: null,
    outsourced: false,
    description: "Five-star glamping to discuss quarterly budget cuts for cubicle workers.",
    upgradeName: "Executive Summary"
  },
  {
    id: 24,
    name: "Fired? No, 'Restructured'!",
    type: "goToPip",
    cost: 0,
    baseRent: 0,
    rentScales: [0, 0, 0, 0, 0],
    upgradeCost: 0,
    numUpgrades: 0,
    ownerId: null,
    outsourced: false,
    description: "Manager catches you looking at job boards. Go directly to Performance Improvement Plan (PIP). Do not pass the Clock-In Desk.",
    upgradeName: ""
  },
  {
    id: 25,
    name: "Premium Air Filter Lease",
    type: "department",
    group: "C-Suite Excess",
    groupColor: "#b45309", // Orange-gold
    cost: 360,
    baseRent: 38,
    rentScales: [38, 190, 440, 1100, 1350],
    upgradeCost: 200,
    numUpgrades: 0,
    ownerId: null,
    outsourced: false,
    description: "Unprecedented air cleanliness levels delivered securely to executive office suites. Bills standard staff cards.",
    upgradeName: "Executive Summary"
  },
  {
    id: 26,
    name: "C-Suite Town Hall",
    type: "action_townhall",
    cost: 0,
    baseRent: 0,
    rentScales: [0, 0, 0, 0, 0],
    upgradeCost: 0,
    numUpgrades: 0,
    ownerId: null,
    outsourced: false,
    description: "Draw a Town Hall card. Discover how inspired management is this quarter.",
    upgradeName: ""
  },
  {
    id: 27,
    name: "Pre-Meeting Prep Panel",
    type: "department",
    group: "Meeting Overload",
    groupColor: "#15803d", // Green
    cost: 380,
    baseRent: 40,
    rentScales: [40, 200, 480, 1100, 1400],
    upgradeCost: 250,
    numUpgrades: 0,
    ownerId: null,
    outsourced: false,
    description: "A meeting scheduled to prepare for the pre-meeting to align interests.",
    upgradeName: "Bureaucratic Layer"
  },
  {
    id: 28,
    name: "Bureaucracy Loop Incubator",
    type: "department",
    group: "Meeting Overload",
    groupColor: "#15803d", // Green
    cost: 420,
    baseRent: 45,
    rentScales: [45, 220, 520, 1200, 1500],
    upgradeCost: 250,
    numUpgrades: 0,
    ownerId: null,
    outsourced: false,
    description: "Forms that require signatures from people who are permanently out of office.",
    upgradeName: "Bureaucratic Layer"
  },
  {
    id: 29,
    name: "Debrief Alignment Summit",
    type: "department",
    group: "Meeting Overload",
    groupColor: "#15803d", // Green
    cost: 440,
    baseRent: 50,
    rentScales: [50, 250, 600, 1300, 1600],
    upgradeCost: 250,
    numUpgrades: 0,
    ownerId: null,
    outsourced: false,
    description: "A summit designed to deep-dive into why the previous debrief alignment failed to generate actions.",
    upgradeName: "Bureaucratic Layer"
  },
  {
    id: 30,
    name: "Presenteeism Attendance",
    type: "department",
    group: "Extreme Presenteeism",
    groupColor: "#dc2626", // Red
    cost: 480,
    baseRent: 55,
    rentScales: [55, 275, 680, 1500, 1800],
    upgradeCost: 300,
    numUpgrades: 0,
    ownerId: null,
    outsourced: false,
    description: "Log in exactly at 8:00 AM and do absolutely nothing until 7:00 PM just to be seen.",
    upgradeName: "Micro-Manager Desk"
  },
  {
    id: 31,
    name: "Friday 4:59 PM Urgent Email",
    type: "department",
    group: "Extreme Presenteeism",
    groupColor: "#dc2626", // Red
    cost: 550,
    baseRent: 70,
    rentScales: [70, 350, 850, 1700, 2200],
    upgradeCost: 300,
    numUpgrades: 0,
    ownerId: null,
    outsourced: false,
    description: "Subject: QUICK ALIGNMENT? Ruins your entire weekend. Demands immediate attention and maximum rent.",
    upgradeName: "Micro-Manager Desk"
  }
];

export const HR_CARDS: ActionCard[] = [
  {
    id: "hr_1",
    title: "Unapproved Office Snack Intake",
    type: "hr",
    text: "You were caught eating a client-exclusive premium snack out of the VIP executive mini-fridge.",
    flavorText: "HR warns that organic almonds are reserved for Series B investors. Refunding the cost added to your bill.",
    effectType: "balance_change",
    value: 120
  },
  {
    id: "hr_2",
    title: "Toxic Positivity Infraction",
    type: "hr",
    text: "Your slack status remained at standard 'In a meeting' instead of 'Excited to synthesize! 🚀'.",
    flavorText: "Mandatory corporate enthusiasm therapy billed directly to your corporate Amex.",
    effectType: "balance_change",
    value: 80
  },
  {
    id: "hr_3",
    title: "Favoritism Backlash",
    type: "hr",
    text: "The Manager praised your spreadsheet formatting in front of colleagues. You spent $150 on conciliatory coffee to appease their jealousy.",
    flavorText: "Nothing maintains office cohesion like collective resentment.",
    effectType: "balance_change",
    value: 150
  },
  {
    id: "hr_4",
    title: "Self-Appraisal Breakthrough",
    type: "hr",
    text: "Your quarterly self-appraisal scored yourself as 'Requires Guidance' to seem humble. Company rewarded your honesty by lowering your interest rate.",
    flavorText: "Lower expectations mean fewer opportunities to disappoint.",
    effectType: "limit_change",
    value: 800 // Boost limit
  },
  {
    id: "hr_5",
    title: "Accidental Reply-All Disaster",
    type: "hr",
    text: "You replied 'Thanks!' to a company-wide email of 12,000 employees, causing a server crash and immediate disciplinary action.",
    flavorText: "Go directly to Performance Improvement Plan (PIP).",
    effectType: "go_to_pip",
    value: 0
  },
  {
    id: "hr_6",
    title: "Ergonomic Desk Assessment",
    type: "hr",
    text: "HR evaluates your cubicle seating setup. They find your spine is aligned too comfortably, which breeds comfort.",
    flavorText: "You are billed $110 for a certified posture-ruining stool.",
    effectType: "balance_change",
    value: 110
  },
  {
    id: "hr_7",
    title: "Work-Life Integration Success",
    type: "hr",
    text: "You answer a non-critical alert during your cousin's wedding reception. HR commends your extreme alignment.",
    flavorText: "Stress decreased by 30 points, credit limit raised by $500.",
    effectType: "stress_change",
    value: -30
  },
  {
    id: "hr_8",
    title: "Passive-Aggressive Sticky Note",
    type: "hr",
    text: "A sticky note signed 'Management' was pasted to your screen: 'We noticed you left at 5:01 PM. Is everything okay at home?'",
    flavorText: "Guilt and panic spike. Gain 25 Stress.",
    effectType: "stress_change",
    value: 25
  },
  {
    id: "hr_9",
    title: "HR 'Safe Space' Consultation",
    type: "hr",
    text: "You confide that meeting fatigue is affecting your sleep. HR records this as 'Inability to multitask' on your personnel file.",
    flavorText: "Gain 20 Stress and pay $90 for administrative file management.",
    effectType: "balance_change",
    value: 90
  },
  {
    id: "hr_10",
    title: "The Golden Paperclip Merit",
    type: "hr",
    text: "You successfully bypassed a signature block to submit a report on time. You are awarded the HR Immunity pass.",
    flavorText: "Get out of Performance Improvement Plan (PIP) free card.",
    effectType: "free_out_of_pip",
    value: 0
  }
];

export const TOWNHALL_CARDS: ActionCard[] = [
  {
    id: "th_1",
    title: "Venture Capital Re-Evaluation",
    type: "townhall",
    text: "The Board re-brands the company from 'SaaS Solutions' to 'AI-Integrated Hyper-Synergy API'. All employee credit limits extended!",
    flavorText: "Now you can buy twice as much useless debt! Limit increased by $1,500.",
    effectType: "limit_change",
    value: 1500
  },
  {
    id: "th_2",
    title: "The Infinite Pizza Subsidy",
    type: "townhall",
    text: "Management cancels premium medical coverage and redirects funds to dynamic pizza party procurement.",
    flavorText: "Balance reduced by $200, but stress increased by 20.",
    effectType: "balance_change",
    value: -200 // Reduces debt
  },
  {
    id: "th_3",
    title: "Synergy Consolidation Loop",
    type: "townhall",
    text: "The CEO requests 'collaborative expense offloading'. Pay every colleague $50 from your card to sponsor their team-building snack fund.",
    flavorText: "Generosity is mandatory, and you are footing the bill.",
    effectType: "pay_each_player",
    value: 50
  },
  {
    id: "th_4",
    title: "Global Server Migration",
    type: "townhall",
    text: "The databases are migrated to a decentralized server located in a garage. It's offline for 3 days. Total peace.",
    flavorText: "Stress decreased by 40 points, but no business can be conducted. Balance charged $100 for offline costs.",
    effectType: "stress_change",
    value: -40
  },
  {
    id: "th_5",
    title: "Quarterly Alignment Index Survey",
    type: "townhall",
    text: "You rate your team happiness as 10/10 to avoid private feedback standups. Executive team is highly inspired.",
    flavorText: "Receive $150 credit limit boost for stellar corporate compliance.",
    effectType: "limit_change",
    value: 500
  },
  {
    id: "th_6",
    title: "Outsourced Synergy Consultant Audit",
    type: "townhall",
    text: "Expensive consultants audit the department and recommend firing the people who do actual work.",
    flavorText: "To prove your necessity, work double hours. Gain 35 Stress.",
    effectType: "stress_change",
    value: 35
  },
  {
    id: "th_7",
    title: "Voluntary Salary Over-Sacrifice",
    type: "townhall",
    text: "Management asks employees to voluntarily defer salary to invest in executive standing desk retrofits.",
    flavorText: "Refusing would look unaligned. Pay $250 immediately.",
    effectType: "balance_change",
    value: 250
  },
  {
    id: "th_8",
    title: "Coffee Machine Crowdfunding",
    type: "townhall",
    text: "Collect $100 from every colleague to purchase a single bag of artisanal micro-roasted fair-trade corporate beans.",
    flavorText: "You are now the Coffee Custodian. Enjoy clean pots and dirty desks.",
    effectType: "collect_from_each_player",
    value: 100
  },
  {
    id: "th_boardroom",
    title: "Rare Boardroom Meeting",
    type: "townhall",
    text: "An emergency Boardroom Meeting mandates a global Corporate Quarterly Assessment on all department assets.",
    flavorText: "Pay a flat $75 surcharge fee to your card balance for EACH department owned. This applies to ALL players in the game!",
    effectType: "boardroom_meeting_assessment",
    value: 75
  }
];

export interface RolePreset {
  name: string;
  description: string;
  startingLimit: number;
  startingBalance: number; // starts in DEBT!
  interestRate: number;
  accentColor: string;
  avatar: string;
  quote: string;
}

export const ROLE_PRESETS: RolePreset[] = [
  {
    name: "Junior Synergy Architect",
    description: "Young, eager, hopelessly optimistic, and drowning in credit debris. Starts with high credit limit but higher starting debt.",
    startingLimit: 6000,
    startingBalance: 3200,
    interestRate: 0.12,
    accentColor: "#3b82f6", // Vibrant Blue
    avatar: "🧑‍💻",
    quote: "I'm just thrilled to align with outstanding minds at 8 AM daily!"
  },
  {
    name: "VP of Presenteeism",
    description: "Believes butts-in-seats is the only valid metric of software performance. Heavy interest rate but lower starting debt.",
    startingLimit: 5000,
    startingBalance: 2000,
    interestRate: 0.15,
    accentColor: "#ef4444", // Bright Red
    avatar: "👔",
    quote: "If you aren't Slack-active at midnight, are you even committed?"
  },
  {
    name: "Lead Solution Evangelist",
    description: "Speaks entirely in marketing metaphors and agile guidelines. Has premium credit standing and moderate interest rates.",
    startingLimit: 5500,
    startingBalance: 2500,
    interestRate: 0.08,
    accentColor: "#10b981", // Emerald Green
    avatar: "🎙️",
    quote: "Let's put a pin in that and circle back on a holistic, cross-functional deep dive!"
  },
  {
    name: "Bureaucracy Coordinator",
    description: "A master of requesting signatures and filling obsolete triplicate forms. Safe player with high distress tolerance but lower credit limit.",
    startingLimit: 4000,
    startingBalance: 1500,
    interestRate: 0.10,
    accentColor: "#f59e0b", // Amber/Gold
    avatar: "📑",
    quote: "The authorization requires form 34-B stamped by an out-of-office manager."
  }
];

export const OFFICE_DESPAIR_DISCLAIMER = `DISCLAIMER & PARODY LEGAL WARNING: This is a work of pure satirical fiction and social commentary. Names, characters, departments, board locations, and corporate titles are imaginary or utilized in a completely satirical context. Any resemblance to real corporations, live startup platforms, financial consulting agencies, executive personnel, human resource auditors, or current workplace trauma is purely coincidental and, frankly, depressing. No employees were harmed, laid off, or micro-managed in the creation of this source code. Enjoy managing your debt responsibly!`;
