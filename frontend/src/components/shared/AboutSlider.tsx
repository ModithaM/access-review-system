import { Marquee } from "@/components/ui/marquee";

import aboutImage01 from "@/assets/about-us-image-01.png";
import aboutImage02 from "@/assets/about-us-image-02.png";
import aboutImage03 from "@/assets/about-us-image-03.png";
import aboutImage04 from "@/assets/about-us-image-04.png";

const images = [
  { src: aboutImage01, alt: "About us 1" },
  { src: aboutImage02, alt: "About us 2" },
  { src: aboutImage03, alt: "About us 3" },
  { src: aboutImage04, alt: "About us 4" },
];

const ImageCard = ({ src, alt }: { src: string; alt: string }) => {
  return (
    <figure className="relative h-40 w-36 cursor-pointer overflow-hidden rounded-xl border border-gray-950/[.1] hover:border-gray-950/[.2] dark:border-gray-50/[.1] dark:hover:border-gray-50/[.2]">
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
      />
    </figure>
  );
};

export function AboutSlider() {
  return (
    <div className="relative flex h-100 w-full flex-row items-center justify-center gap-4 overflow-hidden [perspective:300px]">
      <div
        className="flex flex-row items-center gap-4"
        style={{
          transform:
            "translateX(-100px) translateY(0px) translateZ(-100px) rotateX(20deg) rotateY(-10deg) rotateZ(20deg)",
        }}
      >
        <Marquee pauseOnHover vertical className="[--duration:20s]">
          {images.map((image) => (
            <ImageCard key={image.alt} {...image} />
          ))}
        </Marquee>
        <Marquee reverse pauseOnHover vertical className="[--duration:20s]">
          {images.map((image) => (
            <ImageCard key={image.alt} {...image} />
          ))}
        </Marquee>
        <Marquee pauseOnHover vertical className="[--duration:20s]">
          {images.map((image) => (
            <ImageCard key={image.alt} {...image} />
          ))}
        </Marquee>
      </div>

      <div className="from-background pointer-events-none absolute inset-x-0 top-0 h-1/4 bg-linear-to-b" />
      <div className="from-background pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t" />
      <div className="from-background pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r" />
      <div className="from-background pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l" />
    </div>
  );
}