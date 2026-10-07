import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Screens } from './screens';
import { authScreenOptions } from './stackOptions';
import { ROUTES } from '../constants/routes';

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
  return (
    <Stack.Navigator initialRouteName={ROUTES.WELCOME} screenOptions={authScreenOptions}>
      <Stack.Screen name={ROUTES.WELCOME} component={Screens.Welcome} />
      <Stack.Screen name={ROUTES.ONBOARDING} component={Screens.Onboarding} />
      <Stack.Screen name={ROUTES.LOGIN} component={Screens.Login} />
      <Stack.Screen name={ROUTES.REGISTER} component={Screens.Register} />
      <Stack.Screen name={ROUTES.VERIFY_OTP} component={Screens.VerifyOtp} />
      <Stack.Screen name={ROUTES.ACCOUNT_RECOVERY} component={Screens.AccountRecovery} />
      <Stack.Screen name={ROUTES.RESET_PASSWORD} component={Screens.ResetPassword} />
    </Stack.Navigator>
  );
}