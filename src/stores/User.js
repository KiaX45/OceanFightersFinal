import { writable } from "svelte/store";

const createUser = () =>{
    const { subscribe, set, update } = writable(null);
    return {
        subscribe,
        setUser: (user) =>{
            set(user);
        },
        update
    }
}

const createAdmin = () => {
  const { subscribe, set, update } = writable(null);
  return {
    subscribe,
    setAdmin: (user) => {
      set(user);
    },
    update,
  };
};


export const isLoggedIn = writable(false);
export const user = createUser();
export const admin = createAdmin();