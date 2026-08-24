const WEBGL_IMAGE_PATHS = new Set([
  '/images/big-brother.jpg',
  '/images/family-trio.jpg',
  '/images/garden.jpg',
  '/images/grandfather.jpg',
  '/images/gujari.jpg',
  '/images/holi.jpg',
  '/images/home-porch.jpg',
  '/images/janaki-mandir.jpg',
  '/images/little-brother.jpg',
  '/images/mother.jpg',
  '/images/nephew.jpg',
  '/images/nisha.jpg',
  '/images/portrait-casual.jpg',
  '/images/rakha.jpg',
  '/images/resort-park.jpg',
  '/images/rituraj.jpg',
  '/images/son-shubham.jpg',
  '/images/timeline-1979.jpg',
  '/images/timeline-2001-marriage.jpg',
  '/images/timeline-2002-first-child.jpg',
  '/images/timeline-2014-achievement.jpg',
  '/images/timeline-2026-family.jpg',
  '/images/undp-work.jpg',
  '/images/varanasi-trip.jpg',
  '/images/wife-kiran.jpg',
]);

export function webglImagePath(image: string, size: 'sm' | 'lg') {
  if (!WEBGL_IMAGE_PATHS.has(image)) return image;

  const dot = image.lastIndexOf('.');
  const slash = image.lastIndexOf('/');
  if (dot <= slash) return image;

  return `${image.slice(0, slash + 1)}webgl/${image.slice(slash + 1, dot)}-${size}.jpg`;
}
