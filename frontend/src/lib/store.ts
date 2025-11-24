import { atom } from 'jotai';
import { atomWithStorage, loadable } from 'jotai/utils';
import {
  ChatData
} from './types';
import { getUserDownvotes, getUserIssueUpvotes, getUserPreferences, getUserUpvotes } from './utils';

export const chats = atom<ChatData[]>([]);
export const navStateAtom = atom<boolean>(false);
export const userNameAtom = atomWithStorage<string>('civicsphere_username', '');
export const userPrefsAtom = atom(getUserPreferences());
export const userPrefsAtom_loadable = loadable(userPrefsAtom);
export const userPostUpvotesAtom = atom(getUserUpvotes());
export const userPostUpvotesAtom_loadable = loadable(userPostUpvotesAtom);
export const userPostDownvotesAtom = atom(getUserDownvotes());
export const userPostDownvotesAtom_loadable = loadable(userPostDownvotesAtom);
export const userIssueUpvotesAtom = atom(getUserIssueUpvotes());
export const userIssueUpvotesAtom_loadable = loadable(userIssueUpvotesAtom);
export const userIssueDownvotesAtom = atom(getUserDownvotes());
export const userIssueDownvotesAtom_loadable = loadable(userIssueDownvotesAtom);
