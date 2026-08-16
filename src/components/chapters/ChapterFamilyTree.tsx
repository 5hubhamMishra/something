'use client';

import Image from 'next/image';
import Reveal from '@/components/ui/Reveal';
import { siteConfig } from '@/lib/config';
import { chapterById } from '@/lib/chapters';
import type { FamilyMember } from '@/lib/types';

const chapter = chapterById('family-tree');

// No 3D content of its own: this chapter's DOM has a full-bleed opaque
// backdrop (see FamilyTreeDom) that fully covers the canvas underneath for
// its whole scroll range, so anything rendered here would never be seen —
// dead GPU work.
export function FamilyTreeScene() {
  return null;
}

function findMember(id: string): FamilyMember | undefined {
  return siteConfig.family.find((m) => m.id === id);
}

function TreeCard({
  name,
  relation,
  image,
  emphasize,
}: {
  name: string;
  relation: string;
  image?: string;
  emphasize?: boolean;
}) {
  const initial = name.trim().charAt(0).toUpperCase() || '?';
  return (
    <div className="flex flex-col items-center text-center w-24 md:w-28">
      <div
        className={`relative overflow-hidden rounded-2xl border bg-charcoal/60 ${
          emphasize
            ? 'w-24 h-24 md:w-28 md:h-28 border-gold shadow-[0_0_30px_-8px_rgba(201,161,95,0.6)]'
            : 'w-16 h-16 md:w-20 md:h-20 border-bronze/40'
        }`}
      >
        {image ? (
          // Fixed at well above the card's rendered size (max 112px) rather than
          // matched to it — the `sizes` hint only reacts to viewport breakpoints,
          // not to a viewer zooming in, so a tightly-matched size would deliver a
          // small file that just stretches (and visibly pixelates) under zoom.
          <Image src={image} alt={name} fill sizes="320px" quality={90} className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gold/70 font-display text-2xl">
            {initial}
          </div>
        )}
      </div>
      <span
        className={`mt-3 font-display leading-tight ${
          emphasize ? 'text-base md:text-lg text-gold' : 'text-xs md:text-sm text-warm-white'
        }`}
      >
        {name}
      </span>
      <span className="text-[9px] tracking-[0.2em] uppercase text-silver/60 mt-1">{relation}</span>
    </div>
  );
}

function Connector() {
  return <div className="w-px h-8 md:h-10 bg-bronze/30 mx-auto" />;
}

export function FamilyTreeDom() {
  const heightVh = (chapter.end - chapter.start) * 100;
  const father = siteConfig.father;
  const bhola = findMember('grandfather');
  const mother = findMember('mother');
  const bigSister = findMember('big-sister');
  const bigBrother = findMember('big-brother');
  const littleBrother = findMember('little-brother');
  const wife = findMember('wife');
  const son = findMember('son');
  const nephew = findMember('nephew');
  const rituraj = findMember('rituraj');
  const nisha = findMember('nisha');
  const gujari = findMember('gujari');

  return (
    <section
      style={{ minHeight: `${heightVh}vh` }}
      className="relative flex flex-col justify-center items-center"
    >
      {/* Full-bleed opaque backdrop, covering the entire section edge-to-edge —
          not just a boxed card behind the content. This chapter is a dense
          photo grid, not ambient prose, so any 3D content from neighboring
          chapters drifting into view behind it (an inherent side effect of
          every chapter sharing one scroll-driven scene graph) would visually
          tangle with its own photos. A card bounded to a max-width still let
          neighboring photos show past its edges; only a backdrop covering the
          full section, for its entire scroll range, guarantees none can. */}
      <div className="absolute inset-0 bg-void" />

      <div className="relative w-full max-w-4xl px-6 md:px-16 py-24 flex flex-col items-center gap-10">
        <div className="max-w-2xl text-center">
          <Reveal>
            <span className="text-[11px] tracking-[0.5em] text-gold uppercase">Chapter Five</span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="font-display text-4xl md:text-6xl mt-4 mb-6 text-warm-white">
              The Family Tree
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="text-silver leading-relaxed text-base md:text-lg">
              Every name here belongs to the same story. {father.displayName} was raised in{' '}
              {father.birthplace} by {bhola?.name} and {mother?.name}, the third of four —
              alongside his sister {bigSister?.name} and his brothers {bigBrother?.name} and{' '}
              {littleBrother?.name}. Their children — {bigSister?.name}&apos;s{' '}
              {rituraj?.name}, {nisha?.name}, and {gujari?.name}; {bigBrother?.name}&apos;s{' '}
              {nephew?.name}; and {father.displayName}&apos;s own son {son?.name} with his wife{' '}
              {wife?.name} — carry that story into the next generation.
            </p>
          </Reveal>
        </div>

        <div className="flex flex-col items-center gap-2">
          {/* His parents */}
          <Reveal delay={0.25}>
            <div className="flex justify-center gap-10 md:gap-16">
              {bhola && <TreeCard name={bhola.name} relation={bhola.relation} image={bhola.image} />}
              {mother && <TreeCard name={mother.name} relation={mother.relation} image={mother.image} />}
            </div>
          </Reveal>

          <Connector />

          {/* Their four children — eldest to youngest, left to right — each
              branch carrying its own children below it */}
          <Reveal delay={0.32}>
            <div className="flex justify-center items-start gap-8 md:gap-16 flex-wrap">
              <div className="flex flex-col items-center gap-2">
                {bigSister && (
                  <TreeCard name={bigSister.name} relation={bigSister.relation} image={bigSister.image} />
                )}
                {(rituraj || nisha || gujari) && (
                  <>
                    <Connector />
                    <div className="flex items-start gap-3">
                      {rituraj && (
                        <TreeCard name={rituraj.name} relation={rituraj.relation} image={rituraj.image} />
                      )}
                      {nisha && (
                        <TreeCard name={nisha.name} relation={nisha.relation} image={nisha.image} />
                      )}
                      {gujari && (
                        <TreeCard name={gujari.name} relation={gujari.relation} image={gujari.image} />
                      )}
                    </div>
                  </>
                )}
              </div>

              <div className="flex flex-col items-center gap-2">
                {bigBrother && (
                  <TreeCard
                    name={bigBrother.name}
                    relation={bigBrother.relation}
                    image={bigBrother.image}
                  />
                )}
                {nephew && (
                  <>
                    <Connector />
                    <TreeCard name={nephew.name} relation={nephew.relation} image={nephew.image} />
                  </>
                )}
              </div>

              <div className="flex flex-col items-center gap-2">
                <div className="flex items-start gap-2">
                  <TreeCard
                    name={father.displayName}
                    relation="Him"
                    image="/images/portrait-casual.jpg"
                    emphasize
                  />
                  <span className="text-gold/60 font-display text-xl mt-8 md:mt-10">&amp;</span>
                  {wife && <TreeCard name={wife.name} relation={wife.relation} image={wife.image} />}
                </div>
                {son && (
                  <>
                    <Connector />
                    <TreeCard name={son.name} relation={son.relation} image={son.image} />
                  </>
                )}
              </div>

              {littleBrother && (
                <div className="flex flex-col items-center gap-2">
                  <TreeCard
                    name={littleBrother.name}
                    relation={littleBrother.relation}
                    image={littleBrother.image}
                  />
                </div>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
