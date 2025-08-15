import { useEffect } from 'react';

interface TelemetryProviderProps {
  children: React.ReactNode;
}

export function TelemetryProvider({ children }: TelemetryProviderProps) {
  useEffect(() => {
    console.log('Telemetry provider initialized');
  }, []);

  return <>{children}</>;
}