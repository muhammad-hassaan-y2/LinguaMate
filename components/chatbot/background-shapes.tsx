interface BackgroundShapesProps {
    variant?: 'default' | 'transcribe' | 'speaking' | 'quizzes';
  }
  
  export function BackgroundShapes({ variant = 'default' }: BackgroundShapesProps) {
    const getGradient = (color: string) => `from-${color}-100/40 to-${color}-200/40`;
  
    const variants = {
      default: ['yellow', 'pink', 'purple', 'yellow'],
      transcribe: ['blue', 'indigo', 'cyan', 'blue'],
      speaking: ['green', 'emerald', 'teal', 'green'],
      quizzes: ['orange', 'amber', 'yellow', 'orange'],
    };
  
    const colors = variants[variant] || variants.default;
  
    return (
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -right-20 -top-20 w-96 h-96 bg-gradient-to-br ${getGradient(colors[0])} rounded-3xl rotate-45 blur-3xl`} />
        <div className={`absolute -left-20 bottom-0 w-96 h-96 bg-gradient-to-tr ${getGradient(colors[1])} rounded-3xl -rotate-45 blur-3xl`} />
        <div className={`absolute right-1/4 top-1/3 w-64 h-64 bg-gradient-to-t ${getGradient(colors[2])} rounded-full blur-3xl`} />
        <div className={`absolute right-0 bottom-0 w-96 h-96 bg-gradient-to-tl ${getGradient(colors[3])} rounded-3xl rotate-12 blur-3xl`} />
      </div>
    );
  }
  
  