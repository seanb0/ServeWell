import { neon } from '@neondatabase/serverless';
import { Church, Ministry } from './defintions';

const sql = neon(process.env.DATABASE_URL!);

export async function getChurches() {
  try {
    const data = await sql<Church>SELECT * FROM church;
    return data;
  } catch (err) {
    console.error('Database Error', err);
    throw new Error('Failed to fetch church data');
  }
}

export async function createMinistry({ MinistryName, Church_ID, Budget, Description }: {
  MinistryName: string;
  Church_ID: number;
  Budget: number;
  Description: string;
}): Promise<Ministry> {
  try {
    console.log('Creating ministry with data:', { MinistryName, Church_ID, Budget, Description });

    const data = await sql
      INSERT INTO ministry (ministryname, church_id, budget, description)
      VALUES (${MinistryName}, ${Church_ID}, ${Budget}, ${Description})
      RETURNING *
    ;

    console.log('Insert result:', data[0]);
    return data[0];
  } catch (err) {
    console.error('Detailed Database Error:', err);
    throw new Error(Failed to create ministry: ${err instanceof Error ? err.message : 'Unknown error'});
  }
}

export async function getMinistries() {
  try {
    const data = await sql<Ministry>SELECT * FROM ministry;
    console.log('Fetched ministries:', data);
    return data;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch ministry data');
  }
}