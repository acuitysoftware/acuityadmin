export const DEFAULT_MENU = [
  { id: "m1", label: "Home", link: "/", enabled: true },
  { id: "m2", label: "About Us", link: "/about", enabled: true },
  {
    id: "m3", label: "Services", link: "/services", enabled: true,
    children: [
      { id: "m3a", label: "Web Development", link: "/services/web" },
      { id: "m3b", label: "Mobile Apps", link: "/services/mobile" },
    ],
  },
  { id: "m4", label: "Industries", link: "/industries", enabled: true },
  { id: "m5", label: "Portfolio", link: "/portfolio", enabled: true },
  { id: "m6", label: "Blog", link: "/blog", enabled: true },
  { id: "m7", label: "Contact Us", link: "/contact", enabled: true },
];

export const DEFAULT_COMPANY = {
  name: "Acuity Software Services",
  tagline: "Technology That Works for Your Business",
  email: "paul@acuitysoftwareservices.com",
  phone: "6290915550",
  address: "Kolkata, India",
  cta: "Get a Free Quote",
  facebook: "https://facebook.com/acuitysoftware",
  instagram: "https://instagram.com/acuitysoftware",
  linkedin: "https://linkedin.com/company/acuitysoftware",
  meta: "Acuity Software Services — modern websites, mobile apps & digital marketing.",
};

export const DEFAULT_SECTIONS = [
  { id: "s1", type: "Hero", enabled: true, title: "Grow Your Business With Smart Software", subtitle: "End-to-end technology solutions to help your business grow in the digital world." },
  { id: "s2", type: "Clients", enabled: true, title: "Our Recent Clients", items: ["Ali's Pizzeria", "Pink & Purple", "NexOrdr", "BottleRunners", "MenuHuts", "Marco's Pizza", "The Food Hub", "Spice Villa", "UrbanBite", "TastyKart"] },
  { id: "s3", type: "Services", enabled: true, title: "Our Services", items: [
    ["Website Development", "Modern, responsive and SEO-friendly websites."],
    ["Mobile App Development", "Android & iOS apps to grow your customer base."],
    ["Custom Software Development", "Tailored software for unique business needs."],
    ["E-commerce Solutions", "Powerful online stores to boost your sales."],
    ["Digital Marketing & SEO", "Get more traffic, leads and sales."],
    ["UI/UX Design", "Beautiful, user-friendly designs that convert."],
    ["Cloud & DevOps Solutions", "Scalable and secure cloud infrastructure."],
    ["IT Consulting & Support", "Expert guidance and long-term support."],
  ]},
  { id: "s4", type: "Solutions", enabled: true, title: "Our Solutions", items: ["Web Solutions", "Mobile App Solutions", "Cloud & Infrastructure", "AI & Automation", "E-commerce Solutions", "Digital Marketing Solutions", "Custom Software Solutions", "IT Support & Consulting"] },
  { id: "s5", type: "About", enabled: true, title: "Technology That Works for Your Business", body: "We are a results-driven IT company helping businesses with innovative digital solutions. From startups to enterprises, we deliver technology that creates real value and measurable growth.", features: ["Experienced Team", "Client-Centric Approach", "Quality Solutions", "Long-Term Partnership"] },
  { id: "s6", type: "TechStack", enabled: true, title: "Technologies We Work With", items: ["Laravel", "React JS", "Node.js", "WordPress", "Shopify", "Flutter", "Firebase", "AWS", "Google Cloud", "MySQL", "Docker", "Kubernetes"] },
  { id: "s7", type: "Industries", enabled: true, title: "Industries We Serve", items: ["Restaurant & Food Tech", "Retail & E-commerce", "Education", "Travel & Hospitality", "Healthcare", "Real Estate", "On-Demand Services", "Others"] },
  { id: "s8", type: "Process", enabled: true, title: "How We Work", items: [["01", "Discover", "Understand your business goals."], ["02", "Plan & Design", "Create the right strategy."], ["03", "Develop", "Build with the best technologies."], ["04", "Launch & Support", "Go live and provide ongoing support."]] },
  { id: "s9", type: "Portfolio", enabled: true, title: "Featured Projects", items: ["Restaurant Ordering System (NexOrdr)", "E-commerce Website (Pink and Purple)", "Corporate Website (Acuity)", "Pizzeria Website (Ali's Pizzeria)", "Custom Web Application"] },
  { id: "s10", type: "Testimonials", enabled: true, title: "What Our Clients Say", items: [
    ["Rajesh Das", "Acuity delivered our website on time with excellent support. Highly recommended!"],
    ["Priya Sharma", "Excellent team, great communication and quality work."],
    ["Amit Verma", "Professional and reliable. They understand business needs."],
  ]},
  { id: "s11", type: "CTA", enabled: true, title: "Let's Build Something Great Together", subtitle: "Have a project in mind? Get in touch and our experts will help you find the right solution." },
];

export const BLOCK_TYPES = [
  "Hero", "About", "Services", "Industries", "Products", "Features", "WhyChooseUs",
  "Statistics", "Testimonials", "Portfolio", "Clients", "TechStack", "Team", "CTA",
  "FAQ", "Blog", "Contact", "Newsletter", "Video", "Solutions", "Process", "Custom",
];

export const uid = () => Math.random().toString(36).slice(2, 9);
