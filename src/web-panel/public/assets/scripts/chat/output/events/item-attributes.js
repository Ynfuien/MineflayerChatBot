/**
 * @type {Object.<string, {name: string, value: number, slot: "head" | "chest" | "legs" | "feet"}[]>}
 */
const itemAttributes = {
    //#region Tools
    // Wooden
    wooden_sword: [
        {
            name: "generic.attack_damage",
            value: 4,
            slot: "mainhand"
        },
        {
            name: "generic.attack_speed",
            value: 1.6,
            slot: "mainhand"
        }
    ],
    wooden_pickaxe: [
        {
            name: "generic.attack_damage",
            value: 2,
            slot: "mainhand"
        },
        {
            name: "generic.attack_speed",
            value: 1.2,
            slot: "mainhand"
        }
    ],
    wooden_axe: [
        {
            name: "generic.attack_damage",
            value: 7,
            slot: "mainhand"
        },
        {
            name: "generic.attack_speed",
            value: 0.8,
            slot: "mainhand"
        }
    ],
    wooden_shovel: [
        {
            name: "generic.attack_damage",
            value: 2.5,
            slot: "mainhand"
        },
        {
            name: "generic.attack_speed",
            value: 1,
            slot: "mainhand"
        }
    ],
    wooden_hoe: [
        {
            name: "generic.attack_damage",
            value: 1,
            slot: "mainhand"
        },
        {
            name: "generic.attack_speed",
            value: 1,
            slot: "mainhand"
        }
    ],

    // Stone
    stone_sword: [
        {
            name: "generic.attack_damage",
            value: 5,
            slot: "mainhand"
        },
        {
            name: "generic.attack_speed",
            value: 1.6,
            slot: "mainhand"
        }
    ],
    stone_pickaxe: [
        {
            name: "generic.attack_damage",
            value: 3,
            slot: "mainhand"
        },
        {
            name: "generic.attack_speed",
            value: 1.2,
            slot: "mainhand"
        }
    ],
    stone_axe: [
        {
            name: "generic.attack_damage",
            value: 9,
            slot: "mainhand"
        },
        {
            name: "generic.attack_speed",
            value: 0.8,
            slot: "mainhand"
        }
    ],
    stone_shovel: [
        {
            name: "generic.attack_damage",
            value: 3.5,
            slot: "mainhand"
        },
        {
            name: "generic.attack_speed",
            value: 1,
            slot: "mainhand"
        }
    ],
    stone_hoe: [
        {
            name: "generic.attack_damage",
            value: 1,
            slot: "mainhand"
        },
        {
            name: "generic.attack_speed",
            value: 2,
            slot: "mainhand"
        }
    ],

    // Iron
    iron_sword: [
        {
            name: "generic.attack_damage",
            value: 6,
            slot: "mainhand"
        },
        {
            name: "generic.attack_speed",
            value: 1.6,
            slot: "mainhand"
        }
    ],
    iron_pickaxe: [
        {
            name: "generic.attack_damage",
            value: 4,
            slot: "mainhand"
        },
        {
            name: "generic.attack_speed",
            value: 1.2,
            slot: "mainhand"
        }
    ],
    iron_axe: [
        {
            name: "generic.attack_damage",
            value: 9,
            slot: "mainhand"
        },
        {
            name: "generic.attack_speed",
            value: 0.9,
            slot: "mainhand"
        }
    ],
    iron_shovel: [
        {
            name: "generic.attack_damage",
            value: 4.5,
            slot: "mainhand"
        },
        {
            name: "generic.attack_speed",
            value: 1,
            slot: "mainhand"
        }
    ],
    iron_hoe: [
        {
            name: "generic.attack_damage",
            value: 1,
            slot: "mainhand"
        },
        {
            name: "generic.attack_speed",
            value: 3,
            slot: "mainhand"
        }
    ],

    // Golden
    golden_sword: [
        {
            name: "generic.attack_damage",
            value: 4,
            slot: "mainhand"
        },
        {
            name: "generic.attack_speed",
            value: 1.6,
            slot: "mainhand"
        }
    ],
    golden_pickaxe: [
        {
            name: "generic.attack_damage",
            value: 2,
            slot: "mainhand"
        },
        {
            name: "generic.attack_speed",
            value: 1.2,
            slot: "mainhand"
        }
    ],
    golden_axe: [
        {
            name: "generic.attack_damage",
            value: 7,
            slot: "mainhand"
        },
        {
            name: "generic.attack_speed",
            value: 1,
            slot: "mainhand"
        }
    ],
    golden_shovel: [
        {
            name: "generic.attack_damage",
            value: 2.5,
            slot: "mainhand"
        },
        {
            name: "generic.attack_speed",
            value: 1,
            slot: "mainhand"
        }
    ],
    golden_hoe: [
        {
            name: "generic.attack_damage",
            value: 1,
            slot: "mainhand"
        },
        {
            name: "generic.attack_speed",
            value: 1,
            slot: "mainhand"
        }
    ],

    // Diamond
    diamond_sword: [
        {
            name: "generic.attack_damage",
            value: 7,
            slot: "mainhand"
        },
        {
            name: "generic.attack_speed",
            value: 1.6,
            slot: "mainhand"
        }
    ],
    diamond_pickaxe: [
        {
            name: "generic.attack_damage",
            value: 5,
            slot: "mainhand"
        },
        {
            name: "generic.attack_speed",
            value: 1.2,
            slot: "mainhand"
        }
    ],
    diamond_axe: [
        {
            name: "generic.attack_damage",
            value: 9,
            slot: "mainhand"
        },
        {
            name: "generic.attack_speed",
            value: 1,
            slot: "mainhand"
        }
    ],
    diamond_shovel: [
        {
            name: "generic.attack_damage",
            value: 5.5,
            slot: "mainhand"
        },
        {
            name: "generic.attack_speed",
            value: 1,
            slot: "mainhand"
        }
    ],
    diamond_hoe: [
        {
            name: "generic.attack_damage",
            value: 1,
            slot: "mainhand"
        },
        {
            name: "generic.attack_speed",
            value: 4,
            slot: "mainhand"
        }
    ],

    // Netherite
    netherite_sword: [
        {
            name: "generic.attack_damage",
            value: 8,
            slot: "mainhand"
        },
        {
            name: "generic.attack_speed",
            value: 1.6,
            slot: "mainhand"
        }
    ],
    netherite_pickaxe: [
        {
            name: "generic.attack_damage",
            value: 6,
            slot: "mainhand"
        },
        {
            name: "generic.attack_speed",
            value: 1.2,
            slot: "mainhand"
        }
    ],
    netherite_axe: [
        {
            name: "generic.attack_damage",
            value: 10,
            slot: "mainhand"
        },
        {
            name: "generic.attack_speed",
            value: 1,
            slot: "mainhand"
        }
    ],
    netherite_shovel: [
        {
            name: "generic.attack_damage",
            value: 6.5,
            slot: "mainhand"
        },
        {
            name: "generic.attack_speed",
            value: 1,
            slot: "mainhand"
        }
    ],
    netherite_hoe: [
        {
            name: "generic.attack_damage",
            value: 1,
            slot: "mainhand"
        },
        {
            name: "generic.attack_speed",
            value: 4,
            slot: "mainhand"
        }
    ],

    trident: [
        {
            name: "generic.attack_damage",
            value: 9,
            slot: "mainhand"
        },
        {
            name: "generic.attack_speed",
            value: 1.1,
            slot: "mainhand"
        }
    ],
    //#endregion


    //#region Armor
    // Leather
    leather_helmet: [
        {
            name: "generic.armor",
            value: 1,
            slot: "head"
        }
    ],
    leather_chestplate: [
        {
            name: "generic.armor",
            value: 3,
            slot: "chest"
        }
    ],
    leather_leggings: [
        {
            name: "generic.armor",
            value: 2,
            slot: "legs"
        }
    ],
    leather_boots: [
        {
            name: "generic.armor",
            value: 1,
            slot: "feet"
        }
    ],

    // Chainmail
    chainmail_helmet: [
        {
            name: "generic.armor",
            value: 2,
            slot: "head"
        }
    ],
    chainmail_chestplate: [
        {
            name: "generic.armor",
            value: 5,
            slot: "chest"
        }
    ],
    chainmail_leggings: [
        {
            name: "generic.armor",
            value: 4,
            slot: "legs"
        }
    ],
    chainmail_boots: [
        {
            name: "generic.armor",
            value: 1,
            slot: "feet"
        }
    ],

    // Chainmail
    chainmail_helmet: [
        {
            name: "generic.armor",
            value: 2,
            slot: "head"
        }
    ],
    chainmail_chestplate: [
        {
            name: "generic.armor",
            value: 5,
            slot: "chest"
        }
    ],
    chainmail_leggings: [
        {
            name: "generic.armor",
            value: 4,
            slot: "legs"
        }
    ],
    chainmail_boots: [
        {
            name: "generic.armor",
            value: 1,
            slot: "feet"
        }
    ],

    // Golden
    golden_helmet: [
        {
            name: "generic.armor",
            value: 2,
            slot: "head"
        }
    ],
    golden_chestplate: [
        {
            name: "generic.armor",
            value: 5,
            slot: "chest"
        }
    ],
    golden_leggings: [
        {
            name: "generic.armor",
            value: 3,
            slot: "legs"
        }
    ],
    golden_boots: [
        {
            name: "generic.armor",
            value: 1,
            slot: "feet"
        }
    ],

    // Iron
    iron_helmet: [
        {
            name: "generic.armor",
            value: 2,
            slot: "head"
        }
    ],
    iron_chestplate: [
        {
            name: "generic.armor",
            value: 6,
            slot: "chest"
        }
    ],
    iron_leggings: [
        {
            name: "generic.armor",
            value: 5,
            slot: "legs"
        }
    ],
    iron_boots: [
        {
            name: "generic.armor",
            value: 2,
            slot: "feet"
        }
    ],

    // Diamond
    diamond_helmet: [
        {
            name: "generic.armor",
            value: 3,
            slot: "head"
        },
        {
            name: "generic.armor_toughness",
            value: 2,
            slot: "head"
        }
    ],
    diamond_chestplate: [
        {
            name: "generic.armor",
            value: 8,
            slot: "chest"
        },
        {
            name: "generic.armor_toughness",
            value: 2,
            slot: "chest"
        }
    ],
    diamond_leggings: [
        {
            name: "generic.armor",
            value: 6,
            slot: "legs"
        },
        {
            name: "generic.armor_toughness",
            value: 2,
            slot: "legs"
        }
    ],
    diamond_boots: [
        {
            name: "generic.armor",
            value: 3,
            slot: "feet"
        },
        {
            name: "generic.armor_toughness",
            value: 2,
            slot: "feet"
        }
    ],

    // Netherite
    netherite_helmet: [
        {
            name: "generic.armor",
            value: 3,
            slot: "head"
        },
        {
            name: "generic.armor_toughness",
            value: 3,
            slot: "head"
        },
        {
            name: "generic.knockback_resistance",
            value: 1,
            slot: "head"
        }
    ],
    netherite_chestplate: [
        {
            name: "generic.armor",
            value: 8,
            slot: "chest"
        },
        {
            name: "generic.armor_toughness",
            value: 3,
            slot: "chest"
        },
        {
            name: "generic.knockback_resistance",
            value: 1,
            slot: "chest"
        }
    ],
    netherite_leggings: [
        {
            name: "generic.armor",
            value: 6,
            slot: "legs"
        },
        {
            name: "generic.armor_toughness",
            value: 3,
            slot: "legs"
        },
        {
            name: "generic.knockback_resistance",
            value: 1,
            slot: "legs"
        }
    ],
    netherite_boots: [
        {
            name: "generic.armor",
            value: 3,
            slot: "feet"
        },
        {
            name: "generic.armor_toughness",
            value: 3,
            slot: "feet"
        },
        {
            name: "generic.knockback_resistance",
            value: 1,
            slot: "feet"
        }
    ],

    turtle_helmet: [
        {
            name: "generic.armor",
            value: 2,
            slot: "head"
        }
    ]
    //#endregion
};

export default itemAttributes;