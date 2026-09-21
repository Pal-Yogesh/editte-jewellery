import { getStorefrontDesigners } from "@/lib/designers";
import ZaraNavbar from "@/components/ZaraNavbar";
import NavbarActions from "@/components/NavbarActions";

/**
 * The navbar with its live data attached. The DESIGNERS flyout lists registered
 * vendors, so every page that renders the navbar needs the directory — this
 * wrapper fetches it once (cached) and keeps the pages themselves plain.
 */
export default async function SiteNavbar() {
  const designers = await getStorefrontDesigners();

  return (
    <ZaraNavbar
      actions={<NavbarActions />}
      designers={designers.map((d) => ({
        label: d.brandName,
        href: `/designer/${d.slug}`,
      }))}
    />
  );
}
