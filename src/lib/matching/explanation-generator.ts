// Match Explanation Generator
// Generates compelling, personalized explanations for designer-client matches

import { Designer, Brief, ClientPreferences, EnhancedScoreResult } from './enhanced-scoring';

export interface AIAnalysisResult {
  score: number;
  confidence: 'high' | 'medium' | 'low';
  reasons: string[];
  uniqueValue?: string;
  challenges?: string[];
  riskLevel?: 'low' | 'medium' | 'high';
  matchSummary?: string;
}

export interface MatchExplanationData {
  designer: Designer;
  brief: Brief;
  aiAnalysis: AIAnalysisResult;
  scores: EnhancedScoreResult;
  clientPrefs?: ClientPreferences;
}

// Templates for different match scenarios
const explanationTemplates = {
  highMatch: {
    intro: "{designer_name} stands out as your ideal match with a {match_score}% compatibility score.",
    primaryStrength: "Their expertise in {primary_expertise} directly aligns with your {project_type} needs.",
    experience: "With {years} years specializing in {industry}, they bring both creative excellence and reliability.",
    workStyle: "{work_style_match}",
    trackRecord: "Their track record of {performance_metric} combined with {specific_skill} makes them perfectly positioned to {achieve_goal}.",
    closing: "{unique_value}"
  },
  goodMatch: {
    intro: "{designer_name} is a strong match for your project with {match_score}% compatibility.",
    primaryStrength: "They bring valuable experience in {primary_expertise} that aligns well with your {project_type}.",
    experience: "Having worked {years} years in {industry}, they understand the nuances of your market.",
    workStyle: "{work_style_match}",
    trackRecord: "With {performance_metric} and expertise in {specific_skill}, they're well-equipped to deliver on your goals.",
    closing: "{unique_value}"
  },
  moderateMatch: {
    intro: "{designer_name} offers solid capabilities for your project with {match_score}% compatibility.",
    primaryStrength: "Their background in {primary_expertise} provides a good foundation for your {project_type}.",
    experience: "They bring {years} years of design experience with exposure to {industry}.",
    workStyle: "{work_style_match}",
    trackRecord: "Their {performance_metric} demonstrates reliability for your project needs.",
    closing: "{unique_value}"
  }
};

// Generate work style match description
function generateWorkStyleMatch(designer: Designer, brief: Brief, clientPrefs?: ClientPreferences): string {
  const style = designer.communication_style || 'collaborative';
  const timeline = brief.timeline;
  const teamSize = designer.team_size || 'solo';
  
  const styleDescriptions: Record<string, string> = {
    'collaborative': "collaborative approach and experience with agile teams matches your fast-paced environment perfectly",
    'formal': "structured communication style ensures clear project milestones and deliverables",
    'casual': "flexible and adaptive working style aligns with your dynamic project needs"
  };
  
  let description = `Their ${styleDescriptions[style] || 'professional approach'}`;
  
  if (timeline === 'ASAP' || timeline === '1-2 weeks') {
    description += ", combined with their immediate availability,";
  }
  
  if (teamSize === 'small_team' || teamSize === 'agency') {
    description += " and access to a dedicated team";
  }
  
  return description;
}

// Generate performance metric highlight
function generatePerformanceMetric(designer: Designer): string {
  const metrics = [];
  
  if (designer.on_time_delivery_rate && designer.on_time_delivery_rate >= 95) {
    metrics.push(`${designer.on_time_delivery_rate}% on-time delivery rate`);
  }
  
  if (designer.avg_client_satisfaction && designer.avg_client_satisfaction >= 4.5) {
    metrics.push(`${designer.avg_client_satisfaction}/5 client satisfaction`);
  }
  
  if (designer.project_completion_rate && designer.project_completion_rate >= 95) {
    metrics.push(`${designer.project_completion_rate}% project completion rate`);
  }
  
  if (designer.total_projects_completed && designer.total_projects_completed >= 50) {
    metrics.push(`${designer.total_projects_completed}+ successful projects`);
  }
  
  return metrics[0] || "proven track record";
}

// Generate specific skill highlight
function generateSpecificSkill(designer: Designer, brief: Brief): string {
  // Match specializations with project type
  if (designer.specializations?.length) {
    const relevantSpec = designer.specializations.find(spec => 
      brief.project_type.toLowerCase().includes(spec.toLowerCase()) ||
      spec.toLowerCase().includes(brief.project_type.toLowerCase())
    );
    if (relevantSpec) return `expertise in ${relevantSpec}`;
  }
  
  // Match tools if specified
  if (designer.tools_expertise?.length && brief.required_tools?.length) {
    const matchingTool = designer.tools_expertise.find(tool => 
      brief.required_tools!.includes(tool)
    );
    if (matchingTool) return `proficiency in ${matchingTool}`;
  }
  
  // Default to style expertise
  if (designer.styles?.length) {
    return `mastery of ${designer.styles[0]} design`;
  }
  
  return "specialized expertise";
}

// Generate achievement goal based on brief
function generateAchievementGoal(brief: Brief): string {
  const projectType = brief.project_type.toLowerCase();
  
  const goals: Record<string, string> = {
    'website redesign': 'transform your online presence into a conversion powerhouse',
    'mobile app design': 'create an intuitive and engaging mobile experience',
    'branding': 'develop a distinctive brand identity that resonates with your audience',
    'ui/ux design': 'craft user experiences that delight and convert',
    'dashboard design': 'transform your data into actionable insights',
    'e-commerce': 'boost your online sales with compelling design',
    'saas': 'create a product experience that drives user retention'
  };
  
  // Find matching goal
  for (const [key, goal] of Object.entries(goals)) {
    if (projectType.includes(key)) return goal;
  }
  
  return "deliver exceptional results for your project";
}

// Main explanation generation function
export function generateMatchExplanation(data: MatchExplanationData): string {
  const { designer, brief, aiAnalysis, scores } = data;
  
  // Select template based on score
  let template;
  if (scores.totalScore >= 85) {
    template = explanationTemplates.highMatch;
  } else if (scores.totalScore >= 70) {
    template = explanationTemplates.goodMatch;
  } else {
    template = explanationTemplates.moderateMatch;
  }
  
  // Build explanation components
  const components = {
    designer_name: `${designer.first_name} ${designer.last_name}`,
    match_score: scores.totalScore,
    primary_expertise: designer.specializations?.[0] || designer.styles?.[0] || 'design',
    project_type: brief.project_type,
    years: designer.years_experience || 5,
    industry: designer.industries?.[0] || brief.industry,
    work_style_match: generateWorkStyleMatch(designer, brief, data.clientPrefs),
    performance_metric: generatePerformanceMetric(designer),
    specific_skill: generateSpecificSkill(designer, brief),
    achieve_goal: generateAchievementGoal(brief),
    unique_value: aiAnalysis.uniqueValue || "They bring a unique perspective and proven expertise to your project."
  };
  
  // Build the explanation paragraph
  const explanation = [
    template.intro,
    template.primaryStrength,
    template.experience,
    template.workStyle,
    template.trackRecord,
    template.closing
  ].map(sentence => {
    // Replace placeholders
    let result = sentence;
    Object.entries(components).forEach(([key, value]) => {
      result = result.replace(new RegExp(`{${key}}`, 'g'), String(value));
    });
    return result;
  }).join(' ');
  
  return explanation;
}

// Generate key strengths bullet points
export function generateKeyStrengths(
  designer: Designer, 
  brief: Brief, 
  aiAnalysis: AIAnalysisResult
): string[] {
  const strengths: string[] = [];
  
  // Use AI-generated reasons if available
  if (aiAnalysis.reasons?.length >= 3) {
    return aiAnalysis.reasons.slice(0, 4);
  }
  
  // Generate based on data
  // Style match
  if (designer.styles?.some(style => brief.styles?.includes(style))) {
    strengths.push(`Expert in ${designer.styles.find(s => brief.styles?.includes(s))} design, perfectly matching your aesthetic requirements`);
  }
  
  // Industry experience
  if (designer.industries?.some(ind => ind.toLowerCase() === brief.industry.toLowerCase())) {
    strengths.push(`Deep experience in the ${brief.industry} industry with proven results`);
  }
  
  // Performance metrics
  if (designer.avg_client_satisfaction && designer.avg_client_satisfaction >= 4.5) {
    strengths.push(`${designer.avg_client_satisfaction}/5 average client satisfaction rating from ${designer.total_projects_completed || 20}+ projects`);
  }
  
  // Availability match
  if (designer.availability === 'available' && (brief.timeline === 'ASAP' || brief.timeline === '1-2 weeks')) {
    strengths.push(`Immediately available to start on your urgent project`);
  }
  
  // Specialization match
  if (designer.specializations?.length) {
    const relevantSpec = designer.specializations.find(spec => 
      brief.project_type.toLowerCase().includes(spec.toLowerCase())
    );
    if (relevantSpec) {
      strengths.push(`Specialized expertise in ${relevantSpec} projects like yours`);
    }
  }
  
  // Team advantage
  if (designer.team_size === 'small_team' || designer.team_size === 'agency') {
    strengths.push(`Access to a dedicated team for comprehensive project support`);
  }
  
  return strengths.slice(0, 4);
}

// Generate quick stats for display
export function generateQuickStats(designer: Designer, brief: Brief): Array<{
  label: string;
  value: string;
  relevance: 'high' | 'medium' | 'low';
}> {
  const stats = [];
  
  // Experience
  stats.push({
    label: 'Experience',
    value: `${designer.years_experience || 5}+ years`,
    relevance: designer.years_experience >= 5 ? 'high' : 'medium'
  });
  
  // Projects completed
  stats.push({
    label: 'Projects',
    value: `${designer.total_projects_completed || designer.total_projects || 20}+ completed`,
    relevance: 'medium'
  });
  
  // Client satisfaction
  if (designer.avg_client_satisfaction) {
    stats.push({
      label: 'Rating',
      value: `${designer.avg_client_satisfaction}/5 stars`,
      relevance: designer.avg_client_satisfaction >= 4.5 ? 'high' : 'medium'
    });
  }
  
  // On-time delivery
  if (designer.on_time_delivery_rate) {
    stats.push({
      label: 'On-time',
      value: `${designer.on_time_delivery_rate}%`,
      relevance: designer.on_time_delivery_rate >= 95 ? 'high' : 'medium'
    });
  }
  
  // Availability
  stats.push({
    label: 'Availability',
    value: designer.availability === 'available' ? 'Ready now' : 'In 1-2 weeks',
    relevance: designer.availability === 'available' ? 'high' : 'low'
  });
  
  // Response time (if available)
  stats.push({
    label: 'Response',
    value: 'Within 24h',
    relevance: 'medium'
  });
  
  return stats.slice(0, 6);
}