import { verifyAdmin } from "@/lib/dal";
import { adminDb } from "@/lib/firebase/admin";
import MediaUploader from "./MediaUploader";
import MediaGrid from "./MediaGrid";

async function getMedia() {
  const snap = await adminDb.collection("media").orderBy("createdAt", "desc").limit(100).get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as {
    id: string; filename: string; url: string; storagePath: string;
    type: string; size: number; createdAt: number;
  }[];
}

export default async function MediaPage() {
  await verifyAdmin();
  const items = await getMedia();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-cacao text-3xl">Media Library</h1>
        <span className="text-ink/40 text-sm">{items.length} file{items.length !== 1 ? "s" : ""}</span>
      </div>
      <MediaUploader />
      <MediaGrid items={items} />
    </div>
  );
}
