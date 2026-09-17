-- ====================================================================
-- MANILA WINE COLLECTOR'S CHOICE — SEED DATA
-- ====================================================================

-- 1. Initial Campaign (Seed according to Section 18 specifications)
-- Status is 'draft', min/max price unset, open/close dates unset.
insert into public.campaigns (
  id,
  slug,
  name,
  status,
  access_mode,
  headline,
  intro_copy,
  story_copy,
  vote_opens_at,
  vote_closes_at,
  timezone,
  show_vote_counts_mode,
  planned_quantity,
  price_display_mode,
  min_price_php,
  max_price_php,
  main_shop_url,
  priority_sale_url,
  winning_design_id
) values (
  'e29d749a-14d2-4ce0-8d59-20f5efc34001',
  'philippines-collectors-edition',
  'Manila Wine Collector''s Choice',
  'draft',
  'public_authenticated',
  'A Philippines Edition, Chosen by You',
  'We are exploring a new Manila Wine collector''s edition inspired by the Philippines—only 100 individually numbered bottles. Before production begins, we are inviting our community to choose the design.',
  'This edition is being created for collectors who want something genuinely rare and distinctly Filipino. Review each concept, choose the design that speaks to you, and help decide which artwork moves forward. Only one vote is allowed per person.',
  null, -- Unset: Flagged in Admin as required before launch
  null, -- Unset: Flagged in Admin as required before launch
  'Asia/Manila',
  'signed_in_only',
  100,
  'starting_from',
  null, -- Unset: Flagged in Admin as required before launch
  null, -- Unset
  'https://manila-wine.com',
  null, -- Unset
  null
) on conflict (slug) do update set name = excluded.name;

-- 2. Seed All 11 Bottle Concept Artworks
insert into public.designs (
  id,
  campaign_id,
  code,
  title,
  subtitle,
  description,
  alt_text,
  original_image_path,
  full_image_path,
  thumbnail_path,
  sort_order,
  is_published
) values
(
  'c0000000-0000-0000-0000-000000000001',
  'e29d749a-14d2-4ce0-8d59-20f5efc34001',
  'Concept 01',
  'Concept 01 — Archipelago Heritage',
  'Flora, Fauna & Sunburst Gold',
  'Lush tropical foliage and Philippine biodiversity intertwined with baroque filigree and the iconic Philippine eight-rayed sun in lustrous embossed gold.',
  'Four views of Johnnie Walker Blue Label bottle featuring golden Philippine flora, sunburst motif, and exotic fauna illustration on deep amber glass.',
  '/concepts/original/concept-01.png',
  '/concepts/full/concept-01.webp',
  '/concepts/thumbs/concept-01.webp',
  1,
  true
),
(
  'c0000000-0000-0000-0000-000000000002',
  'e29d749a-14d2-4ce0-8d59-20f5efc34001',
  'Concept 02',
  'Concept 02 — Pearl of the Orient',
  'Maritime Azure & Coral Reefs',
  'Deep oceanic cobalt and cerulean gradients depicting Tubbataha Reefs and Philippine marine sanctuary life across the four bottle facets.',
  'Four views of bottle with vibrant turquoise and cobalt blue marine life, coral reefs, and oceanic waves wrapped around the square glass.',
  '/concepts/original/concept-02.png',
  '/concepts/full/concept-02.webp',
  '/concepts/thumbs/concept-02.webp',
  2,
  true
),
(
  'c0000000-0000-0000-0000-000000000003',
  'e29d749a-14d2-4ce0-8d59-20f5efc34001',
  'Concept 03',
  'Concept 03 — Indigenous Tapestry',
  'Yakan & Inabel Geometric Weaves',
  'Honoring centuries of Philippine master weavers with intricate geometric Inabel and Yakan tribal patterns rendered in etched gold and rich ruby pigments.',
  'Four views of bottle featuring traditional Philippine handwoven geometric tapestry patterns in gold and deep crimson.',
  '/concepts/original/concept-03.png',
  '/concepts/full/concept-03.webp',
  '/concepts/thumbs/concept-03.webp',
  3,
  true
),
(
  'c0000000-0000-0000-0000-000000000004',
  'e29d749a-14d2-4ce0-8d59-20f5efc34001',
  'Concept 04',
  'Concept 04 — Manila Sunset Elegance',
  'Golden Hour Over Manila Bay',
  'Warm cinnabar, ochre, and burnished gold gradients capturing the legendary sunset of Manila Bay with historic Spanish colonial arches.',
  'Four views of bottle showcasing a dramatic Manila Bay sunset gradient in warm gold, terracotta, and amber with silhouettes of Intramuros.',
  '/concepts/original/concept-04.png',
  '/concepts/full/concept-04.webp',
  '/concepts/thumbs/concept-04.webp',
  4,
  true
),
(
  'c0000000-0000-0000-0000-000000000005',
  'e29d749a-14d2-4ce0-8d59-20f5efc34001',
  'Concept 05',
  'Concept 05 — Golden Harvest Terroir',
  'Rice Terraces & Tropical Highlands',
  'The monumental Banaue Rice Terraces carved into mountain mist, celebrating northern highland craftsmanship and fertile Philippine valleys.',
  'Four views of bottle illustrating tiered emerald and gold Banaue rice terraces with mountain clouds and indigenous farming heritage.',
  '/concepts/original/concept-05.png',
  '/concepts/full/concept-05.webp',
  '/concepts/thumbs/concept-05.webp',
  5,
  true
),
(
  'c0000000-0000-0000-0000-000000000006',
  'e29d749a-14d2-4ce0-8d59-20f5efc34001',
  'Concept 06',
  'Concept 06 — Island Fiesta & Floral Tapestry',
  'Baroque Festivity & Sampaguita',
  'Vibrant celebration of nationwide festivities featuring sweet national Sampaguita blooms, cascading bougainvillea, and ceremonial gold trim.',
  'Four views of bottle adorned with blooming Philippine sampaguita flowers, festive fiesta ribbons, and filigree gold leaf.',
  '/concepts/original/concept-06.png',
  '/concepts/full/concept-06.webp',
  '/concepts/thumbs/concept-06.webp',
  6,
  true
),
(
  'c0000000-0000-0000-0000-000000000007',
  'e29d749a-14d2-4ce0-8d59-20f5efc34001',
  'Concept 07',
  'Concept 07 — Oceanic Depths & Whale Shark',
  'Gentle Giants of Donsol',
  'A serene tribute to the gentle Butanding (whale shark) gliding through translucent cyan waters alongside school of reef fishes.',
  'Four views of bottle featuring majestic whale sharks swimming through azure Philippine waters with deep-sea topography.',
  '/concepts/original/concept-07.png',
  '/concepts/full/concept-07.webp',
  '/concepts/thumbs/concept-07.webp',
  7,
  true
),
(
  'c0000000-0000-0000-0000-000000000008',
  'e29d749a-14d2-4ce0-8d59-20f5efc34001',
  'Concept 08',
  'Concept 08 — Philippine Sun & Liberty Gold',
  'The 8-Rayed Sun in Radiant Leaf',
  'Bold minimalist luxury featuring the eight rays of the Philippine flag sun boldly wrapped across the shoulder and corners in textured gold leaf.',
  'Four views of bottle highlighting the Philippine golden sun emblem embossed prominently on the glass shoulder and diagonal banner.',
  '/concepts/original/concept-08.png',
  '/concepts/full/concept-08.webp',
  '/concepts/thumbs/concept-08.webp',
  8,
  true
),
(
  'c0000000-0000-0000-0000-000000000009',
  'e29d749a-14d2-4ce0-8d59-20f5efc34001',
  'Concept 09',
  'Concept 09 — Emerald Cordillera & Highlands',
  'Pristine Mountain Peaks',
  'Rich malachite greens and deep spruce tones evoking the towering pine ridges and mystical peaks of the northern Luzon Cordilleras.',
  'Four views of bottle depicting lush Cordillera pine forests and mountain ridges in rich emerald green with gold accents.',
  '/concepts/original/concept-09.png',
  '/concepts/full/concept-09.webp',
  '/concepts/thumbs/concept-09.webp',
  9,
  true
),
(
  'c0000000-0000-0000-0000-000000000010',
  'e29d749a-14d2-4ce0-8d59-20f5efc34001',
  'Concept 10',
  'Concept 10 — Tropical Biodiversity Bloom',
  'Endemic Wildlife & Orchids',
  'The Philippine Eagle, Tarsier, and rare Vanda sanderiana (Waling-waling) orchid harmoniously composed in detailed naturalist line art.',
  'Four views of bottle featuring detailed naturalist illustrations of the Philippine Eagle, Tarsier, and Waling-waling orchid.',
  '/concepts/original/concept-10.png',
  '/concepts/full/concept-10.webp',
  '/concepts/thumbs/concept-10.webp',
  10,
  true
),
(
  'c0000000-0000-0000-0000-000000000011',
  'e29d749a-14d2-4ce0-8d59-20f5efc34001',
  'Concept 11',
  'Concept 11 — Treasures of the Philippines',
  'Constellation Chart & National Landmarks',
  'Dark midnight celestial navigation chart tracing the archipelago from Batanes to Tubbataha, Bohol tarsier, Banaue, Siargao, and Mount Apo with illuminated coordinates.',
  'Four views of bottle featuring a dark celestial constellation map with Philippine island coordinates, iconic landmarks, and golden linework.',
  '/concepts/original/concept-11.png',
  '/concepts/full/concept-11.webp',
  '/concepts/thumbs/concept-11.webp',
  11,
  true
)
on conflict (id) do nothing;
