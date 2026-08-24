import { formatTag } from '../data/masterTags';
import { MASTER_CATEGORIES } from '../data/masterTags';

export interface TagExportItem {
  id?: number | string;
  rawTag: string;
  category?: string;
}

/**
 * Generates a clean, UTF-8 compliant CSV string from a list of tags.
 */
export function generateTagsCsv(
  tags: string[],
  artistName: string = '',
  trackName: string = '',
  categoryMap?: Record<string, string>
): string {
  const headers = [
    'ID',
    'Tag Original',
    'Tag Formate (Artiste / Titre)',
    'Format Hashtag (Instagram / TikTok)',
    'Nombre de Caracteres',
    'Categorie / Type',
    'Optimisation YouTube SEO',
    'Optimisation Instagram Reels',
    'Date Export',
  ];

  // Helper to escape CSV fields
  const escapeCsv = (val: string | number) => {
    const stringVal = String(val ?? '');
    return `"${stringVal.replace(/"/g, '""')}"`;
  };

  // Find categories for tags if not provided
  const findCategory = (tag: string): string => {
    if (categoryMap && categoryMap[tag]) return categoryMap[tag];
    for (const cat of MASTER_CATEGORIES) {
      if (cat.tags.includes(tag)) {
        return cat.name;
      }
    }
    return 'Sélection Personnalisée';
  };

  const exportDate = new Date().toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  const rows = tags.map((rawTag, index) => {
    const formatted = formatTag(rawTag, artistName, trackName);
    const hashtag = '#' + formatted.replace(/[^a-zA-Z0-9\u00C0-\u017F]/g, '');
    const charCount = formatted.length;
    const cat = findCategory(rawTag);

    // YouTube SEO note
    let ytNote = 'Mot-clé secondaire pour enrichir le référencement sémantique.';
    if (rawTag.includes('{artiste}') || rawTag.includes('{titre}')) {
      ytNote = 'Couche 1 : Identité officielle indispensable pour lier les vidéos de votre chaîne.';
    } else if (formatted.toLowerCase().includes('plug') || formatted.toLowerCase().includes('trap') || formatted.toLowerCase().includes('drill')) {
      ytNote = 'Couche 2 : Sous-genre précis à fort ciblage algorithmique.';
    } else if (formatted.toLowerCase().includes('808') || formatted.toLowerCase().includes('nuit') || formatted.toLowerCase().includes('nocturne')) {
      ytNote = 'Couche 3 : Requête longue traîne d\'ambiance et de production.';
    }

    // Instagram SEO note
    const igNote = `Hashtag de découvrabilité pour Reels & Posts (${hashtag}). Recommandé dans les 5-15 tags ciblés.`;

    return [
      escapeCsv(index + 1),
      escapeCsv(rawTag),
      escapeCsv(formatted),
      escapeCsv(hashtag),
      escapeCsv(charCount),
      escapeCsv(cat),
      escapeCsv(ytNote),
      escapeCsv(igNote),
      escapeCsv(exportDate),
    ].join(';');
  });

  // UTF-8 BOM (\uFEFF) + Header + Rows with semicolon delimiter (standard for European Excel)
  return '\uFEFF' + [headers.map(escapeCsv).join(';'), ...rows].join('\r\n');
}

/**
 * Triggers a browser download of the generated CSV file.
 */
export function downloadTagsCsv(
  tags: string[],
  artistName: string = '',
  trackName: string = '',
  fileNamePrefix: string = 'master-tags-export'
) {
  const csvContent = generateTagsCsv(tags, artistName, trackName);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  const safeArtist = (artistName || 'artiste').toLowerCase().replace(/[^a-z0-9]/gi, '-');
  const safeTrack = (trackName || 'track').toLowerCase().replace(/[^a-z0-9]/gi, '-');
  const safePrefix = fileNamePrefix.toLowerCase().replace(/[^a-z0-9]/gi, '-');

  link.setAttribute('href', url);
  link.setAttribute('download', `${safePrefix}-${safeArtist}-${safeTrack}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
