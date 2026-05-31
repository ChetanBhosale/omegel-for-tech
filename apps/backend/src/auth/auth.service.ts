import { prisma } from 'db';
import type { NormalizedProfile } from './types';

/**
 * Given a normalized OAuth profile, find-or-create the User and link/refresh
 * the provider Account. Returns the persisted user.
 *
 * Account-linking strategy:
 *  1. If this exact provider account already exists -> reuse its user.
 *  2. Else if a user with the same email exists -> link this provider to them.
 *  3. Else -> create a brand new user.
 */
export async function upsertUserFromProfile(profile: NormalizedProfile) {
  // 1. Already linked provider account?
  const existingAccount = await prisma.account.findUnique({
    where: {
      provider_providerAccountId: {
        provider: profile.provider,
        providerAccountId: profile.providerAccountId,
      },
    },
    include: { user: true },
  });

  if (existingAccount) {
    // Refresh tokens / scope on every login.
    await prisma.account.update({
      where: { id: existingAccount.id },
      data: {
        accessToken: profile.accessToken,
        refreshToken: profile.refreshToken ?? null,
        scope: profile.scope ?? null,
      },
    });
    return existingAccount.user;
  }

  // 2. Existing user with the same email -> link a new provider to them.
  let user = profile.email
    ? await prisma.user.findUnique({ where: { email: profile.email } })
    : null;

  // 3. Otherwise create a new user.
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: profile.email,
        name: profile.name,
        username: profile.username,
        avatarUrl: profile.avatarUrl,
      },
    });
  }

  await prisma.account.create({
    data: {
      userId: user.id,
      provider: profile.provider,
      providerAccountId: profile.providerAccountId,
      accessToken: profile.accessToken,
      refreshToken: profile.refreshToken ?? null,
      scope: profile.scope ?? null,
    },
  });

  return user;
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({ where: { id } });
}
