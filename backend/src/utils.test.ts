import { randomSlug } from './utils';

describe('randomSlug', () => {

    it('should return a slug of the default length (6)', () => {
        const slug = randomSlug();
        expect(slug).toHaveLength(6);
    });

    it('should return a slug of a specified length', () => {
        const slug = randomSlug(10);
        expect(slug).toHaveLength(10);
    });

    it('should only contain valid characters (alphanumeric)', () => {
        const slug = randomSlug(50);

        // Regex to test that all characters are in the allowed set
        const validCharsRegex = /^[a-zA-Z0-9]+$/;

        expect(validCharsRegex.test(slug)).toBe(true);
    });
});