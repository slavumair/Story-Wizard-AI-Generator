export default function StoryDisplay({ story }: { story: string }) {
  return (
    <div className="mt-6 w-full flex justify-center">
      <div
        className="
          relative
          bg-white/5
          backdrop-blur-md
          p-8
          rounded-3xl
          border border-pink-400/50
          text-white
          text-lg
          leading-relaxed
          max-w-2xl
          shadow-lg
          before:absolute
          before:inset-0
          before:rounded-3xl
          before:border
          before:border-pink-400/30
          before:animate-pulse-glow
          before:pointer-events-none
        "
      >
        <h2 className="text-pink-300 font-extrabold text-xl mb-4 text-center">
          ✨ Your Story ✨
        </h2>
        <p className="whitespace-pre-line">{story}</p>
      </div>
    </div>
  );
}
