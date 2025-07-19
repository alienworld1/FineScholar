import type { StudentData } from '../services/geminiAI';

/**
 * Mock student data for testing the AI merit score calculation
 * and blockchain integration
 */
export const mockStudentsData: StudentData[] = [
  {
    studentId: 'STU001',
    address: '0xc29d5d17Ee9C10929DEA6a02a849B72737686BcE', // Valid address
    gpa: 3.8,
    financialNeed: 75,
    volunteerHours: 120,
    academicYear: 'Junior',
    major: 'Computer Science',
    university: 'Tech University',
    additionalInfo:
      'Active in coding bootcamp mentorship and local food bank volunteering. First-generation college student.',
  },
  {
    studentId: 'STU002',
    address: '0x8ba1f109551bD432803012645Aac136c302231c5', // Valid address (fixed H -> A)
    gpa: 3.2,
    financialNeed: 90,
    volunteerHours: 80,
    academicYear: 'Sophomore',
    major: 'Engineering',
    university: 'State University',
    additionalInfo:
      'Part-time job to support family. Tutors younger students in mathematics.',
  },
  {
    studentId: 'STU003',
    address: '0x3456789012345678901234567890123456789abc', // Valid address
    gpa: 3.9,
    financialNeed: 60,
    volunteerHours: 200,
    academicYear: 'Senior',
    major: 'Biology',
    university: 'Science College',
    additionalInfo:
      'Pre-med student conducting research on cancer treatments. Volunteers at free clinic.',
  },
  {
    studentId: 'STU004',
    address: '0x4567890123456789012345678901234567890def', // Valid address
    gpa: 2.8,
    financialNeed: 85,
    volunteerHours: 40,
    academicYear: 'Freshman',
    major: 'Art History',
    university: 'Liberal Arts College',
    additionalInfo:
      'Recovering from health issues that affected academic performance. Shows improvement trend.',
  },
  {
    studentId: 'STU005',
    address: '0x5678901234567890123456789012345678901234', // Valid address
    gpa: 4.0,
    financialNeed: 30,
    volunteerHours: 300,
    academicYear: 'Graduate',
    major: 'Education',
    university: 'Education Institute',
    additionalInfo:
      "Dean's list student. Volunteers teaching literacy to adults and children in underserved communities.",
  },
];

/**
 * Generate random student data for testing (useful for load testing)
 */
export function generateRandomStudentData(count: number = 1): StudentData[] {
  const majors = [
    'Computer Science',
    'Engineering',
    'Biology',
    'Mathematics',
    'Art History',
    'Business',
    'Education',
    'Psychology',
  ];
  const universities = [
    'Tech University',
    'State University',
    'Science College',
    'Liberal Arts College',
    'Education Institute',
  ];
  const academicYears = [
    'Freshman',
    'Sophomore',
    'Junior',
    'Senior',
    'Graduate',
  ];

  const students: StudentData[] = [];

  for (let i = 0; i < count; i++) {
    const studentId = `STU${String(i + 100).padStart(3, '0')}`;
    const randomAddress = generateRandomAddress();

    students.push({
      studentId,
      address: randomAddress,
      gpa: Number((Math.random() * 3 + 1).toFixed(2)), // 1.0 - 4.0
      financialNeed: Math.floor(Math.random() * 100), // 0-100
      volunteerHours: Math.floor(Math.random() * 400), // 0-400
      academicYear:
        academicYears[Math.floor(Math.random() * academicYears.length)],
      major: majors[Math.floor(Math.random() * majors.length)],
      university: universities[Math.floor(Math.random() * universities.length)],
      additionalInfo: generateRandomAdditionalInfo(),
    });
  }

  return students;
}

/**
 * Generate a random Ethereum address
 */
function generateRandomAddress(): string {
  const chars = '0123456789abcdef';
  let address = '0x';
  for (let i = 0; i < 40; i++) {
    address += chars[Math.floor(Math.random() * chars.length)];
  }
  return address;
}

/**
 * Generate random additional info
 */
function generateRandomAdditionalInfo(): string {
  const infos = [
    'Active in student government and community service projects.',
    'Works part-time to support family while maintaining academic excellence.',
    'First-generation college student with strong leadership skills.',
    'Volunteers at local animal shelter and environmental cleanup initiatives.',
    'Tutors underprivileged students and mentors high school students.',
    'Participates in research projects and academic competitions.',
    'Has overcome personal challenges while pursuing education goals.',
  ];

  return infos[Math.floor(Math.random() * infos.length)];
}

/**
 * Student data organized by merit score ranges for testing
 */
export const studentsByMeritRange = {
  high: mockStudentsData.filter(s => s.gpa >= 3.7 && s.volunteerHours >= 150),
  medium: mockStudentsData.filter(s => s.gpa >= 3.0 && s.gpa < 3.7),
  low: mockStudentsData.filter(s => s.gpa < 3.0),
};

/**
 * Test scenarios for different edge cases
 */
export const testScenarios = {
  perfectStudent: {
    studentId: 'PERFECT001',
    address: '0x9999999999999999999999999999999999999999',
    gpa: 4.0,
    financialNeed: 100,
    volunteerHours: 500,
    academicYear: 'Senior',
    major: 'Computer Science',
    university: 'Top University',
    additionalInfo: 'Perfect student with maximum need and volunteer work.',
  },

  minimalStudent: {
    studentId: 'MINIMAL001',
    address: '0x1111111111111111111111111111111111111111',
    gpa: 2.0,
    financialNeed: 10,
    volunteerHours: 0,
    academicYear: 'Freshman',
    major: 'Undeclared',
    university: 'Community College',
    additionalInfo: 'Student with minimal qualifications.',
  },

  improvedStudent: {
    studentId: 'IMPROVED001',
    address: '0x8888888888888888888888888888888888888888',
    gpa: 3.5,
    financialNeed: 70,
    volunteerHours: 100,
    academicYear: 'Junior',
    major: 'Psychology',
    university: 'State University',
    additionalInfo: 'Student showing significant improvement from poor start.',
  },
};
