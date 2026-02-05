'use client'
import { createContext, useContext } from 'react';

export const ViewContext = createContext<{
    viewMode: 'admin' | 'user';
    setViewMode: (mode: 'admin' | 'user') => void;
}>({ viewMode: 'admin', setViewMode: () => { } });

export const useViewMode = () => useContext(ViewContext);
