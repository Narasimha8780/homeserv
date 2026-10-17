import { getCategoryIconUrl } from './categoryIcons';

const TAGLINES: Record<string, string> = {
  driver: 'Your journey, made easier',
  plumber: 'Small leaks. Expert fixes.',
  electrician: 'Bright ideas. Safer homes.',
  'insta-help': 'A helping hand, close by',
  'saree-draping': 'Every drape, beautifully done',
  'mehendi-service': 'Little details. Lovely memories.',
  'pest-control': 'A healthier, happier home',
  carpenter: 'Crafted for your everyday',
  spa: 'Look good. Feel good.',
  interior: 'Make your space feel like you',
  painter: 'A fresh colour. A fresh start.',
  'home-cleaning': 'Fresh spaces. Happy faces.',
  'bridal-makeup': 'Your day. Your beautiful glow.',
  photography: 'Your moments, beautifully kept',
  events: 'Big days. Beautiful memories.',
  'ac-repair': 'Stay cool. Stay comfortable.',
  'appliance-repair': 'Get everyday life running again',
  barber: 'Fresh cuts. Everyday confidence.',
};

export function getServiceTagline(id: string, title: string, fallback = ''): string {
  if (TAGLINES[id]) return TAGLINES[id];
  const icon = getCategoryIconUrl(id, title);
  if (icon) {
    const match = Object.keys(TAGLINES).find((key) => getCategoryIconUrl(key) === icon);
    if (match) return TAGLINES[match];
  }
  return fallback || 'Local expertise, close to home';
}
