// @ts-check
import getSrcset from "./getSrcset.js";
import getConfigOptions from "./getConfigOptions.js";
import getFallbackImage from "./getFallbackImage.js";

export default async function getImageSources(
  src,
  image,
  format,
  imageWidth,
  imagesizes,
  breakpoints,
  placeholder,
  imageFormat,
  formatOptions,
  fallbackFormat,
  includeSourceFormat,
  rest
) {
  const calculatedConfigs = getConfigOptions(
    imageWidth,
    imagesizes,
    breakpoints,
    format,
    imageFormat,
    fallbackFormat,
    includeSourceFormat
  );

  const { formats, requiredBreakpoints } = calculatedConfigs;

  imagesizes = calculatedConfigs.imagesizes;

  const maxWidth = requiredBreakpoints.at(-1);
  const sliceLength = -(maxWidth.toString().length + 2);

  const sources = await Promise.all(
    formats.map(async (format) => {
      const srcset = await getSrcset(src, requiredBreakpoints, format, {
        ...rest,
        ...formatOptions[format],
      });

      return {
        src:
          format === fallbackFormat
            ? srcset.split(", ").at(-1).slice(0, sliceLength)
            : null,
        format,
        srcset,
      };
    })
  );

  const sizes = {
    width: maxWidth,
    height: Math.round(maxWidth / rest.aspect),
  };

  const fallback = await getFallbackImage(
    src,
    placeholder,
    image,
    fallbackFormat,
    formatOptions,
    rest
  );

  return { sources, sizes, fallback, imagesizes };
}
