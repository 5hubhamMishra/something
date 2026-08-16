'use client';

import ParticleField from '@/components/canvas/ParticleField';
import Reveal from '@/components/ui/Reveal';
import WordReveal from '@/components/ui/WordReveal';
import { hasContent, siteConfig } from '@/lib/config';
import { chapterById } from '@/lib/chapters';

const chapter = chapterById('lessons');

export function LessonsScene() {
  const wz = chapter.worldZ;
  return (
    <group position={[0, 0, wz]}>
      <ParticleField count={250} radius={9} color="#a9adb8" opacity={0.35} />
    </group>
  );
}

export function LessonsDom() {
  const heightVh = (chapter.end - chapter.start) * 100;
  return (
    <section
      style={{ minHeight: `${heightVh}vh` }}
      className="relative flex flex-col justify-center px-8 md:px-24 max-w-3xl"
    >
      <Reveal>
        <span className="text-[11px] tracking-[0.5em] text-gold uppercase">Chapter Seven</span>
      </Reveal>
      <Reveal delay={0.1}>
        <h2 className="font-display text-4xl md:text-6xl mt-4 mb-6 text-warm-white">
          The Lessons
        </h2>
      </Reveal>
      <Reveal delay={0.2}>
        <p className="text-silver leading-relaxed text-base md:text-lg max-w-xl mb-10">
          What he taught us, without always saying it.
        </p>
      </Reveal>

      <div className="max-w-xl">
        {siteConfig.lessons
          .filter((lesson) => hasContent(lesson.story) || hasContent(lesson.quote))
          .map((lesson, i) => (
            <WordReveal
              key={`${lesson.word}-${i}`}
              word={lesson.word}
              detail={hasContent(lesson.story) ? lesson.story : ''}
              quote={hasContent(lesson.quote) ? lesson.quote : undefined}
            />
          ))}
      </div>
    </section>
  );
}
