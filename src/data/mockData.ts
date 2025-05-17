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
  },
  {
    id: '13',
    name: 'Lucas Oliveira',
    currentTitle: 'Blockchain Developer',
    location: 'São Paulo, Brazil',
    workAuth: 'Work Visa Required',
    yearsExp: 4,
    skills: ['Solidity', 'Ethereum', 'Web3.js', 'Smart Contracts', 'Rust', 'DeFi'],
    shortlisted: false,
    status: 'new' as const,
    aiSummary: 'Lucas is a blockchain specialist with experience in DeFi and smart contract development. His work on decentralized applications and security-focused development makes him a strong candidate for blockchain roles. He has contributed to several open-source blockchain projects.',
    achievements: [
      'Developed DeFi protocol with $50M TVL',
      'Audited smart contracts for major crypto projects',
      'Created security-focused smart contract library'
    ]
  },
  {
    id: '14',
    name: 'Yuki Nakamura',
    currentTitle: 'Game Developer',
    location: 'Osaka, Japan',
    workAuth: 'Work Visa Required',
    yearsExp: 6,
    skills: ['Unity', 'C#', 'Unreal Engine', '3D Graphics', 'Game Physics', 'VR/AR'],
    shortlisted: false,
    status: 'interested' as const,
    aiSummary: 'Yuki brings 6 years of experience in game development with expertise in both Unity and Unreal Engine. Her work on mobile and VR games demonstrates her versatility and technical depth. She has a strong background in performance optimization and graphics programming.',
    achievements: [
      'Developed mobile game with 5M+ downloads',
      'Optimized VR game performance by 40%',
      'Created reusable game engine components'
    ]
  },
  {
    id: '15',
    name: 'Fatima Al-Mansouri',
    currentTitle: 'Data Engineer',
    location: 'Dubai, UAE',
    workAuth: 'Work Visa Required',
    yearsExp: 5,
    skills: ['Apache Spark', 'Airflow', 'Python', 'SQL', 'Data Warehousing', 'ETL'],
    shortlisted: true,
    status: 'contacted' as const,
    aiSummary: 'Fatima specializes in building scalable data pipelines and data warehouses. Her experience with big data technologies and ETL processes makes her an excellent fit for data engineering roles. She has successfully implemented data solutions for enterprise clients.',
    achievements: [
      'Built data pipeline processing 1TB daily',
      'Reduced ETL job runtime by 60%',
      'Implemented real-time analytics system'
    ]
  },
  {
    id: '16',
    name: 'Marcus Johnson',
    currentTitle: 'Site Reliability Engineer',
    location: 'Chicago, IL',
    workAuth: 'US Citizen',
    yearsExp: 7,
    skills: ['Kubernetes', 'Prometheus', 'Grafana', 'Terraform', 'Go', 'Incident Response'],
    shortlisted: false,
    status: 'interviewing' as const,
    aiSummary: 'Marcus is an experienced SRE with a focus on building reliable and scalable infrastructure. His expertise in monitoring, automation, and incident response makes him a strong candidate for SRE roles. He has improved system reliability and reduced incident response time in previous positions.',
    achievements: [
      'Reduced system downtime by 99.9%',
      'Automated 80% of operational tasks',
      'Led incident response team during major outages'
    ]
  },
  {
    id: '17',
    name: 'Aisha Rahman',
    currentTitle: 'Technical Product Manager',
    location: 'Karachi, Pakistan',
    workAuth: 'Work Visa Required',
    yearsExp: 6,
    skills: ['Product Strategy', 'Technical Architecture', 'Agile', 'Data Analytics', 'API Design', 'Cloud Services'],
    shortlisted: false,
    status: 'new' as const,
    aiSummary: 'Aisha combines technical expertise with product management skills. Her experience in leading technical product teams and working with engineering teams makes her an excellent fit for technical product roles. She has successfully launched several enterprise products.',
    achievements: [
      'Led development of enterprise API platform',
      'Increased product adoption by 200%',
      'Reduced time-to-market by 40%'
    ]
  },
  {
    id: '18',
    name: 'Carlos Mendoza',
    currentTitle: 'Cloud Solutions Architect',
    location: 'Mexico City, Mexico',
    workAuth: 'Work Visa Required',
    yearsExp: 8,
    skills: ['AWS', 'Azure', 'GCP', 'Cloud Architecture', 'Serverless', 'DevOps'],
    shortlisted: true,
    status: 'contacted' as const,
    aiSummary: 'Carlos is a cloud architecture expert with experience across major cloud providers. His work on enterprise cloud migrations and serverless architectures makes him a strong candidate for cloud architecture roles. He has helped organizations optimize their cloud infrastructure.',
    achievements: [
      'Led cloud migration saving $2M annually',
      'Designed multi-cloud architecture for global enterprise',
      'AWS Certified Solutions Architect - Professional'
    ]
  },
  {
    id: '19',
    name: 'Sophie Dubois',
    currentTitle: 'AI Research Engineer',
    location: 'Paris, France',
    workAuth: 'EU Citizen',
    yearsExp: 5,
    skills: ['Deep Learning', 'PyTorch', 'TensorFlow', 'Research', 'NLP', 'Computer Vision'],
    shortlisted: false,
    status: 'interested' as const,
    aiSummary: 'Sophie combines research expertise with practical engineering skills. Her work in deep learning and natural language processing makes her an excellent fit for AI research roles. She has published papers in top AI conferences and implemented research findings in production systems.',
    achievements: [
      'Published research at ICML 2023',
      'Developed state-of-the-art NLP model',
      'Led AI research team at tech startup'
    ]
  },
  {
    id: '20',
    name: 'Kwame Osei',
    currentTitle: 'Backend Team Lead',
    location: 'Accra, Ghana',
    workAuth: 'Work Visa Required',
    yearsExp: 7,
    skills: ['Java', 'Spring Boot', 'Microservices', 'Kafka', 'PostgreSQL', 'Team Leadership'],
    shortlisted: false,
    status: 'new' as const,
    aiSummary: 'Kwame is an experienced backend developer and team lead with expertise in building scalable microservices. His leadership experience and technical depth make him a strong candidate for backend team lead roles. He has successfully led teams in delivering complex backend systems.',
    achievements: [
      'Led team of 8 engineers in microservices migration',
      'Improved system performance by 300%',
      'Mentored 5 junior developers to senior level'
    ]
  }
];
