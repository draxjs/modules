// Import statements for Vitest functions and any necessary types
import { describe, it, expect, vi } from 'vitest';
import { AuthSystem } from '../../../src/core/system/AuthSystem';
import { IAuthProviderInterface } from '../../../src/core/interfaces/IAuthProviderInterface';

// Enhanced Mock implementation of AuthRestProvider to handle bad credentials
class MockAuthRestProvider implements IAuthProviderInterface {
  async login(username: string, password: string): Promise<string> {
    // Simulate bad credentials by checking for a specific username and password
    if (username === 'baduser' || password === 'badpassword') {
      throw new Error('BadCredentials');
    }
    // Otherwise, return a mocked token string
    return 'mocked-token';
  }
}

describe('AuthSystem', () => {
  it('should successfully login and return a token', async () => {
    // Setup
    const mockProvider = new MockAuthRestProvider();
    const authSystem = new AuthSystem(mockProvider);

    // Execute
    const token = await authSystem.login('testuser', 'testpassword');

    // Assert
    expect(token).toBe('mocked-token');
  });

  it('should fail to login with bad credentials', async () => {
    // Setup
    const mockProvider = new MockAuthRestProvider();
    const authSystem = new AuthSystem(mockProvider);

    // Execute and Assert
    await expect(authSystem.login('baduser', 'testpassword'))
      .rejects.toThrow('BadCredentials');
    // Alternatively, if you're checking for a specific error message
    // await expect(authSystem.login('baduser', 'testpassword'))
    //   .rejects.toThrowError(new Error('BadCredentials'));
  });
});
