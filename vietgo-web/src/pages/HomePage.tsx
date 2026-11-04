import { AppCta } from '@/sections/AppCta/AppCta';
import { Destinations } from '@/sections/Destinations/Destinations';
import { Explore } from '@/sections/Explore/Explore';
import { Hero } from '@/sections/Hero/Hero';
import { Journeys } from '@/sections/Journeys/Journeys';
import { Safety } from '@/sections/Safety/Safety';
import { Statement } from '@/sections/Statement/Statement';
import { WordBand } from '@/sections/WordBand/WordBand';

export function HomePage() {
  return (
    <>
      <Hero />
      <Statement />
      <Journeys />
      <Explore />
      <Destinations />
      <WordBand />
      <Safety />
      <AppCta />
    </>
  );
}
