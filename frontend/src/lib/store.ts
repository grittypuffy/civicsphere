import { atom } from 'jotai';
import { loadable } from 'jotai/utils';
import {
  ChatData,
  User
} from './types';
import { getFeeds } from './utils';

export const chats = atom<ChatData[]>([]);
export const navStateAtom = atom<boolean>(false);
export const feedAtom = atom(getFeeds());
export const loadableFeedAtom = loadable(feedAtom);
export const userAtom = atom<User>({
  user_id: '',
  username: '',
  email: '',
  full_name: '',
  role: undefined,
  location: '',
  language: undefined,
  interests: [],
  profession: ''
});
