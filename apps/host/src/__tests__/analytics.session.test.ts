import { analytics } from '../lib/analytics';

// Mock console methods
const consoleSpy = {
  log: jest.spyOn(console, 'log').mockImplementation(),
  table: jest.spyOn(console, 'table').mockImplementation(),
};

describe('Analytics - Session Management', () => {
  beforeEach(() => {
    // Clear analytics data
    const data = analytics.getAnalytics();
    data.pageViews.length = 0;
    data.interactions.length = 0;
    consoleSpy.log.mockClear();
    consoleSpy.table.mockClear();
  });

  afterAll(() => {
    consoleSpy.log.mockRestore();
    consoleSpy.table.mockRestore();
  });

  describe('session ID generation', () => {
    it('should generate session ID with correct format', () => {
      const data = analytics.getAnalytics();
      expect(data.sessionId).toMatch(/^session_\d+_[a-z0-9]{9}$/);
    });

    it('should maintain same session ID across calls', () => {
      const data1 = analytics.getAnalytics();
      const data2 = analytics.getAnalytics();
      expect(data1.sessionId).toBe(data2.sessionId);
    });
  });

  describe('session duration calculation', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return 0s when no page views', () => {
      const data = analytics.getAnalytics();
      expect(data.summary.sessionDuration).toBe('0s');
    });

    it('should calculate session duration in seconds', () => {
      const startTime = new Date('2023-01-01T10:00:00Z');
      jest.setSystemTime(startTime);
      
      analytics.trackPageView('home');
      
      jest.setSystemTime(new Date('2023-01-01T10:00:30Z'));
      
      const data = analytics.getAnalytics();
      expect(data.summary.sessionDuration).toBe('30s');
    });

    it('should calculate session duration in minutes and seconds', () => {
      const startTime = new Date('2023-01-01T10:00:00Z');
      jest.setSystemTime(startTime);
      
      analytics.trackPageView('home');
      
      jest.setSystemTime(new Date('2023-01-01T10:02:30Z'));
      
      const data = analytics.getAnalytics();
      expect(data.summary.sessionDuration).toBe('2m 30s');
    });

    it('should calculate duration with only minutes', () => {
      const startTime = new Date('2023-01-01T10:00:00Z');
      jest.setSystemTime(startTime);
      
      analytics.trackPageView('home');
      
      jest.setSystemTime(new Date('2023-01-01T10:02:00Z'));
      
      const data = analytics.getAnalytics();
      expect(data.summary.sessionDuration).toBe('2m 0s');
    });
  });

  describe('analytics summary', () => {
    it('should provide correct summary data', () => {
      analytics.trackPageView('home');
      analytics.trackPageView('about');
      analytics.trackInteraction('click', 'button');

      const data = analytics.getAnalytics();
      
      expect(data.summary).toEqual({
        totalPageViews: 2,
        totalInteractions: 1,
        sessionDuration: expect.any(String),
      });
    });

    it('should update summary counts correctly', () => {
      const data = analytics.getAnalytics();
      expect(data.summary.totalPageViews).toBe(0);
      expect(data.summary.totalInteractions).toBe(0);

      analytics.trackPageView('test');
      expect(analytics.getAnalytics().summary.totalPageViews).toBe(1);

      analytics.trackInteraction('click', 'test');
      expect(analytics.getAnalytics().summary.totalInteractions).toBe(1);
    });
  });
});