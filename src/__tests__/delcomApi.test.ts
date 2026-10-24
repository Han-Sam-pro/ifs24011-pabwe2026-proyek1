/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect, beforeEach } from 'vitest';
import { getStoredToken, setAuthSession, clearAuthSession, getStoredUser } from '../services/delcomApi';

describe('Delcom API Token Helpers', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('manages auth session storage correctly', () => {
    expect(getStoredToken()).toBeNull();
    expect(getStoredUser()).toBeNull();

    const mockUser = { id: 1, name: 'Tester', email: 'tester@example.com' };
    setAuthSession('mock-token-123', mockUser);

    expect(getStoredToken()).toBe('mock-token-123');
    expect(getStoredUser()).toEqual(mockUser);

    clearAuthSession();
    expect(getStoredToken()).toBeNull();
    expect(getStoredUser()).toBeNull();
  });
});
