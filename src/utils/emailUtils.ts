
type CandidateType = {
  name: string;
  currentTitle: string;
  skills: string[];
  location: string;
};

export const generateEmailTemplate = (candidate: CandidateType, templateType: string) => {
  const { name, currentTitle, skills, location } = candidate;
  const relevantSkills = skills.slice(0, 3).join(", ");
  const companyName = "TechCo";
  const recruiterName = "Alex Recruiter";
  const position = templateType === "software-engineer" ? "Senior Software Engineer" :
                   templateType === "product-manager" ? "Product Manager" :
                   templateType === "data-scientist" ? "Data Scientist" :
                   "UX Designer";

  const templates = {
    "software-engineer": `Hi ${name},

I hope this email finds you well! My name is ${recruiterName} and I'm a technical recruiter at ${companyName}.

I came across your profile and was particularly impressed by your experience as a ${currentTitle} and your skills in ${relevantSkills}. We're currently looking for a ${position} to join our engineering team, and I think your background could be a great fit.

At ${companyName}, we're building cutting-edge technology solutions that [brief company description]. Our engineering team is focused on [team focus], and we're looking for someone with your expertise to help us [main job responsibility].

Would you be interested in having a quick chat about this opportunity? I'd be happy to share more details about the role, our team, and answer any questions you might have.

Looking forward to connecting!

Best regards,
${recruiterName}
Technical Recruiter | ${companyName}
`,
    "product-manager": `Hi ${name},

Hope you're having a great day! I'm ${recruiterName}, a recruiter at ${companyName}.

I was impressed by your experience as a ${currentTitle} and your skills in ${relevantSkills}. We're looking for a talented ${position} to lead our product initiatives, and your background caught my attention.

At ${companyName}, we're on a mission to [company mission], and our product team plays a crucial role in [key responsibility]. We're at an exciting growth stage, and your expertise would be valuable as we scale our operations.

I'd love to tell you more about the role and learn about your career interests. Would you be available for a brief call this week?

Looking forward to connecting!

Best regards,
${recruiterName}
Technical Recruiter | ${companyName}
`,
    "data-scientist": `Hi ${name},

I hope this email finds you well! I'm ${recruiterName}, a technical recruiter at ${companyName}.

I recently came across your profile and was impressed by your experience as a ${currentTitle} and your expertise in ${relevantSkills}. We're looking for a talented ${position} to join our data team, and I believe your background aligns well with what we need.

At ${companyName}, we're leveraging advanced data science to [company focus]. Our data science team works on challenging problems like [example problems], and we're looking for someone with your skills to help us [main job responsibility].

Would you be open to a conversation about this opportunity? I'd be happy to share more details about the role, our team, and the interesting projects you'd be working on.

Looking forward to hearing from you!

Best regards,
${recruiterName}
Technical Recruiter | ${companyName}
`,
    "designer": `Hi ${name},

I hope you're doing well! My name is ${recruiterName} and I'm a recruiter at ${companyName}.

Your experience as a ${currentTitle} and your skills in ${relevantSkills} really stood out to me. We're currently searching for a talented ${position} to join our product team, and I think you might be a great fit.

At ${companyName}, design is at the core of our product philosophy. We're working on [project description], and we need someone with your creative vision to help us [key responsibility].

I'd love to tell you more about this opportunity and learn about what you're looking for in your next role. Would you be available for a brief call this week?

Looking forward to connecting!

Best regards,
${recruiterName}
Technical Recruiter | ${companyName}
`
  };

  return templates[templateType as keyof typeof templates] || templates["software-engineer"];
};
