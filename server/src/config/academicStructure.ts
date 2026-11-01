/**
 * Centralized JECRC University Official Academic Structure
 * 
 * Maps Official Degree -> Approved Courses / Specializations.
 * Used for:
 * - Frontend registration dependent dropdowns
 * - Backend Zod validation & API security
 * - Admin directory filters
 * - Automated test verification
 */

export const OTHER_OPTION = 'Other / Not Listed';

export const JECRC_ACADEMIC_STRUCTURE: Record<string, string[]> = {
  'B.Tech': [
    'Computer Science & Engineering (CSE)',
    'Civil Engineering',
    'Electronics & Communication Engineering (ECE)',
    'Mechanical Engineering',
    'Artificial Intelligence',
    'Artificial Intelligence & Machine Learning',
    'Data Science',
    'Cloud Computing',
    'Cyber Security',
    'Software Product Engineering',
    'Generative AI',
    'Full Stack Development',
    'Other / Not Listed',
  ],
  'B.Tech Lateral Entry': [
    'Computer Science & Engineering',
    'Civil Engineering',
    'Electronics & Communication Engineering',
    'Mechanical Engineering',
    'Other / Not Listed',
  ],
  'M.Tech': [
    'Computer Science & Engineering',
    'Civil Engineering',
    'Electronics & Communication Engineering',
    'Mechanical Engineering',
    'Electrical Engineering',
    'Other / Not Listed',
  ],
  'BCA': [
    'General BCA',
    'Artificial Intelligence',
    'Data Science',
    'Health Informatics',
    'Cyber Security',
    'Data Science & Data Analytics',
    'Cloud Computing & Full Stack Development',
    'Artificial Intelligence & Machine Learning',
    'Full Stack Web Design & Development',
    'AI DevOps & Cloud Automation',
    'Other / Not Listed',
  ],
  'MCA': [
    'General MCA',
    'Artificial Intelligence & Data Science',
    'Cyber Security',
    'Data Science & Data Analytics',
    'Cloud Computing & Full Stack Development',
    'Artificial Intelligence & Machine Learning',
    'Full Stack Web Design & Development',
    'AI DevOps & Cloud Automation',
    'Other / Not Listed',
  ],
  'BBA': [
    'General BBA',
    'Human Resources (HR)',
    'Information Technology (IT)',
    'Finance',
    'Marketing',
    'International Business',
    'Banking, Financial Services & Insurance (BFSI)',
    'New Age Digital Marketing',
    'Data Analytics & Data Visualization',
    'Fintech',
    'Other / Not Listed',
  ],
  'B.Com': [
    'Accountancy & Business Statistics (ABST)',
    'Economic Administration & Financial Management (EAFM)',
    'Business Administration',
    'Capital Market',
    'Other / Not Listed',
  ],
  'MBA': [
    'Marketing',
    'Finance',
    'Information Technology',
    'Human Resource Management (HRM)',
    'Production & Operations Management',
    'Banking, Financial Services & Insurance (BFSI)',
    'Data Analytics & Data Visualization',
    'Artificial Intelligence',
    'Fintech',
    'Global Finance & AI',
    'Applied Finance',
    'Other / Not Listed',
  ],
  'B.Des': [
    'Interior Design',
    'Jewellery Design',
    'Game Arts & Animation',
    'Fashion Design',
    'Graphic Design',
    'Painting Design',
    'Other / Not Listed',
  ],
  'M.Des': [
    'Interior Design',
    'Fashion Design',
    'Other / Not Listed',
  ],
  'Masters of Visual Arts': [
    'Graphic Design',
    'Other / Not Listed',
  ],
  'M.Sc Design': [
    'Interior Design',
    'Jewellery Design',
    'Graphic Design',
    'Fashion Design',
    'Other / Not Listed',
  ],
  'BA (Hons.)': [
    'English',
    'Psychology',
    'Political Science',
    'Liberal Studies',
    'International Relations',
    'Economics',
    'Other / Not Listed',
  ],
  'MA': [
    'Political Science',
    'Public Policy & Governance',
    'Economics',
    'Other / Not Listed',
  ],
  'BA LLB (Hons.)': [
    'Law',
    'Other / Not Listed',
  ],
  'BBA LLB (Hons.)': [
    'Law',
    'Other / Not Listed',
  ],
  'BSc LLB (Hons.)': [
    'Law',
    'Other / Not Listed',
  ],
  'LLM': [
    'Corporate Law',
    'Intellectual Property Rights',
    'Personal Law',
    'Other / Not Listed',
  ],
  'B.Sc': [
    'Hospitality & Hotel Management',
    'Other / Not Listed',
  ],
  'B.Sc (Hons.)': [
    'Microbiology',
    'Biotechnology',
    'Forensic Science',
    'Other / Not Listed',
  ],
  'M.Sc': [
    'Microbiology',
    'Biotechnology',
    'Forensic Science',
    'Digital & Material Chemistry',
    'Physics',
    'Chemistry',
    'Mathematics',
    'Botany',
    'Zoology',
    'Clinical Embryology',
    'Other / Not Listed',
  ],
  'BA-JMC': [
    'Journalism & Mass Communication',
    'Other / Not Listed',
  ],
  'MA-JMC': [
    'Journalism & Mass Communication',
    'Film Making',
    'Other / Not Listed',
  ],
  'Certificate / Foreign Language Programme': [
    'German',
    'French',
    'Japanese',
    'Other / Not Listed',
  ],
  'Ph.D.': [
    'Engineering & Technology',
    'Management',
    'Commerce',
    'Hotel Management',
    'Journalism & Mass Communication',
    'Physical & Life Sciences',
    'Law',
    'Design',
    'English',
    'Economics',
    'Psychology',
    'Other / Not Listed',
  ],
  'Other / Not Listed': [
    'Other / Not Listed',
  ],
};

export const JECRC_DEGREES = Object.keys(JECRC_ACADEMIC_STRUCTURE);

/**
 * Returns available courses for a chosen degree
 */
export const getCoursesForDegree = (degree: string): string[] => {
  if (!degree) return [];
  if (degree === OTHER_OPTION) return [OTHER_OPTION];
  return JECRC_ACADEMIC_STRUCTURE[degree] || [OTHER_OPTION];
};

/**
 * Validates whether a degree exists or is marked Other
 */
export const isValidDegree = (degree: string): boolean => {
  if (!degree) return false;
  return Object.prototype.hasOwnProperty.call(JECRC_ACADEMIC_STRUCTURE, degree) || degree === OTHER_OPTION;
};

/**
 * Validates whether a degree and course pair is recognized
 */
export const isValidDegreeCoursePair = (degree: string, course: string): boolean => {
  if (!degree || !course) return false;
  if (degree === OTHER_OPTION) return true; // Handled by otherDegree custom validation
  if (course === OTHER_OPTION) return true; // Handled by otherCourse custom validation
  const courses = JECRC_ACADEMIC_STRUCTURE[degree];
  if (!courses) return false;
  return courses.includes(course);
};

