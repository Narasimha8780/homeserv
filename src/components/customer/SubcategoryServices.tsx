import React, { useState } from 'react';
import { Wrench } from 'lucide-react';
import { getServiceSubcategories, type ServiceSubcategory } from '../../data/serviceSubcategories';
import { getRootCategoryKey } from '../../utils/categoryHierarchy';
import { getSubcategoryIconUrl } from '../../utils/subcategoryIcons';

const ServiceArtwork: React.FC<{ id: string }> = ({ id }) => {
  const [failed, setFailed] = useState(false);
  const url = getSubcategoryIconUrl(id);
  return url && !failed ? (
    <img src={url} alt="" loading="lazy" width={192} height={192} onError={() => setFailed(true)} className="subcategory-art" />
  ) : <span className="subcategory-art flex items-center justify-center bg-info-soft text-info-ink"><Wrench className="w-7 h-7" /></span>;
};

export const SubcategoryServices: React.FC<{ categoryId: string; title: string }> = ({ categoryId, title }) => {
  const services = getServiceSubcategories(categoryId, title);
  if (!services.length) return null;
  const hasFeaturedArtwork = ['spa', 'barber', 'plumber', 'ac-repair', 'electrician', 'driver', 'carpenter', 'painter', 'interior', 'home-cleaning'].includes(getRootCategoryKey(categoryId, title));
  const sections = Array.from(new Set(services.map(({ section }) => section || '')));
  return (
    <section className={`subcategory-services mt-7 ${hasFeaturedArtwork ? 'subcategory-featured' : ''}`} aria-labelledby="subcategory-heading">
      <h2 id="subcategory-heading" className="text-xl font-bold text-ink">Services in this category</h2>
      <p className="mt-1 text-sm text-ink-2">Confirm your required service with the professional you contact.</p>
      {sections.map((section) => (
        <div key={section} className="mt-5">
          {section && <h3 className="text-base font-bold text-ink mb-4">{section}</h3>}
          <ul className="subcategory-grid">
            {services.filter((service) => (service.section || '') === section).map((service: ServiceSubcategory) => (
              <li key={service.id} className="subcategory-tile" data-service-id={service.id}>
                <ServiceArtwork id={service.id} />
                <span className="subcategory-label text-xs sm:text-sm font-semibold text-ink leading-snug">{service.title}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
};
