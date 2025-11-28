import { atom } from 'jotai';
import { atomWithStorage, loadable } from 'jotai/utils';
import {
  ChatData
} from './types';
import { getUserIssueUpvotes, getUserPostDownvotes, getUserPostUpvotes, getUserPreferences } from './utils';

export const chats = atom<ChatData[]>([]);
export const navStateAtom = atom<boolean>(false);
export const userNameAtom = atomWithStorage<string>('civicsphere_username', '');
export const userPrefsAtom = atom(getUserPreferences());
export const userPrefsAtom_loadable = loadable(userPrefsAtom);
export const userPostUpvotesAtom = atom(getUserPostUpvotes());
export const userPostUpvotesAtom_loadable = loadable(userPostUpvotesAtom);
export const userPostDownvotesAtom = atom(getUserPostDownvotes());
export const userPostDownvotesAtom_loadable = loadable(userPostDownvotesAtom);
export const userIssueUpvotesAtom = atom(getUserIssueUpvotes());
export const userIssueUpvotesAtom_loadable = loadable(userIssueUpvotesAtom);
