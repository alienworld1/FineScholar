import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Student data structure for merit score calculation
 */
export interface StudentData {
  studentId: string;
  address: string;
  gpa: number; // 0.0 - 4.0
  financialNeed: number; // 0-100 scale (0 = no need, 100 = highest need)
  volunteerHours: number; // Total volunteer hours
  academicYear: string; // e.g., "Sophomore", "Junior"
  major?: string;
  university?: string;
  additionalInfo?: string;
}

/**
 * Merit score calculation result
 */
export interface MeritScoreResult {
  score: number; // 0-100
  reasoning: string;
  breakdown: {
    gpaScore: number;
    financialNeedScore: number;
    volunteerScore: number;
    totalScore: number;
  };
  proofHash: string;
}

/**
 * Gemini AI service for calculating merit scores
 */
export class GeminiMeritCalculator {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('Gemini API key is required');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  /**
   * Calculate merit score using Gemini AI
   * @param studentData Student information for scoring
   * @returns Promise<MeritScoreResult>
   */
  async calculateMeritScore(
    studentData: StudentData,
  ): Promise<MeritScoreResult> {
    try {
      const prompt = this.createMeritScorePrompt(studentData);
      console.log('🤖 Sending request to Gemini AI...');

      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      console.log('🔍 Gemini AI Response:', text);

      // Parse the AI response
      const meritResult = this.parseMeritScoreResponse(text, studentData);

      // Generate proof hash for blockchain verification
      const proofData = {
        studentData,
        result: meritResult,
        timestamp: Date.now(),
        model: 'gemini-1.5-flash',
      };

      // Simple hash generation (in production, use more secure hashing)
      const proofHash = this.generateProofHash(JSON.stringify(proofData));
      meritResult.proofHash = proofHash;

      console.log('✅ Merit Score Calculated:', meritResult);
      return meritResult;
    } catch (error) {
      console.error('❌ Error calculating merit score:', error);
      throw new Error(`Gemini AI calculation failed: ${error}`);
    }
  }

  /**
   * Create detailed prompt for merit score calculation
   */
  private createMeritScorePrompt(studentData: StudentData): string {
    return `
You are an AI scholarship advisor tasked with calculating a fair merit score for a university student.

STUDENT INFORMATION:
- Student ID: ${studentData.studentId}
- GPA: ${studentData.gpa}/4.0
- Financial Need Level: ${studentData.financialNeed}/100 (0=no need, 100=highest need)
- Volunteer Hours: ${studentData.volunteerHours}
- Academic Year: ${studentData.academicYear}
- Major: ${studentData.major || 'Not specified'}
- University: ${studentData.university || 'Not specified'}
- Additional Info: ${studentData.additionalInfo || 'None'}

SCORING CRITERIA:
1. GPA Component (50% weight): Higher GPA = higher score
   - 4.0 GPA = 50 points
   - 3.5-3.99 GPA = 40-49 points
   - 3.0-3.49 GPA = 30-39 points
   - 2.5-2.99 GPA = 20-29 points
   - Below 2.5 GPA = 10-19 points

2. Financial Need (30% weight): Higher need = higher score
   - Financial need 80-100 = 30 points
   - Financial need 60-79 = 24 points
   - Financial need 40-59 = 18 points
   - Financial need 20-39 = 12 points
   - Financial need 0-19 = 6 points

3. Volunteer Hours (20% weight): More volunteer work = higher score
   - 200+ hours = 20 points
   - 150-199 hours = 17 points
   - 100-149 hours = 14 points
   - 50-99 hours = 10 points
   - 25-49 hours = 7 points
   - 1-24 hours = 4 points
   - 0 hours = 0 points

INSTRUCTIONS:
1. Calculate each component score based on the criteria above
2. Sum all components for total merit score (0-100)
3. Provide reasoning for the score
4. Respond in this EXACT JSON format:

{
  "gpaScore": [number],
  "financialNeedScore": [number], 
  "volunteerScore": [number],
  "totalScore": [number],
  "reasoning": "[detailed explanation of scoring]"
}

Calculate the merit score now:
    `;
  }

  /**
   * Parse Gemini AI response to extract merit score
   */
  private parseMeritScoreResponse(
    response: string,
    studentData: StudentData,
  ): MeritScoreResult {
    try {
      // Try to extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in AI response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      // Validate the response structure
      if (
        typeof parsed.totalScore !== 'number' ||
        parsed.totalScore < 0 ||
        parsed.totalScore > 100
      ) {
        throw new Error('Invalid total score in AI response');
      }

      return {
        score: Math.round(parsed.totalScore),
        reasoning: parsed.reasoning || 'Merit score calculated by AI',
        breakdown: {
          gpaScore: parsed.gpaScore || 0,
          financialNeedScore: parsed.financialNeedScore || 0,
          volunteerScore: parsed.volunteerScore || 0,
          totalScore: Math.round(parsed.totalScore),
        },
        proofHash: '', // Will be set later
      };
    } catch (error) {
      console.warn(
        '⚠️ Failed to parse AI response, using fallback calculation',
      );
      // Fallback calculation if AI response parsing fails
      return this.fallbackMeritCalculation(studentData);
    }
  }

  /**
   * Fallback merit calculation if AI fails
   */
  private fallbackMeritCalculation(studentData: StudentData): MeritScoreResult {
    // GPA component (50% weight)
    let gpaScore = 0;
    if (studentData.gpa >= 4.0) gpaScore = 50;
    else if (studentData.gpa >= 3.5)
      gpaScore = Math.round(40 + (studentData.gpa - 3.5) * 20);
    else if (studentData.gpa >= 3.0)
      gpaScore = Math.round(30 + (studentData.gpa - 3.0) * 20);
    else if (studentData.gpa >= 2.5)
      gpaScore = Math.round(20 + (studentData.gpa - 2.5) * 20);
    else gpaScore = Math.max(10, Math.round(studentData.gpa * 5));

    // Financial need component (30% weight)
    const financialNeedScore = Math.round(studentData.financialNeed * 0.3);

    // Volunteer hours component (20% weight)
    let volunteerScore = 0;
    if (studentData.volunteerHours >= 200) volunteerScore = 20;
    else if (studentData.volunteerHours >= 150) volunteerScore = 17;
    else if (studentData.volunteerHours >= 100) volunteerScore = 14;
    else if (studentData.volunteerHours >= 50) volunteerScore = 10;
    else if (studentData.volunteerHours >= 25) volunteerScore = 7;
    else if (studentData.volunteerHours >= 1) volunteerScore = 4;

    const totalScore = Math.min(
      100,
      gpaScore + financialNeedScore + volunteerScore,
    );

    return {
      score: totalScore,
      reasoning:
        'Fallback calculation: Merit score based on GPA (50%), financial need (30%), and volunteer hours (20%)',
      breakdown: {
        gpaScore,
        financialNeedScore,
        volunteerScore,
        totalScore,
      },
      proofHash: '',
    };
  }

  /**
   * Generate a proof hash for blockchain verification
   */
  private generateProofHash(data: string): string {
    // Simple hash generation - in production use crypto libraries
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return `0x${Math.abs(hash).toString(16).padStart(64, '0')}`;
  }

  /**
   * Validate student data before processing
   */
  public validateStudentData(studentData: StudentData): boolean {
    if (!studentData.studentId || !studentData.address) {
      throw new Error('Student ID and address are required');
    }

    if (studentData.gpa < 0 || studentData.gpa > 4.0) {
      throw new Error('GPA must be between 0.0 and 4.0');
    }

    if (studentData.financialNeed < 0 || studentData.financialNeed > 100) {
      throw new Error('Financial need must be between 0 and 100');
    }

    if (studentData.volunteerHours < 0) {
      throw new Error('Volunteer hours cannot be negative');
    }

    return true;
  }
}
