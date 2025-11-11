import { useReducer, useEffect, useState } from "react";
import { chatReducer } from "../contexts/ChatReducer";
import { StorageService } from "../utils/storage-adapter";

// Initialize storage service
const storageService = new StorageService();

// Persistence middleware
const persistenceMiddleware = (reducer) => {
  let lastSavedState = null;

  return (state, action) => {
    // Apply the reducer to get the new state
    const newState = reducer(state, action);

    // Check if state actually changed
    if (newState !== state) {
      // Debounced save to prevent excessive writes
      if (lastSavedState) {
        clearTimeout(lastSavedState);
      }

      lastSavedState = setTimeout(() => {
        storageService.save(newState).catch((error) => {
          console.error("Failed to save chat state:", error);
        });
      }, 1000); // 1 second debounce
    }

    return newState;
  };
};

export const useChat = () => {
  // Initialize with persisted state or default state
  const [state, dispatch] = useReducer(persistenceMiddleware(chatReducer), {
    active: null,
    chats: [],
  });

  // Add loading state to prevent race conditions
  const [isLoading, setIsLoading] = useState(true);

  // Load persisted state on mount
  useEffect(() => {
    const loadPersistedState = async () => {
      try {
        setIsLoading(true);
        const savedState = await storageService.load();
        if (savedState && savedState.chats && savedState.chats.length > 0) {
          // Properly hydrate state with saved data
          dispatch({
            type: "CHAT:LOAD",
            payload: {
              active: savedState.active,
              chats: savedState.chats,
            },
          });
        } else {
          // create new chat nothing has been persisted
          dispatch({ type: "CHAT:CREATE", payload: null });
        }
      } catch (error) {
        console.error("Failed to load persisted chat state:", error);
        // just create a new chat
        dispatch({ type: "CHAT:CREATE", payload: null });
      } finally {
        setIsLoading(false);
      }
    };

    loadPersistedState();
  }, []);

  // set the active chat
  const activateChat = (chatId) => {
    if (!isLoading) {
      dispatch({ type: "CHAT:ACTIVATE", payload: chatId });
    }
  };

  // initialize new chat
  const createChat = (message) => {
    if (!isLoading) {
      dispatch({ type: "CHAT:CREATE", payload: message });
    }
  };

  // remove a chat
  const deleteChat = (chatId) => {
    if (!isLoading) {
      dispatch({ type: "CHAT:DELETE", payload: chatId });
    }
  };

  // add chat a message
  const addMessage = (message) => {
    if (!isLoading) {
      dispatch({ type: "CHAT:SEND_MESSAGE", payload: message });
    }
  };

  // manual save method for immediate persistence
  const saveNow = () => {
    if (!isLoading) {
      storageService.save(state).catch((error) => {
        console.error("Failed to save chat state:", error);
      });
    }
  };

  return {
    activeChat: state.active,
    chats: state.chats,
    isLoading,
    activateChat,
    createChat,
    deleteChat,
    addMessage,
    saveNow,
  };
};
