import { atom } from 'jotai';
import { atomWithStorage, loadable } from 'jotai/utils';
import {
  ChatData
} from './types';
import { getUserPreferences } from './utils';

export const chats = atom<ChatData[]>([]);
export const navStateAtom = atom<boolean>(false);
export const userNameAtom = atomWithStorage<string>('civicsphere_username', '');
export const userPrefsAtom = atom(getUserPreferences());
export const userPrefsAtom_loadable = loadable(userPrefsAtom);
