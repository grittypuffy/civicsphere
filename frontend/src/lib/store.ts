import { atom } from 'jotai';
import {
  ChatData
} from './types';

export const chats = atom<ChatData[]>([]);
export const navStateAtom = atom<boolean>(false);
