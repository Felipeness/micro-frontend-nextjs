interface PageView {
  page: string;
  timestamp: Date;
  sessionId: string;
}

interface UserInteraction {
  action: string;
  element: string;
  timestamp: Date;
  sessionId: string;
}

class Analytics {
  private pageViews: PageView[] = [];
  private interactions: UserInteraction[] = [];
  private sessionId: string;

  constructor() {
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  trackPageView(page: string) {
    const pageView: PageView = {
      page,
      timestamp: new Date(),
      sessionId: this.sessionId,
    };
    
    this.pageViews.push(pageView);
    console.log('📊 Page View Tracked:', pageView);
    
    // In real app, this would send to analytics service
    this.logAnalytics();
  }

  trackInteraction(action: string, element: string) {
    const interaction: UserInteraction = {
      action,
      element,
      timestamp: new Date(),
      sessionId: this.sessionId,
    };
    
    this.interactions.push(interaction);
    console.log('🖱️ User Interaction Tracked:', interaction);
  }

  getAnalytics() {
    return {
      sessionId: this.sessionId,
      pageViews: this.pageViews,
      interactions: this.interactions,
      summary: {
        totalPageViews: this.pageViews.length,
        totalInteractions: this.interactions.length,
        sessionDuration: this.getSessionDuration(),
      }
    };
  }

  private getSessionDuration(): string {
    if (this.pageViews.length === 0) return '0s';
    
    const firstView = this.pageViews[0].timestamp;
    const now = new Date();
    const duration = now.getTime() - firstView.getTime();
    
    const seconds = Math.floor(duration / 1000);
    const minutes = Math.floor(seconds / 60);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  }

  private logAnalytics() {
    const analytics = this.getAnalytics();
    console.table(analytics.pageViews);
    console.log('📈 Analytics Summary:', analytics.summary);
  }
}

export const analytics = new Analytics();