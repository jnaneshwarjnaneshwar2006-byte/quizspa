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
 * Default starting configurations
 */
function getAvatarDefaultConfig(string $style = 'boy'): array
{
    $style = in_array($style, ['boy', 'girl']) ? $style : 'boy';

    if ($style === 'girl') {
        return [
            'style'            => 'girl',
            'body'             => 'regular',
            'skin'             => 'skin_03',
            'face'             => 'face_oval',
            'freckles'         => 'none',
            'hair'             => 'hair_girl_wavy',
            'hairColor'        => 'dark_brown',
            'eyes'             => 'eyes_bright',
            'eyeColor'         => 'brown',
            'eyebrows'         => 'brows_curved',
            'nose'             => 'nose_small',
            'mouth'            => 'mouth_smile',
            'facialHair'       => 'none',
            'facialHairColor'  => 'dark_brown',
            'top'              => 'top_casual',
            'topColor'         => 'purple',
            'bottom'           => 'bottom_jeans',
            'bottomColor'      => 'denim',
            'dress'            => 'none',
            'dressColor'       => 'pink',
            'shoes'            => 'shoes_sneakers',
            'shoeColor'        => 'white',
            'headwear'         => 'none',
            'headwearColor'    => 'purple',
            'glasses'          => 'none',
            'glassesColor'     => 'black',
            'accessory'        => 'acc_earrings',
            'accessoryColor'   => 'gold',
            'specialItem'      => 'none',
            'rotation'         => 'front',
            'zoom'             => 1
        ];
    }

    // Default: Boy
    return [
        'style'            => 'boy',
        'body'             => 'regular',
        'skin'             => 'skin_04',
        'face'             => 'face_round',
        'freckles'         => 'none',
        'hair'             => 'hair_boy_fade',
        'hairColor'        => 'black',
        'eyes'             => 'eyes_friendly',
        'eyeColor'         => 'dark_brown',
        'eyebrows'         => 'brows_thick',
        'nose'             => 'nose_medium',
        'mouth'            => 'mouth_smile',
        'facialHair'       => 'none',
        'facialHairColor'  => 'black',
        'top'              => 'top_tshirt',
        'topColor'         => 'blue',
        'bottom'           => 'bottom_jeans',
        'bottomColor'      => 'denim',
        'dress'            => 'none',
        'dressColor'       => 'purple',
        'shoes'            => 'shoes_sneakers',
        'shoeColor'        => 'white',
        'headwear'         => 'none',
        'headwearColor'    => 'red',
        'glasses'          => 'none',
        'glassesColor'     => 'black',
        'accessory'        => 'none',
        'accessoryColor'   => 'gold',
        'specialItem'      => 'none',
        'rotation'         => 'front',
        'zoom'             => 1
    ];
}

/**
 * Validates and sanitizes avatar payload against server whitelists & hex colors.
 * Returns valid JSON string.
 */
function validateAndSanitizeAvatar($rawInput): string
{
    $whitelists = getAvatarWhitelists();
    
    // Decode JSON if string given
    if (is_string($rawInput)) {
        $decoded = json_decode($rawInput, true);
        $input = is_array($decoded) ? $decoded : [];
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
