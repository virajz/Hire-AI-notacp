
export const mockCandidates = [
  {
    id: '1',
    name: 'Aisha Patel',
    currentTitle: 'Senior AWS Solutions Architect',
    location: 'Bangalore, India',
    workAuth: 'Citizen',
    yearsExp: 7,
    skills: ['AWS', 'Cloud Architecture', 'Terraform', 'Python', 'Kubernetes', 'Docker'],
    shortlisted: false,
    status: 'new' as const,
    aiSummary: 'Aisha has 7+ years of experience building scalable cloud infrastructure with AWS. Her expertise in Kubernetes and automation tools make her an excellent fit for your DevOps Lead role. She has led cloud migration projects for enterprise clients and has the communication skills needed for cross-team collaboration.',
    achievements: [
      'Led cloud migration for a fintech company with zero downtime',
      'Reduced AWS costs by 35% through architecture optimization',
      'AWS Certified Solutions Architect - Professional'
    ]
  },
  {
    id: '2',
    name: 'James Wilson',
    currentTitle: 'Lead Frontend Engineer',
    location: 'Seattle, WA',
    workAuth: 'US Citizen',
    yearsExp: 6,
    skills: ['React', 'TypeScript', 'GraphQL', 'Next.js', 'Jest', 'CI/CD'],
    shortlisted: true,
    status: 'contacted' as const,
    aiSummary: 'James brings 6 years of frontend expertise with a strong focus on React and TypeScript. His work at TechCorp involved building high-performance web applications with sophisticated state management and API integrations. His experience with design systems makes him a strong candidate for your Senior Frontend role.',
    achievements: [
      'Built a component library used by 40+ engineers',
      'Reduced load time by 40% through code splitting and optimization',
      'Speaker at ReactConf 2023'
    ]
  },
  {
    id: '3',
    name: 'Sofia Rodriguez',
    currentTitle: 'Data Scientist',
    location: 'Buenos Aires, Argentina',
    workAuth: 'Work Visa Required',
    yearsExp: 4,
    skills: ['Python', 'TensorFlow', 'PyTorch', 'SQL', 'Pandas', 'Machine Learning'],
    shortlisted: false,
    status: 'new' as const,
    aiSummary: 'Sofia has a strong background in machine learning with 4 years of hands-on experience building and deploying predictive models. Her expertise in TensorFlow and PyTorch aligns perfectly with your ML Engineering role. Her past work in recommendation systems is directly relevant to your product needs.',
    achievements: [
      'Developed a recommendation engine that increased user engagement by 22%',
      'Published research paper on efficient deep learning models',
      'M.S. in Computer Science from University of Buenos Aires'
    ]
  },
  {
    id: '4',
    name: 'Michael Chen',
    currentTitle: 'Product Manager',
    location: 'Toronto, Canada',
    workAuth: 'Permanent Resident',
    yearsExp: 5,
    skills: ['Product Strategy', 'A/B Testing', 'User Research', 'Agile', 'Data Analysis', 'UX Design'],
    shortlisted: false,
    status: 'interested' as const,
    aiSummary: 'Michael combines technical knowledge with strong product intuition. His 5 years of experience leading product teams includes successful launches in B2B SaaS environments similar to yours. His background in UX design enables him to work effectively with design and engineering teams.',
    achievements: [
      'Led product team that grew ARR from $2M to $8M in 18 months',
      'Implemented product discovery process that reduced failed features by 60%',
      'MBA from University of Toronto with focus on technology management'
    ]
  },
  {
    id: '5',
    name: 'Priya Sharma',
    currentTitle: 'Backend Engineer',
    location: 'Hyderabad, India',
    workAuth: 'Citizen',
    yearsExp: 3,
    skills: ['Node.js', 'Express', 'MongoDB', 'Redis', 'Microservices', 'Docker'],
    shortlisted: false,
    status: 'new' as const,
    aiSummary: 'Priya has built several high-performance backend systems using Node.js and Express. Her experience with microservices architecture and database optimization makes her a strong candidate for your Backend Engineering role. She has demonstrated expertise in scaling applications to handle millions of requests.',
    achievements: [
      'Designed microservices architecture that improved API response time by 65%',
      'Implemented caching strategy that reduced database load by 40%',
      'Created automated testing framework with 90% code coverage'
    ]
  },
  {
    id: '6',
    name: 'David Kim',
    currentTitle: 'Full Stack Developer',
    location: 'Austin, TX',
    workAuth: 'US Citizen',
    yearsExp: 4,
    skills: ['JavaScript', 'React', 'Node.js', 'PostgreSQL', 'AWS', 'GraphQL'],
    shortlisted: false,
    status: 'interviewing' as const,
    aiSummary: 'David is a versatile full-stack developer with equal expertise in frontend and backend technologies. His 4 years of experience include building complete web applications from scratch and optimizing existing systems. His knowledge of both React and Node.js makes him ideal for your Full Stack role.',
    achievements: [
      'Built an e-commerce platform that processes $2M annually',
      'Reduced API latency by 70% through query optimization',
      'Contributing maintainer to popular open source libraries'
    ]
  }
];
