import { or } from "three/tsl";

/**
 * Point d'entrée pour générer la structure JSON.
 * @param {Object} dataContext - Contient { beams, forces, loads, ... }
 */
export function generateStructure(dataContext) {
  const { beams } = dataContext;

  console.group("🏗️ GÉNÉRATION STRUCTURE JSON");
  
  if (!beams || beams.length === 0) {
    console.warn("Aucune poutre dans la scène.");
    console.groupEnd();
    return [];
  }

  // 1. La Poutre Mère est la première du tableau
  const rootBeam = beams[0];
  console.log(`%c Racine : Poutre ID ${rootBeam.id}`, "color: green; font-weight: bold;");

  // --- DÉFINITION DE L'ORIGINE GLOBALE ---
  // Le point de départ de la première poutre devient le (0,0) universel
  const globalOrigin = { x: rootBeam.x1, y: rootBeam.y1 };
  console.log(`Origine du modèle fixée à : [${globalOrigin.x}, ${globalOrigin.y}]`);

  const processedIds = new Set();
  processedIds.add(rootBeam.id);

  // 2. Lancer la récursion
  const rootNode = buildBeamNode(rootBeam, null, dataContext, processedIds, globalOrigin);

  console.groupEnd();

  return [
    {
      version: "2D",
      E: 200000,
      G: 100000,
      V: 0.3,
      body: [rootNode]
    }
  ];
}

function buildBeamNode(beam, parentBeam, context, processedIds, globalOrigin) {
  // ... (Calcul angle et logique vecteurs inchangés) ...
  // ... (Je remets le code de calcul d'angle pour la cohérence, mais c'est surtout la fin qui change) ...

  let angleRelatif = 0;
  const gridSize = 50; 

  if (parentBeam) {
    const vParent = { x: (parentBeam.x2 - parentBeam.x1), y: (parentBeam.y2 - parentBeam.y1) };
    const vChild = { x: (beam.x2 - beam.x1), y: (beam.y2 - beam.y1) };
    const dotProduct = vParent.x * vChild.x + vParent.y * vChild.y;
    const magParent = Math.sqrt(vParent.x ** 2 + vParent.y ** 2);
    const magChild = Math.sqrt(vChild.x ** 2 + vChild.y ** 2);
    let cosTheta = 0;
    if (magParent * magChild !== 0) cosTheta = dotProduct / (magParent * magChild);
    cosTheta = Math.max(-1, Math.min(1, cosTheta));
    let deg = (Math.acos(cosTheta) * 180) / Math.PI;
    const crossProduct = vParent.x * vChild.y - vParent.y * vChild.x;
    if (crossProduct < 0) deg = -deg;
    angleRelatif = -parseFloat(deg.toFixed(2));
  }

  const attachments = getAttachmentsForBeam(beam, context, globalOrigin);
  const childBeams = findConnectedBeams(beam, context.beams, processedIds);
  const childNodes = childBeams.map(child => {
    processedIds.add(child.id);
    return buildBeamNode(child, beam, context, processedIds, globalOrigin);
  });
  const allChildren = [...attachments, ...childNodes];

  // Calcul Coordonnées
  const x1 = (beam.x1 - globalOrigin.x) / gridSize;
  const x2 = (beam.x2 - globalOrigin.x) / gridSize;
  const y1 = -(beam.y1 - globalOrigin.y) / gridSize;
  const y2 = -(beam.y2 - globalOrigin.y) / gridSize;
  const clean = (val) => parseFloat(val.toFixed(3));

  // --- MODIFICATION ICI : Mapping des propriétés dynamiques ---
  return {
    id: beam.id,
    type: "poutre",
    coords: [[clean(x1), clean(y1)], [clean(x2), clean(y2)]],
    
    // Propriétés dynamiques (avec valeurs par défaut si non définies)
    form: beam.shape || "Rectangulaire",
    longueur: calculateLength(beam),
    largeur: beam.width || 10,      // Valeur utilisateur ou défaut 10
    hauteur: beam.height || 40,     // Valeur utilisateur ou défaut 40
    epaisseur: beam.thickness || 1, // Valeur utilisateur ou défaut 1
    
    angle: angleRelatif,
    child: allChildren
  };
}

function getAttachmentsForBeam(beam, context, globalOrigin) {
  const list = [];
  const gridSize = 50;

  // Helpers de conversion avec INVERSION Y
  const toGlobalX = (val) => parseFloat(((val - globalOrigin.x) / gridSize).toFixed(3));
  const toGlobalY = (val) => parseFloat((- (val - globalOrigin.y) / gridSize).toFixed(3)); // Notez le -

  const add = (arr, type, extraProps = {}) => {
    arr.filter(item => item.beamId === beam.id).forEach(item => {
      list.push({ 
        id: item.id, 
        type, 
        coords: [toGlobalX(item.x), toGlobalY(item.y)], 
        ...extraProps(item) 
      });
    });
  };

  add(context.forces, "force", f => ({ valeur: f.value, angle: f.angle }));
  add(context.moments, "moment", m => ({ valeur: m.value, sens: m.direction === 1 }));
  add(context.fixed, "encastrement", () => ({}));
  add(context.pinned, "appuie", () => ({}));
  add(context.rolled, "rouleau", () => ({}));

  context.loads.filter(l => l.beamId === beam.id).forEach(l => {
    list.push({
      id: l.id,
      type: "charge-repartie",
      valeur: l.value,
      coords: [
        [toGlobalX(l.x1), toGlobalY(l.y1)],
        [toGlobalX(l.x2), toGlobalY(l.y2)]
      ]
    });
  });

  return list;
}

function findConnectedBeams(parentBeam, allBeams, processedIds) {
  const TOLERANCE = 5.0; // Tolérance large pour le clic
  
  const children = allBeams.filter(b => {
    if (processedIds.has(b.id)) return false;

    // L'enfant b est connecté si UN de ses bouts touche le parent (N'importe où sur le parent)
    
    // Test 1: Le DÉBUT de l'enfant touche le Parent ?
    const touchStart = isPointOnBeam({x: b.x1, y: b.y1}, parentBeam, TOLERANCE);
    
    // Test 2: La FIN de l'enfant touche le Parent ?
    const touchEnd = isPointOnBeam({x: b.x2, y: b.y2}, parentBeam, TOLERANCE);

    return touchStart || touchEnd;
  });
  
  return children;
}

/**
 * Vérifie si un point (x,y) est sur la poutre (Segments inclus !)
 */
function isPointOnBeam(point, beam, tolerance) {
  // 1. Distance aux extrémités (Cas simple)
  if (dist(point.x, point.y, beam.x1, beam.y1) < tolerance) return true;
  if (dist(point.x, point.y, beam.x2, beam.y2) < tolerance) return true;

  // 2. Distance au segment (Cas T-Junction)
  const proj = getProjectedPoint(point, beam);
  const d = dist(point.x, point.y, proj.x, proj.y);

  // Si proche de la ligne ET dans les bornes du segment
  if (d < tolerance && proj.t >= 0 && proj.t <= 1) {
    return true;
  }

  return false;
}

// Helpers géométriques pour le générateur (copiés pour l'indépendance)
function getProjectedPoint(point, beam) {
  const ABx = beam.x2 - beam.x1;
  const ABy = beam.y2 - beam.y1;
  const APx = point.x - beam.x1;
  const APy = point.y - beam.y1;
  const lenSq = ABx*ABx + ABy*ABy;
  if (lenSq === 0) return { x: beam.x1, y: beam.y1, t: 0 };
  const t = (APx*ABx + APy*ABy) / lenSq;
  return { x: beam.x1 + t*ABx, y: beam.y1 + t*ABy, t: t };
}

// Helpers
function dist(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

function calculateLength(b) {
  return parseFloat((dist(b.x1, b.y1, b.x2, b.y2) / 50).toFixed(2));
}
