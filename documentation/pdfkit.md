# PDFKit - Guide et Bonnes Pratiques

## Vue d'ensemble

PDFKit est la bibliothèque JavaScript utilisée pour la génération PDF dans ce projet, offrant un contrôle précis de la mise en page et des performances optimisées.

## Règles Critiques de Conversion

### ⚠️ Problème majeur : Sauts de page automatiques

**Symptôme :** Le contenu apparaît sur des pages séparées des éléments de mise en page (barres latérales, headers, footers).

**Cause :** Les options `width` et `align` dans les appels `.text()` peuvent provoquer des débordements automatiques et créer des pages supplémentaires non désirées.

#### ❌ Code problématique
```javascript
// ÉVITER : width et align peuvent causer des sauts de page
doc.text('Mon titre', x, y, {
    width: contentWidth,
    align: 'center'
});

doc.text('Texte long...', x, y, {
    width: width,
    align: 'justify'
});
```

#### ✅ Code sécurisé
```javascript
// RECOMMANDÉ : Positionnement direct sans width/align
doc.text('Mon titre', x, y);

// Pour les textes longs, découper manuellement
doc.text('Première ligne du texte', x, y);
doc.text('Deuxième ligne du texte', x, y + 15);
```

### Texte vertical avec rotation

#### ❌ Rotation problématique
```javascript
// ÉVITER : Peut causer des sauts de page
doc.rotate(-90)
   .text('Texte vertical', x, y, {
       width: 400,
       align: 'center'
   });
```

#### ✅ Rotation sécurisée
```javascript
// RECOMMANDÉ : save/restore avec positionnement simple
doc.save()
   .translate(x, y)
   .rotate(-90)
   .text('Texte vertical', 0, 0)
   .restore();
```

### Gestion des marges et débordements

#### ✅ Bonnes pratiques
```javascript
// Calculer les positions manuellement
const contentX = sidebarWidth + 15;
const maxY = pageHeight - 50; // Éviter le débordement en bas

let y = 80;
doc.text('Ligne 1', contentX, y);
y += 20;
doc.text('Ligne 2', contentX, y);

// Vérifier les limites avant d'ajouter du contenu
if (y + 40 > maxY) {
    doc.addPage();
    y = 80;
}
```

## Architecture de pages avec barres latérales alternées

### Mise en page pages impaires/paires

```javascript
function createPageWithSidebar(doc, pageNum, sectionTitle, isOddPage) {
    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const sidebarWidth = 15 * 2.83; // 15mm en points
    
    // Position de la barre selon page paire/impaire
    const sidebarX = isOddPage ? 0 : pageWidth - sidebarWidth;
    
    // Barre latérale
    doc.fillColor('#000000')
       .rect(sidebarX, 0, sidebarWidth, pageHeight)
       .fill();
    
    // Numéro de page
    const pageNumX = isOddPage ? 7 : pageWidth - sidebarWidth + 7;
    doc.fillColor('#000000')
       .rect(pageNumX, 28, 28, 28)
       .fill();
    
    doc.fontSize(18)
       .fillColor('white')
       .text(pageNum.toString(), pageNumX + 10, 33);
    
    // Texte vertical sécurisé
    const textX = isOddPage ? sidebarWidth/2 : pageWidth - sidebarWidth/2;
    doc.save()
       .translate(textX, pageHeight - 100)
       .rotate(-90)
       .fontSize(14)
       .font('Helvetica-Bold')
       .fillColor('white')
       .text(sectionTitle, 0, 0)
       .restore();
    
    // Zone de contenu adaptée
    const contentX = isOddPage ? sidebarWidth + 15 : 20;
    const contentWidth = pageWidth - sidebarWidth - 35;
    
    return { contentX, contentWidth };
}
```

## Avantages de PDFKit

### Points forts

- **Taille fichier** : ~4-8 KB (très compact)
- **Performance** : Génération rapide native JavaScript
- **Contrôle mise en page** : Positionnement précis au pixel
- **Headers/Footers** : Support natif des éléments de page
- **Gestion pages** : Contrôle manuel et prévisible de la pagination

### Bonnes pratiques

1. **Positionnement direct** via méthodes PDFKit
2. **Calculs de marges précis** en points
3. **Gestion manuelle des sauts de page**
4. **Éviter les options automatiques** (width/align)

## Polices et typographie

### Polices système recommandées
```javascript
// Polices fiables disponibles par défaut
const fonts = {
    regular: 'Helvetica',
    bold: 'Helvetica-Bold', 
    italic: 'Helvetica-Oblique',
    monospace: 'Courier'
};
```

### Chargement de polices personnalisées
```javascript
// Vérifier la compatibilité avant utilisation
try {
    doc.registerFont('CustomFont-Regular', fontPath);
    doc.font('CustomFont-Regular');
} catch (error) {
    console.warn('Police personnalisée non compatible, fallback vers Helvetica');
    doc.font('Helvetica');
}
```

## Débogage et diagnostics

### Identifier les problèmes de saut de page

1. **Simplifier le contenu** progressivement
2. **Supprimer les options width/align** des appels text()
3. **Vérifier les transformations** save/restore
4. **Tester avec du contenu minimal** d'abord

### Logs de débogage utiles
```javascript
console.log(`Page ${pageNum}: isOddPage=${isOddPage}`);
console.log(`SidebarX=${sidebarX}, ContentX=${contentX}`);
console.log(`Current Y position: ${y}, Page height: ${pageHeight}`);
```

## Performances et optimisation

### Bonnes pratiques

- **Éviter les transformations complexes** inutiles
- **Réutiliser les calculs** de position
- **Grouper les opérations** graphiques similaires
- **Limiter les changements** de police/couleur

### Monitoring taille fichier
- PDFKit : 2-8 KB pour documents standards
- Si > 10 KB : vérifier les images ou contenus dupliqués

## Exemples de templates

Voir `src/services/PdfKitService.js` pour l'implémentation complète du template Monsterhearts avec barres latérales alternées.

## Ressources

- [Documentation officielle PDFKit](http://pdfkit.org/)
- [API Reference](https://pdfkit.org/docs/getting_started.html)
- Tests unitaires : `tests/unit/PdfKitService.test.js`