export const DEMO_PLAYER_NAMES = [
  "Carlos Rodríguez", "María García", "José Martínez", "Ana López", "Luis Hernández", "Carmen González", "Miguel Pérez", "Isabel Sánchez",
  "Francisco Ramírez", "Laura Torres", "Diego Cruz", "Sofía Morales", "Javier Reyes", "Lucía Jiménez", "Antonio Flores", "Patricia Mendoza",
  "Ricardo Vargas", "Claudia Castro", "Andrés Medina", "Valeria Ríos", "Sergio Aguilar", "Daniela Navarro", "Fernando Salazar", "Monica Herrera",
  "Gabriel Castillo", "Paulina Ortiz", "Adrián Espinoza", "Natalia Guzmán", "Mateo Paredes", "Regina Velasco", "Sebastián Campos", "Alejandra Cervantes",
  "Emilio Fuentes", "Sara Mejía", "Julián Estrada", "Brenda Quintana", "Nicolás Zaragoza", "Camila Gallegos", "Samuel Solano", "Valentina Palacios",
  "Daniel Ibarra", "Rebeca Vidal", "Alexis Montes", "Miriam Lozano", "Oscar Puga", "Elena Bejarano", "Andrea Saldaña", "David Rangel",
  "Jorge Ledesma", "Gabriela Córdoba", "Raúl Ocampo", "Teresa Montiel", "Eduardo Cisneros", "Rosa Luna", "Manuel Pineda", "Karla Soto",
  "Rubén Aguilar", "Liliana Delgado", "Hugo Mora", "Susana Rosales", "Alberto Lara", "Martha Quintana", "Roberto Zúñiga", "Beatriz Galván",
  "Ricardo Espinoza", "Cecilia Villanueva", "Víctor Manzano", "Norma Guerrero", "Saúl Barrera", "Leticia Benítez", "Octavio Rivas", "Aurora Cordero",
  "Marco Antonio", "Guadalupe Fernández", "Armando Pacheco", "Yolanda Aguilar", "Benjamín Rojas", "Esther Márquez", "Gilberto Medina", "Silvia Torres",
  "Ramiro Valencia", "Teresa Campos", "Federico Guzmán", "Olivia Lozano", "Ignacio Salazar", "Cristina Castillo", "Eugenio Paredes", "Verónica Espinoza",
  "Gustavo Navarro", "Liliana Herrera", "Rodolfo Vargas", "Patricia Morales", "Arturo Reyes", "Marisol Jiménez", "Raúl Flores", "Ana Karen Mendoza",
  "Javier González", "Margarita López", "Santiago Martínez", "Rosa María García", "Carlos Alberto", "María del Carmen", "José Luis", "Ana Patricia",
  "Francisco Javier", "Guadalupe Patricia", "Luis Antonio", "María de los Ángeles", "Juan Carlos", "María Fernanda", "Manuel Alejandro", "Ana Sofía",
  "Roberto Carlos", "María Guadalupe", "Jesús Antonio", "María José", "Miguel Ángel", "Ana María", "José Francisco", "María Isabel",
  "Antonio de Jesús", "María del Rosario", "Juan Manuel", "María Teresa", "Luis Miguel", "Ana Lilia", "Jorge Luis", "María Elena",
  "Francisco José", "María de Jesús", "Carlos Eduardo", "Ana Gabriela", "José María", "María de la Luz", "Alberto José", "Ana Laura",
  "Ricardo Antonio", "María del Pilar", "Santiago José", "María de los Ángeles", "Gabriel Antonio", "María del Socorro", "Pedro José", "María Concepción",
  "Víctor Manuel", "María de la Paz", "Ernesto José", "María del Carmen", "Ramiro José", "María de la Fe", "Salvador José", "María de la Merced",
  "Octavio José", "María de la Salud", "Abelardo José", "María de la Esperanza", "Norberto José", "María de la Gracia", "Eulogio José", "María de la Caridad",
  "Filiberto José", "María de la Victoria", "Wenceslao José", "María de la Trinidad", "Anacleto José", "María de la Purificación", "Eusebio José", "María de la Presentación",
  "Teódulo José", "María de la Natividad", "Eustaquio José", "María de la Anunciación", "Fulgencio José", "María de la Asunción", "Pascual José", "María de la Inmaculada"
] as const;

export const getDemoPlayers = (count: number): string[] => {
  const clampedCount = Math.min(Math.max(count, 4), 128);
  return DEMO_PLAYER_NAMES.slice(0, clampedCount);
};
