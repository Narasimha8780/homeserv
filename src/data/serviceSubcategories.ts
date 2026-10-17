import { getRootCategoryKey } from '../utils/categoryHierarchy';

export interface ServiceSubcategory {
  id: string;
  title: string;
  section?: string;
}

// Service examples shown within each parent category. Confirm the exact work
// with the professional; these do not assert individual providers' offerings.
export const SERVICE_SUBCATEGORIES: Record<string, ServiceSubcategory[]> = {
  'electrician': [
    { id: 'electrician-wiring', title: "Wiring & Rewiring" },
    { id: 'electrician-switch-socket', title: "Switches & Sockets" },
    { id: 'electrician-fan-repair', title: "Fan Installation & Repair" },
  ],
  'plumber': [
    { id: 'plumber-tap-repair', title: "Tap Repair" },
    { id: 'plumber-pipe-leak', title: "Pipe Leak Repair" },
    { id: 'plumber-bathroom-fittings', title: "Bathroom Fittings" },
  ],
  'driver': [
    { id: 'driver-local-driver', title: "Local Driver" },
    { id: 'driver-outstation-driver', title: "Outstation Driver" },
    { id: 'driver-designated-driver', title: "Personal Driver" },
  ],
  'carpenter': [
    { id: 'carpenter-furniture-repair', title: "Furniture Repair" },
    { id: 'carpenter-door-lock', title: "Doors & Locks" },
    { id: 'carpenter-furniture-assembly', title: "Furniture Assembly" },
  ],
  'painter': [
    { id: 'painter-interior-painting', title: "Interior Painting" },
    { id: 'painter-exterior-painting', title: "Exterior Painting" },
    { id: 'painter-waterproofing', title: "Waterproofing" },
  ],
  'insta-help': [
    { id: 'insta-help-home-errands', title: "Home Errands" },
    { id: 'insta-help-grocery-help', title: "Grocery Assistance" },
    { id: 'insta-help-moving-help', title: "Moving Assistance" },
  ],
  'interior': [
    { id: 'interior-room-design', title: "Room Design" },
    { id: 'interior-modular-kitchen', title: "Modular Kitchen" },
    { id: 'interior-wardrobe-design', title: "Wardrobe Design" },
  ],
  'home-cleaning': [
    { id: 'home-cleaning-deep-cleaning', title: "Home Deep Cleaning" },
    { id: 'home-cleaning-bathroom-cleaning', title: "Bathroom Cleaning" },
    { id: 'home-cleaning-kitchen-cleaning', title: "Kitchen Cleaning" },
  ],
  'photography': [
    { id: 'photography-wedding-photography', title: "Wedding Photography" },
    { id: 'photography-portrait-photography', title: "Portrait Photography" },
    { id: 'photography-event-photography', title: "Event Photography" },
  ],
  'events': [
    { id: 'events-wedding-decoration', title: "Wedding Decoration" },
    { id: 'events-birthday-decoration', title: "Birthday Decoration" },
    { id: 'events-event-planning', title: "Event Planning" },
  ],
  'ac-repair': [
    { id: 'ac-repair-ac', title: "AC", section: 'Large appliances' },
    { id: 'ac-repair-washing-machine', title: "Washing Machine", section: 'Large appliances' },
    { id: 'ac-repair-refrigerator', title: "Refrigerator", section: 'Large appliances' },
    { id: 'ac-repair-television', title: "Television", section: 'Large appliances' },
    { id: 'ac-repair-chimney', title: "Chimney", section: 'Other appliances' },
    { id: 'ac-repair-microwave', title: "Microwave", section: 'Other appliances' },
    { id: 'ac-repair-stove', title: "Stove", section: 'Other appliances' },
    { id: 'ac-repair-laptop', title: "Laptop", section: 'Other appliances' },
    { id: 'ac-repair-water-purifier', title: "RO / Water Purifier", section: 'Other appliances' },
    { id: 'ac-repair-geyser', title: "Geyser", section: 'Other appliances' },
    { id: 'ac-repair-air-cooler', title: "Air Cooler", section: 'Other appliances' },
  ],
  'barber': [
    { id: 'barber-haircut-beard', title: "Haircut & Beard Styling" },
    { id: 'barber-facial-cleanup', title: "Facial & Cleanup" },
    { id: 'barber-detan', title: "De-tan" },
    { id: 'barber-massage', title: "Massage" },
    { id: 'barber-hair-colour', title: "Hair Colour" },
  ],
  'pest-control': [
    { id: 'pest-control-cockroach', title: "Cockroach Control" },
    { id: 'pest-control-ants-bedbugs', title: "Ants & Bed Bugs Control" },
  ],
  'spa': [
    { id: 'spa-waxing-threading', title: "Waxing & Threading" },
    { id: 'spa-cleanup-bleach-detan', title: "Cleanup, Bleach & De-tan" },
    { id: 'spa-pedicure-manicure', title: "Pedicure & Manicure" },
    { id: 'spa-hair-spa-colour', title: "Hair Spa, Colour & Henna" },
    { id: 'spa-makeup', title: "Makeup" },
    { id: 'spa-facials', title: "Facials" },
    { id: 'spa-bridal-makeup-hairstyling', title: "Bridal Makeup & Hairstyling" },
    { id: 'spa-head-massage', title: "Head Massage" },
    { id: 'spa-saree-draping', title: "Saree Draping / Pre-pleating" },
    { id: 'spa-mehendi', title: "Mehendi Services" },
  ],
};

export function getServiceSubcategories(categoryId: string, title = ''): ServiceSubcategory[] {
  return SERVICE_SUBCATEGORIES[getRootCategoryKey(categoryId, title)] || [];
}

