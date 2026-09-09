import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

const CreatedCareerStepContext = createContext<{
  createdStepId: string | null;
  requestScrollToCreatedCareerStep: (id: string) => void;
  clearCreatedCareerStepScroll: () => void;
} | null>(null);

export function CareerStepCreatedFocusProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [createdStepId, setCreatedStepId] = useState<string | null>(null);
  const clearCreatedCareerStepScroll = useCallback(() => {
    setCreatedStepId(null);
  }, []);
  const value = useMemo(
    () => ({
      createdStepId,
      requestScrollToCreatedCareerStep: setCreatedStepId,
      clearCreatedCareerStepScroll,
    }),
    [createdStepId, clearCreatedCareerStepScroll],
  );

  return (
    <CreatedCareerStepContext.Provider value={value}>
      {children}
    </CreatedCareerStepContext.Provider>
  );
}

export function useCreatedCareerStepScroll() {
  const context = useContext(CreatedCareerStepContext);
  if (!context) {
    throw new Error('CareerStepCreatedFocusProvider is required');
  }
  return context;
}
