import { getInfrastructure } from '../../infrastructure/index.ts';

export async function initializeApp(): Promise<void> {
  const { application, seedFirestoreIfEmpty, migrateLegacyLocalHistory } = getInfrastructure();

  await application.admins.initializePrimary.execute();
  await migrateLegacyLocalHistory();
  await seedFirestoreIfEmpty();
}
