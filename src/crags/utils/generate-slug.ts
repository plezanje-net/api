import slugify from 'slugify';

async function generateSlug(
  name: string,
  alreadyExistsCondition: (name: string) => Promise<boolean>,
): Promise<string> {
  let slug = slugify(name, { lower: true });
  let suffixCounter = 0;
  let suffix = '';

  while (await alreadyExistsCondition(slug + suffix)) {
    suffixCounter++;
    suffix = '-' + suffixCounter;
  }
  slug += suffix;
  return Promise.resolve(slug);
}

export default generateSlug;
