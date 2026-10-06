import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loginThunk, logoutThunk, registerThunk } from '../store/slices/authSlice';
import { LoginPayload, RegisterPayload } from '../api/auth';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, token, status, error, bootstrapped } = useAppSelector(state => state.auth);

  const login = useCallback(
    (payload: LoginPayload) => dispatch(loginThunk(payload)).unwrap(),
    [dispatch]
  );

  const register = useCallback(
    (payload: RegisterPayload) => dispatch(registerThunk(payload)).unwrap(),
    [dispatch]
  );

  const logout = useCallback(() => dispatch(logoutThunk()).unwrap(), [dispatch]);

  return {
    user,
    token,
    isAuthenticated: Boolean(token),
    isLoading: status === 'loading',
    bootstrapped,
    error,
    login,
    register,
    logout,
  };
};
