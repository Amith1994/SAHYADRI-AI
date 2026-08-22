import { useState } from 'react';
import { ChatPage } from './pages/Chat';
import { SplashScreen } from './components/SplashScreen';

function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <>
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
      <ChatPage />
    </>
  );
}

export default App;
