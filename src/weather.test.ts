import {describe,it,expect,vi,afterEach} from 'vitest';
import {getWeather,initialCity} from './weather';

describe('weather API', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('throws an error when weather API is unavailable (HTTP 500)', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 500,
    } as Response);
    
    await expect(getWeather(initialCity)).rejects.toThrow('Weather HTTP 500');
  });

  it('throws an error when weather API response is invalid', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ current: null, daily: null }),
    } as Response);
    
    await expect(getWeather(initialCity)).rejects.toThrow('Invalid weather response');
  });
});
