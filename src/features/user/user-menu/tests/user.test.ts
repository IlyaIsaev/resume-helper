import { expect, test } from 'vitest';

import { buildUserInitials } from '../model/user';

test('should take the first letters of two words when the name has multiple parts', () => {
  expect(buildUserInitials('Ada Lovelace')).toBe('AL');
});

test('should return one letter when the name is a single word', () => {
  expect(buildUserInitials('Ada')).toBe('A');
});

test('should return ? when the name is empty or whitespace', () => {
  expect(buildUserInitials('')).toBe('?');
  expect(buildUserInitials('   ')).toBe('?');
});
