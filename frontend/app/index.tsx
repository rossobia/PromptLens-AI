import { Redirect } from 'expo-router';

export default function Index() {
  // 🔥 TypeScript'i susturuyoruz ve tam rotaya yönlendiriyoruz!
  return <Redirect href={"/login-screen" as any} />; 
}