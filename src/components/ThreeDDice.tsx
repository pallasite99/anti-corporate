import React from 'react';

interface ThreeDDiceProps {
  value: number;
  rolling: boolean;
}

export default function ThreeDDice({ value, rolling }: ThreeDDiceProps) {
  // Dot layout helper function - maps values to relative percentage positions (top%, left%)
  const getDotsForFace = (faceNum: number) => {
    switch (faceNum) {
      case 1:
        return [{ top: '50%', left: '50%' }];
      case 2:
        return [
          { top: '25%', left: '25%' },
          { top: '75%', left: '75%' }
        ];
      case 3:
        return [
          { top: '25%', left: '25%' },
          { top: '50%', left: '50%' },
          { top: '75%', left: '75%' }
        ];
      case 4:
        return [
          { top: '25%', left: '25%' },
          { top: '25%', left: '75%' },
          { top: '75%', left: '25%' },
          { top: '75%', left: '75%' }
        ];
      case 5:
        return [
          { top: '25%', left: '25%' },
          { top: '25%', left: '75%' },
          { top: '50%', left: '50%' },
          { top: '75%', left: '25%' },
          { top: '75%', left: '75%' }
        ];
      case 6:
        return [
          { top: '25%', left: '25%' },
          { top: '25%', left: '75%' },
          { top: '50%', left: '25%' },
          { top: '50%', left: '75%' },
          { top: '75%', left: '25%' },
          { top: '75%', left: '75%' }
        ];
      default:
        return [];
    }
  };

  const faces = [1, 2, 3, 4, 5, 6];

  return (
    <div className="perspective-container p-2 flex items-center justify-center">
      <div 
        className={`dice-cube ${rolling ? 'dice-cube-rolling' : `show-face-${value}`}`}
        id={`3d-dice-cube-${value}-${rolling ? 'rolling' : 'idle'}`}
      >
        {faces.map((f) => {
          const dots = getDotsForFace(f);
          return (
            <div 
              key={f} 
              className={`dice-face face-${f} relative bg-white`}
              style={{
                // Slightly yellow-cream shade matching other corporate board accents
                backgroundColor: '#ffffff',
                border: '2.5px solid #171717'
              }}
            >
              {/* Render dots styled as little corporate dots */}
              {dots.map((dot, idx) => (
                <div
                  key={idx}
                  className="absolute w-2 h-2 rounded-full bg-neutral-900 -translate-x-1/2 -translate-y-1/2 shadow-inner"
                  style={{
                    top: dot.top,
                    left: dot.left
                  }}
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
