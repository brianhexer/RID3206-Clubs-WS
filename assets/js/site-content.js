window.SITE_CONTENT = {
  site: {
    title: "Rotaract Club of Metro City",
    tagline: "People of Action",
    nav: [
      { label: "Home", href: "#hero" },
      { label: "Impact", href: "#impactSection" },
      { label: "Programs", href: "#programsSection" },
      { label: "Events", href: "#eventsSection" },
      { label: "Campaigns", href: "#campaignsSection" },
      { label: "Stories", href: "#resourcesSection" },
      { label: "Contact", href: "#contactSection" }
    ],
    footerLinks: [
      { label: "Volunteer", href: "#eventsSection" },
      { label: "Donate", href: "#testimonialsSection" },
      { label: "Projects", href: "#programsSection" },
      { label: "Join Newsletter", href: "#newsletterSection" }
    ]
  },
  hero: {
    kicker: "Rotaract District 3206",
    title: "Service, Leadership, and Lasting Community Impact",
    subtitle:
      "We design high-impact local projects, empower young leaders, and collaborate with partners to create measurable social change.",
    actions: [
      { label: "Become a Volunteer", href: "#eventsSection", type: "solid" },
      { label: "Support Our Campaigns", href: "#campaignsSection", type: "outline" }
    ],
    facts: [
      "Founded in 2014",
      "120+ Active Members",
      "18 Annual Community Drives"
    ],
    panel: {
      title: "This Month at a Glance",
      items: [
        "Health outreach in 6 villages",
        "Career mentoring for 280 students",
        "Tree restoration along 4km riverbank"
      ],
      note: "Weekly updates are published every Friday at 18:00."
    }
  },
  impact: {
    kicker: "Impact Dashboard",
    title: "Transparent Results, Updated Regularly",
    stats: [
      { label: "Lives Reached", value: 26400, suffix: "+" },
      { label: "Volunteer Hours", value: 9100, suffix: "+" },
      { label: "Projects Completed", value: 84, suffix: "" },
      { label: "Partner Organizations", value: 37, suffix: "" }
    ]
  },
  programs: {
    kicker: "What We Do",
    title: "Flagship Programs",
    intro:
      "Each program is structured around measurable targets, local partnerships, and youth-led execution.",
    cards: [
      {
        title: "Community Health Access",
        description:
          "Mobile screening camps, blood donation networks, and health awareness sessions with medical partners.",
        tags: ["Health", "Screening", "Awareness"]
      },
      {
        title: "Education and Skills",
        description:
          "Scholar support, digital literacy classes, and mentorship circles for school and college students.",
        tags: ["Education", "Mentoring", "Digital"]
      },
      {
        title: "Climate and Sustainability",
        description:
          "Urban plantation, waste segregation drives, and practical climate action training for neighborhoods.",
        tags: ["Climate", "Waste", "Green Cities"]
      },
      {
        title: "Youth Leadership",
        description:
          "Leadership bootcamps and project labs where members build and launch real social initiatives.",
        tags: ["Leadership", "Training", "Innovation"]
      }
    ]
  },
  events: {
    kicker: "Get Involved",
    title: "Upcoming Events",
    timeline: [
      {
        date: "May 05, 2026",
        title: "Mega Blood Donation Drive",
        location: "City Civic Auditorium",
        description: "Targeting 500 donors with district-level medical collaboration."
      },
      {
        date: "May 19, 2026",
        title: "Career Compass Workshop",
        location: "Metro Government School",
        description: "College and career mentoring for final-year students."
      },
      {
        date: "June 02, 2026",
        title: "Riverbank Restoration Day",
        location: "North Canal Zone",
        description: "Native plantation and waste cleanup with local residents."
      }
    ],
    volunteerCard: {
      title: "Volunteer With Us",
      text:
        "Choose your cause, your schedule, and your preferred role. We provide orientation, mentorship, and execution support.",
      points: [
        "Flexible weekly time slots",
        "On-ground and remote opportunities",
        "Certificate and leadership credits"
      ],
      cta: { label: "Register Interest", href: "#contactSection" }
    }
  },
  campaigns: {
    kicker: "Active Campaigns",
    title: "Fundraising and Action Goals",
    list: [
      {
        title: "School Health Kits Initiative",
        description: "Distribute basic health kits to 3,000 school children.",
        raised: 18400,
        goal: 25000
      },
      {
        title: "Community Library Corners",
        description: "Set up mini libraries in underserved community centers.",
        raised: 9800,
        goal: 15000
      },
      {
        title: "Women Entrepreneur Circles",
        description: "Micro-support and training sessions for 120 local entrepreneurs.",
        raised: 14100,
        goal: 20000
      }
    ]
  },
  testimonials: {
    kicker: "Voices From The Field",
    title: "Stories of Change",
    quotes: [
      {
        text:
          "The Rotaract mentorship program helped me secure my first internship and build confidence in public speaking.",
        name: "Anita R.",
        role: "Student Beneficiary"
      },
      {
        text:
          "Their project planning is disciplined and transparent. Every partnership meeting ends with clear next steps.",
        name: "Dr. Naveen P.",
        role: "Partner Clinic Lead"
      },
      {
        text:
          "I joined as a volunteer and discovered leadership opportunities I never thought possible.",
        name: "Rahul M.",
        role: "Club Volunteer"
      }
    ]
  },
  donate: {
    kicker: "Support The Mission",
    title: "Fuel Impact Through Giving",
    text:
      "Your contribution directly supports verified projects in health, education, and sustainability.",
    presets: [10, 25, 50, 100],
    buttonLabel: "Donate Now",
    note: "This demo button can be connected to Razorpay, Stripe, or any payment gateway."
  },
  gallery: {
    kicker: "In Action",
    title: "Project Highlights",
    images: [
      {
        src: "https://images.unsplash.com/photo-1529390079861-591de354faf5?auto=format&fit=crop&w=900&q=80",
        alt: "Volunteers planting saplings in a community area"
      },
      {
        src: "https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?auto=format&fit=crop&w=900&q=80",
        alt: "Students attending a mentoring workshop"
      },
      {
        src: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=900&q=80",
        alt: "Medical camp consultation with local residents"
      },
      {
        src: "https://images.unsplash.com/photo-1524069290683-0457abfe42c3?auto=format&fit=crop&w=900&q=80",
        alt: "Team discussion during NGO planning session"
      }
    ]
  },
  blog: {
    kicker: "Insights",
    title: "Latest Updates",
    posts: [
      {
        title: "How Youth-Led Projects Improve Last-Mile Delivery",
        excerpt: "A practical look at how Rotaract teams move from ideation to measurable outcomes.",
        link: "#"
      },
      {
        title: "5 Ways to Build Strong Volunteer Retention",
        excerpt: "From onboarding to recognition, a framework that helps teams stay committed.",
        link: "#"
      },
      {
        title: "Community Partnerships: Lessons From 12 Joint Drives",
        excerpt: "What worked, what failed, and how we now design stronger multi-stakeholder projects.",
        link: "#"
      }
    ]
  },
  faq: {
    kicker: "Help Center",
    title: "Frequently Asked Questions",
    items: [
      {
        question: "Who can join the Rotaract Club?",
        answer: "Students and young professionals interested in service and leadership can apply."
      },
      {
        question: "How do I volunteer for an event?",
        answer: "Use the contact form below and mention the event name, skill, and available dates."
      },
      {
        question: "Can organizations partner with the club?",
        answer: "Yes. We welcome NGOs, schools, hospitals, and local businesses for joint projects."
      }
    ]
  },
  contact: {
    kicker: "Connect",
    title: "Let Us Build Impact Together",
    intro:
      "Have a project idea, partnership request, or volunteer inquiry? Send us a message and our team will respond shortly.",
    details: [
      { label: "Email", value: "hello@rotaractmetro.org" },
      { label: "Phone", value: "+91 90000 12345" },
      { label: "Address", value: "Rotaract Community Center, Metro City" }
    ],
    form: {
      nameLabel: "Your Name",
      emailLabel: "Email Address",
      messageLabel: "Message",
      submitLabel: "Send Message",
      note: "Form submission is demo-ready and can be connected to Formspree, Netlify Forms, or backend APIs."
    }
  },
  newsletter: {
    kicker: "Stay Updated",
    title: "Monthly Impact Brief",
    text: "Get one concise update with milestones, events, and volunteer opportunities.",
    label: "Email for newsletter",
    submitLabel: "Subscribe"
  },
  footer: {
    about:
      "Rotaract Club of Metro City is a youth-led service organization creating sustainable social impact through action, collaboration, and leadership.",
    quickTitle: "Quick Links",
    legalTitle: "Legal",
    legalLinks: [
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
      { label: "Code of Conduct", href: "#" }
    ],
    copyright: "All rights reserved."
  },
  messages: {
    contactSuccess: "Thank you. Your message has been received.",
    newsletterSuccess: "You are now subscribed to monthly updates.",
    donationReady: "Donation flow placeholder: connect this button to your payment gateway.",
    amountRequired: "Please select or enter a valid donation amount."
  }
};
