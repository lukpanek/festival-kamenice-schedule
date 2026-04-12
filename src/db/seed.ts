import "dotenv/config";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { stages, artistCategories, artists, performances } from "./schema";

const seed = async () => {
  const client = postgres(process.env.DATABASE_URL!);
  const db = drizzle(client);

  console.log("Seeding database...");

  // Clear existing data
  await db.delete(performances);
  await db.delete(artistCategories);
  await db.delete(artists);
  await db.delete(stages);

  // 1. Categories
  const categoryValues = [
    { name: "Koncert", color: "#FF3366" },
    { name: "Doprovodný program", color: "#33CCFF" },
    { name: "Afterparty", color: "#000000" },
  ];
  const insertedCategories = await db.insert(artistCategories).values(categoryValues).returning();
  const [koncert, doprovodny, afterparty] = insertedCategories;

  // 2. Stages
  const stageValues = [
    { name: "Hlavní Stage (Náměstí)", description: "Hlavní dění festivalu", order: 1 },
    { name: "Zámecké nádvoří", description: "Klidnější zóna, akustické koncerty", order: 2 },
    { name: "Koupaliště", description: "Denní chillout a afterparty", order: 3 },
  ];
  const insertedStages = await db.insert(stages).values(stageValues).returning();
  const [namesti, nadvori, koupaliste] = insertedStages;

  // 3. Artists
  const artistValues = [
    {
      name: "Prago Union",
      genre: "Hip Hop",
      shortDescription: "Legenda českého hip hopu.",
      longDescription: "Kato a jeho parta přijedou rozhýbat Kamenici svými propracovanými rýmy a klasickým boom bap soundem.",
    },
    {
      name: "TATA BOJS",
      genre: "Alternative Rock",
      shortDescription: "Kluci z Hanspaulky.",
      longDescription: "Jedinečná audiovizuální show jedné z nejkonzistentnějších kapel u nás. Očekávejte energii a hity.",
    },
    {
      name: "Mutanti Hledaj Východisko",
      genre: "Alternative Electronic Hip Hop",
      shortDescription: "Bizár, divadlo, rap.",
      longDescription: "Dvojice, co posouvá hranice žánrů a nebojí se experimentovat jak hudebně, tak textově.",
    },
    {
      name: "DJ NobodyListen",
      genre: "Electronic / Club",
      shortDescription: "Zásadní jméno CZ klubové scény.",
      longDescription: "Nekonečný banger po bangeru. Addict vibes dorazí do Kamenice.",
    },
    {
      name: "Lokální divadlo J.K. Tyla",
      genre: "Divadlo",
      shortDescription: "Klasika nerezaví.",
      longDescription: "Odpolední představení pro všechny generace.",
    }
  ];
  const insertedArtists = await db.insert(artists).values(artistValues).returning();
  const [prago, tata, mutanti, nobody, divadlo] = insertedArtists;

  // 4. Performances
  // Dates: 2026-06-04 (Thu), 2026-06-05 (Fri), 2026-06-06 (Sat)
  const performanceValues = [
    // Friday: 2026-06-05
    {
      artistId: divadlo.id,
      stageId: nadvori.id,
      categoryId: doprovodny.id,
      date: "2026-06-05",
      startTime: "14:00:00",
      endTime: "15:30:00",
    },
    {
      artistId: mutanti.id,
      stageId: namesti.id,
      categoryId: koncert.id,
      date: "2026-06-05",
      startTime: "18:00:00",
      endTime: "19:00:00",
    },
    {
      artistId: prago.id,
      stageId: namesti.id,
      categoryId: koncert.id,
      date: "2026-06-05",
      startTime: "20:30:00",
      endTime: "21:45:00",
    },
    {
      artistId: nobody.id,
      stageId: koupaliste.id,
      categoryId: afterparty.id,
      date: "2026-06-05",
      startTime: "22:30:00",
      endTime: "02:00:00",
    },
    // Saturday: 2026-06-06
    {
      artistId: tata.id,
      stageId: namesti.id,
      categoryId: koncert.id,
      date: "2026-06-06",
      startTime: "21:00:00",
      endTime: "22:30:00",
    },
  ];

  await db.insert(performances).values(performanceValues);

  console.log("Seeding done!");
  process.exit(0);
};

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
