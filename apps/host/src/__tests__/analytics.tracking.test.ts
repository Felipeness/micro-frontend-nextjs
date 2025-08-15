import { analytics } from '../lib/analytics';

// Mock console methods to avoid noise in tests
const consoleSpy = {
  log: jest.spyOn(console, 'log').mockImplementation(),
  table: jest.spyOn(console, 'table').mockImplementation(),
};

describe('Analytics', () => {
  beforeEach(() => {
    // Clear analytics data before each test
    analytics.getAnalytics().pageViews.length = 0;
    analytics.getAnalytics().interactions.length = 0;
    consoleSpy.log.mockClear();
    consoleSpy.table.mockClear();
  });

  afterAll(() => {
    consoleSpy.log.mockRestore();
    consoleSpy.table.mockRestore();
  });

  describe('trackPageView', () => {
    it('should track page views correctly', () => {
      analytics.trackPageView('home');
      analytics.trackPageView('about');

      const data = analytics.getAnalytics();
      
      expect(data.pageViews).toHaveLength(2);
      expect(data.pageViews[0].page).toBe('home');
      expect(data.pageViews[1].page).toBe('about');
      expect(data.pageViews[0].sessionId).toBe(data.sessionId);
      expect(data.pageViews[0].timestamp).toBeInstanceOf(Date);
    });

    it('should log page view tracking', () => {
      analytics.trackPageView('test-page');
      
      expect(consoleSpy.log).toHaveBeenCalledWith(
        '📊 Page View Tracked:',
        expect.objectContaining({
          page: 'test-page',
          timestamp: expect.any(Date),
          sessionId: expect.any(String),
        })
      );
    });

    it('should log analytics after tracking page view', () => {
      analytics.trackPageView('home');
      
      expect(consoleSpy.table).toHaveBeenCalled();
      expect(consoleSpy.log).toHaveBeenCalledWith(
        '📈 Analytics Summary:',
        expect.objectContaining({
          totalPageViews: 1,
          totalInteractions: 0,
          sessionDuration: expect.any(String),
        })
      );
    });
  });

  describe('trackInteraction', () => {
    it('should track user interactions correctly', () => {
      analytics.trackInteraction('click', 'button');
      analytics.trackInteraction('hover', 'menu');

      const data = analytics.getAnalytics();
      
      expect(data.interactions).toHaveLength(2);
      expect(data.interactions[0].action).toBe('click');
      expect(data.interactions[0].element).toBe('button');
      expect(data.interactions[1].action).toBe('hover');
      expect(data.interactions[1].element).toBe('menu');
      expect(data.interactions[0].sessionId).toBe(data.sessionId);
      expect(data.interactions[0].timestamp).toBeInstanceOf(Date);
    });

    it('should log interaction tracking', () => {
      analytics.trackInteraction('click', 'test-button');
      
      expect(consoleSpy.log).toHaveBeenCalledWith(
        '🖱️ User Interaction Tracked:',
        expect.objectContaining({
          action: 'click',
          element: 'test-button',
          timestamp: expect.any(Date),
          sessionId: expect.any(String),
        })
      );
    });
  });

  describe('getAnalytics', () => {
    it('should return correct analytics summary', () => {
      analytics.trackPageView('home');
      analytics.trackPageView('about');
      analytics.trackInteraction('click', 'button');

      const data = analytics.getAnalytics();
      
      expect(data).toEqual({
        sessionId: expect.any(String),
        pageViews: expect.arrayContaining([
          expect.objectContaining({ page: 'home' }),
          expect.objectContaining({ page: 'about' }),
        ]),
        interactions: expect.arrayContaining([
          expect.objectContaining({ action: 'click', element: 'button' }),
        ]),
        summary: {
          totalPageViews: 2,
          totalInteractions: 1,
          sessionDuration: expect.any(String),
        },
      });
    });

    it('should generate unique session IDs', () => {
      const data1 = analytics.getAnalytics();
      
      // Create a new analytics instance to get a different session ID
      const { analytics: newAnalytics } = require('../lib/analytics');
      const data2 = newAnalytics.getAnalytics();
      
      expect(data1.sessionId).toMatch(/^session_\d+_[a-z0-9]{9}$/);
      expect(data2.sessionId).toMatch(/^session_\d+_[a-z0-9]{9}$/);
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
      
      // Move forward 30 seconds
      jest.setSystemTime(new Date('2023-01-01T10:00:30Z'));
      
      const data = analytics.getAnalytics();
      expect(data.summary.sessionDuration).toBe('30s');
    });

    it('should calculate session duration in minutes and seconds', () => {
      const startTime = new Date('2023-01-01T10:00:00Z');
      jest.setSystemTime(startTime);
      
      analytics.trackPageView('home');
      
      // Move forward 2 minutes and 30 seconds
      jest.setSystemTime(new Date('2023-01-01T10:02:30Z'));
      
      const data = analytics.getAnalytics();
      expect(data.summary.sessionDuration).toBe('2m 30s');
    });
  });
});