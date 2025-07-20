import { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import crypto from 'crypto';

interface StudentData {
  studentId: string;
  address: string;
  gpa: number;
  financialNeed: number;
  volunteerHours: number;
  academicYear: string;
  major: string;
  university: string;
  additionalInfo?: string;
}

interface MeritScoreResult {
  score: number;
  reasoning: string;
  breakdown: {
    gpaScore: number;
    financialNeedScore: number;
    volunteerScore: number;
    totalScore: number;
  };
  proofHash: string;
}

// Initialize Gemini AI
const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

export async function mcpCalculateMerit(req: Request, res: Response) {
  try {
    const studentData: StudentData = req.body;

    // Validate required fields
    if (
      !studentData.gpa ||
      !studentData.financialNeed ||
      !studentData.volunteerHours
    ) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: gpa, financialNeed, volunteerHours',
      });
    }

    let result: MeritScoreResult;

    if (genAI) {
      // Use Gemini AI to calculate merit score
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `
          Calculate a comprehensive merit score (0-100) for a scholarship application with detailed breakdown.
          
          Student Profile:
          - GPA: ${studentData.gpa}/4.0
          - Financial Need: ${studentData.financialNeed}/100
          - Volunteer Hours: ${studentData.volunteerHours}
          - Academic Year: ${studentData.academicYear}
          - Major: ${studentData.major}
          - University: ${studentData.university}
          - Additional Info: ${studentData.additionalInfo || 'None'}
          
          Scoring Criteria:
          - GPA Score: 0-50 points (50% weight) - Higher GPA = higher score
          - Financial Need: 0-30 points (30% weight) - Higher need = higher score
          - Volunteer Experience: 0-20 points (20% weight) - More hours = higher score
          
          Please provide:
          1. Individual component scores
          2. Total merit score (0-100)
          3. Detailed reasoning explaining the assessment
          
          Format your response as JSON with this structure:
          {
            "gpaScore": number,
            "financialNeedScore": number, 
            "volunteerScore": number,
            "totalScore": number,
            "reasoning": "detailed explanation"
          }
        `;

        const aiResult = await model.generateContent(prompt);
        const response = aiResult.response.text();

        // Parse AI response
        const cleanResponse = response.replace(/```json\n?|\n?```/g, '').trim();
        const aiScores = JSON.parse(cleanResponse);

        result = {
          score: Math.min(100, Math.max(0, aiScores.totalScore)),
          reasoning: aiScores.reasoning,
          breakdown: {
            gpaScore: Math.min(50, Math.max(0, aiScores.gpaScore)),
            financialNeedScore: Math.min(
              30,
              Math.max(0, aiScores.financialNeedScore),
            ),
            volunteerScore: Math.min(20, Math.max(0, aiScores.volunteerScore)),
            totalScore: Math.min(100, Math.max(0, aiScores.totalScore)),
          },
          proofHash: generateProofHash(studentData, aiScores.totalScore),
        };
      } catch (aiError) {
        console.warn('AI calculation failed, using fallback:', aiError);
        result = calculateFallbackMerit(studentData);
      }
    } else {
      // Fallback calculation without AI
      result = calculateFallbackMerit(studentData);
    }

    res.json(result);
  } catch (error) {
    console.error('Merit calculation error:', error);
    res.status(500).json({
      success: false,
      error:
        error instanceof Error ? error.message : 'Merit calculation failed',
    });
  }
}

function calculateFallbackMerit(studentData: StudentData): MeritScoreResult {
  // Calculate component scores using mathematical formulas
  const gpaScore = Math.round((studentData.gpa / 4.0) * 50);
  const financialNeedScore = Math.round((studentData.financialNeed / 100) * 30);
  const volunteerScore = Math.round(
    Math.min(studentData.volunteerHours / 200, 1) * 20,
  );
  const totalScore = gpaScore + financialNeedScore + volunteerScore;

  let reasoning = `Merit score calculated using academic and financial criteria: `;
  reasoning += `GPA score: ${gpaScore}/50 (${studentData.gpa.toFixed(1)}/4.0), `;
  reasoning += `Financial need: ${financialNeedScore}/30 (${studentData.financialNeed}% need), `;
  reasoning += `Volunteer service: ${volunteerScore}/20 (${studentData.volunteerHours} hours). `;

  if (totalScore >= 80) {
    reasoning += `Excellent candidate with strong academic performance and significant need/service.`;
  } else if (totalScore >= 60) {
    reasoning += `Good candidate with solid qualifications for scholarship support.`;
  } else {
    reasoning += `Potential candidate who could benefit from scholarship assistance.`;
  }

  return {
    score: totalScore,
    reasoning,
    breakdown: {
      gpaScore,
      financialNeedScore,
      volunteerScore,
      totalScore,
    },
    proofHash: generateProofHash(studentData, totalScore),
  };
}

function generateProofHash(studentData: StudentData, score: number): string {
  // Generate a deterministic hash for the proof
  const dataString = JSON.stringify({
    studentId: studentData.studentId,
    gpa: studentData.gpa,
    financialNeed: studentData.financialNeed,
    volunteerHours: studentData.volunteerHours,
    score,
    timestamp: Math.floor(Date.now() / 1000),
  });

  return '0x' + crypto.createHash('sha256').update(dataString).digest('hex');
}
