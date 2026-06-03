import authReducer, { clearError } from './authSlice';

describe('authSlice reducer', () => {
  const initialState = {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null
  };

  it('should return the initial state', () => {
    expect(authReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle clearError', () => {
    const errorState = {
      ...initialState,
      error: 'Invalid credentials'
    };
    expect(authReducer(errorState, clearError())).toEqual(initialState);
  });

  it('should handle loginUser.pending', () => {
    const action = { type: 'auth/loginUser/pending' };
    const expectedState = {
      ...initialState,
      loading: true,
      error: null
    };
    expect(authReducer(initialState, action)).toEqual(expectedState);
  });

  it('should handle loginUser.fulfilled', () => {
    const mockUser = { email: 'admin@test.edu', role: 'Super Admin' };
    const action = { type: 'auth/loginUser/fulfilled', payload: mockUser };
    const expectedState = {
      ...initialState,
      user: mockUser,
      isAuthenticated: true,
      loading: false,
      error: null
    };
    expect(authReducer(initialState, action)).toEqual(expectedState);
  });
});
