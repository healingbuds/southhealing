import newsMarlonWayans from "@/assets/news-marlon-wayans.webp";
import newsNftMinting from "@/assets/news-nft-minting.jpg";
import newsRicardoCapone from "@/assets/news-ricardo-capone.jpg";
import newsMaxWhite from "@/assets/news-max-white.jpg";
import newsShaggyBrown from "@/assets/news-shaggy-brown.jpg";
import newsRicardoTech from "@/assets/news-ricardo-tech.jpg";

export interface NewsArticle {
  id: string;
  category: string;
  title: string;
  description: string;
  image: string;
  featured: boolean;
  externalLink: string;
  tags: string[];
  author: string;
  date: string;
  content: string[];
}

export const newsArticles: NewsArticle[] = [
  {
    id: "marlon-wayans-dr-green",
    category: "Cannabis",
    title: "Marlon Wayans Talks Selling Weed On The Blockchain: Is Dr. Green Legit?",
    description: "Actor and comedian Marlon Wayans, famous for his roles in iconic films like Scary Movie, has transitioned his lifelong relationship with cannabis into a purposeful partnership with Dr. Green NFT.",
    image: newsMarlonWayans,
    featured: true,
    externalLink: "https://drgreennft.com/news/marlon-wayans-talks-selling-weed-on-the-blockchain-is-dr-green-legit-he-isnt-afraid-to-answer-the-tough-questions",
    tags: ["Cannabis", "Dr. Green"],
    author: "Dr. Green",
    date: "Oct 15, 2024",
    content: [
      "Actor and comedian Marlon Wayans, famous for his roles in iconic films like Scary Movie, has transitioned his lifelong relationship with cannabis into a purposeful partnership with Dr. Green NFT.",
      "In a candid conversation, Wayans shares how cannabis has evolved from youthful indulgence to a source of creativity, relaxation, and wellness in his daily life.",
      "When asked about his decision to partner with Dr. Green, Wayans explained that he's been offered many deals over the years, but Dr. Green stood out because they actually know what they're talking about.",
      "The partnership represents a significant step forward in bringing mainstream recognition to blockchain-based cannabis ventures, combining entertainment industry influence with cutting-edge technology.",
    ],
  },
  {
    id: "unlocking-future-nft-minting",
    category: "Dr. Green",
    title: "Unlocking the Future: Next Steps After Minting Your NFT",
    description: "Minting your NFT is just the beginning of your journey into a revolutionary platform that combines blockchain technology with the medical cannabis industry.",
    image: newsNftMinting,
    featured: false,
    externalLink: "https://drgreennft.com/news/unlocking-the-future-next-steps-after-minting-your-nft",
    tags: ["Dr. Green", "NFT"],
    author: "Dr. Green",
    date: "Sep 20, 2024",
    content: [
      "Minting your NFT is just the beginning of your journey into a revolutionary platform that combines blockchain technology with the medical cannabis industry.",
      "We're excited to share the next phases of our roadmap, designed to empower NFT holders to access and benefit from our cutting-edge admin centre for the Dr Green dropshipping platform for medical cannabis.",
      "The platform enables keyholders to participate in the regulated cannabis ecosystem without ever handling or selling cannabis themselves.",
      "Smart contracts calculate and distribute rewards to keyholders based on the blockchain activity generated through the platform.",
    ],
  },
  {
    id: "ricardo-capone-spotlight",
    category: "Dr. Green",
    title: "Sniper Spotlight with Ricardo Capone from Dr. Green Cannabis",
    description: "For the last five years, we've been involved heavily in the medical cannabis space in Portugal. We have facilities where we grow medical cannabis for distribution to institutions.",
    image: newsRicardoCapone,
    featured: false,
    externalLink: "https://drgreennft.com/news/sniper-spotlight-with-ricardo-capone-from-dr-green-canabis",
    tags: ["Dr. Green", "NFT", "Medical Cannabis"],
    author: "Dr. Green",
    date: "Sep 9, 2024",
    content: [
      "For the last five years, we've been involved heavily in the medical cannabis space in Portugal. We have facilities where we grow medical cannabis for distribution to institutions that utilize it.",
      "Conditions like multiple sclerosis, epilepsy, and Parkinson's disease — these issues can be treated with cannabis because the problem is usually in the endocannabinoid system in the human body.",
      "We develop different technologies, and our primary focus has been biotechnology. If we have a patient, we'll take a swab of their mouth and analyze the DNA structure of the person, and we can see where the breakdown is that's causing them to have a problem.",
      "We have a strain library with around 2,100 strains analyzed across 50,000 seeds, and what it tells us is the nuclear genetics and the mitochondrial genetics of the plant.",
    ],
  },
  {
    id: "ricardo-capone-pioneering",
    category: "Dr. Green",
    title: "Ricardo Capone: Pioneering Technological Solutions in the Cannabis Industry",
    description: "Financial setbacks have never deterred billionaire Maximillian White. After losing $39 million in the Cypriot banking collapse, White turned his resilience into a new venture.",
    image: newsRicardoTech,
    featured: false,
    externalLink: "https://drgreennft.com/news/ricardo-capone-pioneering-technological-solutions-in-the-cannabis-industry",
    tags: ["Dr. Green"],
    author: "Dr. Green",
    date: "Aug 28, 2024",
    content: [
      "Financial setbacks have never deterred billionaire Maximillian White. After losing $39 million in the Cypriot banking collapse, White turned his resilience into a new venture: the cannabis industry.",
      "Working alongside CTO Ricardo Capone, they have built a technology-first approach to medical cannabis that prioritizes compliance, traceability, and patient outcomes.",
      "The team's focus on biotechnology and plant genomics has positioned Dr. Green as a leader in personalized cannabis medicine.",
    ],
  },
  {
    id: "maximillian-white-elon-musk-weed",
    category: "Dr. Green",
    title: "Maximillian White 'Elon Musk of weed' will legalise cannabis around the world",
    description: "Billionaire Maximillian White dubbed the 'Elon Musk of weed' vouches to legalise marijuana around the globe. The founder of Dr. Green aims to be the number-one supplier.",
    image: newsMaxWhite,
    featured: false,
    externalLink: "https://drgreennft.com/news/maximillian-white-elon-musk-of-weed-will-legalise-cannabis-around-the-world",
    tags: ["Cannabis", "Dr. Green"],
    author: "Dr. Green",
    date: "Aug 15, 2024",
    content: [
      "Billionaire Maximillian White dubbed the 'Elon Musk of weed' vouches to legalise marijuana around the globe.",
      "The founder of Dr. Green aims to be the number-one supplier of recreational cannabis around the world, with a vision that combines regulatory compliance with global accessibility.",
      "White's approach focuses on building trust through transparency, utilizing blockchain technology to ensure every product can be traced from seed to sale.",
    ],
  },
  {
    id: "shaggy-brown-joins-dr-green",
    category: "Dr. Green",
    title: "From Hollywood's 'Weed Man' to Regulatory Pioneer: Shaggy Brown Joins Dr Green",
    description: "From Hollywood's trusted 'weed man to the stars' to global cannabis pioneer, Shaggy Brown has spent 25+ years curating the highest-quality cannabis for icons like Tyson, Snoop, and DMX.",
    image: newsShaggyBrown,
    featured: false,
    externalLink: "https://drgreennft.com/news/from-hollywoods-weed-man-to-regulatory-pioneer-shaggy-brown-joins-forces-with-dr-green",
    tags: ["Dr. Green"],
    author: "Dr. Green",
    date: "Sep 16, 2024",
    content: [
      "From Hollywood's trusted 'weed man to the stars' to global cannabis pioneer, Shaggy Brown has spent 25+ years curating the highest-quality cannabis for icons like Tyson, Snoop, and DMX.",
      "Now, he's partnering with Dr Green to bring that same integrity to a transparent, blockchain-powered future.",
      "Brown's expertise in sourcing and quality control complements Dr. Green's technological infrastructure, creating a powerful combination for the regulated cannabis market.",
    ],
  },
];
