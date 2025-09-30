/**
 * Generate a URL-friendly slug from a string
 */
export function generateSlug(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // Replace spaces with -
    .replace(/[^\w\-]+/g, '')     // Remove all non-word chars
    .replace(/\-\-+/g, '-')       // Replace multiple - with single -
    .replace(/^-+/, '')           // Trim - from start of text
    .replace(/-+$/, '')           // Trim - from end of text
}

/**
 * Check if a slug is unique (async function that would make an API call)
 */
export async function isSlugUnique(slug: string, postId?: string): Promise<boolean> {
  try {
    const params = new URLSearchParams({ slug })
    if (postId) params.append('postId', postId)
    
    const response = await fetch(`/api/check-slug?${params}`)
    const data = await response.json()
    return data.unique
  } catch (error) {
    console.error('Error checking slug uniqueness:', error)
    return false
  }
}

/**
 * Generate a unique slug by adding a number suffix if needed
 */
export async function generateUniqueSlug(text: string, postId?: string): Promise<string> {
  let slug = generateSlug(text)
  let counter = 1
  let finalSlug = slug

  while (!(await isSlugUnique(finalSlug, postId))) {
    finalSlug = `${slug}-${counter}`
    counter++
  }

  return finalSlug
}