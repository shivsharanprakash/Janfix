"use client";

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

const DynamicMap = dynamic(() => import('./MapViewClient'), { ssr: false });

export default function MapView({ center, markers }) {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  if (!ready) return null;
  return <DynamicMap center={center} markers={markers} />;
}



