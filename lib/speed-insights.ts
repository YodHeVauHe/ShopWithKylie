/**
 * Vercel Speed Insights Client-Side Initialization
 * 
 * This module initializes Vercel Speed Insights on the client side only.
 * It provides a function to inject the Speed Insights script and start monitoring.
 */

/**
 * Initialize Vercel Speed Insights
 * This should be called early in your app's lifecycle, preferably before other scripts load.
 * It automatically detects the environment and only runs in the browser.
 */
export const initSpeedInsights = async () => {
  // Only run in browser environment
  if (typeof window === 'undefined') {
    return;
  }

  try {
    // Dynamically import the Speed Insights injection function
    const { injectSpeedInsights } = await import('@vercel/speed-insights');
    
    // Call the injection function to initialize Speed Insights
    injectSpeedInsights();
    
    console.log('Vercel Speed Insights initialized successfully');
  } catch (error) {
    // Gracefully handle errors - Speed Insights is optional
    console.warn('Failed to initialize Vercel Speed Insights:', error);
  }
};

export default initSpeedInsights;
