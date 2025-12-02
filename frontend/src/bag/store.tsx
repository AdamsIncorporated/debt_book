import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from "react";

// Define the type of items in the bag
interface Item {
  id: number;
  name: string;
}

type State = {
  bag: Item[];
};

type Action =
  | { type: "ADD_ITEM"; payload: Item }
  | { type: "REMOVE_ITEM"; payload: number }
  | { type: "CLEAR_BAG" };

const initialState: State = {
  bag: [],
};

const BagContext = createContext<{
  state: State;
  dispatch: React.Dispatch<Action>;
} | null>(null);

// Reducer function (like Redux)
function bagReducer(state: State, action: Action): State {
  switch (action.type) {
    case "ADD_ITEM":
      return { ...state, bag: [...state.bag, action.payload] };
    case "REMOVE_ITEM":
      return {
        ...state,
        bag: state.bag.filter((item) => item.id !== action.payload),
      };
    case "CLEAR_BAG":
      return { ...state, bag: [] };
    default:
      return state;
  }
}

// Provider component
export const BagProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(bagReducer, initialState, (initial) => {
    // Load from sessionStorage on init
    const stored = sessionStorage.getItem("bag");
    return stored ? { bag: JSON.parse(stored) } : initial;
  });

  // Persist state to sessionStorage whenever it changes
  useEffect(() => {
    sessionStorage.setItem("bag", JSON.stringify(state.bag));
  }, [state.bag]);

  return (
    <BagContext.Provider value={{ state, dispatch }}>
      {children}
    </BagContext.Provider>
  );
};

// Hook to use the bag store
export const useBag = () => {
  const context = useContext(BagContext);
  if (!context) throw new Error("useBag must be used within a BagProvider");
  return context;
};
