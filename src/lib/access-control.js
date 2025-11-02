/**
 * Utility functions for checking user access to paid content
 */

/**
 * Check if a user has access to paid (PRO) content
 * @param {string} userPlan - The user's subscription plan ('FREE' or 'PRO')
 * @returns {boolean} - True if user has PRO access
 */
export function hasProAccess(userPlan) {
  return userPlan === 'PRO';
}

/**
 * Check if content requires PRO access
 * @param {string} contentType - Type of content (e.g., 'biotech_insights', 'detailed_analysis')
 * @returns {boolean} - True if content requires PRO
 */
export function requiresProAccess(contentType) {
  // Define which content types require PRO access
  const proContentTypes = [
    'biotech_insights',
    'detailed_analysis',
    'exclusive_reports',
    'portfolio_details',
  ];
  
  return proContentTypes.includes(contentType);
}

/**
 * Get access status for content
 * @param {string} userPlan - The user's subscription plan
 * @param {string} contentType - Type of content
 * @returns {{hasAccess: boolean, requiresPro: boolean}}
 */
export function getContentAccessStatus(userPlan, contentType) {
  const requiresPro = requiresProAccess(contentType);
  const hasAccess = !requiresPro || hasProAccess(userPlan);
  
  return {
    hasAccess,
    requiresPro,
    userPlan: userPlan || 'FREE',
  };
}

