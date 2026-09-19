import fs from 'fs';
import path from 'path';
import { 
  Campaign, 
  Design, 
  Vote, 
  VoteEvent, 
  Pledge, 
  Invitation, 
  Profile, 
  AdminAuditLog,
  ConsentEvent,
  InterestTier,
  UserRole
} from '@/types';

interface DatabaseSchema {
  campaigns: Campaign[];
  designs: Design[];
  profiles: Profile[];
  votes: Vote[];
  vote_events: VoteEvent[];
  pledges: Pledge[];
  invitations: Invitation[];
  consent_events: ConsentEvent[];
  audit_logs: AdminAuditLog[];
}

const ROOT_DB_PATH = path.join(process.cwd(), 'data', 'store.json');
const TMP_DB_PATH = path.join('/tmp', 'store.json');

// Default Seed Campaign per Section 18
const DEFAULT_CAMPAIGN_ID = 'e29d749a-14d2-4ce0-8d59-20f5efc34001';

const INITIAL_CAMPAIGN: Campaign = {
  id: DEFAULT_CAMPAIGN_ID,
  slug: 'philippines-collectors-edition',
  name: "Manila Wine Collector's Choice",
  status: 'draft', // Section 18: draft initial state
  access_mode: 'public_authenticated',
  headline: 'A Philippines Edition, Chosen by You',
  intro_copy: 'We are exploring a new Manila Wine collector’s edition inspired by the Philippines—only 100 individually numbered bottles. Before production begins, we are inviting our community to choose the design.',
  story_copy: 'This edition is being created for collectors who want something genuinely rare and distinctly Filipino. Review each concept, choose the design that speaks to you, and help decide which artwork moves forward. Only one vote is allowed per person.',
  vote_opens_at: null, // Section 18: unset, visibly flagged in admin
  vote_closes_at: null, // Section 18: unset, visibly flagged in admin
  timezone: 'Asia/Manila',
  show_vote_counts_mode: 'signed_in_only',
  planned_quantity: 100,
  price_display_mode: 'starting_from',
  min_price_php: null, // Section 18: unset, visibly flagged in admin
  max_price_php: null,
  main_shop_url: 'https://manila-wine.com',
  priority_sale_url: null,
  winning_design_id: null,
  hero_wallpaper_url: '/brand/hero-wallpaper-2k.webp',
  hero_wallpaper_opacity: 55,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const INITIAL_DESIGNS: Design[] = [
  {
    "id": "c0000000-0000-0000-0000-000000000001",
    "campaign_id": "e29d749a-14d2-4ce0-8d59-20f5efc34001",
    "code": "Concept 01",
    "title": "Concept 01 — Archipelago Heritage",
    "subtitle": "Flora, Fauna & Sunburst Gold",
    "description": "Lush tropical foliage and Philippine biodiversity intertwined with baroque filigree and the iconic Philippine eight-rayed sun in lustrous embossed gold.",
    "alt_text": "Four views of Johnnie Walker Blue Label bottle featuring golden Philippine flora, sunburst motif, and exotic fauna illustration on deep amber glass.",
    "original_image_path": "/concepts/original/concept-01.png",
    "full_image_path": "/concepts/full/concept-01.webp",
    "thumbnail_path": "/concepts/thumbs/concept-01.webp",
    "sort_order": 1,
    "is_published": true,
    "created_at": "2026-09-16T12:41:02.348Z",
    "updated_at": "2026-09-18T05:02:28.866Z"
  },
  {
    "id": "c0000000-0000-0000-0000-000000000002",
    "campaign_id": "e29d749a-14d2-4ce0-8d59-20f5efc34001",
    "code": "Concept 02",
    "title": "Concept 02 — Pearl of the Orient",
    "subtitle": "Maritime Azure & Coral Reefs",
    "description": "Deep oceanic cobalt and cerulean gradients depicting Tubbataha Reefs and Philippine marine sanctuary life across the four bottle facets.",
    "alt_text": "Four views of bottle with vibrant turquoise and cobalt blue marine life, coral reefs, and oceanic waves wrapped around the square glass.",
    "original_image_path": "/concepts/original/concept-02.png",
    "full_image_path": "/concepts/full/concept-02.webp",
    "thumbnail_path": "/concepts/thumbs/concept-02.webp",
    "sort_order": 2,
    "is_published": true,
    "created_at": "2026-09-16T12:41:02.348Z",
    "updated_at": "2026-09-18T05:02:29.063Z"
  },
  {
    "id": "c0000000-0000-0000-0000-000000000003",
    "campaign_id": "e29d749a-14d2-4ce0-8d59-20f5efc34001",
    "code": "Concept 03",
    "title": "Concept 03 — Indigenous Tapestry",
    "subtitle": "Yakan & Inabel Geometric Weaves",
    "description": "Honoring centuries of Philippine master weavers with intricate geometric Inabel and Yakan tribal patterns rendered in etched gold and rich ruby pigments.",
    "alt_text": "Four views of bottle featuring traditional Philippine handwoven geometric tapestry patterns in gold and deep crimson.",
    "original_image_path": "/concepts/original/concept-03.png",
    "full_image_path": "/concepts/full/concept-03.webp",
    "thumbnail_path": "/concepts/thumbs/concept-03.webp",
    "sort_order": 3,
    "is_published": true,
    "created_at": "2026-09-16T12:41:02.348Z",
    "updated_at": "2026-09-18T05:02:29.252Z"
  },
  {
    "id": "c0000000-0000-0000-0000-000000000004",
    "campaign_id": "e29d749a-14d2-4ce0-8d59-20f5efc34001",
    "code": "Concept 04",
    "title": "Concept 04 — Manila Sunset Elegance",
    "subtitle": "Golden Hour Over Manila Bay",
    "description": "Warm cinnabar, ochre, and burnished gold gradients capturing the legendary sunset of Manila Bay with historic Spanish colonial arches.",
    "alt_text": "Four views of bottle showcasing a dramatic Manila Bay sunset gradient in warm gold, terracotta, and amber with silhouettes of Intramuros.",
    "original_image_path": "/concepts/original/concept-04.png",
    "full_image_path": "/concepts/full/concept-04.webp",
    "thumbnail_path": "/concepts/thumbs/concept-04.webp",
    "sort_order": 4,
    "is_published": true,
    "created_at": "2026-09-16T12:41:02.348Z",
    "updated_at": "2026-09-18T05:02:29.440Z"
  },
  {
    "id": "c0000000-0000-0000-0000-000000000005",
    "campaign_id": "e29d749a-14d2-4ce0-8d59-20f5efc34001",
    "code": "Concept 05",
    "title": "Concept 05 — Fort Santiago & Intramuros",
    "subtitle": "The Walled City Heritage",
    "description": "Weathered Spanish stonework, neoclassical balustrades, and historic ironwork silhouettes paying tribute to Intramuros and Manila’s four-hundred-year chronicle.",
    "alt_text": "Four views of bottle with Spanish colonial stone bastion gates, ornate wrought-iron lanterns, and neoclassical arches etched in gold.",
    "original_image_path": "/concepts/original/concept-05.png",
    "full_image_path": "/concepts/full/concept-05.webp",
    "thumbnail_path": "/concepts/thumbs/concept-05.webp",
    "sort_order": 5,
    "is_published": true,
    "created_at": "2026-09-16T12:41:02.348Z",
    "updated_at": "2026-09-18T05:02:29.635Z"
  },
  {
    "id": "c0000000-0000-0000-0000-000000000006",
    "campaign_id": "e29d749a-14d2-4ce0-8d59-20f5efc34001",
    "code": "Concept 06",
    "title": "Concept 06 — King of the Road",
    "subtitle": "Jeepney Chrome & Chromatic Pop-Art",
    "description": "Dynamic chrome filigree and vibrant festival hues celebrating the irrepressible Philippine jeepney—an enduring monument to ingenuity and urban mobility.",
    "alt_text": "Four views of bottle showcasing ornate chrome hood ornaments, festive hand-painted typography, and vibrant fiesta ribbons of the Philippine jeepney.",
    "original_image_path": "/concepts/original/concept-06.png",
    "full_image_path": "/concepts/full/concept-06.webp",
    "thumbnail_path": "/concepts/thumbs/concept-06.webp",
    "sort_order": 6,
    "is_published": true,
    "created_at": "2026-09-16T12:41:02.348Z",
    "updated_at": "2026-09-18T05:02:29.834Z"
  },
  {
    "id": "c0000000-0000-0000-0000-000000000007",
    "campaign_id": "e29d749a-14d2-4ce0-8d59-20f5efc34001",
    "code": "Concept 07",
    "title": "Concept 07 — Bohol Sanctuary",
    "subtitle": "Chocolate Hills & The Nocturnal Tarsier",
    "description": "The surreal conical mounds of Bohol cloaked in seasonal bronze hues, cradling the nocturnal Philippine tarsier nestled among dew-kissed emerald fronds.",
    "alt_text": "Four views of bottle with rolling chocolate hills and wide-eyed Philippine tarsier clinging to bamboo shoots in sepia and olive tones.",
    "original_image_path": "/concepts/original/concept-07.png",
    "full_image_path": "/concepts/full/concept-07.webp",
    "thumbnail_path": "/concepts/thumbs/concept-07.webp",
    "sort_order": 7,
    "is_published": true,
    "created_at": "2026-09-16T12:41:02.348Z",
    "updated_at": "2026-09-18T05:02:30.014Z"
  },
  {
    "id": "c0000000-0000-0000-0000-000000000008",
    "campaign_id": "e29d749a-14d2-4ce0-8d59-20f5efc34001",
    "code": "Concept 08",
    "title": "Concept 08 — Stairways to Heaven",
    "subtitle": "Ifugao Rice Terraces of Banaue",
    "description": "Two thousand years of ancestral engineering rendered in rippling emerald and gold contours ascending through mist-shrouded Cordillera peaks.",
    "alt_text": "Four views of bottle featuring stepped terraces carved into mountain slopes with mist clouds and morning sunlight rendered in green and gold leaf.",
    "original_image_path": "/concepts/original/concept-08.png",
    "full_image_path": "/concepts/full/concept-08.webp",
    "thumbnail_path": "/concepts/thumbs/concept-08.webp",
    "sort_order": 8,
    "is_published": true,
    "created_at": "2026-09-16T12:41:02.348Z",
    "updated_at": "2026-09-18T05:02:30.506Z"
  },
  {
    "id": "c0000000-0000-0000-0000-000000000009",
    "campaign_id": "e29d749a-14d2-4ce0-8d59-20f5efc34001",
    "code": "Concept 09",
    "title": "Concept 09 — The Perfect Cone",
    "subtitle": "Mayon Volcano & Albay Horizon",
    "description": "The legendary symmetry of Mount Mayon rising in volcanic majesty against dusk skies, with ember filigree and fertile Bicol volcanic soils below.",
    "alt_text": "Four views of bottle presenting symmetrical volcanic cone with wisps of smoke, Cagsawa ruins silhouette, and twilight violet and terracotta sky.",
    "original_image_path": "/concepts/original/concept-09.png",
    "full_image_path": "/concepts/full/concept-09.webp",
    "thumbnail_path": "/concepts/thumbs/concept-09.webp",
    "sort_order": 9,
    "is_published": true,
    "created_at": "2026-09-16T12:41:02.348Z",
    "updated_at": "2026-09-18T05:02:30.708Z"
  },
  {
    "id": "c0000000-0000-0000-0000-000000000010",
    "campaign_id": "e29d749a-14d2-4ce0-8d59-20f5efc34001",
    "code": "Concept 10",
    "title": "Concept 10 — Lord of the Skies",
    "subtitle": "The Sovereign Philippine Eagle",
    "description": "Spanning four facets, the magnificent Haribon spreads its crowned crest across ancient dipterocarp forest canopies in etched burnished platinum and gold.",
    "alt_text": "Four views of bottle depicting majestic Philippine eagle with outspread feathers and crowned crest over tropical mountain rainforest canopy.",
    "original_image_path": "/concepts/original/concept-10.png",
    "full_image_path": "/concepts/full/concept-10.webp",
    "thumbnail_path": "/concepts/thumbs/concept-10.webp",
    "sort_order": 10,
    "is_published": true,
    "created_at": "2026-09-16T12:41:02.348Z",
    "updated_at": "2026-09-18T05:02:30.906Z"
  },
  {
    "id": "c0000000-0000-0000-0000-000000000011",
    "campaign_id": "e29d749a-14d2-4ce0-8d59-20f5efc34001",
    "code": "Concept 11",
    "title": "Concept 11 — The Pintados Warriors",
    "subtitle": "Ancient Visayan Tattoo Mastery",
    "description": "Bold geometric body-art of pre-colonial Visayan warriors, depicting bravery, spiritual protection, and sacred ancestral lineages hand-etched in gold leaf.",
    "alt_text": "Four views of bottle adorned with sharp geometric Visayan tribal tattoo patterns, sacred solar emblems, and protective warrior talismans in gold.",
    "original_image_path": "/concepts/original/concept-11.png",
    "full_image_path": "/concepts/full/concept-11.webp",
    "thumbnail_path": "/concepts/thumbs/concept-11.webp",
    "sort_order": 11,
    "is_published": true,
    "created_at": "2026-09-16T12:41:02.348Z",
    "updated_at": "2026-09-18T05:02:31.099Z"
  },
  {
    "id": "c0000000-0000-0000-0000-000000000012",
    "campaign_id": "e29d749a-14d2-4ce0-8d59-20f5efc34001",
    "code": "Concept 12",
    "title": "Concept 12 — Butanding & Sovereign Eagle",
    "subtitle": "Gentle Giants, Mountain Terraces & Coral Bays",
    "description": "A majestic fusion of Philippine apex wonders: the gentle Whale Shark gliding through coral sanctuaries, crowned Philippine Eagle soaring over rice terraces, carabao, and festive jeepney.",
    "alt_text": "Four views of Johnnie Walker bottle illustrated with whale shark, Philippine eagle, carabao, and Banaue terraces.",
    "original_image_path": "/concepts/original/concept-12.png",
    "full_image_path": "/concepts/full/concept-12.webp",
    "thumbnail_path": "/concepts/thumbs/concept-12.webp",
    "sort_order": 12,
    "is_published": true,
    "created_at": "2026-09-16T12:41:02.348Z",
    "updated_at": "2026-09-18T05:02:31.300Z"
  },
  {
    "id": "c0000000-0000-0000-0000-000000000013",
    "campaign_id": "e29d749a-14d2-4ce0-8d59-20f5efc34001",
    "code": "Concept 13",
    "title": "Concept 13 — Parol & Capiz Luminescence",
    "subtitle": "Stained Glass Cathedral & Golden Sunburst",
    "description": "A radiant architectural celebration of Philippine festive light, featuring translucent Capiz shell tessellations, cathedral stained-glass geometry, and an eight-rayed sun in brilliant jewel tones.",
    "alt_text": "Four views of bottle featuring glowing Capiz shell star, stained-glass mosaic panels, and golden Philippine sunburst.",
    "original_image_path": "/concepts/original/concept-13.png",
    "full_image_path": "/concepts/full/concept-13.webp",
    "thumbnail_path": "/concepts/thumbs/concept-13.webp",
    "sort_order": 13,
    "is_published": true,
    "created_at": "2026-09-16T12:41:02.348Z",
    "updated_at": "2026-09-18T05:02:31.488Z"
  },
  {
    "id": "c0000000-0000-0000-0000-000000000014",
    "campaign_id": "e29d749a-14d2-4ce0-8d59-20f5efc34001",
    "code": "Concept 14",
    "title": "Concept 14 — Habi & Hardcourt",
    "subtitle": "Ancestral Weaving & Barangay Basketball",
    "description": "An authentic portrait of modern Philippine life blending the timeless art of indigenous loom weaving with the nation’s heartbeat passion for neighborhood basketball, tarsiers, and colorful jeepneys.",
    "alt_text": "Four views of bottle featuring ancestral woven ribbon flowing into a basketball court with Mayon volcano, jeepney, and tarsier.",
    "original_image_path": "/concepts/original/concept-14.png",
    "full_image_path": "/concepts/full/concept-14.webp",
    "thumbnail_path": "/concepts/thumbs/concept-14.webp",
    "sort_order": 14,
    "is_published": true,
    "created_at": "2026-09-16T12:41:02.348Z",
    "updated_at": "2026-09-18T05:02:32.333Z"
  },
  {
    "id": "c0000000-0000-0000-0000-000000000015",
    "campaign_id": "e29d749a-14d2-4ce0-8d59-20f5efc34001",
    "code": "Concept 15",
    "title": "Concept 15 — Treasures of the Philippines",
    "subtitle": "Mayon, Intramuros, Vinta & Manila Jeepney",
    "description": "The definitive panoramic journey through Philippine identity: Mayon Volcano, Banaue terraces, Intramuros colonial kalesa, vibrant jeepney, Bohol tarsier, and sunset sailing Vinta in rich collector presentation.",
    "alt_text": "Four views of Johnnie Walker Blue Label Treasures of the Philippines collector edition bottle on silver-reflective luxury studio setting.",
    "original_image_path": "/concepts/original/concept-15.png",
    "full_image_path": "/concepts/full/concept-15.webp",
    "thumbnail_path": "/concepts/thumbs/concept-15.webp",
    "sort_order": 15,
    "is_published": true,
    "created_at": "2026-09-16T12:41:02.348Z",
    "updated_at": "2026-09-18T05:02:32.610Z"
  },
  {
    "id": "c0000000-0000-0000-0000-000000000016",
    "campaign_id": "e29d749a-14d2-4ce0-8d59-20f5efc34001",
    "code": "Concept 16",
    "title": "Concept 16 — Bakunawa The Moon Eater",
    "subtitle": "Celestial Serpent & Lunar Constellations",
    "description": "The mythical Philippine cosmic dragon Bakunawa emerging from deep cerulean ocean waves, encircling lunar phases and starry constellations across the four facets of the bottle in lustrous gold and lapis lazuli.",
    "alt_text": "Four views of bottle featuring the mythological Bakunawa sea serpent coiling around lunar phases with gold scales and starry night sky.",
    "original_image_path": "/concepts/original/concept-16.png",
    "full_image_path": "/concepts/full/concept-16.webp",
    "thumbnail_path": "/concepts/thumbs/concept-16.webp",
    "sort_order": 16,
    "is_published": true,
    "created_at": "2026-09-16T12:41:02.348Z",
    "updated_at": "2026-09-18T05:02:32.890Z"
  },
  {
    "id": "c0000000-0000-0000-0000-000000000017",
    "campaign_id": "e29d749a-14d2-4ce0-8d59-20f5efc34001",
    "code": "Concept 17",
    "title": "Concept 17 — Ani Golden Harvest",
    "subtitle": "Carabao, Emerald Terraces & Christmas Parol",
    "description": "A celebration of community bounty and Philippine folk-art spirit, featuring the revered water buffalo in blue porcelain filigree, emerald Cordillera paddies, festive jeepney riders, and a glowing Christmas star.",
    "alt_text": "Four views of bottle featuring water buffalo with filigree motifs, terraced rice paddies, joyful jeepney, and festive Christmas parol.",
    "original_image_path": "/concepts/original/concept-17.png",
    "full_image_path": "/concepts/full/concept-17.webp",
    "thumbnail_path": "/concepts/thumbs/concept-17.webp",
    "sort_order": 17,
    "is_published": true,
    "created_at": "2026-09-16T12:41:02.348Z",
    "updated_at": "2026-09-18T05:02:33.174Z"
  },
  {
    "id": "c0000000-0000-0000-0000-000000000018",
    "campaign_id": "e29d749a-14d2-4ce0-8d59-20f5efc34001",
    "code": "Concept 18",
    "title": "Concept 18 — Sarimanok Messenger of Fortune",
    "subtitle": "Maranao Royal Plumes & Golden Okir",
    "description": "The legendary Maranao totem bird of good fortune and prosperity, adorned with flowing jewel-toned plumes of emerald, sapphire, and ruby, grasping a silver fish amidst golden okir scrolls and the crescent moon.",
    "alt_text": "Four views of bottle featuring the mythological Sarimanok bird with vibrant okir filigree feathers, golden sun, and crescent moon.",
    "original_image_path": "/concepts/original/concept-18.png",
    "full_image_path": "/concepts/full/concept-18.webp",
    "thumbnail_path": "/concepts/thumbs/concept-18.webp",
    "sort_order": 18,
    "is_published": true,
    "created_at": "2026-09-16T12:41:02.348Z",
    "updated_at": "2026-09-18T05:02:33.484Z"
  },
  {
    "id": "c0000000-0000-0000-0000-000000000019",
    "campaign_id": "e29d749a-14d2-4ce0-8d59-20f5efc34001",
    "code": "Concept 19",
    "title": "Concept 19 — Tinikling & Mayon Sunset",
    "subtitle": "National Bamboo Dance & Soaring Haribon",
    "description": "Capturing the rhythmic grace of the Tinikling bamboo dancers in traditional baro't saya, accompanied by kulintang gongs, the sovereign Philippine eagle, and a vibrant Vinta gliding before Mount Mayon.",
    "alt_text": "Four views of bottle depicting Tinikling bamboo dancers, Philippine eagle in flight, colorful Vinta boat, and fiery Mayon sunset.",
    "original_image_path": "/concepts/original/concept-19.png",
    "full_image_path": "/concepts/full/concept-19.webp",
    "thumbnail_path": "/concepts/thumbs/concept-19.webp",
    "sort_order": 19,
    "is_published": true,
    "created_at": "2026-09-16T12:41:02.348Z",
    "updated_at": "2026-09-18T05:02:33.770Z"
  },
  {
    "id": "c0000000-0000-0000-0000-000000000020",
    "campaign_id": "e29d749a-14d2-4ce0-8d59-20f5efc34001",
    "code": "Concept 20",
    "title": "Concept 20 — Palawan Marine & Wild Sanctuaries",
    "subtitle": "Dugong, Sea Turtle, Tamaraw & Philippine Crocodile",
    "description": "An extraordinary tribute to the Philippines' most endangered and sacred wildlife, featuring the rare Palawan Dugong, hawksbill sea turtle, Mindoro tamaraw, Philippine eagle, and Mindoro freshwater crocodile.",
    "alt_text": "Four views of bottle featuring underwater ocean life with dugong and sea turtle on one side, and rainforest with eagle, tamaraw, and crocodile on the other.",
    "original_image_path": "/concepts/original/concept-20.png",
    "full_image_path": "/concepts/full/concept-20.webp",
    "thumbnail_path": "/concepts/thumbs/concept-20.webp",
    "sort_order": 20,
    "is_published": true,
    "created_at": "2026-09-16T12:41:02.348Z",
    "updated_at": "2026-09-18T05:02:34.060Z"
  },
  {
    "id": "c0000000-0000-0000-0000-000000000021",
    "campaign_id": "e29d749a-14d2-4ce0-8d59-20f5efc34001",
    "code": "Concept 21",
    "title": "Concept 21 — MassKara & Singkil Royalty",
    "subtitle": "Bacolod Smiling Masks & Royal Fan Dance",
    "description": "Vibrant cultural pageantry honoring Bacolod's world-famous MassKara Festival smiling mask adorned in feathers and Capiz shells, alongside the royal Singkil princess dance and kulintang gong ensemble.",
    "alt_text": "Four views of bottle featuring elaborate MassKara festival mask, Singkil royal fan dancers, kulintang musicians, and shimmering Capiz shell accents.",
    "original_image_path": "/concepts/original/concept-21.png",
    "full_image_path": "/concepts/full/concept-21.webp",
    "thumbnail_path": "/concepts/thumbs/concept-21.webp",
    "sort_order": 21,
    "is_published": true,
    "created_at": "2026-09-16T12:41:02.348Z",
    "updated_at": "2026-09-18T05:02:34.357Z"
  },
  {
    "id": "c0000000-0000-0000-0000-000000000022",
    "campaign_id": "e29d749a-14d2-4ce0-8d59-20f5efc34001",
    "code": "Concept 22",
    "title": "Concept 22 — Bayanihan & Heart of the Game",
    "subtitle": "Tarsier, Terraces & Neighborhood Passion",
    "description": "A striking contemporary celebration of the Filipino spirit, connecting ancestral mountain heritage, lush tropical highlands, and delicate tarsiers with the vibrant urban heartbeat of barangay basketball and artisan weaving.",
    "alt_text": "Four views of Johnnie Walker Blue Label bottle featuring weaving hands, tarsier in rice terraces, and basketball player shooting under Christmas parol.",
    "original_image_path": "/concepts/original/concept-22.png",
    "full_image_path": "/concepts/full/concept-22.webp",
    "thumbnail_path": "/concepts/thumbs/concept-22.webp",
    "sort_order": 22,
    "is_published": true,
    "created_at": "2026-09-16T12:41:02.348Z",
    "updated_at": "2026-09-18T05:02:34.642Z"
  }
];

class LocalDatabase {
  private db: DatabaseSchema;

  constructor() {
    this.db = this.load();
  }

  private load(): DatabaseSchema {
    try {
      // Check /tmp first for serverless updates
      if (fs.existsSync(TMP_DB_PATH)) {
        const raw = fs.readFileSync(TMP_DB_PATH, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.campaigns && parsed.designs) {
          return parsed;
        }
      }

      if (fs.existsSync(ROOT_DB_PATH)) {
        const raw = fs.readFileSync(ROOT_DB_PATH, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.campaigns && parsed.designs) {
          return parsed;
        }
      }
    } catch {
      // fallback to initial
    }

    const initial: DatabaseSchema = {
      campaigns: [INITIAL_CAMPAIGN],
      designs: INITIAL_DESIGNS,
      profiles: [
        {
          id: 'admin-seed-user-id',
          email: 'admin@manila-wine.com',
          display_name: 'Manila Wine Admin',
          role: 'admin',
          age_confirmed_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ],
      votes: [],
      vote_events: [],
      pledges: [],
      invitations: [
        {
          id: 'inv-seed-01',
          campaign_id: DEFAULT_CAMPAIGN_ID,
          email_normalized: 'vipbuyer@example.com',
          reference_code: 'MW-VIP-7782',
          status: 'sent',
          sent_at: new Date().toISOString(),
          first_visited_at: null,
          joined_user_id: null,
          voted_at: null,
          pledged_at: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ],
      consent_events: [],
      audit_logs: [
        {
          id: 'log-001',
          actor_email: 'system',
          action: 'CAMPAIGN_INITIALIZED',
          entity_type: 'campaign',
          entity_id: DEFAULT_CAMPAIGN_ID,
          after_state: { status: 'draft' },
          reason: 'Initial seed generation per Section 18',
          created_at: new Date().toISOString(),
        },
      ],
    };

    this.save(initial);
    return initial;
  }

  private save(data?: DatabaseSchema) {
    const toSave = data || this.db;
    const jsonStr = JSON.stringify(toSave, null, 2);

    // 1. Try writing to primary project storage
    try {
      const dir = path.dirname(ROOT_DB_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(ROOT_DB_PATH, jsonStr, 'utf-8');
      return;
    } catch {
      // Read-only filesystem (AWS Lambda / Vercel EROFS). Proceed to /tmp fallback.
    }

    // 2. Fallback to /tmp in serverless environments
    try {
      fs.writeFileSync(TMP_DB_PATH, jsonStr, 'utf-8');
    } catch (err) {
      console.error('Failed to persist store to /tmp:', err);
    }
  }

  // --- Campaign Methods ---
  getCampaignBySlug(slug: string = 'philippines-collectors-edition'): Campaign {
    let campaign = this.db.campaigns.find(c => c.slug === slug);
    if (!campaign) {
      campaign = this.db.campaigns[0] || INITIAL_CAMPAIGN;
    }
    return campaign;
  }

  getCampaignById(id: string): Campaign | undefined {
    return this.db.campaigns.find(c => c.id === id);
  }

  updateCampaign(id: string, updates: Partial<Campaign>, actorEmail: string = 'admin'): Campaign {
    const idx = this.db.campaigns.findIndex(c => c.id === id);
    if (idx === -1) {
      throw new Error(`Campaign ${id} not found`);
    }
    const before = { ...this.db.campaigns[idx] };
    const updated: Campaign = {
      ...this.db.campaigns[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.db.campaigns[idx] = updated;

    this.logAudit({
      actor_email: actorEmail,
      action: 'UPDATE_CAMPAIGN',
      entity_type: 'campaign',
      entity_id: id,
      before_state: before,
      after_state: updated,
      reason: 'Admin updated campaign settings',
    });

    this.save();
    return updated;
  }

  // --- Design Methods ---
  getDesigns(campaignId: string, includeArchived: boolean = false): Design[] {
    const counts = this.getVoteCounts(campaignId);
    return this.db.designs
      .filter(d => d.campaign_id === campaignId)
      .filter(d => includeArchived ? true : (!d.archived_at && d.is_published))
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(d => ({
        ...d,
        vote_count: counts[d.id] || 0,
      }));
  }

  getAllDesigns(campaignId: string): Design[] {
    const counts = this.getVoteCounts(campaignId);
    return this.db.designs
      .filter(d => d.campaign_id === campaignId)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(d => ({
        ...d,
        vote_count: counts[d.id] || 0,
      }));
  }

  createDesign(
    campaignId: string, 
    data: {
      code?: string;
      title: string;
      subtitle?: string | null;
      description?: string;
      alt_text?: string;
      original_image_path?: string;
      full_image_path?: string;
      thumbnail_path?: string;
      is_published?: boolean;
    }, 
    actorEmail: string = 'admin'
  ): Design {
    const campaignDesigns = this.db.designs.filter(d => d.campaign_id === campaignId);
    const maxOrder = campaignDesigns.reduce((max, d) => Math.max(max, d.sort_order || 0), 0);
    const nextOrder = maxOrder + 1;
    const defaultCode = `Concept ${String(nextOrder).padStart(2, '0')}`;
    const code = data.code?.trim() || defaultCode;
    const newId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `c-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

    const fallbackImg = '/concepts/full/concept-01.webp';
    const fallbackThumb = '/concepts/thumbs/concept-01.webp';

    const newDesign: Design = {
      id: newId,
      campaign_id: campaignId,
      code,
      title: data.title.trim(),
      subtitle: data.subtitle ? data.subtitle.trim() : null,
      description: data.description ? data.description.trim() : '',
      alt_text: data.alt_text ? data.alt_text.trim() : `${code} bottle concept artwork for Johnnie Walker Philippines Edition`,
      original_image_path: data.original_image_path || fallbackImg,
      full_image_path: data.full_image_path || fallbackImg,
      thumbnail_path: data.thumbnail_path || fallbackThumb,
      sort_order: nextOrder,
      is_published: data.is_published !== undefined ? data.is_published : true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.db.designs.push(newDesign);

    this.logAudit({
      actor_email: actorEmail,
      action: 'CREATE_DESIGN',
      entity_type: 'design',
      entity_id: newId,
      after_state: newDesign,
    });

    this.save();
    return newDesign;
  }

  updateDesign(designId: string, updates: Partial<Design>, actorEmail: string = 'admin'): Design {
    const idx = this.db.designs.findIndex(d => d.id === designId);
    if (idx === -1) throw new Error('Design not found');
    const before = { ...this.db.designs[idx] };
    const updated: Design = {
      ...this.db.designs[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.db.designs[idx] = updated;

    this.logAudit({
      actor_email: actorEmail,
      action: 'UPDATE_DESIGN',
      entity_type: 'design',
      entity_id: designId,
      before_state: before,
      after_state: updated,
    });

    this.save();
    return updated;
  }

  reorderDesigns(campaignId: string, orderedIds: string[], actorEmail: string = 'admin') {
    orderedIds.forEach((id, index) => {
      const d = this.db.designs.find(item => item.id === id && item.campaign_id === campaignId);
      if (d) {
        d.sort_order = index + 1;
        d.updated_at = new Date().toISOString();
      }
    });

    this.logAudit({
      actor_email: actorEmail,
      action: 'REORDER_DESIGNS',
      entity_type: 'campaign',
      entity_id: campaignId,
      after_state: { orderedIds },
    });

    this.save();
  }

  archiveDesign(designId: string, actorEmail: string = 'admin') {
    const hasVotes = this.db.votes.some(v => v.design_id === designId);
    const d = this.db.designs.find(item => item.id === designId);
    if (!d) throw new Error('Design not found');
    
    d.archived_at = new Date().toISOString();
    d.is_published = false;
    d.updated_at = new Date().toISOString();

    this.logAudit({
      actor_email: actorEmail,
      action: 'ARCHIVE_DESIGN',
      entity_type: 'design',
      entity_id: designId,
      reason: hasVotes ? 'Soft-archived design with existing votes' : 'Archived design without votes',
    });

    this.save();
    return d;
  }

  // --- Vote Methods ---
  getVoteCounts(campaignId: string): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const v of this.db.votes) {
      if (v.campaign_id === campaignId) {
        counts[v.design_id] = (counts[v.design_id] || 0) + 1;
      }
    }
    return counts;
  }

  getUserVote(campaignId: string, userId: string): Vote | null {
    return this.db.votes.find(v => v.campaign_id === campaignId && v.user_id === userId) || null;
  }

  castOrChangeVote(
    campaignId: string,
    userId: string,
    designId: string,
    metadata?: {
      source?: string;
      utm_source?: string;
      utm_medium?: string;
      utm_campaign?: string;
      utm_content?: string;
    }
  ): { vote: Vote; isChange: boolean } {
    const campaign = this.getCampaignById(campaignId);
    if (!campaign) throw new Error('Campaign not found');

    // Verify campaign phase
    if (campaign.status !== 'voting_open') {
      throw new Error(`Voting is not active for this campaign (current status: ${campaign.status})`);
    }

    // Check deadline
    if (campaign.vote_closes_at && new Date() > new Date(campaign.vote_closes_at)) {
      throw new Error('Voting deadline has passed');
    }

    // Verify target design exists and is published
    const targetDesign = this.db.designs.find(d => d.id === designId && d.campaign_id === campaignId);
    if (!targetDesign || !targetDesign.is_published || targetDesign.archived_at) {
      throw new Error('Selected design is invalid or not available for voting');
    }

    // Check existing vote (Atomic enforcement of 1 vote per user per campaign)
    const existingIndex = this.db.votes.findIndex(v => v.campaign_id === campaignId && v.user_id === userId);

    const now = new Date().toISOString();

    if (existingIndex >= 0) {
      const existingVote = this.db.votes[existingIndex];
      const fromDesignId = existingVote.design_id;

      if (fromDesignId === designId) {
        // Same design voted again, idempotent return
        return { vote: existingVote, isChange: false };
      }

      // Update existing vote
      existingVote.design_id = designId;
      existingVote.updated_at = now;

      // Append vote change event
      const event: VoteEvent = {
        id: `ve-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        vote_id: existingVote.id,
        campaign_id: campaignId,
        user_id: userId,
        from_design_id: fromDesignId,
        to_design_id: designId,
        event_type: 'changed',
        created_at: now,
      };
      this.db.vote_events.push(event);

      // If user had a pledge, update its design reference snapshot
      const userPledge = this.db.pledges.find(p => p.campaign_id === campaignId && p.user_id === userId);
      if (userPledge) {
        userPledge.design_id = designId;
        userPledge.updated_at = now;
      }

      this.save();
      return { vote: existingVote, isChange: true };
    } else {
      // First vote
      const newVote: Vote = {
        id: `v-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        campaign_id: campaignId,
        user_id: userId,
        design_id: designId,
        source: metadata?.source,
        utm_source: metadata?.utm_source,
        utm_medium: metadata?.utm_medium,
        utm_campaign: metadata?.utm_campaign,
        utm_content: metadata?.utm_content,
        created_at: now,
        updated_at: now,
      };
      this.db.votes.push(newVote);

      const event: VoteEvent = {
        id: `ve-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        vote_id: newVote.id,
        campaign_id: campaignId,
        user_id: userId,
        from_design_id: null,
        to_design_id: designId,
        event_type: 'created',
        created_at: now,
      };
      this.db.vote_events.push(event);

      this.save();
      return { vote: newVote, isChange: false };
    }
  }

  resetUserVote(campaignId: string, userId: string): boolean {
    const beforeVotes = this.db.votes.length;
    this.db.votes = this.db.votes.filter(v => !(v.campaign_id === campaignId && v.user_id === userId));
    this.db.pledges = this.db.pledges.filter(p => !(p.campaign_id === campaignId && p.user_id === userId));
    this.save();
    return this.db.votes.length < beforeVotes;
  }

  resetUserVoteByEmail(campaignId: string, email: string): boolean {
    const profile = this.db.profiles.find(p => p.email.toLowerCase() === email.trim().toLowerCase());
    if (!profile) return false;
    return this.resetUserVote(campaignId, profile.id);
  }

  // --- Pledge Methods ---
  getUserPledge(campaignId: string, userId: string): Pledge | null {
    return this.db.pledges.find(p => p.campaign_id === campaignId && p.user_id === userId) || null;
  }

  createOrUpdatePledge(
    campaignId: string,
    userId: string,
    data: {
      bottle_count?: number;
      preferred_number?: number | null;
      interest_tier: InterestTier;
      marketing_consent?: boolean;
    }
  ): Pledge {
    const campaign = this.getCampaignById(campaignId);
    if (!campaign) throw new Error('Campaign not found');

    const count = data.bottle_count !== undefined ? Math.max(1, Math.min(100, Math.floor(data.bottle_count))) : 1;

    if (data.preferred_number !== undefined && data.preferred_number !== null) {
      if (data.preferred_number < 1 || data.preferred_number > 100) {
        throw new Error('Preferred bottle number must be between 1 and 100');
      }
    }

    const now = new Date().toISOString();
    const userVote = this.getUserVote(campaignId, userId);
    const designId = userVote?.design_id || null;

    const existingIndex = this.db.pledges.findIndex(p => p.campaign_id === campaignId && p.user_id === userId);

    if (existingIndex >= 0) {
      const pledge = this.db.pledges[existingIndex];
      pledge.bottle_count = data.bottle_count !== undefined ? count : (pledge.bottle_count || 1);
      pledge.preferred_number = data.preferred_number ?? pledge.preferred_number;
      pledge.interest_tier = data.interest_tier;
      pledge.design_id = designId;
      pledge.status = 'active';
      pledge.withdrawn_at = null;
      if (data.marketing_consent) {
        pledge.marketing_consent_at = now;
      }
      pledge.updated_at = now;

      this.save();
      return pledge;
    } else {
      const newPledge: Pledge = {
        id: `pl-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        campaign_id: campaignId,
        user_id: userId,
        design_id: designId,
        status: 'active',
        bottle_count: count,
        preferred_number: data.preferred_number ?? null,
        interest_tier: data.interest_tier,
        nonbinding_acknowledged_at: now,
        campaign_updates_consent_at: now,
        marketing_consent_at: data.marketing_consent ? now : null,
        withdrawn_at: null,
        created_at: now,
        updated_at: now,
      };
      this.db.pledges.push(newPledge);
      this.save();
      return newPledge;
    }
  }

  withdrawPledge(campaignId: string, userId: string): Pledge {
    const pledge = this.db.pledges.find(p => p.campaign_id === campaignId && p.user_id === userId);
    if (!pledge) throw new Error('No active pledge found to withdraw');

    pledge.status = 'withdrawn';
    pledge.withdrawn_at = new Date().toISOString();
    pledge.updated_at = new Date().toISOString();

    this.save();
    return pledge;
  }

  // --- Profile & Session ---
  getProfile(userId: string): Profile | null {
    return this.db.profiles.find(p => p.id === userId) || null;
  }

  getProfileByEmail(email: string): Profile | null {
    const norm = email.trim().toLowerCase();
    return this.db.profiles.find(p => p.email.toLowerCase() === norm) || null;
  }

  upsertProfile(email: string, role: UserRole = 'user', ageConfirmed: boolean = true): Profile {
    const norm = email.trim().toLowerCase();
    let profile = this.getProfileByEmail(norm);
    const now = new Date().toISOString();

    if (profile) {
      if (ageConfirmed && !profile.age_confirmed_at) {
        profile.age_confirmed_at = now;
      }
      if (role === 'admin' && profile.role !== 'admin') {
        profile.role = 'admin';
      }
      profile.updated_at = now;
    } else {
      profile = {
        id: `usr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        email: norm,
        display_name: norm.split('@')[0],
        role: role,
        age_confirmed_at: ageConfirmed ? now : null,
        created_at: now,
        updated_at: now,
      };
      this.db.profiles.push(profile);
    }
    this.save();
    return profile;
  }

  // --- Invitations ---
  getInvitations(campaignId: string): Invitation[] {
    return this.db.invitations.filter(i => i.campaign_id === campaignId);
  }

  importInvitations(campaignId: string, rawEmails: string[]): { imported: number; duplicates: number; invalid: number } {
    let imported = 0;
    let duplicates = 0;
    let invalid = 0;
    const now = new Date().toISOString();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    for (const raw of rawEmails) {
      const email = raw.trim().toLowerCase();
      if (!email || !emailRegex.test(email)) {
        invalid++;
        continue;
      }

      const existing = this.db.invitations.find(i => i.campaign_id === campaignId && i.email_normalized === email);
      if (existing) {
        duplicates++;
        continue;
      }

      const code = `MW-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
      this.db.invitations.push({
        id: `inv-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        campaign_id: campaignId,
        email_normalized: email,
        reference_code: code,
        status: 'sent',
        sent_at: now,
        first_visited_at: null,
        joined_user_id: null,
        voted_at: null,
        pledged_at: null,
        created_at: now,
        updated_at: now,
      });
      imported++;
    }

    this.save();
    return { imported, duplicates, invalid };
  }

  isEmailAllowed(campaignId: string, email: string): boolean {
    const campaign = this.getCampaignById(campaignId);
    if (!campaign || campaign.access_mode === 'public_authenticated') {
      return true;
    }
    const norm = email.trim().toLowerCase();
    return this.db.invitations.some(i => i.campaign_id === campaignId && i.email_normalized === norm && i.status !== 'deactivated');
  }

  // --- Audit Logging ---
  logAudit(entry: Omit<AdminAuditLog, 'id' | 'created_at'>) {
    const log: AdminAuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      created_at: new Date().toISOString(),
      ...entry,
    };
    this.db.audit_logs.unshift(log);
    if (this.db.audit_logs.length > 500) {
      this.db.audit_logs = this.db.audit_logs.slice(0, 500);
    }
    this.save();
  }

  getAuditLogs(limit: number = 100): AdminAuditLog[] {
    return this.db.audit_logs.slice(0, limit);
  }

  // --- Admin Reporting & Analytics ---
  getCampaignAnalytics(campaignId: string) {
    const votes = this.db.votes.filter(v => v.campaign_id === campaignId);
    const pledges = this.db.pledges.filter(p => p.campaign_id === campaignId && p.status === 'active');
    const designs = this.getDesigns(campaignId, true);

    const totalVoters = votes.length;
    const totalPledges = pledges.length;
    const totalBottlesPledged = pledges.reduce((sum, p) => sum + (p.bottle_count || 1), 0);
    const conversionRate = totalVoters > 0 ? (totalPledges / totalVoters) * 100 : 0;

    // Preferred numbers map
    const preferredNumbers: Record<number, number> = {};
    pledges.forEach(p => {
      if (p.preferred_number) {
        preferredNumbers[p.preferred_number] = (preferredNumbers[p.preferred_number] || 0) + 1;
      }
    });

    // Interest tier breakdown
    const tierCounts = {
      any_available: pledges.filter(p => p.interest_tier === 'any_available').length,
      specific_standard: pledges.filter(p => p.interest_tier === 'specific_standard').length,
      premium_collector: pledges.filter(p => p.interest_tier === 'premium_collector').length,
    };

    // UTM / Referral attribution
    const utmBreakdown: Record<string, number> = {};
    votes.forEach(v => {
      const src = v.utm_source || v.source || 'direct';
      utmBreakdown[src] = (utmBreakdown[src] || 0) + 1;
    });

    // Votes by date (last 14 days)
    const votesByDate: Record<string, number> = {};
    votes.forEach(v => {
      const dateKey = v.created_at.split('T')[0];
      votesByDate[dateKey] = (votesByDate[dateKey] || 0) + 1;
    });

    return {
      totalVoters,
      totalPledges,
      totalBottlesPledged,
      conversionRate: Math.round(conversionRate * 10) / 10,
      designs,
      preferredNumbers,
      tierCounts,
      utmBreakdown,
      votesByDate,
    };
  }

  // CSV Export Data
  getVotesExport(campaignId: string) {
    const votes = this.db.votes.filter(v => v.campaign_id === campaignId);
    return votes.map(v => {
      const profile = this.db.profiles.find(p => p.id === v.user_id);
      const design = this.db.designs.find(d => d.id === v.design_id);
      const pledge = this.db.pledges.find(p => p.campaign_id === campaignId && p.user_id === v.user_id && p.status === 'active');
      return {
        vote_id: v.id,
        user_email: profile?.email || 'unknown',
        design_code: design?.code || 'unknown',
        design_title: design?.title || 'unknown',
        has_pledge: Boolean(pledge),
        pledged_bottles: pledge ? (pledge.bottle_count || 1) : 0,
        pledged_number: pledge?.preferred_number || '',
        pledge_tier: pledge?.interest_tier || '',
        utm_source: v.utm_source || '',
        utm_medium: v.utm_medium || '',
        utm_campaign: v.utm_campaign || '',
        voted_at: v.created_at,
        last_updated_at: v.updated_at,
      };
    });
  }

  getPledgesExport(campaignId: string) {
    const pledges = this.db.pledges.filter(p => p.campaign_id === campaignId);
    return pledges.map(p => {
      const profile = this.db.profiles.find(u => u.id === p.user_id);
      const design = p.design_id ? this.db.designs.find(d => d.id === p.design_id) : null;
      return {
        pledge_id: p.id,
        user_email: profile?.email || 'unknown',
        status: p.status,
        bottle_count: p.bottle_count || 1,
        preferred_number: p.preferred_number || '',
        interest_tier: p.interest_tier,
        associated_design_code: design?.code || '',
        associated_design_title: design?.title || '',
        campaign_updates_consent: Boolean(p.campaign_updates_consent_at),
        marketing_news_consent: Boolean(p.marketing_consent_at),
        pledged_at: p.created_at,
        withdrawn_at: p.withdrawn_at || '',
      };
    });
  }
}

// Global singleton instance
declare global {
  var __localDbInstance: LocalDatabase | undefined;
}

export function getDb(): LocalDatabase {
  if (!global.__localDbInstance) {
    global.__localDbInstance = new LocalDatabase();
  }
  return global.__localDbInstance;
}
