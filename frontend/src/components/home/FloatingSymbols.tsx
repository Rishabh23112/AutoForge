import React, { useMemo } from 'react';
import { Float, Image } from '@react-three/drei';

export const FloatingSymbols = () => {
  const icons = [
    'https://img.icons8.com/fluency/48/python.png',
    'https://img.icons8.com/fluency/48/html-5.png',
    'https://img.icons8.com/fluency/48/css3.png',
    'https://img.icons8.com/fluency/48/javascript.png',
    'https://img.icons8.com/fluency/48/github.png',
    'https://img.icons8.com/fluency/48/tailwind_css.png',
    'https://img.icons8.com/fluency/48/docker.png'
  ];
  
  const items = useMemo(() => {
    return Array.from({ length: 30 }).map((_, i) => ({
      url: icons[Math.floor(Math.random() * icons.length)],
      position: [
        (Math.random() - 0.5) * 25,
        (Math.random() - 0.5) * 25,
        (Math.random() - 0.5) * 15 - 5
      ] as [number, number, number],
      scale: Math.random() * 1.5 + 0.5,
    }));
  }, []);

  return (
    <>
      <ambientLight intensity={0.5} />
      {items.map((item, i) => (
        <Float
          key={i}
          speed={1 + Math.random()} 
          rotationIntensity={1.5} 
          floatIntensity={2}
          position={item.position}
        >
          <Image
            url={item.url}
            scale={item.scale}
            transparent
            opacity={0.8}
          />
        </Float>
      ))}
    </>
  );
};
