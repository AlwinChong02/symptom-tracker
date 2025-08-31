import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/dbConnect';
import SymptomHistory from '../../../../models/SymptomHistory';
import User from '../../../../models/User';
import { requireAdmin } from '../../../../lib/adminAuth';

// GET all user assessments with analysis (admin only)
export async function GET(req) {
  try {
    await requireAdmin(req);
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const skip = (page - 1) * limit;

    // Build query
    let query = {};
    if (userId) {
      query.user = userId;
    }
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const assessments = await SymptomHistory.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await SymptomHistory.countDocuments(query);

    // Generate analysis
    const analysis = await generateAssessmentAnalysis(query);

    return NextResponse.json({
      success: true,
      data: {
        assessments,
        analysis,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: error.message === 'Admin access required' ? 403 : 500 }
    );
  }
}

async function generateAssessmentAnalysis(query) {
  try {
    const assessments = await SymptomHistory.find(query);
    
    if (assessments.length === 0) {
      return {
        totalAssessments: 0,
        uniqueUsers: 0,
        averageScore: 0,
        riskDistribution: { low: 0, medium: 0, high: 0 },
        commonSymptoms: [],
        timeAnalysis: {}
      };
    }

    // Basic statistics
    const totalAssessments = assessments.length;
    const uniqueUsers = new Set(assessments.map(a => a.user.toString())).size;
    
    // Calculate average score
    const totalScore = assessments.reduce((sum, assessment) => {
      return sum + (assessment.totalScore || 0);
    }, 0);
    const averageScore = totalScore / totalAssessments;

    // Risk distribution
    const riskDistribution = { low: 0, medium: 0, high: 0 };
    assessments.forEach(assessment => {
      const score = assessment.totalScore || 0;
      if (score < 30) riskDistribution.low++;
      else if (score < 60) riskDistribution.medium++;
      else riskDistribution.high++;
    });

    // Common symptoms analysis
    const symptomCounts = {};
    assessments.forEach(assessment => {
      if (assessment.symptoms && Array.isArray(assessment.symptoms)) {
        assessment.symptoms.forEach(symptom => {
          if (symptom.selected) {
            symptomCounts[symptom.name] = (symptomCounts[symptom.name] || 0) + 1;
          }
        });
      }
    });

    const commonSymptoms = Object.entries(symptomCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([name, count]) => ({ name, count, percentage: (count / totalAssessments * 100).toFixed(1) }));

    // Time-based analysis (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentAssessments = assessments.filter(a => new Date(a.createdAt) >= thirtyDaysAgo);
    const dailyStats = {};
    
    recentAssessments.forEach(assessment => {
      const date = new Date(assessment.createdAt).toISOString().split('T')[0];
      if (!dailyStats[date]) {
        dailyStats[date] = { count: 0, totalScore: 0 };
      }
      dailyStats[date].count++;
      dailyStats[date].totalScore += assessment.totalScore || 0;
    });

    // Convert to array and calculate averages
    const timeAnalysis = Object.entries(dailyStats).map(([date, stats]) => ({
      date,
      count: stats.count,
      averageScore: stats.totalScore / stats.count
    })).sort((a, b) => new Date(a.date) - new Date(b.date));

    return {
      totalAssessments,
      uniqueUsers,
      averageScore: Math.round(averageScore * 100) / 100,
      riskDistribution,
      commonSymptoms,
      timeAnalysis
    };
  } catch (error) {
    console.error('Analysis generation error:', error);
    return {
      totalAssessments: 0,
      uniqueUsers: 0,
      averageScore: 0,
      riskDistribution: { low: 0, medium: 0, high: 0 },
      commonSymptoms: [],
      timeAnalysis: {},
      error: 'Failed to generate analysis'
    };
  }
}
