//Vamos a crear un tipo de datop unico para los restaurantes
export type restaurant = {
    idRestaurante: number,
    img: string,
    nombre: string,
    direccion: string,
    telefono: number,
    horaApertura: string,
    horaCierre: string,
    descripcion: string,
    puntuacion: number,
    visible: boolean,
}