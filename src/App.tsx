import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import WalletProvider from './providers/WalletProvider';

function App() {
  return (
    <WalletProvider>
      <RouterProvider router={router} />
    </WalletProvider>
  );
}

export default App;
