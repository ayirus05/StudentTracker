"use client";
import { useState } from "react";
import { Student, Class } from "./useDashboard";
import { Trophy, Sparkles, Users } from "lucide-react";

interface RandomizerProps {
  classes: Class[];
  students: Student[];
}

export default function Randomizer({ classes, students }: RandomizerProps) {
  const [selectedClassId, setSelectedClassId] = useState<string | null>(
    null
  );
  const [rotation, setRotation] = useState(0);
  const [winner, setWinner] = useState<Student | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [sampleSize, setSampleSize] = useState(1);
  const [sampledStudents, setSampledStudents] = useState<Student[]>([]);

  const classStudents = selectedClassId ? students.filter(s => s.classId === selectedClassId) : [];
  
  // Vibrant colors for the wheel segments
  const colors = [
    '#ef4444', // red
    '#f97316', // orange
    '#f59e0b', // amber
    '#84cc16', // lime
    '#10b981', // emerald
    '#06b6d4', // cyan
    '#3b82f6', // blue
    '#8b5cf6', // violet
    '#d946ef', // fuchsia
    '#f43f5e'  // rose
  ];

  const handleSpin = () => {
    if (isSpinning || classStudents.length < 2) return;
    
    setIsSpinning(true);
    setWinner(null);
    
    // Random rotation between 5 and 10 full spins (1800-3600 degrees) plus random segment alignment
    const minSpins = 5;
    const maxSpins = 10;
    const randomSpins = Math.random() * (maxSpins - minSpins) + minSpins;
    const randomDegree = Math.floor(randomSpins * 360);
    
    // Add to current rotation to ensure we always spin forward
    const newRotation = rotation + randomDegree;
    
    setRotation(newRotation);

    setTimeout(() => {
      setIsSpinning(false);
      const segmentAngle = 360 / classStudents.length;
      // Calculate which segment is at the top (0 degrees)
      // We use modulo 360 to get the final position
      // Since we rotate clockwise, the wheel moves "left" relative to the top pointer
      const normalizedRotation = newRotation % 360;
      const effectiveAngle = (360 - normalizedRotation) % 360;
      const winnerIndex = Math.floor(effectiveAngle / segmentAngle);
      
      // Ensure index is within bounds
      const safeIndex = Math.min(winnerIndex, classStudents.length - 1);
      setWinner(classStudents[safeIndex]);
    }, 4000); // 4s matches the CSS transition duration
  };

  const handlePickSample = () => {
    if (classStudents.length === 0 || sampleSize <= 0) {
      setSampledStudents([]);
      return;
    }
    const size = Math.min(sampleSize, classStudents.length);
    const shuffled = [...classStudents].sort(() => 0.5 - Math.random());
    setSampledStudents(shuffled.slice(0, size));
  };

  // Generate conic gradient string
  const getConicGradient = () => {
    if (classStudents.length === 0) return 'gray';
    const segmentSize = 100 / classStudents.length;
    return classStudents.map((_, index) => {
      const color = colors[index % colors.length];
      return `${color} ${index * segmentSize}% ${(index + 1) * segmentSize}%`;
    }).join(', ');
  };

  return (
    <div className="space-y-6">
      {/* Class Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {classes.map(cls => (
          <button
            key={cls.id}
            onClick={() => {
              setSelectedClassId(cls.id);
              setRotation(0);
              setSampledStudents([]);
              setWinner(null);
            }}
            className={`p-6 rounded-xl border text-left transition-all ${
              selectedClassId === cls.id 
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-900/20' 
                : 'bg-white text-zinc-900 border-zinc-200 hover:border-indigo-300 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-100'
            }`}
          >
            <h3 className="text-xl font-bold">{cls.name}</h3>
            <p className={`text-sm mt-1 ${selectedClassId === cls.id ? 'text-indigo-100' : 'text-zinc-500'}`}>
              {students.filter(s => s.classId === cls.id).length} Students
            </p>
          </button>
        ))}
      </div>

      {selectedClassId && (
        <div className="space-y-8">
          <div className="flex flex-col items-center justify-center bg-white p-8 rounded-xl border border-zinc-200 shadow-sm dark:bg-zinc-900 dark:border-zinc-800 min-h-[500px]">
            {classStudents.length < 2 ? (
              <div className="text-center text-zinc-500">
                <p>Not enough students in this class to spin the wheel.</p>
                <p className="text-sm">Add at least 2 students.</p>
              </div>
            ) : (
              <>
                <div className="relative mb-8">
                  {/* Pointer */}
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-20">
                    <div className="w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[30px] border-t-zinc-800 dark:border-t-white drop-shadow-md"></div>
                  </div>

                  {/* Wheel Container */}
                  <div 
                    className="w-80 h-80 md:w-96 md:h-96 rounded-full border-8 border-zinc-200 dark:border-zinc-700 shadow-xl overflow-hidden relative transition-transform duration-[4000ms] cubic-bezier(0.2, 0.8, 0.2, 1)"
                    style={{ 
                      background: `conic-gradient(${getConicGradient()})`,
                      transform: `rotate(${rotation}deg)`
                    }}
                  >
                    {/* Student Names on Wheel */}
                    {classStudents.map((student, index) => {
                      const angle = (360 / classStudents.length);
                      const rotation = angle * index + (angle / 2); // Center text in segment
                      return (
                        <div
                          key={student.id}
                          className="absolute top-0 left-1/2 w-1 h-1/2 origin-bottom flex justify-center pt-4"
                          style={{ transform: `translateX(-50%) rotate(${rotation}deg)` }}
                        >
                          <span className="text-white font-bold text-sm md:text-base drop-shadow-md whitespace-nowrap truncate max-w-[100px] md:max-w-[120px]" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
                            {student.name}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Center Cap */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white dark:bg-zinc-800 rounded-full shadow-lg border-4 border-zinc-200 dark:border-zinc-700 z-10 flex items-center justify-center">
                    <div className="w-3 h-3 bg-zinc-300 dark:bg-zinc-600 rounded-full"></div>
                  </div>
                </div>

                {/* Winner Display */}
                {winner && !isSpinning && (
                  <div className="mb-6 text-center animate-bounce">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full font-bold text-lg border border-yellow-200 shadow-sm">
                      <Trophy size={20} />
                      Winner: {winner.name}
                      <Sparkles size={20} />
                    </div>
                  </div>
                )}

                <button
                  onClick={handleSpin}
                  disabled={isSpinning}
                  className="px-8 py-3 bg-indigo-600 text-white text-lg font-bold rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/30 transition-all transform active:scale-95"
                >
                  {isSpinning ? 'Spinning...' : 'Spin the Wheel!'}
                </button>
              </>
            )}
          </div>

          <div className="bg-white p-8 rounded-xl border border-zinc-200 shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
            <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Random Sample Picker</h3>
            <p className="text-zinc-500 mb-6">Select a random group of students from the class.</p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-6 bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-lg">
              <div className="flex-1 w-full">
                <label htmlFor="sample-size" className="font-medium text-zinc-700 dark:text-zinc-300">Sample Size:</label>
                <input
                  id="sample-size"
                  type="number"
                  value={sampleSize}
                  onChange={(e) => setSampleSize(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                  max={classStudents.length > 0 ? classStudents.length : 1}
                  disabled={classStudents.length === 0}
                  className="w-full mt-1 px-3 py-2 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-zinc-700 dark:border-zinc-600"
                />
              </div>
              <button
                onClick={handlePickSample}
                disabled={classStudents.length === 0 || sampleSize <= 0}
                className="w-full sm:w-auto px-8 py-3 bg-emerald-600 text-white text-lg font-bold rounded-full hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/30 transition-all transform active:scale-95"
              >
                Pick Sample
              </button>
            </div>

            {sampledStudents.length > 0 && (
              <div>
                <h4 className="font-bold text-lg text-zinc-800 dark:text-zinc-200 mb-4 flex items-center gap-2">
                  <Users size={20} />
                  Selected Students ({sampledStudents.length})
                </h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {sampledStudents.map((student) => (
                    <li key={student.id} className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700">
                      <div className="h-10 w-10 rounded-full bg-zinc-200 overflow-hidden flex items-center justify-center border-2 border-white dark:border-zinc-600 flex-shrink-0">
                        {student.photoUrl ? (
                          <img src={student.photoUrl} alt={student.name} className="h-full w-full object-cover" />
                        ) : (
                          <span className="font-bold text-zinc-600 dark:text-zinc-400">{student.name.charAt(0)}</span>
                        )}
                      </div>
                      <span className="font-medium text-zinc-800 dark:text-zinc-200 truncate">{student.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}