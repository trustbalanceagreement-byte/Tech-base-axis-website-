export interface FaqItem {
  q: string;
  a: string;
}

/** Single source of truth: rendered on the Home page AND emitted as FAQPage JSON-LD (index.html / prerender). */
export const FAQ_ITEMS: FaqItem[] = [
  {
    q: 'What does Tech Base Axis do?',
    a: 'Tech Base Axis is a web development and digital solutions company based in Kolkata, India. We build custom web applications, e-commerce platforms, automation workflows, AI-powered tools and cloud-based software.',
  },
  {
    q: 'Who founded Tech Base Axis?',
    a: 'Tech Base Axis was founded by Bikram Ghosh, a full stack web developer and software architect from Kolkata, West Bengal.',
  },
  {
    q: 'Where is Tech Base Axis located and do you work with clients outside India?',
    a: 'We are based in Kolkata, West Bengal, India, and we work remotely with clients across India and around the world.',
  },
  {
    q: 'How can I hire Tech Base Axis or get a quote?',
    a: 'Open the Contact page to book an appointment, request a quote or send an enquiry, or choose a ready-made plan on the Packages page and book it online.',
  },
  {
    q: 'What web development packages do you offer?',
    a: 'The Packages page lists our service packages and optional add-ons with their prices, and you can book a package directly on the site.',
  },
  {
    q: 'Which technologies do you use?',
    a: 'We mainly build with React, TypeScript, Node.js and modern cloud services such as Firebase and Supabase, chosen to suit each project.',
  },
  {
    q: 'What is your refund policy?',
    a: 'Our Terms & Conditions describe a strict no-refund policy and the payment milestones for each service. Please read them before booking.',
  },
];
