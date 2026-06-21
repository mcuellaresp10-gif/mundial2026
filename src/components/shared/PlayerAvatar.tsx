import Image from "next/image";
import { cn } from "@/lib/utils";
import { pickImageSrc } from "@/utils/imageSrc";

interface PlayerAvatarProps {
  photo?: string | null;
  teamLogo?: string | null;
  alt?: string;
  size?: number;
  className?: string;
}

export function PlayerAvatar({
  photo,
  teamLogo,
  alt = "",
  size = 32,
  className,
}: PlayerAvatarProps) {
  const src = pickImageSrc(photo, teamLogo);

  if (!src) {
    return (
      <span
        className={cn("inline-block rounded-full bg-muted shrink-0", className)}
        style={{ width: size, height: size }}
        aria-hidden
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={cn("rounded-full shrink-0", className)}
    />
  );
}
