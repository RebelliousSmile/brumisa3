// Tests de fonctions utilitaires simples

describe('Utility Functions', () => {
  describe('Number formatting', () => {
    test('should format numbers with K suffix', () => {
      // Fonction de formatage que nous devons implémenter
      function formaterNombre(nombre) {
        if (!nombre) return '0';
        
        if (nombre >= 1000000) {
          return (nombre / 1000000).toFixed(1) + 'M';
        } else if (nombre >= 1000) {
          return (nombre / 1000).toFixed(0) + 'K';
        }
        
        return nombre.toString();
      }

      expect(formaterNombre(1247)).toBe('1K');
      expect(formaterNombre(8932)).toBe('9K');
      expect(formaterNombre(3456)).toBe('3K');
      expect(formaterNombre(1500000)).toBe('1.5M');
      expect(formaterNombre(999)).toBe('999');
      expect(formaterNombre(0)).toBe('0');
      expect(formaterNombre(null)).toBe('0');
    });
  });

  describe('File size formatting', () => {
    test('should format file sizes correctly', () => {
      function formaterTailleFichier(octets) {
        if (!octets) return 'N/A';
        
        const unites = ['o', 'Ko', 'Mo', 'Go'];
        let taille = octets;
        let uniteIndex = 0;
        
        while (taille >= 1024 && uniteIndex < unites.length - 1) {
          taille /= 1024;
          uniteIndex++;
        }
        
        return `${Math.round(taille * 10) / 10} ${unites[uniteIndex]}`;
      }

      expect(formaterTailleFichier(1024)).toBe('1 Ko');
      expect(formaterTailleFichier(1048576)).toBe('1 Mo');
      expect(formaterTailleFichier(500)).toBe('500 o');
      expect(formaterTailleFichier(null)).toBe('N/A');
      expect(formaterTailleFichier(1536)).toBe('1.5 Ko');
    });
  });

  describe('Star rating generation', () => {
    test('should generate correct star ratings', () => {
      function genererEtoiles(note) {
        const etoilesCompletes = '★'.repeat(note);
        const etoilesVides = '☆'.repeat(5 - note);
        return etoilesCompletes + etoilesVides;
      }

      expect(genererEtoiles(5)).toBe('★★★★★');
      expect(genererEtoiles(3)).toBe('★★★☆☆');
      expect(genererEtoiles(0)).toBe('☆☆☆☆☆');
      expect(genererEtoiles(1)).toBe('★☆☆☆☆');
    });
  });

  describe('Date formatting', () => {
    test('should format dates in French', () => {
      function formaterDate(dateString) {
        return new Date(dateString).toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });
      }

      const result = formaterDate('2024-01-15T10:30:00.000Z');
      expect(result).toMatch(/15 janvier 2024/);
    });
  });

  describe('Email validation', () => {
    test('should validate email addresses', () => {
      function validerEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      }

      expect(validerEmail('test@example.com')).toBe(true);
      expect(validerEmail('user.name+tag@domain.co.uk')).toBe(true);
      expect(validerEmail('invalid-email')).toBe(false);
      expect(validerEmail('missing@domain')).toBe(false);
      expect(validerEmail('@domain.com')).toBe(false);
      expect(validerEmail('')).toBe(false);
    });
  });
});