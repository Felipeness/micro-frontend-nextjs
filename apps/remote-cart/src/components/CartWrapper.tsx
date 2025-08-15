import { useEffect, useState } from 'react';
import Cart from './Cart';

export default function CartWrapper() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <div>Loading cart...</div>;
  }

  return <Cart />;
}