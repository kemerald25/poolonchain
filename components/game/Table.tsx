'use client';

import { PHYSICS } from '@/lib/constants';

export function Table() {
  // A placeholder felt color until textures are fully generated
  const feltColor = '#1f3b28';
  const railColor = '#3b2612';

  // Table dimensions (Length x Width as specified in constants)
  const length = PHYSICS.TABLE_LENGTH; // 2.54m
  const width = PHYSICS.TABLE_WIDTH;   // 1.27m
  const thickness = 0.1;               // 10cm thick bed
  const railWidth = 0.15;              // 15cm wide rails
  const cushionHeight = 0.05;

  return (
    <group>
      {/* Playing Surface / Bed */}
      <mesh receiveShadow position={[0, -thickness / 2, 0]}>
        <boxGeometry args={[length, thickness, width]} />
        <meshStandardMaterial color={feltColor} roughness={0.8} />
      </mesh>

      {/* Rails - Long / Top & Bottom */}
      <mesh receiveShadow position={[0, cushionHeight / 2, -width / 2 - railWidth / 2]}>
        <boxGeometry args={[length + railWidth * 2, cushionHeight * 2, railWidth]} />
        <meshStandardMaterial color={railColor} roughness={0.5} />
      </mesh>
      <mesh receiveShadow position={[0, cushionHeight / 2, width / 2 + railWidth / 2]}>
        <boxGeometry args={[length + railWidth * 2, cushionHeight * 2, railWidth]} />
        <meshStandardMaterial color={railColor} roughness={0.5} />
      </mesh>

      {/* Rails - Short / Left & Right */}
      <mesh receiveShadow position={[-length / 2 - railWidth / 2, cushionHeight / 2, 0]}>
        <boxGeometry args={[railWidth, cushionHeight * 2, width]} />
        <meshStandardMaterial color={railColor} roughness={0.5} />
      </mesh>
      <mesh receiveShadow position={[length / 2 + railWidth / 2, cushionHeight / 2, 0]}>
        <boxGeometry args={[railWidth, cushionHeight * 2, width]} />
        <meshStandardMaterial color={railColor} roughness={0.5} />
      </mesh>
      
      {/* Inner Cushions (Basic green blocks for now) */}
      <mesh receiveShadow position={[0, cushionHeight / 2, -width / 2 + 0.02]}>
        <boxGeometry args={[length, cushionHeight, 0.04]} />
        <meshStandardMaterial color={feltColor} roughness={0.7} />
      </mesh>
      <mesh receiveShadow position={[0, cushionHeight / 2, width / 2 - 0.02]}>
        <boxGeometry args={[length, cushionHeight, 0.04]} />
        <meshStandardMaterial color={feltColor} roughness={0.7} />
      </mesh>
      <mesh receiveShadow position={[-length / 2 + 0.02, cushionHeight / 2, 0]}>
        <boxGeometry args={[0.04, cushionHeight, width]} />
        <meshStandardMaterial color={feltColor} roughness={0.7} />
      </mesh>
      <mesh receiveShadow position={[length / 2 - 0.02, cushionHeight / 2, 0]}>
        <boxGeometry args={[0.04, cushionHeight, width]} />
        <meshStandardMaterial color={feltColor} roughness={0.7} />
      </mesh>

      {/* Pockets (Simple black circles for now) */}
      {[
        [-length/2, 0.001, -width/2], [length/2, 0.001, -width/2], // Corners
        [-length/2, 0.001, width/2], [length/2, 0.001, width/2],   // Corners
        [0, 0.001, -width/2 - 0.02], [0, 0.001, width/2 + 0.02]     // Sides
      ].map((pos, idx) => (
        <mesh key={idx} position={pos as [number, number, number]} rotation={[-Math.PI/2, 0, 0]}>
          <circleGeometry args={[0.08, 32]} />
          <meshBasicMaterial color="#000000" />
        </mesh>
      ))}

    </group>
  );
}
