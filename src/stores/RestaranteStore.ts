import { writable} from "svelte/store";
import type { Writable } from "svelte/store";
import type { restaurant } from "../lib/logic/restaurante";

export const restauranteStore: Writable<restaurant> = writable(null);

//creamos un get para obtener el valor del store
export const getRestaurante = () => {
    let restaurante: restaurant;
    restauranteStore.subscribe((value) => {
        restaurante = value;
    });
    return restaurante;
};
