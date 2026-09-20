<?php
/**
 * QuizSpark 3D Full-Body Avatar System - Configuration & Whitelist Validation
 */

/**
 * Returns complete whitelist of allowed avatar components and properties.
 */
function getAvatarWhitelists(): array
{
    return [
        'style' => ['boy', 'girl'],

        'body' => [
            'regular', 'slim', 'athletic', 'soft', 'tall', 'short'
        ],

        'skin' => [
            'skin_01', 'skin_02', 'skin_03', 'skin_04',
            'skin_05', 'skin_06', 'skin_07', 'skin_08'
        ],

        'face' => [
            'face_round', 'face_oval', 'face_square',
            'face_soft', 'face_long', 'face_wide'
        ],

        'hair' => [
            // Boy Hairstyles
            'hair_boy_short', 'hair_boy_crew', 'hair_boy_sidepart', 'hair_boy_fade',
            'hair_boy_curly', 'hair_boy_wavy', 'hair_boy_messy', 'hair_boy_spiky',
            'hair_boy_medium', 'hair_boy_long',
            // Girl Hairstyles
            'hair_girl_straight', 'hair_girl_wavy', 'hair_girl_curly', 'hair_girl_ponytail',
            'hair_girl_highpony', 'hair_girl_lowpony', 'hair_girl_bob', 'hair_girl_braids',
            'hair_girl_bun', 'hair_girl_sidebraid', 'hair_girl_shoulder', 'hair_girl_wavymedium',
            'none'
        ],

        'hairColor' => [
            // Natural
            'black', 'dark_brown', 'brown', 'light_brown',
            'blonde', 'dark_blonde', 'red', 'auburn', 'grey',
            // Fun / Vibrant
            'blue', 'purple', 'pink', 'green', 'teal', 'coral'
        ],

        'eyes' => [
            'eyes_round', 'eyes_almond', 'eyes_large', 'eyes_small',
            'eyes_soft', 'eyes_bright', 'eyes_cartoon', 'eyes_friendly'
        ],

        'eyeColor' => [
            'brown', 'dark_brown', 'blue', 'green', 'hazel', 'grey', 'amber'
        ],

        'eyebrows' => [
            'brows_straight', 'brows_curved', 'brows_thick',
            'brows_thin', 'brows_soft', 'brows_raised', 'brows_natural'
        ],

        'nose' => [
            'nose_small', 'nose_medium', 'nose_wide', 'nose_rounded', 'nose_straight'
        ],

        'mouth' => [
            'mouth_smile', 'mouth_small_smile', 'mouth_neutral',
            'mouth_big_smile', 'mouth_laugh', 'mouth_friendly', 'mouth_confident'
        ],

        'facialHair' => [
            'none', 'mustache', 'light_beard', 'full_beard', 'goatee', 'short_beard'
        ],

        'top' => [
            'top_tshirt', 'top_polo', 'top_hoodie', 'top_sweatshirt',
            'top_jacket', 'top_shirt', 'top_casual', 'top_jersey', 'top_sweater',
            'none'
        ],

        'topColor' => [
            'blue', 'purple', 'red', 'yellow', 'green', 'coral', 'black', 'white', 'teal', 'navy', 'crimson', 'emerald'
        ],

        'bottom' => [
            'bottom_jeans', 'bottom_shorts', 'bottom_joggers',
            'bottom_casual', 'bottom_formal', 'bottom_skirt',
            'none'
        ],

        'bottomColor' => [
            'denim', 'black', 'khaki', 'navy', 'grey', 'crimson', 'white', 'teal'
        ],

        'dress' => [
            'none', 'dress_casual', 'dress_party', 'dress_summer',
            'dress_long', 'dress_formal', 'dress_traditional', 'dress_modern'
        ],

        'dressColor' => [
            'purple', 'pink', 'blue', 'emerald', 'ruby', 'gold', 'teal', 'black'
        ],

        'shoes' => [
            'shoes_sneakers', 'shoes_sports', 'shoes_boots',
            'shoes_casual', 'shoes_formal', 'shoes_sandals'
        ],

        'shoeColor' => [
            'white', 'black', 'red', 'blue', 'brown', 'pink', 'grey'
        ],

        'headwear' => [
            'none', 'headwear_cap', 'headwear_beanie', 'headwear_hat',
            'headwear_headband', 'headwear_crown', 'headwear_winter_hat'
        ],

        'glasses' => [
            'none', 'glasses_round', 'glasses_square',
            'glasses_thin', 'glasses_large', 'glasses_sunglasses'
        ],

        'accessory' => [
            'none', 'acc_backpack', 'acc_watch', 'acc_necklace',
            'acc_earrings', 'acc_headphones', 'acc_clips'
        ],

        'specialItem' => [
            'none', 'item_book', 'item_laptop', 'item_pencil',
            'item_trophy', 'item_gradcap'
        ]
    ];
}

/**
 * Default starting configurations
 */
function getAvatarDefaultConfig(string $style = 'boy'): array
{
    $style = in_array($style, ['boy', 'girl']) ? $style : 'boy';

    if ($style === 'girl') {
        return [
            'style'       => 'girl',
            'body'        => 'regular',
            'skin'        => 'skin_03',
            'face'        => 'face_oval',
            'hair'        => 'hair_girl_wavy',
            'hairColor'   => 'dark_brown',
            'eyes'        => 'eyes_bright',
            'eyeColor'    => 'brown',
            'eyebrows'    => 'brows_curved',
            'nose'        => 'nose_small',
            'mouth'       => 'mouth_smile',
            'facialHair'  => 'none',
            'top'         => 'top_casual',
            'topColor'    => 'purple',
            'bottom'      => 'bottom_jeans',
            'bottomColor' => 'denim',
            'dress'       => 'none',
            'dressColor'  => 'pink',
            'shoes'       => 'shoes_sneakers',
            'shoeColor'   => 'white',
            'headwear'    => 'none',
            'glasses'     => 'none',
            'accessory'   => 'acc_earrings',
            'specialItem' => 'none'
        ];
    }

    // Default: Boy
    return [
        'style'       => 'boy',
        'body'        => 'regular',
        'skin'        => 'skin_04',
        'face'        => 'face_round',
        'hair'        => 'hair_boy_fade',
        'hairColor'   => 'black',
        'eyes'        => 'eyes_friendly',
        'eyeColor'    => 'dark_brown',
        'eyebrows'    => 'brows_thick',
        'nose'        => 'nose_medium',
        'mouth'       => 'mouth_smile',
        'facialHair'  => 'none',
        'top'         => 'top_tshirt',
        'topColor'    => 'blue',
        'bottom'      => 'bottom_jeans',
        'bottomColor' => 'denim',
        'dress'       => 'none',
        'dressColor'  => 'purple',
        'shoes'       => 'shoes_sneakers',
        'shoeColor'   => 'white',
        'headwear'    => 'none',
        'glasses'     => 'none',
        'accessory'   => 'none',
        'specialItem' => 'none'
    ];
}

/**
 * Returns curated starting presets for Boy, Girl, and Neutral
 */
function getAvatarPresets(): array
{
    return [
        'boy' => [
            [
                'id' => 'boy_1', 'name' => 'Boy 1 (Sporty)',
                'config' => [
                    'style' => 'boy', 'body' => 'athletic', 'skin' => 'skin_04', 'face' => 'face_round',
                    'hair' => 'hair_boy_fade', 'hairColor' => 'black', 'eyes' => 'eyes_bright',
                    'eyeColor' => 'dark_brown', 'eyebrows' => 'brows_thick', 'nose' => 'nose_medium',
                    'mouth' => 'mouth_smile', 'facialHair' => 'none', 'top' => 'top_jersey',
                    'topColor' => 'blue', 'bottom' => 'bottom_shorts', 'bottomColor' => 'navy',
                    'dress' => 'none', 'dressColor' => 'blue', 'shoes' => 'shoes_sports',
                    'shoeColor' => 'red', 'headwear' => 'headwear_cap', 'glasses' => 'none',
                    'accessory' => 'acc_watch', 'specialItem' => 'none'
                ]
            ],
            [
                'id' => 'boy_2', 'name' => 'Boy 2 (Casual Hoodie)',
                'config' => [
                    'style' => 'boy', 'body' => 'regular', 'skin' => 'skin_02', 'face' => 'face_oval',
                    'hair' => 'hair_boy_curly', 'hairColor' => 'dark_brown', 'eyes' => 'eyes_friendly',
                    'eyeColor' => 'brown', 'eyebrows' => 'brows_natural', 'nose' => 'nose_small',
                    'mouth' => 'mouth_confident', 'facialHair' => 'none', 'top' => 'top_hoodie',
                    'topColor' => 'purple', 'bottom' => 'bottom_jeans', 'bottomColor' => 'denim',
                    'dress' => 'none', 'dressColor' => 'purple', 'shoes' => 'shoes_sneakers',
                    'shoeColor' => 'white', 'headwear' => 'none', 'glasses' => 'glasses_round',
                    'accessory' => 'acc_backpack', 'specialItem' => 'item_laptop'
                ]
            ],
            [
                'id' => 'boy_3', 'name' => 'Boy 3 (Smart Polo)',
                'config' => [
                    'style' => 'boy', 'body' => 'slim', 'skin' => 'skin_06', 'face' => 'face_square',
                    'hair' => 'hair_boy_sidepart', 'hairColor' => 'black', 'eyes' => 'eyes_almond',
                    'eyeColor' => 'dark_brown', 'eyebrows' => 'brows_straight', 'nose' => 'nose_straight',
                    'mouth' => 'mouth_smile', 'facialHair' => 'mustache', 'top' => 'top_polo',
                    'topColor' => 'coral', 'bottom' => 'bottom_casual', 'bottomColor' => 'khaki',
                    'dress' => 'none', 'dressColor' => 'coral', 'shoes' => 'shoes_casual',
                    'shoeColor' => 'brown', 'headwear' => 'none', 'glasses' => 'glasses_thin',
                    'accessory' => 'acc_watch', 'specialItem' => 'none'
                ]
            ],
            [
                'id' => 'boy_4', 'name' => 'Boy 4 (Urban Beanie)',
                'config' => [
                    'style' => 'boy', 'body' => 'regular', 'skin' => 'skin_03', 'face' => 'face_soft',
                    'hair' => 'hair_boy_spiky', 'hairColor' => 'blonde', 'eyes' => 'eyes_round',
                    'eyeColor' => 'blue', 'eyebrows' => 'brows_thick', 'nose' => 'nose_rounded',
                    'mouth' => 'mouth_big_smile', 'facialHair' => 'none', 'top' => 'top_jacket',
                    'topColor' => 'black', 'bottom' => 'bottom_joggers', 'bottomColor' => 'grey',
                    'dress' => 'none', 'dressColor' => 'black', 'shoes' => 'shoes_boots',
                    'shoeColor' => 'black', 'headwear' => 'headwear_beanie', 'glasses' => 'glasses_sunglasses',
                    'accessory' => 'acc_headphones', 'specialItem' => 'none'
                ]
            ],
            [
                'id' => 'boy_5', 'name' => 'Boy 5 (Classic Scholar)',
                'config' => [
                    'style' => 'boy', 'body' => 'tall', 'skin' => 'skin_07', 'face' => 'face_long',
                    'hair' => 'hair_boy_short', 'hairColor' => 'black', 'eyes' => 'eyes_cartoon',
                    'eyeColor' => 'dark_brown', 'eyebrows' => 'brows_raised', 'nose' => 'nose_medium',
                    'mouth' => 'mouth_friendly', 'facialHair' => 'none', 'top' => 'top_shirt',
                    'topColor' => 'white', 'bottom' => 'bottom_formal', 'bottomColor' => 'navy',
                    'dress' => 'none', 'dressColor' => 'white', 'shoes' => 'shoes_formal',
                    'shoeColor' => 'black', 'headwear' => 'none', 'glasses' => 'glasses_square',
                    'accessory' => 'none', 'specialItem' => 'item_book'
                ]
            ]
        ],

        'girl' => [
            [
                'id' => 'girl_1', 'name' => 'Girl 1 (Casual Vibe)',
                'config' => [
                    'style' => 'girl', 'body' => 'regular', 'skin' => 'skin_03', 'face' => 'face_oval',
                    'hair' => 'hair_girl_wavy', 'hairColor' => 'dark_brown', 'eyes' => 'eyes_bright',
                    'eyeColor' => 'brown', 'eyebrows' => 'brows_curved', 'nose' => 'nose_small',
                    'mouth' => 'mouth_smile', 'facialHair' => 'none', 'top' => 'top_casual',
                    'topColor' => 'purple', 'bottom' => 'bottom_jeans', 'bottomColor' => 'denim',
                    'dress' => 'none', 'dressColor' => 'purple', 'shoes' => 'shoes_sneakers',
                    'shoeColor' => 'white', 'headwear' => 'none', 'glasses' => 'none',
                    'accessory' => 'acc_earrings', 'specialItem' => 'none'
                ]
            ],
            [
                'id' => 'girl_2', 'name' => 'Girl 2 (High Ponytail Sport)',
                'config' => [
                    'style' => 'girl', 'body' => 'athletic', 'skin' => 'skin_05', 'face' => 'face_round',
                    'hair' => 'hair_girl_highpony', 'hairColor' => 'black', 'eyes' => 'eyes_almond',
                    'eyeColor' => 'dark_brown', 'eyebrows' => 'brows_natural', 'nose' => 'nose_small',
                    'mouth' => 'mouth_confident', 'facialHair' => 'none', 'top' => 'top_tshirt',
                    'topColor' => 'teal', 'bottom' => 'bottom_joggers', 'bottomColor' => 'black',
                    'dress' => 'none', 'dressColor' => 'teal', 'shoes' => 'shoes_sports',
                    'shoeColor' => 'pink', 'headwear' => 'headwear_headband', 'glasses' => 'none',
                    'accessory' => 'acc_headphones', 'specialItem' => 'none'
                ]
            ],
            [
                'id' => 'girl_3', 'name' => 'Girl 3 (Party Dress)',
                'config' => [
                    'style' => 'girl', 'body' => 'slim', 'skin' => 'skin_02', 'face' => 'face_soft',
                    'hair' => 'hair_girl_curly', 'hairColor' => 'auburn', 'eyes' => 'eyes_large',
                    'eyeColor' => 'green', 'eyebrows' => 'brows_curved', 'nose' => 'nose_small',
                    'mouth' => 'mouth_big_smile', 'facialHair' => 'none', 'top' => 'none',
                    'topColor' => 'pink', 'bottom' => 'none', 'bottomColor' => 'pink',
                    'dress' => 'dress_party', 'dressColor' => 'ruby', 'shoes' => 'shoes_casual',
                    'shoeColor' => 'red', 'headwear' => 'headwear_crown', 'glasses' => 'none',
                    'accessory' => 'acc_necklace', 'specialItem' => 'item_trophy'
                ]
            ],
            [
                'id' => 'girl_4', 'name' => 'Girl 4 (Braids & Glasses)',
                'config' => [
                    'style' => 'girl', 'body' => 'regular', 'skin' => 'skin_07', 'face' => 'face_oval',
                    'hair' => 'hair_girl_braids', 'hairColor' => 'black', 'eyes' => 'eyes_friendly',
                    'eyeColor' => 'dark_brown', 'eyebrows' => 'brows_thick', 'nose' => 'nose_medium',
                    'mouth' => 'mouth_smile', 'facialHair' => 'none', 'top' => 'top_sweater',
                    'topColor' => 'yellow', 'bottom' => 'bottom_skirt', 'bottomColor' => 'denim',
                    'dress' => 'none', 'dressColor' => 'yellow', 'shoes' => 'shoes_boots',
                    'shoeColor' => 'brown', 'headwear' => 'none', 'glasses' => 'glasses_round',
                    'accessory' => 'acc_backpack', 'specialItem' => 'item_book'
                ]
            ],
            [
                'id' => 'girl_5', 'name' => 'Girl 5 (Chic Bob Cut)',
                'config' => [
                    'style' => 'girl', 'body' => 'regular', 'skin' => 'skin_01', 'face' => 'face_square',
                    'hair' => 'hair_girl_bob', 'hairColor' => 'blonde', 'eyes' => 'eyes_bright',
                    'eyeColor' => 'blue', 'eyebrows' => 'brows_thin', 'nose' => 'nose_straight',
                    'mouth' => 'mouth_laugh', 'facialHair' => 'none', 'top' => 'top_jacket',
                    'topColor' => 'crimson', 'bottom' => 'bottom_jeans', 'bottomColor' => 'black',
                    'dress' => 'none', 'dressColor' => 'crimson', 'shoes' => 'shoes_sneakers',
                    'shoeColor' => 'white', 'headwear' => 'none', 'glasses' => 'glasses_sunglasses',
                    'accessory' => 'acc_earrings', 'specialItem' => 'none'
                ]
            ]
        ]
    ];
}

/**
 * Validates and sanitizes avatar payload against strict server whitelists.
 * Returns valid JSON string.
 */
function validateAndSanitizeAvatar($rawInput): string
{
    $whitelists = getAvatarWhitelists();
    
    // Decode JSON if string given
    if (is_string($rawInput)) {
        $decoded = json_decode($rawInput, true);
        if (is_array($decoded)) {
            $input = $decoded;
        } else {
            $input = [];
        }
    } elseif (is_array($rawInput)) {
        $input = $rawInput;
    } else {
        $input = [];
    }

    $style = (string)($input['style'] ?? 'boy');
    if (!in_array($style, $whitelists['style'], true)) {
        $style = 'boy';
    }

    $defaults = getAvatarDefaultConfig($style);
    $clean = [];

    foreach ($defaults as $key => $defaultVal) {
        $val = isset($input[$key]) ? (string)$input[$key] : $defaultVal;

        // Check against whitelist for this key if available
        if (isset($whitelists[$key])) {
            if (in_array($val, $whitelists[$key], true)) {
                $clean[$key] = $val;
            } else {
                $clean[$key] = $defaultVal;
            }
        } else {
            // General string sanitization if key has no explicit whitelist
            $clean[$key] = preg_replace('/[^a-zA-Z0-9_\-]/', '', $val);
            if (empty($clean[$key])) {
                $clean[$key] = $defaultVal;
            }
        }
    }

    // Mutual exclusivity: if dress is selected and not 'none', top and bottom should be 'none'
    if ($clean['dress'] !== 'none') {
        $clean['top'] = 'none';
        $clean['bottom'] = 'none';
    } else {
        if ($clean['top'] === 'none') {
            $clean['top'] = $defaults['top'];
        }
        if ($clean['bottom'] === 'none') {
            $clean['bottom'] = $defaults['bottom'];
        }
    }

    return json_encode($clean, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
}

/**
 * Helper to safely extract avatar data array from participant record
 */
function getParticipantAvatarData(?array $participant): array
{
    if (!$participant) {
        return getAvatarDefaultConfig('boy');
    }

    $raw = $participant['avatar_data'] ?? null;
    if ($raw) {
        $decoded = json_decode($raw, true);
        if (is_array($decoded) && isset($decoded['style'])) {
            return $decoded;
        }
    }

    // Fallback for legacy participant with emoji
    $emoji = $participant['emoji'] ?? '😀';
    if (in_array($emoji, ['👧', '👩', '👱‍♀️', '👸', '🌸', '🎀'])) {
        return getAvatarDefaultConfig('girl');
    }
    return getAvatarDefaultConfig('boy');
}
