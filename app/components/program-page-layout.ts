/**
 * Junior/adult program route layouts — centers the page band up to 1800px.
 * Uses flex justify-center instead of mx-auto on a flex-col child (avoids shrink-to-fit).
 */
export const programSectionWrapper =
  "flex w-full flex-grow justify-center px-4 py-8";

export const programSectionContainer = "w-full min-w-0 max-w-[1800px]";

/**
 * Shared width rules for program pages + loading skeletons.
 *
 * - Below md (< 768px): full width
 * - md → below lg: 80% width, centered (tablet)
 * - lg+ (≥ 1024px): full width up to 1400px, centered
 */
export const programPageContent =
  "w-full min-w-0 md:mx-auto md:w-4/5 lg:w-full lg:max-w-[1400px] lg:mx-auto";

export const programPageGrid =
  "grid w-full min-w-0 grid-cols-1 gap-6 lg:grid-cols-13";

/** Inner client wrapper — must span full width of programPageContent when centered. */
export const programPageClientGrid =
  "w-full min-w-0 lg:col-span-13 grid lg:grid-cols-13 gap-6";

export const programPageGridCell = "w-full min-w-0";

/**
 * Uniform program hero image across every program/skeleton page.
 *
 * - One fixed height + one width cap for all images.
 * - `object-cover` fills the frame; below the cap the frame is full width.
 * - Past the cap the image stops growing and `programCardImageContainer`'s
 *   light gray fills the area behind it.
 */
export const programCardImageContainer =
  "flex w-full justify-center bg-gray-100";

export const programCardImageFrame =
  "relative h-[480px] w-full max-w-[600px]";

/** Golf for Women + adult private instruction */
export const programCardImageFrameTall =
  "relative h-[600px] w-full max-w-[600px]";

/** Junior private instruction — slightly taller than other tall heroes */
export const programCardImageFrameJuniorPrivate =
  "relative h-[680px] w-full max-w-[600px]";

export const programCardImageClass = "h-full w-full object-cover";

/** @deprecated Use programPageContent */
export const programPageShell = programPageContent;
