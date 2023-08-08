import { writable } from "svelte/store";
import type { Writable } from "svelte/store";
import type { restaurant } from "../lib/logic/restaurante";

export const menuStore: Writable<restaurant> = writable(null);

//creamos un get para obtener el valor del store
export const getMenu = () => {
    let menu: restaurant;
    menuStore.subscribe((value) => {
        menu = value;
    });
    return menu;
};

