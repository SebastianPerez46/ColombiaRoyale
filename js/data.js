// --- CONSTANTES DE JUEGO ---
const TYPES = {
    TROOP: "tropa",
    SPELL: "hechizo",
    BUILDING: "estructura"
};

const TARGETS = {
    GROUND: "terrestre",   
    AIR: "aereo",          
    ALL: "todos",          
    BUILDINGS: "torres",   
    NONE: "ninguno"        
};

// --- DICCIONARIO DE CARTAS CON CONFIGURACIÓN DE SPRITES ---

const cardsData = {
    // --- TROPAS ---

    "indio": {
        name: "Indio",
        type: TYPES.TROOP,
        cost: 3,
        stats: {
            hp: 800, dmg: 120, atkSpeed: 1.2, range: 5.5, speed: 3, target: TARGETS.ALL
        },
        isFlying: false,
        description: "Dispara flechas a distancia.",
        img: "assets/img/cards/indio.png",
        
        spriteConfig: {
            sheet: "assets/img/sprites/indio.png", 
            frameWidth: 100, frameHeight: 100, scale: 1.2, 
            offsetX: 0, offsetY: -15,
            animBack: [ [0, 0], [0, 1] ], 
            animFront: [ [2, 2], [2, 3] ] 
        }
    },

    "gigante": {
        name: "Gigante",
        type: TYPES.TROOP,
        cost: 5,
        stats: {
            hp: 2000, dmg: 150, atkSpeed: 1.5, range: 1.0, speed: 2, target: TARGETS.BUILDINGS
        },
        isFlying: false,
        description: "Tanque pesado que va a estructuras.",
        img: "assets/img/cards/gigante.png",
        
        spriteConfig: {
            sheet: "assets/img/sprites/gigante2.png",
            frameWidth: 200, frameHeight: 200, scale: 1.5, 
            offsetX: 0, offsetY: -25,
            animBack: [ [1, 0], [1, 1] ],
            animFront: [ [0, 0], [0, 1] ]
        }
    },

    "policia": {
        name: "Policía",
        type: TYPES.TROOP,
        cost: 4,
        stats: {
            hp: 500, dmg: 250, atkSpeed: 1.8, range: 5.0, speed: 3, target: TARGETS.ALL
        },
        isFlying: false,
        description: "Mantiene el orden a distancia.",
        img: "assets/img/cards/policia.png",
        
        spriteConfig: {
            sheet: "assets/img/sprites/Policía.png",
            frameWidth: 100, frameHeight: 100, scale: 1.1,
            offsetX: 0, offsetY: -10,
            animBack: [ [0, 2], [0, 3] ],
            animFront: [ [0, 0], [0, 1] ]
        }
    },

    "gymbro": {
        name: "Gymbro",
        type: TYPES.TROOP,
        cost: 4,
        stats: {
            hp: 800, dmg: 250, atkSpeed: 1.8, range: 1.0, speed: 3.5, target: TARGETS.GROUND
        },
        isFlying: false,
        description: "Pega duro cuerpo a cuerpo.",
        img: "assets/img/cards/gymbro.png",
        
        spriteConfig: {
            sheet: "assets/img/sprites/Gymbro.png",
            frameWidth: 100, frameHeight: 100, scale: 1.2,
            offsetX: 0, offsetY: -15,
            animBack: [ [0, 2], [0, 3] ],
            animFront: [ [0, 1], [1, 2] ]
        }
    },

    "policia_oscuro": {
        name: "P. Oscuro",
        type: TYPES.TROOP,
        cost: 4,
        stats: {
            hp: 1000, dmg: 180, atkSpeed: 1.5, range: 1.0, speed: 3.5, target: TARGETS.GROUND
        },
        isFlying: false,
        description: "Antidisturbios con escudo.",
        img: "assets/img/cards/PO.png",
        
        spriteConfig: {
            sheet: "assets/img/sprites/PO.png",
            frameWidth: 100, frameHeight: 100, scale: 1.2,
            offsetX: 0, offsetY: -15,
            animBack: [ [0, 0], [0, 1] ],
            animFront: [ [1, 1], [1, 2] ]
        }
    },

    "campesino": {
        name: "Campesino",
        type: TYPES.TROOP,
        cost: 4,
        stats: {
            hp: 800, dmg: 200, atkSpeed: 1.3, range: 1.0, speed: 4.5, target: TARGETS.BUILDINGS
        },
        isFlying: false,
        description: "Salta el río y ataca torres.",
        img: "assets/img/cards/campesino.png",
        
        spriteConfig: {
            sheet: "assets/img/sprites/campesino.png",
            frameWidth: 100, frameHeight: 200, scale: 1.2,
            offsetX: 0, offsetY: -20,
            animBack: [ [1, 0], [1, 1] ],
            animFront: [ [0, 0], [0, 1] ]
        }
    },

    "dron": {
        name: "Dron",
        type: TYPES.TROOP,
        cost: 3,
        stats: {
            hp: 150, dmg: 100, atkSpeed: 1.0, range: 2.0, speed: 3.5, target: TARGETS.ANY
        },
        isFlying: true, // ¡Vuela!
        description: "Unidad aérea de soporte.",
        img: "assets/img/cards/dron.png",
        
        spriteConfig: {
            sheet: "assets/img/sprites/dron.png",
            frameWidth: 100, frameHeight: 100, scale: 1.0,
            offsetX: 0, offsetY: -40, // Vuela más alto
            animBack: [ [0, 0], [0, 1] ],
            animFront: [[ 0, 2], [0, 3] ]
        }
    },

    "skater": {
        name: "Skater",
        type: TYPES.TROOP,
        cost: 5,
        stats: {
            hp: 900, dmg: 300, atkSpeed: 1.5, range: 1.0, speed: 4.0, target: TARGETS.GROUND
        },
        isFlying: false,
        description: "Carga rápida y golpe fuerte.",
        img: "assets/img/cards/skater.png",
        
        spriteConfig: {
            sheet: "assets/img/sprites/skater.png",
            frameWidth: 100, frameHeight: 100, scale: 1.0,
            offsetX: 0, offsetY: -15,
            animBack: [ [1, 0], [1, 1] ],
            animFront: [ [0, 0], [0, 1] ]
        }
    },

    // --- HECHIZOS ---
    
    "piedras": {
        name: "Piedras", 
        type: TYPES.SPELL, 
        cost: 2,
        stats: { dmg: 150, radius: 2.5, target: TARGETS.ALL },
        description: "Daño de área pequeño.",
        img: "assets/img/cards/piedras.png"
    },

    "bomba": {
        name: "Bomba", 
        type: TYPES.SPELL, 
        cost: 4,
        stats: { dmg: 400, radius: 2.0, target: TARGETS.ALL },
        description: "Mucho daño concentrado.",
        img: "assets/img/cards/bomba.png"
    }
};

function getAllCards() {
    return Object.values(cardsData);
}