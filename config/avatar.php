<?php
/**
 * QuizSpark 3D Full-Body Avatar System - Configuration & Whitelist Validation
 */

/**
 * Returns complete whitelist of allowed avatar components and properties.
 */
/**
 * Returns complete whitelist of allowed avatar components and properties.
 */
function getAvatarWhitelists(): array
{
    return [
        'avatar_id' => [
            'boy1', 'boy2', 'boy3', 'girl1', 'girl2', 'girl3',
            'boy_1', 'boy_2', 'boy_3', 'girl_1', 'girl_2', 'girl_3'
        ],

        'style' => ['boy', 'girl'],

        'body' => [
            'regular', 'slim', 'athletic', 'soft', 'tall', 'short'
        ],

        'skin' => [
            'skin_01', 'skin_02', 'skin_03', 'skin_04',
            'skin_05', 'skin_06', 'skin_07', 'skin_08',
            'skin_09', 'skin_10'
        ],

        'face' => [
            'face_round', 'face_oval', 'face_square',
            'face_soft', 'face_long', 'face_wide',
            'face_heart', 'face_diamond', 'face_chiseled'
        ],

        'freckles' => [
            'none', 'freckles_light', 'freckles_cheeks',
            'beauty_spot_left', 'beauty_spot_right', 'dimples'
        ],

        'hair' => [
            // Boy Hairstyles
            'hair_boy_short', 'hair_boy_crew', 'hair_boy_sidepart', 'hair_boy_fade',
            'hair_boy_curly', 'hair_boy_wavy', 'hair_boy_messy', 'hair_boy_spiky',
            'hair_boy_quiff', 'hair_boy_undercut', 'hair_afro', 'hair_anime_spikes',
            'hair_boy_medium', 'hair_boy_long', 'hair_boy_buzz',
            // Girl Hairstyles
            'hair_girl_straight', 'hair_girl_wavy', 'hair_girl_curly', 'hair_girl_ponytail',
            'hair_girl_highpony', 'hair_girl_lowpony', 'hair_girl_bob', 'hair_girl_braids',
            'hair_girl_bun', 'hair_girl_topbun', 'hair_girl_doublebun', 'hair_girl_sidebraid',
            'hair_girl_shoulder', 'hair_girl_wavymedium', 'hair_girl_pixie',
            'none'
        ],

        'hairColor' => [
            'black', 'dark_brown', 'brown', 'light_brown',
            'blonde', 'platinum', 'dark_blonde', 'red', 'auburn', 'grey', 'white',
            'blue', 'purple', 'pink', 'green', 'teal', 'coral'
        ],

        'eyes' => [
            'eyes_round', 'eyes_almond', 'eyes_large', 'eyes_small',
            'eyes_soft', 'eyes_bright', 'eyes_cartoon', 'eyes_friendly',
            'eyes_cateye', 'eyes_focused'
        ],

        'eyeColor' => [
            'brown', 'dark_brown', 'blue', 'sky_blue', 'green', 'emerald', 'hazel', 'grey', 'amber', 'violet'
        ],

        'eyebrows' => [
            'brows_straight', 'brows_curved', 'brows_thick',
            'brows_thin', 'brows_soft', 'brows_raised', 'brows_natural',
            'brows_arched', 'brows_bushy'
        ],

        'nose' => [
            'nose_small', 'nose_medium', 'nose_wide', 'nose_rounded', 'nose_straight',
            'nose_button', 'nose_aquiline'
        ],

        'mouth' => [
            'mouth_smile', 'mouth_small_smile', 'mouth_neutral',
            'mouth_big_smile', 'mouth_laugh', 'mouth_friendly', 'mouth_confident',
            'mouth_grin', 'mouth_smirk'
        ],

        'facialHair' => [
            'none', 'mustache', 'mustache_handlebar', 'light_beard',
            'short_beard', 'full_beard', 'goatee', 'vandyke', 'soul_patch', 'stubble', 'lumberjack'
        ],

        'top' => [
            'top_tshirt', 'top_printed', 'top_polo', 'top_hoodie', 'top_sweatshirt',
            'top_jacket', 'top_leather_jacket', 'top_denim_jacket', 'top_blazer',
            'top_shirt', 'top_casual', 'top_jersey', 'top_sweater',
            'none'
        ],

        'topColor' => [
            'blue', 'purple', 'red', 'yellow', 'green', 'coral', 'black', 'white',
            'teal', 'navy', 'crimson', 'emerald', 'denim', 'khaki', 'grey', 'pink',
            'gold', 'ruby', 'leather', 'olive'
        ],

        'bottom' => [
            'bottom_jeans', 'bottom_shorts', 'bottom_joggers', 'bottom_cargo',
            'bottom_casual', 'bottom_formal', 'bottom_trackpants', 'bottom_skirt',
            'none'
        ],

        'bottomColor' => [
            'denim', 'black', 'khaki', 'navy', 'grey', 'crimson', 'white', 'teal',
            'blue', 'purple', 'red', 'yellow', 'green', 'coral', 'pink', 'gold', 'ruby'
        ],

        'dress' => [
            'none', 'dress_casual', 'dress_party', 'dress_summer',
            'dress_long', 'dress_formal', 'dress_traditional', 'dress_modern'
        ],

        'dressColor' => [
            'purple', 'pink', 'blue', 'emerald', 'ruby', 'gold', 'teal', 'black',
            'red', 'yellow', 'green', 'coral', 'white', 'navy', 'crimson'
        ],

        'shoes' => [
            'shoes_sneakers', 'shoes_hightops', 'shoes_sports', 'shoes_boots',
            'shoes_casual', 'shoes_formal', 'shoes_sandals', 'shoes_slides'
        ],

        'shoeColor' => [
            'white', 'black', 'red', 'blue', 'brown', 'pink', 'grey', 'gold', 'navy'
        ],

        'headwear' => [
            'none', 'headwear_cap', 'headwear_backward_cap', 'headwear_snapback',
            'headwear_beanie', 'headwear_bucket', 'headwear_fedora', 'headwear_cowboy',
            'headwear_crown', 'headwear_headband', 'headwear_bandana', 'headwear_winter_hat',
            'headwear_gradcap', 'headwear_party'
        ],

        'glasses' => [
            'none', 'glasses_round', 'glasses_square', 'glasses_thin', 'glasses_thick',
            'glasses_gold_round', 'glasses_rimless', 'glasses_sunglasses', 'glasses_wayfarer', 'glasses_aviator'
        ],

        'accessory' => [
            'none', 'acc_headphones', 'acc_earbuds', 'acc_backpack', 'acc_slingbag',
            'acc_necklace', 'acc_chain', 'acc_earrings', 'acc_hoops', 'acc_watch',
            'acc_smartwatch', 'acc_tie', 'acc_bowtie', 'acc_scarf'
        ],

        'specialItem' => [
            'none', 'item_book', 'item_laptop', 'item_pencil', 'item_wand',
            'item_trophy', 'item_gaming_headset', 'item_face_mask'
        ],

        'rotation' => ['front', 'three_quarter_left', 'three_quarter_right', 'side', 'back']
    ];
}

/**
 * Returns the exact 6 predefined 3D avatars (3 Boys, 3 Girls).
 */
function getAvatarPresets(string $style = 'boy'): array
{
    $style = in_array($style, ['boy', 'girl']) ? $style : 'boy';
    $presets = [
        'boy' => [
            [
                'id' => 'boy1',
                'name' => 'Boy 1',
                'subtitle' => 'Casual Boy',
                'config' => [
                    'avatar_id' => 'boy1',
                    'style' => 'boy', 'body' => 'regular', 'skin' => 'skin_03', 'face' => 'face_round',
                    'freckles' => 'none', 'hair' => 'hair_boy_short', 'hairColor' => 'dark_brown',
                    'eyes' => 'eyes_friendly', 'eyeColor' => 'brown', 'eyebrows' => 'brows_natural',
                    'nose' => 'nose_small', 'mouth' => 'mouth_smile', 'facialHair' => 'none', 'facialHairColor' => 'black',
                    'top' => 'top_casual', 'topColor' => 'blue', 'bottom' => 'bottom_jeans', 'bottomColor' => 'denim',
                    'dress' => 'none', 'dressColor' => 'blue', 'shoes' => 'shoes_sneakers', 'shoeColor' => 'white',
                    'headwear' => 'none', 'headwearColor' => 'red', 'glasses' => 'none', 'glassesColor' => 'black',
                    'accessory' => 'acc_headphones', 'accessoryColor' => 'blue', 'specialItem' => 'none',
                    'rotation' => 'front', 'zoom' => 1
                ]
            ],
            [
                'id' => 'boy2',
                'name' => 'Boy 2',
                'subtitle' => 'Hoodie Geek',
                'config' => [
                    'avatar_id' => 'boy2',
                    'style' => 'boy', 'body' => 'regular', 'skin' => 'skin_02', 'face' => 'face_oval',
                    'freckles' => 'freckles_light', 'hair' => 'hair_boy_curly', 'hairColor' => 'dark_brown',
                    'eyes' => 'eyes_friendly', 'eyeColor' => 'brown', 'eyebrows' => 'brows_natural',
                    'nose' => 'nose_small', 'mouth' => 'mouth_smile', 'facialHair' => 'none', 'facialHairColor' => 'black',
                    'top' => 'top_hoodie', 'topColor' => 'coral', 'bottom' => 'bottom_jeans', 'bottomColor' => 'black',
                    'dress' => 'none', 'dressColor' => 'coral', 'shoes' => 'shoes_sneakers', 'shoeColor' => 'white',
                    'headwear' => 'none', 'headwearColor' => 'red', 'glasses' => 'glasses_round', 'glassesColor' => 'black',
                    'accessory' => 'acc_backpack', 'accessoryColor' => 'teal', 'specialItem' => 'item_pencil',
                    'rotation' => 'front', 'zoom' => 1
                ]
            ],
            [
                'id' => 'boy3',
                'name' => 'Boy 3',
                'subtitle' => 'Smart Polo',
                'config' => [
                    'avatar_id' => 'boy3',
                    'style' => 'boy', 'body' => 'slim', 'skin' => 'skin_04', 'face' => 'face_square',
                    'freckles' => 'none', 'hair' => 'hair_boy_sidepart', 'hairColor' => 'black',
                    'eyes' => 'eyes_almond', 'eyeColor' => 'dark_brown', 'eyebrows' => 'brows_straight',
                    'nose' => 'nose_straight', 'mouth' => 'mouth_smile', 'facialHair' => 'none', 'facialHairColor' => 'black',
                    'top' => 'top_polo', 'topColor' => 'emerald', 'bottom' => 'bottom_casual', 'bottomColor' => 'khaki',
                    'dress' => 'none', 'dressColor' => 'emerald', 'shoes' => 'shoes_casual', 'shoeColor' => 'leather',
                    'headwear' => 'none', 'headwearColor' => 'gold', 'glasses' => 'none', 'glassesColor' => 'gold',
                    'accessory' => 'acc_watch', 'accessoryColor' => 'black', 'specialItem' => 'none',
                    'rotation' => 'front', 'zoom' => 1
                ]
            ]
        ],
        'girl' => [
            [
                'id' => 'girl1',
                'name' => 'Girl 1',
                'subtitle' => 'Casual Girl',
                'config' => [
                    'avatar_id' => 'girl1',
                    'style' => 'girl', 'body' => 'regular', 'skin' => 'skin_02', 'face' => 'face_oval',
                    'freckles' => 'freckles_cheeks', 'hair' => 'hair_girl_wavy', 'hairColor' => 'dark_brown',
                    'eyes' => 'eyes_bright', 'eyeColor' => 'brown', 'eyebrows' => 'brows_curved',
                    'nose' => 'nose_small', 'mouth' => 'mouth_smile', 'facialHair' => 'none', 'facialHairColor' => 'black',
                    'top' => 'top_casual', 'topColor' => 'purple', 'bottom' => 'bottom_jeans', 'bottomColor' => 'denim',
                    'dress' => 'none', 'dressColor' => 'purple', 'shoes' => 'shoes_sneakers', 'shoeColor' => 'white',
                    'headwear' => 'none', 'headwearColor' => 'gold', 'glasses' => 'none', 'glassesColor' => 'black',
                    'accessory' => 'acc_earrings', 'accessoryColor' => 'gold', 'specialItem' => 'none',
                    'rotation' => 'front', 'zoom' => 1
                ]
            ],
            [
                'id' => 'girl2',
                'name' => 'Girl 2',
                'subtitle' => 'Sport Pony',
                'config' => [
                    'avatar_id' => 'girl2',
                    'style' => 'girl', 'body' => 'athletic', 'skin' => 'skin_05', 'face' => 'face_round',
                    'freckles' => 'none', 'hair' => 'hair_girl_highpony', 'hairColor' => 'black',
                    'eyes' => 'eyes_almond', 'eyeColor' => 'dark_brown', 'eyebrows' => 'brows_natural',
                    'nose' => 'nose_small', 'mouth' => 'mouth_smile', 'facialHair' => 'none', 'facialHairColor' => 'black',
                    'top' => 'top_printed', 'topColor' => 'teal', 'bottom' => 'bottom_joggers', 'bottomColor' => 'black',
                    'dress' => 'none', 'dressColor' => 'teal', 'shoes' => 'shoes_sports', 'shoeColor' => 'pink',
                    'headwear' => 'headwear_headband', 'headwearColor' => 'pink', 'glasses' => 'none', 'glassesColor' => 'black',
                    'accessory' => 'acc_headphones', 'accessoryColor' => 'pink', 'specialItem' => 'none',
                    'rotation' => 'front', 'zoom' => 1
                ]
            ],
            [
                'id' => 'girl3',
                'name' => 'Girl 3',
                'subtitle' => 'Party Dress',
                'config' => [
                    'avatar_id' => 'girl3',
                    'style' => 'girl', 'body' => 'slim', 'skin' => 'skin_02', 'face' => 'face_soft',
                    'freckles' => 'none', 'hair' => 'hair_girl_curly', 'hairColor' => 'auburn',
                    'eyes' => 'eyes_large', 'eyeColor' => 'emerald', 'eyebrows' => 'brows_curved',
                    'nose' => 'nose_small', 'mouth' => 'mouth_big_smile', 'facialHair' => 'none', 'facialHairColor' => 'black',
                    'top' => 'none', 'topColor' => 'pink', 'bottom' => 'none', 'bottomColor' => 'pink',
                    'dress' => 'dress_party', 'dressColor' => 'ruby', 'shoes' => 'shoes_casual', 'shoeColor' => 'ruby',
                    'headwear' => 'headwear_crown', 'headwearColor' => 'gold', 'glasses' => 'none', 'glassesColor' => 'black',
                    'accessory' => 'acc_necklace', 'accessoryColor' => 'gold', 'specialItem' => 'item_trophy',
                    'rotation' => 'front', 'zoom' => 1
                ]
            ]
        ]
    ];
    return $presets[$style] ?? $presets['boy'];
}

/**
 * Returns a specific predefined avatar by ID (boy1, boy2, boy3, girl1, girl2, girl3)
 */
function getAvatarPresetById(string $id): ?array
{
    $id = str_replace('_', '', strtolower(trim($id)));
    $boys = getAvatarPresets('boy');
    $girls = getAvatarPresets('girl');
    $all = array_merge($boys, $girls);

    foreach ($all as $preset) {
        if ($preset['id'] === $id) {
            return $preset['config'];
        }
    }
    return null;
}

/**
 * Default starting configurations
 */
function getAvatarDefaultConfig(string $style = 'boy'): array
{
    $style = in_array($style, ['boy', 'girl']) ? $style : 'boy';
    $presets = getAvatarPresets($style);
    return $presets[0]['config'] ?? [];
}

/**
 * Validates and sanitizes avatar payload against server whitelists & hex colors.
 * Returns valid JSON string.
 */
function validateAndSanitizeAvatar($rawInput): string
{
    $whitelists = getAvatarWhitelists();
    
    // If a simple preset ID string is passed directly (e.g. 'boy2' or 'girl3')
    if (is_string($rawInput) && preg_match('/^(boy|girl)[_]?[1-3]$/i', trim($rawInput))) {
        $preset = getAvatarPresetById($rawInput);
        if ($preset) {
            return json_encode($preset, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        }
    }

    // Decode JSON if string given
    if (is_string($rawInput)) {
        $decoded = json_decode($rawInput, true);
        $input = is_array($decoded) ? $decoded : [];
    } elseif (is_array($rawInput)) {
        $input = $rawInput;
    } else {
        $input = [];
    }

    // Check if input references a preset ID
    $presetId = (string)($input['avatar_id'] ?? $input['id'] ?? '');
    if (!empty($presetId)) {
        $preset = getAvatarPresetById($presetId);
        if ($preset && empty($input['face'])) {
            return json_encode($preset, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        }
    }

    $style = (string)($input['style'] ?? 'boy');
    if (!in_array($style, $whitelists['style'], true)) {
        $style = 'boy';
    }

    $defaults = getAvatarDefaultConfig($style);
    $clean = [];

    // Preserve avatar_id if valid
    if (!empty($presetId)) {
        $clean['avatar_id'] = str_replace('_', '', strtolower(trim($presetId)));
    } else {
        $clean['avatar_id'] = $defaults['avatar_id'] ?? ($style === 'girl' ? 'girl1' : 'boy1');
    }

    foreach ($defaults as $key => $defaultVal) {
        if ($key === 'avatar_id') continue;
        $val = isset($input[$key]) ? $input[$key] : $defaultVal;

        if ($key === 'zoom') {
            $clean[$key] = is_numeric($val) ? min(1.5, max(0.8, (float)$val)) : 1.0;
            continue;
        }

        $valStr = (string)$val;

        // Custom Hex Color support for color fields
        if (str_ends_with($key, 'Color') && preg_match('/^#[a-fA-F0-9]{3,6}$/', $valStr)) {
            $clean[$key] = $valStr;
            continue;
        }

        // Check against whitelist for this key if available
        if (isset($whitelists[$key])) {
            if (in_array($valStr, $whitelists[$key], true)) {
                $clean[$key] = $valStr;
            } else {
                $clean[$key] = $defaultVal;
            }
        } else {
            $clean[$key] = preg_replace('/[^a-zA-Z0-9_\-#]/', '', $valStr);
            if (empty($clean[$key])) {
                $clean[$key] = $defaultVal;
            }
        }
    }

    // Mutual exclusivity: if dress is selected and not 'none', top and bottom should be 'none'
    if (isset($clean['dress']) && $clean['dress'] !== 'none') {
        $clean['top'] = 'none';
        $clean['bottom'] = 'none';
    } else {
        if (isset($clean['top']) && $clean['top'] === 'none') {
            $clean['top'] = $defaults['top'];
        }
        if (isset($clean['bottom']) && $clean['bottom'] === 'none') {
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
        if (is_string($raw) && preg_match('/^(boy|girl)[_]?[1-3]$/i', trim($raw))) {
            $preset = getAvatarPresetById($raw);
            if ($preset) return $preset;
        }
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

