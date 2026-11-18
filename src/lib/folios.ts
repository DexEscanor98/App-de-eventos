import { prisma } from './prisma';

export type FolioPrefix = 'COT' | 'RES' | 'EVT' | 'PAG' | 'CON';

/**
 * Genera un folio secuencial único con el formato: [PREFIX]-[YEAR]-[00001]
 * Específico y aislado por tenantId.
 */
export async function generateFolio(tenantId: string, prefix: FolioPrefix): Promise<string> {
  const currentYear = new Date().getFullYear();
  const searchPattern = `${prefix}-${currentYear}-%`;

  let count = 0;

  switch (prefix) {
    case 'COT': {
      count = await prisma.quote.count({
        where: {
          tenantId,
          folio: { startsWith: `${prefix}-${currentYear}-` },
        },
      });
      break;
    }
    case 'RES': {
      count = await prisma.reservation.count({
        where: {
          tenantId,
          folio: { startsWith: `${prefix}-${currentYear}-` },
        },
      });
      break;
    }
    case 'EVT': {
      count = await prisma.event.count({
        where: {
          tenantId,
          folio: { startsWith: `${prefix}-${currentYear}-` },
        },
      });
      break;
    }
    case 'PAG': {
      count = await prisma.payment.count({
        where: {
          tenantId,
          folio: { startsWith: `${prefix}-${currentYear}-` },
        },
      });
      break;
    }
    case 'CON': {
      count = await prisma.contract.count({
        where: {
          tenantId,
          folio: { startsWith: `${prefix}-${currentYear}-` },
        },
      });
      break;
    }
  }

  const nextSeq = String(count + 1).padStart(5, '0');
  return `${prefix}-${currentYear}-${nextSeq}`;
}
