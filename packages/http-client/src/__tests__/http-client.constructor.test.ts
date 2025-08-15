import axios from 'axios';
import { HttpClient } from '../http-client';

// Mock axios with proper typing
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('HttpClient - Constructor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedAxios.create.mockReturnValue({
      request: jest.fn(),
    } as any);
  });

  it('should create axios instance with baseURL and timeout', () => {
    new HttpClient('https://api.example.com', 5000);

    expect(mockedAxios.create).toHaveBeenCalledWith({
      baseURL: 'https://api.example.com',
      timeout: 5000,
    });
  });

  it('should use default timeout when not provided', () => {
    new HttpClient('https://api.example.com');

    expect(mockedAxios.create).toHaveBeenCalledWith({
      baseURL: 'https://api.example.com',
      timeout: 30000,
    });
  });

  it('should create instance without baseURL', () => {
    new HttpClient();

    expect(mockedAxios.create).toHaveBeenCalledWith({
      baseURL: undefined,
      timeout: 30000,
    });
  });
});