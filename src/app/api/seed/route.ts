import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users, groups, groupMembers, connections, grades, activityLogs } from '@/db/schema';

export const dynamic = 'force-dynamic';

// Admin user that "created" all the data
const ADMIN_USER = {
  firebaseUid: 'seed-admin-placeholder',
  email: 'charleno@gmail.com',
  displayName: 'Prof. Charleno',
  role: 'admin' as const,
};

// Seed data for groups organized by type
const seedGroups = [
  // ============ ENSINO SUPERIOR ============
  {
    name: 'Algoritmos Avançados',
    type: 'superior' as const,
    leaderName: 'Prof. Dr. Carlos Mendes',
    projectId: null,
    status: 'active' as const,
    members: ['Ana Paula Silva', 'Bruno Costa', 'Carla Ferreira', 'Daniel Santos'],
  },
  {
    name: 'Desenvolvimento Web',
    type: 'superior' as const,
    leaderName: 'Profa. Dra. Maria Oliveira',
    projectId: null,
    status: 'active' as const,
    members: ['Eduardo Lima', 'Fernanda Reis', 'Gabriel Souza'],
  },
  {
    name: 'Inteligência Artificial',
    type: 'superior' as const,
    leaderName: 'Prof. Dr. João Pereira',
    projectId: null,
    status: 'active' as const,
    members: ['Helena Costa', 'Igor Martins', 'Julia Almeida', 'Kevin Santos', 'Laura Oliveira'],
  },
  {
    name: 'Banco de Dados',
    type: 'superior' as const,
    leaderName: 'Profa. Dra. Lucia Santos',
    projectId: null,
    status: 'pending' as const,
    members: ['Marcos Silva', 'Natália Ferreira', 'Oscar Lima'],
  },

  // ============ 2º ANO A (MÉDIO A) ============
  {
    name: 'Equipe Inovação',
    type: 'medio-a' as const,
    leaderName: 'Amanda Rodrigues',
    projectId: '#2A-01',
    status: 'active' as const,
    members: ['Pedro Henrique', 'Rafaela Costa', 'Samuel Oliveira'],
  },
  {
    name: 'Tech Stars',
    type: 'medio-a' as const,
    leaderName: 'Beatriz Lima',
    projectId: '#2A-02',
    status: 'active' as const,
    members: ['Thiago Santos', 'Ursula Ferreira', 'Victor Hugo', 'Wesley Almeida'],
  },
  {
    name: 'Code Masters',
    type: 'medio-a' as const,
    leaderName: 'Caio Mendes',
    projectId: '#2A-03',
    status: 'active' as const,
    members: ['Ximena Costa', 'Yago Pereira'],
  },
  {
    name: 'Digital Creators',
    type: 'medio-a' as const,
    leaderName: 'Diana Santos',
    projectId: '#2A-04',
    status: 'pending' as const,
    members: ['Zara Lima', 'Arthur Reis', 'Bianca Souza'],
  },

  // ============ 2º ANO B (MÉDIO B) ============
  {
    name: 'Cientistas Digitais',
    type: 'medio-b' as const,
    leaderName: 'Elisa Ferreira',
    projectId: '#2B-01',
    status: 'active' as const,
    members: ['Cauã Oliveira', 'Davi Santos', 'Emilly Costa'],
  },
  {
    name: 'Exploradores Tech',
    type: 'medio-b' as const,
    leaderName: 'Felipe Almeida',
    projectId: '#2B-02',
    status: 'active' as const,
    members: ['Flávia Lima', 'Gustavo Reis', 'Heloísa Mendes', 'Ian Pereira'],
  },
  {
    name: 'Future Devs',
    type: 'medio-b' as const,
    leaderName: 'Giovana Costa',
    projectId: '#2B-03',
    status: 'active' as const,
    members: ['João Lucas', 'Kamila Santos'],
  },
  {
    name: 'Inovadores 2B',
    type: 'medio-b' as const,
    leaderName: 'Henrique Silva',
    projectId: '#2B-04',
    status: 'pending' as const,
    members: ['Letícia Ferreira', 'Miguel Oliveira', 'Nicole Souza', 'Otávio Lima'],
  },
];

// Connections to create (by group name pairs and app name)
const seedConnections = [
  { source: 'Equipe Inovação', target: 'Algoritmos Avançados', appName: 'GitHub Classroom' },
  { source: 'Tech Stars', target: 'Desenvolvimento Web', appName: 'Figma' },
  { source: 'Code Masters', target: 'Inteligência Artificial', appName: 'Google Colab' },
  { source: 'Cientistas Digitais', target: 'Algoritmos Avançados', appName: 'Replit' },
  { source: 'Exploradores Tech', target: 'Desenvolvimento Web', appName: 'CodePen' },
  { source: 'Future Devs', target: 'Banco de Dados', appName: 'MongoDB Atlas' },
];

// Grades to create (by group name)
const seedGrades = [
  { groupName: 'Algoritmos Avançados', grade: 85, observations: 'Excelente desempenho na apresentação do projeto' },
  { groupName: 'Desenvolvimento Web', grade: 78, observations: 'Bom trabalho, melhorar documentação' },
  { groupName: 'Inteligência Artificial', grade: 92, observations: 'Projeto inovador e bem executado' },
  { groupName: 'Equipe Inovação', grade: 75, observations: 'Apresentação clara, código precisa de refatoração' },
  { groupName: 'Tech Stars', grade: 88, observations: 'Ótima colaboração em equipe' },
  { groupName: 'Cientistas Digitais', grade: 82, observations: 'Bom progresso, continuar assim' },
  { groupName: 'Exploradores Tech', grade: 70, observations: 'Precisa melhorar a organização do código' },
];

export async function POST() {
  try {
    // Clear ALL existing data (order matters due to foreign keys)
    console.log('[Seed] Clearing database...');
    await db.delete(activityLogs);
    await db.delete(grades);
    await db.delete(connections);
    await db.delete(groupMembers);
    await db.delete(groups);
    await db.delete(users);

    // Create admin user first
    console.log('[Seed] Creating admin user...');
    const [adminUser] = await db.insert(users).values({
      firebaseUid: ADMIN_USER.firebaseUid,
      email: ADMIN_USER.email,
      displayName: ADMIN_USER.displayName,
      role: ADMIN_USER.role,
      lastLoginAt: new Date(),
    }).returning();

    console.log('[Seed] Admin user created:', adminUser.id);

    // Map to store created groups by name
    const groupMap = new Map<string, string>();

    // Insert groups and members
    console.log('[Seed] Creating groups...');
    for (const groupData of seedGroups) {
      const { members, ...groupFields } = groupData;

      const [newGroup] = await db.insert(groups).values(groupFields).returning();
      groupMap.set(newGroup.name, newGroup.id);

      // Add members
      if (members.length > 0) {
        await db.insert(groupMembers).values(
          members.map(name => ({
            groupId: newGroup.id,
            name,
          }))
        );
      }

      // Log activity - group creation by admin
      await db.insert(activityLogs).values({
        userId: adminUser.id,
        action: 'create',
        entityType: 'group',
        entityId: newGroup.id,
        details: `Grupo "${newGroup.name}" criado`,
        ipAddress: 'seed',
        userAgent: 'seed-script',
      });
    }

    // Insert connections
    console.log('[Seed] Creating connections...');
    for (const conn of seedConnections) {
      const sourceId = groupMap.get(conn.source);
      const targetId = groupMap.get(conn.target);

      if (sourceId && targetId) {
        const [newConnection] = await db.insert(connections).values({
          sourceId,
          targetId,
          appName: conn.appName,
        }).returning();

        // Log activity - connection creation by admin
        await db.insert(activityLogs).values({
          userId: adminUser.id,
          action: 'create',
          entityType: 'connection',
          entityId: newConnection.id,
          details: `Conexão "${conn.appName}" criada entre ${conn.source} e ${conn.target}`,
          ipAddress: 'seed',
          userAgent: 'seed-script',
        });
      }
    }

    // Insert grades
    console.log('[Seed] Creating grades...');
    for (const gradeData of seedGrades) {
      const groupId = groupMap.get(gradeData.groupName);

      if (groupId) {
        const [newGrade] = await db.insert(grades).values({
          groupId,
          grade: gradeData.grade,
          observations: gradeData.observations,
          gradedBy: adminUser.id,
        }).returning();

        // Log activity - grade assignment by admin
        await db.insert(activityLogs).values({
          userId: adminUser.id,
          action: 'create',
          entityType: 'grade',
          entityId: newGrade.id,
          details: `Nota ${(gradeData.grade / 10).toFixed(1)} atribuída ao grupo "${gradeData.groupName}"`,
          ipAddress: 'seed',
          userAgent: 'seed-script',
        });
      }
    }

    // Summary
    const summary = {
      adminUser: {
        id: adminUser.id,
        email: adminUser.email,
      },
      groups: {
        total: seedGroups.length,
        superior: seedGroups.filter(g => g.type === 'superior').length,
        medioA: seedGroups.filter(g => g.type === 'medio-a').length,
        medioB: seedGroups.filter(g => g.type === 'medio-b').length,
      },
      connections: seedConnections.length,
      grades: seedGrades.length,
    };

    console.log('[Seed] Complete!', summary);

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully. Admin user created: ' + ADMIN_USER.email,
      summary,
    });
  } catch (error) {
    console.error('[Seed] Error:', error);
    return NextResponse.json(
      { error: 'Failed to seed database', details: String(error) },
      { status: 500 }
    );
  }
}

// GET endpoint to check current data
export async function GET() {
  try {
    const allUsers = await db.query.users.findMany();
    const allGroups = await db.query.groups.findMany({
      with: { members: true },
    });
    const allConnections = await db.query.connections.findMany();

    return NextResponse.json({
      users: allUsers.length,
      groups: allGroups.length,
      connections: allConnections.length,
    });
  } catch (error) {
    console.error('Error fetching seed data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data', details: String(error) },
      { status: 500 }
    );
  }
}
