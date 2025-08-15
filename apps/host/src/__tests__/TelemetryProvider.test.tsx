import { render } from '@testing-library/react';
import { TelemetryProvider } from '../components/TelemetryProvider';

// Mock console.log to test initialization
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();

describe('TelemetryProvider', () => {
  afterEach(() => {
    mockConsoleLog.mockClear();
  });

  afterAll(() => {
    mockConsoleLog.mockRestore();
  });

  it('should render children correctly', () => {
    const { getByText } = render(
      <TelemetryProvider>
        <div>Test content</div>
      </TelemetryProvider>
    );

    expect(getByText('Test content')).toBeInTheDocument();
  });

  it('should log initialization message on mount', () => {
    render(
      <TelemetryProvider>
        <div>Test content</div>
      </TelemetryProvider>
    );

    expect(mockConsoleLog).toHaveBeenCalledWith('Telemetry provider initialized');
  });
});