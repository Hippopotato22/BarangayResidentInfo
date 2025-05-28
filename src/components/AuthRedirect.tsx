'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';


export default function AuthRedirect() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const userData = docSnap.data();
          if (userData.role === 'admin') {
            router.replace('/admin/dashboard');
          } else {
            router.replace('/user/dashboard');
          }
        } else {
          router.replace('/auth/login');
        }
      } else {
        setChecked(true); // Stay on login page
      }
    });

    return () => unsubscribe();
  }, [router]);

  return null;
}
