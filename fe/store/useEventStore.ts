import {create} from 'zustand'

interface EventsStoreState {
    eventCount: number;
    increment: () => void;
}

export const useEventStore = create<EventsStoreState>((set) => ({
    eventCount: 0,
    increment: () => set((state) => ({ eventCount: state.eventCount + 1 })),
}));
