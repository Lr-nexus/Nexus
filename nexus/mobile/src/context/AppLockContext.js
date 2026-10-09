import React, {
  createContext, useContext, useEffect, useRef, useState, useCallback,
} from 'react';
import { AppState } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { secureStorage } from '../utils/secureStorage';

const AppLockCtx = createContext(null);

const KEY_ENABLED = 'nova_app_lock_enabled';
const KEY_BIOMETRIC = 'nova_app_lock_biometric';
const LOCK_TIMEOUT_MS = 60 * 1000; // auto-lock after 60s in background

export function AppLockProvider({ children }) {
  const [enabled, setEnabled] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [locked, setLocked] = useState(false);
  const [ready, setReady] = useState(false);
  const lastActiveRef = useRef(Date.now());

  // Load saved config
  useEffect(() => {
    (async () => {
      try {
        const e = await secureStorage.getItem(KEY_ENABLED);
        const b = await secureStorage.getItem(KEY_BIOMETRIC);
        const isEnabled = e === '1';
        setEnabled(isEnabled);
        setBiometricEnabled(b === '1');
        if (isEnabled) setLocked(true);
      } catch {}
      finally { setReady(true); }
    })();
  }, []);

  // Auto-lock on background
  useEffect(() => {
    if (!enabled) return;
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'background' || state === 'inactive') {
        lastActiveRef.current = Date.now();
      } else if (state === 'active') {
        const away = Date.now() - lastActiveRef.current;
        if (away > LOCK_TIMEOUT_MS) setLocked(true);
      }
    });
    return () => sub.remove();
  }, [enabled]);

  const supportsBiometric = useCallback(async () => {
    const hasHw = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    return hasHw && enrolled;
  }, []);

  const authenticate = useCallback(async (promptMessage = 'Unlock Nova') => {
    const ok = await supportsBiometric();
    if (!ok) return false;
    const res = await LocalAuthentication.authenticateAsync({
      promptMessage,
      fallbackLabel: 'Use passcode',
      disableDeviceFallback: false,
    });
    return res.success;
  }, [supportsBiometric]);

  const enableLock = useCallback(async (useBiometric = true) => {
    if (useBiometric) {
      const ok = await supportsBiometric();
      if (!ok) throw new Error('No biometric hardware or enrollment found.');
      const authed = await authenticate('Enable App Lock');
      if (!authed) throw new Error('Authentication failed.');
    }
    await secureStorage.setItem(KEY_ENABLED, '1');
    await secureStorage.setItem(KEY_BIOMETRIC, useBiometric ? '1' : '0');
    setEnabled(true);
    setBiometricEnabled(useBiometric);
    setLocked(false);
  }, [authenticate, supportsBiometric]);

  const disableLock = useCallback(async () => {
    await secureStorage.deleteItem(KEY_ENABLED);
    await secureStorage.deleteItem(KEY_BIOMETRIC);
    setEnabled(false);
    setBiometricEnabled(false);
    setLocked(false);
  }, []);

  const unlock = useCallback(async () => {
    if (!enabled) { setLocked(false); return true; }
    if (!biometricEnabled) { setLocked(false); return true; }
    const ok = await authenticate('Unlock Nova');
    if (ok) setLocked(false);
    return ok;
  }, [enabled, biometricEnabled, authenticate]);

  const lockNow = useCallback(() => { if (enabled) setLocked(true); }, [enabled]);

  return (
    <AppLockCtx.Provider
      value={{
        ready, enabled, biometricEnabled, locked,
        enableLock, disableLock, unlock, lockNow, supportsBiometric,
      }}
    >
      {children}
    </AppLockCtx.Provider>
  );
}

export function useAppLock() {
  const ctx = useContext(AppLockCtx);
  if (!ctx) throw new Error('useAppLock must be inside AppLockProvider');
  return ctx;
}

export default AppLockCtx;