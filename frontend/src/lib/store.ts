import { atom } from 'jotai';
import { atomWithStorage, loadable } from 'jotai/utils';
import {
  ChatData
} from './types';

export const chats = atom<ChatData[]>([]);
export const navStateAtom = atom<boolean>(false);
export const userNameAtom = atomWithStorage<string>('civicsphere_username', '');
export const userPrefsAtom = atom();
export const userPrefsAtom_loadable = loadable(userPrefsAtom);
export const userPostUpvotesAtom = atom();
export const userPostUpvotesAtom_loadable = loadable(userPostUpvotesAtom);
export const userPostDownvotesAtom = atom();
export const userPostDownvotesAtom_loadable = loadable(userPostDownvotesAtom);
export const userIssueUpvotesAtom = atom();
export const userIssueUpvotesAtom_loadable = loadable(userIssueUpvotesAtom);
export const userIssueDownvotesAtom = atom();
export const userIssueDownvotesAtom_loadable = loadable(userIssueDownvotesAtom);
