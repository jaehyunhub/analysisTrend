'use client';

import { useEffect, useState } from 'react';
import CreatePostModal from '@/features/post/ui/CreatePostModal';
import PostDetailModal from '@/features/post/ui/PostDetailModal';

export default function ModalProvider() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <>
      <CreatePostModal />
      <PostDetailModal />
    </>
  );
}
