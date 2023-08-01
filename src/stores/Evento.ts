import { writable} from "svelte/store";
import type { Writable } from "svelte/store";
import type { evento } from "../lib/logic/eventos";

export const eventoStore: Writable<evento> = writable(null);

//creamos un get para obtener el valor del store    
export const getEvento = () => {
    let evento: evento;
    eventoStore.subscribe((value) => {
        evento = value;
    });
    return evento;
};

//creamos una variable para el id actual del evento
export const idEvento: Writable<any> = writable(null);

//creamos un get para obtener el valor del store
export const getIdEvento = () => {
    let id: any;
    idEvento.subscribe((value) => {
        id = value;
    });
    return id;
}