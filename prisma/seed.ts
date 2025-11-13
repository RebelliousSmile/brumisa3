// Brumisa3 - MVP v1.0 Seed Data
// City of Mist / Legends in the Mist

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create test user
  console.log('👤 Creating test user...')
  const testUser = await prisma.user.create({
    data: {
      email: 'test@brumisa3.com',
      name: 'Test User'
    }
  })

  console.log('✅ Test user created:', testUser.email)

  // Create test playspaces (City of Mist + LITM)
  console.log('🎮 Creating test playspaces...')

  const comPlayspace = await prisma.playspace.create({
    data: {
      name: 'Chicago Investigations',
      description: 'A City of Mist campaign (version 1.0)',
      userId: testUser.id,
      hackId: 'city-of-mist',
      universeId: null, // null = defaultUniverse "the-city"
      isGM: true // Game Master mode
    }
  })

  const litmPlayspace = await prisma.playspace.create({
    data: {
      name: 'Legends of Obojima',
      description: 'A Legends in the Mist campaign (version 2.0 - Mist Engine)',
      userId: testUser.id,
      hackId: 'litm',
      universeId: null, // null = defaultUniverse "obojima"
      isGM: false // Player Character mode (default)
    }
  })

  console.log('✅ Playspaces created:', comPlayspace.name, '&', litmPlayspace.name)

  // Create test character (City of Mist)
  console.log('🧙 Creating City of Mist test character...')

  const comCharacter = await prisma.character.create({
    data: {
      name: 'Detective Sarah Chen',
      description: 'A hardened detective who discovered her connection to Athena',
      playspaceId: comPlayspace.id,
      heroCard: {
        create: {
          identity: 'Detective in Chicago PD, solving cold cases',
          mystery: 'Avatar of Athena, goddess of wisdom and strategy',
          relationships: {
            create: [
              {
                name: 'Captain Marcus Brown',
                description: 'Police captain, mentor and father figure'
              },
              {
                name: 'The Oracle',
                description: 'Mysterious informant who knows about the Mist'
              }
            ]
          }
        }
      },
      themeCards: {
        create: [
          {
            name: 'Divine Tactician',
            type: 'MYTHOS',
            description: 'Blessed with Athena\'s strategic brilliance',
            attention: 0,
            tags: {
              create: [
                { name: 'Strategic Mind', type: 'POWER' },
                { name: 'Divine Insight', type: 'POWER' },
                { name: 'Combat Prowess', type: 'POWER' },
                { name: 'Pride of the Gods', type: 'WEAKNESS' },
                { name: 'Hunted by Ares', type: 'STORY' }
              ]
            }
          },
          {
            name: 'Veteran Detective',
            type: 'LOGOS',
            description: '15 years on the force, seen it all',
            attention: 0,
            tags: {
              create: [
                { name: 'Crime Scene Analysis', type: 'POWER' },
                { name: 'Police Resources', type: 'POWER' },
                { name: 'Interrogation Expert', type: 'POWER' },
                { name: 'Haunted by Failures', type: 'WEAKNESS' },
                { name: 'The Unsolved Case', type: 'STORY' }
              ]
            }
          }
        ]
      },
      trackers: {
        create: {
          statuses: {
            create: [
              { name: 'Determined', tier: 2, positive: true },
              { name: 'Exhausted', tier: 1, positive: false }
            ]
          },
          storyTags: {
            create: [
              { name: 'The Oracle\'s Warning' },
              { name: 'Ares\' Vendetta' }
            ]
          },
          storyThemes: {
            create: [
              { name: 'Uncovering the Truth' },
              { name: 'Divine Destiny' }
            ]
          }
        }
      }
    }
  })

  console.log('✅ City of Mist character created:', comCharacter.name)

  // Create test character (LITM)
  console.log('⚔️ Creating LITM test character...')

  const litmCharacter = await prisma.character.create({
    data: {
      name: 'Kenji the Wanderer',
      description: 'A ronin seeking redemption in feudal Japan',
      playspaceId: litmPlayspace.id,
      heroCard: {
        create: {
          identity: 'Masterless samurai wandering the countryside',
          mystery: 'Blessed by the Dragon Spirit of the East',
          relationships: {
            create: [
              {
                name: 'Lady Yuki',
                description: 'Noble who hired him as bodyguard'
              },
              {
                name: 'The Dragon Elder',
                description: 'Ancient spirit guiding his path'
              }
            ]
          }
        }
      },
      themeCards: {
        create: [
          {
            name: 'Dragon-Blessed Warrior',
            type: 'ORIGIN',
            description: 'Born under the dragon constellation',
            attention: 0,
            tags: {
              create: [
                { name: 'Master Swordsman', type: 'POWER' },
                { name: 'Dragon Fire', type: 'POWER' },
                { name: 'Ancient Wisdom', type: 'POWER' },
                { name: 'Bound to Honor', type: 'WEAKNESS' },
                { name: 'Dragon\'s Destiny', type: 'STORY' }
              ]
            }
          },
          {
            name: 'Quest for Redemption',
            type: 'ADVENTURE',
            description: 'Seeking to atone for past failures',
            attention: 1,
            tags: {
              create: [
                { name: 'Relentless Determination', type: 'POWER' },
                { name: 'Survival Instinct', type: 'POWER' },
                { name: 'Haunted Past', type: 'WEAKNESS' },
                { name: 'The Unforgivable Sin', type: 'STORY' }
              ]
            }
          }
        ]
      },
      trackers: {
        create: {
          statuses: {
            create: [
              { name: 'Focused', tier: 3, positive: true }
            ]
          },
          storyTags: {
            create: [
              { name: 'The Dragon\'s Trial' },
              { name: 'Lady Yuki\'s Secret' }
            ]
          },
          storyThemes: {
            create: [
              { name: 'Redemption Through Service' }
            ]
          }
        }
      }
    }
  })

  console.log('✅ LITM character created:', litmCharacter.name)

  // Summary
  console.log('\n🎉 Seed completed!')
  console.log('=' .repeat(50))
  console.log(`👤 Users: 1 (${testUser.email})`)
  console.log(`🎮 Playspaces: 2 (City of Mist, LITM)`)
  console.log(`🧙 Characters: 2 (${comCharacter.name}, ${litmCharacter.name})`)
  console.log(`🎴 Theme Cards: 4 total`)
  console.log(`🏷️  Tags: 18 total`)
  console.log(`💫 Hero Cards: 2`)
  console.log(`🔗 Relationships: 4`)
  console.log(`📊 Trackers: 2`)
  console.log('=' .repeat(50))
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Seed error:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
